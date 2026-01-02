import { QueryTypes } from 'sequelize';
import { ChartMainPosition } from "./models.js";
import { sequelize } from '../database.js';

export const getChartMaxDate = async function () {
    const max_date = await ChartMainPosition.findAll({
        attributes: [
            [sequelize.fn("max", sequelize.col("chart_date")), "max"],
        ],
        raw: true
    });
    return max_date[0].max;
}

export const getChartByDate = function (date_string, date_string_yesterday) {
    return sequelize.query(`select p.track_position, t.title, t.performer, perf.tech_name as tech_name, t.display_title, t.display_performer,
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
}

export const getChartOutsByDate = function (date_string, date_string_yesterday) {
    return sequelize.query(`select t.title, t.performer, perf.tech_name as tech_name, t.display_title, t.display_performer,
        count(p2.id) filter(where p2.chart_date <= :date_before) as days,
        min(p2.track_position) filter(where p2.chart_date <= :date_before) as peak,
        nullif(count(p2.id) filter(where p2.track_position = 1 and p2.chart_date <= :date_before), 0) as days_at_1,
        (select p3.track_position from positions p3 where p3.chart_date = :date_before and p3.track_id = t.id limit 1) as ld
        from positions p
        left join track t on t.id = p.track_id
        left join positions p2 on p2.track_id = t.id
        left join (select distinct on (track_id) track_id, performer_id from bind_track_artist order by track_id, id) bta on t.id = bta.track_id
        left join performer perf on perf.id = bta.performer_id
        where p.chart_date = :date_before and p.track_id not in (select p2.track_id from positions p2
        where p2.track_id = p.track_id and p2.chart_date = :date)
        group by t.id, perf.id
        order by ld;`,
        {
            replacements: {
                date: date_string,
                date_before: date_string_yesterday
            },
            type: QueryTypes.SELECT,
        });
}

export const getAllTracks = async function () {
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
    return result_arrays;
}

export const getAllTracksByYear = async function (year) {
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
                year: year
            },
            type: QueryTypes.SELECT,
        });
    let result_arrays = [];
    result.forEach((row) => {
        result_arrays.push([row.title, row.performer, parseInt(row.days), row.peak, parseInt(row.days_at_1), parseInt(row.points), row.charting]);
    })
    return result_arrays;
}