import express from 'express';
import bodyParser from 'body-parser';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../database.js';
import { google } from "googleapis";

let jsonParser = bodyParser.json()
export const apiRouter = express.Router();

apiRouter.post("/parse", jsonParser, async (req, res) => {
    let script = "INSERT INTO positions(chart_date, track_position, track_id) VALUES "
    req.body.data.forEach(entry => {
        script += `('${req.body.date}', '${entry[0]}', (select t.id from track t where t.title = '${entry[1].replaceAll("'", "''")}' and t.performer = '${entry[2].replaceAll("'", "''")}')),`
    });
    script = script.slice(0, -1) + ";";
    sequelize.query(script,
        {
            type: QueryTypes.INSERT,
        })
        .then((result) => {
            res.status(200).send('Insertion successful:', result);
        })
        .catch((error) => {
            res.status(400).send('Insertion failed:', error);
        });
});

apiRouter.get("/update", async (req, res) => {
    const result = await sequelize.query(`select tr.title, tr.performer,
        count(p.id) as days,
        min(p.track_position) as peak,
        nullif(count(p.id) filter(where p.track_position = 1), 0) as days_at_1,
        coalesce(sum(21 - p.track_position),0) as points,
        tr.id in (select p.track_id from positions p order by p.id desc limit 20) as charting
        from track tr
        left join positions p on p.track_id = tr.id
        group by tr.id
        order by tr.id;`,
        {
            type: QueryTypes.SELECT,
        });
    let result_arrays = [];
    result.forEach((row) => {
        result_arrays.push([row.title, row.performer, parseInt(row.days), row.peak, parseInt(row.days_at_1), parseInt(row.points), row.charting]);
    })

    const auth = new google.auth.GoogleAuth({
        keyFile: "smooth-verve-411510-825dce00373c.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
    const spreadsheetId = "1JeC-evxsT3vLCHb1Lq0eIqjlZg40NWFTgeqTIpqlb2U";
    googleSheetsInstance.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: 'All!A:G',
        valueInputOption: 'RAW',
        resource: { values: result_arrays },
    }, (err, response) => {
        if (err) {
            res.status(400).send('The API returned an error: ' + err);
        } else {
            res.status(200).send("Updated");
        }
    });
});

apiRouter.get("/update/:year", async (req, res) => {
    const result = await sequelize.query(`select tr.title, tr.performer,
        count(p.id) as days,
        min(p.track_position) as peak,
        nullif(count(p.id) filter(where p.track_position = 1), 0) as days_at_1,
        coalesce(sum(21 - p.track_position),0) as points,
        tr.id in (select p.track_id from positions p order by p.id desc limit 20) as charting
        from track tr
        left join positions p on p.track_id = tr.id
        where tr.chart_year = :year
        group by tr.id
        order by points desc;`,
        {
            replacements: {
                year: req.params.year
            },
            type: QueryTypes.SELECT,
        });
    let result_arrays = [];
    result.forEach((row) => {
        result_arrays.push([row.title, row.performer, parseInt(row.days), row.peak, parseInt(row.days_at_1), parseInt(row.points), row.charting]);
    })

    const auth = new google.auth.GoogleAuth({
        keyFile: "smooth-verve-411510-825dce00373c.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
    const spreadsheetId = "1JeC-evxsT3vLCHb1Lq0eIqjlZg40NWFTgeqTIpqlb2U";
    googleSheetsInstance.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: req.params.year + '!A:G',
        valueInputOption: 'RAW',
        resource: { values: result_arrays },
    }, (err, response) => {
        if (err) {
            res.status(400).send('The API returned an error: ' + err);
        } else {
            res.status(200).send("Updated");
        }
    });
});

export default apiRouter;