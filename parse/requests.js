import { QueryTypes } from 'sequelize';
import { sequelize } from '../database.js';

export const insertParsedChart = async function (data_array, date) {
    let script = "INSERT INTO positions(chart_date, track_position, track_id) VALUES "
    data_array.forEach(entry => {
        script += `('${date}', '${entry[0]}', (select t.id from track t where t.title = '${entry[1].replaceAll("'", "''")}' and t.performer = '${entry[2].replaceAll("'", "''")}')),`
    });
    script = script.slice(0, -1) + ";";

    try{
        const result = await sequelize.query(script,
            {
                type: QueryTypes.INSERT,
            });
        return [200, result];
    }
    catch (error) {
        return [400, error];
    }
}