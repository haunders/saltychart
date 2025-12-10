import passport from "passport";
import express from 'express';

export const authRouter = express.Router();

authRouter.get("/google", passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

authRouter.get("/google/callback", passport.authenticate('google', {
    failureRedirect: "/",
}), (req, res) => {
    res.redirect("/parse?post=1");
});

authRouter.get("/logout", async (req, res) => {
    req.logOut(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

export default authRouter;