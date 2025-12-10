import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import Adapter, { Database, Resource } from '@adminjs/sql';

AdminJS.registerAdapter({
    Database,
    Resource,
});

const db = await new Adapter('postgresql', {
    host: '94.241.143.24',
    port: 5432,
    database: 'saltychart',
    user: 'severino_dan',
    password: '10b0t0mya',
}).init();

export const admin = new AdminJS({
    resources: [],
    databases: [db],
    rootPath: '/admin',
})

export const adminRouter = AdminJSExpress.buildRouter(admin);

export default admin;