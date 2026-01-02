import { google } from "googleapis";
import { getAllTracks, getAllTracksByYear } from "../requests.js";
import { googleSheetsInstance, auth, spreadsheetIdSaltyChart } from "../../google-api.js";

export const ChartAPIController = new class {
    updateMain = async function (req, res) {
        const result_arrays = await getAllTracks();
        googleSheetsInstance.spreadsheets.values.update({
            auth,
            spreadsheetId: spreadsheetIdSaltyChart,
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
    };

    updateYear = async function (req, res) {
        const result_arrays = await getAllTracksByYear(req.params.year);

        const auth = new google.auth.GoogleAuth({
            keyFile: "smooth-verve-411510-825dce00373c.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });
        googleSheetsInstance.spreadsheets.values.clear({
            auth,
            spreadsheetId: spreadsheetIdSaltyChart, 
            range: req.params.year+'!A:F'});
        googleSheetsInstance.spreadsheets.values.update({
            auth,
            spreadsheetId: spreadsheetIdSaltyChart,
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
    };
};

export default ChartAPIController;