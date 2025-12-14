import passport from "passport";
import express from 'express';
import { User } from "../auth/models.js";

export const authRouter = express.Router();

authRouter.get("/google", passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

authRouter.get("/google/callback", passport.authenticate('google', {
    failureRedirect: "/",
}), async (req, res) => {
    const emailExists = await User.findOne({ where: { email: req.user.emails[0].value } });
    if (emailExists) {
        if (emailExists.name != req.user.displayName) {
            User.update(
                {
                    name: req.user.displayName,
                    googleId: req.user.id,
                    avatar: req.user.photos[0].value
                },
                { where: { email: req.user.emails[0].value } }
            )
        }
        res.redirect("/chart");
    }
    else {
        req.logOut();
        res.status(403).send("You are not allowed here");
    }

});

authRouter.get("/logout", async (req, res) => {
    req.logOut();
    res.redirect("/");
});

export default authRouter;