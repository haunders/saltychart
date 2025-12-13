import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import Adapter, { Database, Resource } from '@adminjs/sql';
import { config } from 'dotenv';
import { User } from './auth/models.js';

config({ quiet: true });

AdminJS.registerAdapter({
    Database,
    Resource,
});

const db = await new Adapter('postgresql', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
}).init();

export const admin = new AdminJS({
    resources: [],
    databases: [db],
    rootPath: '/admin',
})

export const adminRouter = AdminJSExpress.buildRouter(admin);

adminRouter.use((req, res, next) => {
    if (req.user) {
        const user = User.findOne({ where: { googleId: req.user.id } });
        if (user.isAdmin) {
            next();
        }
    }
    res.status(400).send("You are not allowed to be here. You are not admin.")
});

export default admin;