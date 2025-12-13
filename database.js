import knex from 'knex';
import Sequelize from 'sequelize';
import { attachPaginate } from 'knex-paginate';
import { config } from 'dotenv';

config();
export const knex_db = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
})
attachPaginate();

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: "postgres",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        logging: false
    }
);

export default knex_db;