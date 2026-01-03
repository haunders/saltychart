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
import parseRouter from './parse/router.js';
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

    app.use(async function (req, res, next) {
        res.locals.currentUser = req.user;
        if (req.user) {
            const user = await User.findOne({ where: { googleId: req.user.id } });
            res.locals.isAdmin = user.isAdmin
        }

        const lang = req.acceptsLanguages('ru')

        if (lang) {
            res.locals.lang = lang
        } else {
            res.locals.lang = 'en'
        }
        next();
    });

    app.use(admin.options.rootPath, async (req, res, next) => {
        if (req.user) {
            const user = await User.findOne({ where: { googleId: req.user.id } });
            if (user.isAdmin) {
                return next();
            }
            return res.status(403).render('auth/error-notadmin')
        }
        return res.status(403).render('auth/error-unauth')
    });

    app.use(admin.options.rootPath, adminRouter);

    app.get("/", async (req, res) => {
        res.render('main');
    });

    app.use('/chart', chartRouter);
    app.use('/artists', artistRouter);
    app.use('/auth', authRouter);
    app.use('/api', apiRouter);
    app.use('/changelog', changelogRouter);
    app.use('/parse', parseRouter);

    app.use("/", async (req, res) => {
        res.status(404).render('404');
    })

    app.listen(process.env.APP_PORT, () => {
        console.log(`AdminJS started on ${process.env.APP_URL}${admin.options.rootPath}`);
    });
};

start();

export const my_own_id = process.env.MY_GOOGLE_ID;