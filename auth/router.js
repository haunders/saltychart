import passport from "passport";
import express from 'express';
import AuthController from "./entry-points/controller.js";

export const authRouter = express.Router();

authRouter.get("/google",
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

authRouter.get("/google/callback",
    passport.authenticate('google', {
        failureRedirect: "/",
    }),
    AuthController.authCallback
);

authRouter.get("/logout",
    AuthController.authLogout
);

export default authRouter;