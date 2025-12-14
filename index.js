import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import { config } from 'dotenv';
import { chartRouter } from './chart/router.js';
import { artistRouter } from './artists/router.js';
import { authRouter } from './auth/router.js';
import { apiRouter } from './api/router.js';
import { changelogRouter } from './changelog/router.js';
import { admin, adminRouter } from './admin.js';
import { User } from "./auth/models.js";
import GoogleStrategy from 'passport-google-oauth20';

config({ quiet: true });
const start = async () => {
    const app = express();

    app.use(express.json());
    app.use(cors({
        origin: process.env.APP_URL,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true
    }));
    app.set("trust proxy", 1);

    app.use(
        cookieSession({
            secret: process.env.COOKIE_SECRET,
            resave: false,
            saveUninitialized: true,
            cookie: {
                secure: false,
                maxAge: 1000 * 60 * 60 * 24 * 7
            }
        })
    );
    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_STRATEGY_CLIENT_ID,
                clientSecret: process.env.GOOGLE_STRATEGY_CLIENT_SECRET,
                callbackURL: process.env.APP_URL + '/auth/google/callback',
            },
            (accessToken, refreshToken, profile, done) => {
                return done(null, profile);
            }
        )
    );
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    app.set('view engine', 'ejs');
    app.use(express.static('static'));

    app.use(admin.options.rootPath, async (req, res, next) => {
        if (req.user) {
            const user = await User.findOne({ where: { googleId: req.user.id } });
            if (user.isAdmin) {
                return next();
            }
            return res.status(400).send("You are not allowed to be here. You are not admin.")
        }
        res.status(400).send("You are not allowed to watch here. Log in.")
    });

    app.use(admin.options.rootPath, adminRouter);
    app.use('/', chartRouter);
    app.use('/artists', artistRouter);
    app.use('/auth', authRouter);
    app.use('/api', apiRouter);
    app.use('/changelog', changelogRouter);

    app.listen(process.env.APP_PORT, () => {
        console.log(`AdminJS started on ${process.env.APP_URL}${admin.options.rootPath}`);
    });
};

start();

export const my_own_id = process.env.MY_GOOGLE_ID;