import express from 'express';
import { QueryTypes } from 'sequelize';
import { knex_db, sequelize } from '../database.js';
import { vk } from '../vk-api.js';
import { ChartMainPosition, Track } from "../chart/models.js";

export const chartRouter = express.Router();
chartRouter.get("/chart/:year-:month-:day", async (req, res) => {
    let todayDate = new Date(
        +req.params.year,
        +req.params.month - 1,
        +req.params.day + 1
    )
    let prevDate = new Date(
        +req.params.year,
        +req.params.month - 1,
        +req.params.day
    )
    if (todayDate.getFullYear() <= 9999) {
        let date_string = todayDate.toISOString().split('T')[0]
        let date_string_yesterday = prevDate.toISOString().split('T')[0]

        const result = await sequelize.query(`select p.track_position, t.title, t.performer, perf.tech_name as tech_name, t.display_title, t.display_performer,
            count(p2.id) filter(where p2.chart_date <= :date) as days,
            min(p2.track_position) filter(where p2.chart_date <= :date) as peak,
            nullif(count(p2.id) filter(where p2.track_position = 1 and p2.chart_date <= :date), 0) as days_at_1,
            (select p3.track_position from positions p3 where p3.chart_date = :date_before and p3.track_id = t.id limit 1) as ld
            from positions p
            left join track t on t.id = p.track_id
            left join positions p2 on p2.track_id = t.id
            left join (select distinct on (track_id) track_id, performer_id from bind_track_artist order by track_id, id) bta on t.id = bta.track_id
            left join performer perf on perf.id = bta.performer_id
            where p.chart_date = :date
            group by p.track_position, t.id, perf.id
            order by track_position;`,
            {
                replacements: {
                    date: date_string,
                    date_before: date_string_yesterday
                },
                type: QueryTypes.SELECT,
            });

        const result_out = await sequelize.query(`select t.title, t.performer, perf.tech_name as tech_name, t.display_title, t.display_performer,
            count(p2.id) filter(where p2.chart_date <= :date_before) as days,
            min(p2.track_position) filter(where p2.chart_date <= :date_before) as peak,
            nullif(count(p2.id) filter(where p2.track_position = 1 and p2.chart_date <= :date_before), 0) as days_at_1
            from positions p
            left join track t on t.id = p.track_id
            left join positions p2 on p2.track_id = t.id
            left join (select distinct on (track_id) track_id, performer_id from bind_track_artist order by track_id, id) bta on t.id = bta.track_id
            left join performer perf on perf.id = bta.performer_id
            where p.chart_date = :date_before and p.track_id not in (select p2.track_id from positions p2
            where p2.track_id = p.track_id and p2.chart_date = :date)
            group by t.id, perf.id;`,
            {
                replacements: {
                    date: date_string,
                    date_before: date_string_yesterday
                },
                type: QueryTypes.SELECT,
            });

        const max_date = await ChartMainPosition.findAll({
            attributes: [
                [sequelize.fn("max", sequelize.col("chart_date")), "max"],
            ],
            raw: true
        })

        res.render('index', {
            data: result,
            date: prevDate,
            date_string: date_string,
            data_out: result_out,
            max_date: max_date[0].max
        });
    }
    else {
        res.status(404).send("Недопустимый год");
    }
});

chartRouter.get("/chart", async (req, res) => {
    const max_date = await ChartMainPosition.findAll({
        attributes: [
            [sequelize.fn("max", sequelize.col("chart_date")), "max"],
        ],
        raw: true
    })
    res.redirect('/chart/' + max_date[0].max);
});

chartRouter.get("/parse", async (req, res) => {
    /*if (!req.user || req.user.id != my_own_id) {
        return res.status(400).send("Нельзя, не трогай, запрещено");
    }*/
    const post = req.query['post'];
    const max_date = await ChartMainPosition.findAll({
        attributes: [
            [sequelize.literal("max(chart_date) + 1"), "max"],
        ],
        raw: true
    })
    let max_date_one = max_date[0].max;
    max_date_one = new Date(max_date_one).toISOString().split('T')[0];

    if (post == null) {
        return res.render('parse', {
            values: [],
            date: max_date_one,
            post: 0
        });
    }

    const data = await vk.call('wall.get', {
        domain: 'saltychart'
    });
    let position = 0;
    let rest_track = '';
    let track_title = '';
    let pref_title = '';
    let regex = new RegExp('[()]');

    let values = [];
    if (post) {
        data.items[post - 1].text.split('\n').forEach((e, i) => {
            if ((i > 1 && i < 24) && (e.length > 10)) {
                position = e.split('. ')[0]
                rest_track = e.split('. ').slice(1).join('. ')
                rest_track = rest_track.split('] ').slice(1).join('] ')
                track_title = rest_track.split(' - ')[0].trim()
                pref_title = rest_track.split(' - ')[1]
                pref_title = pref_title.split(regex)[0].trim()
                values.push([position, track_title, pref_title]);
            }
        });

    }

    res.render('parse', {
        values: values,
        date: max_date_one,
        post: post
    });
});

chartRouter.get("/", async (req, res) => {
    res.send("Nothing happened at all");
});

export default chartRouter;