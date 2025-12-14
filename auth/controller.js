import { User } from "./models.js";

export async function requiresAuthentication(req, res, next) {
    if (req.user) {
        return next();
    }
    res.status(400).send("You are not allowed to watch here. Log in.")
}

export async function requiresAdmin(req, res, next) {
    if (req.user) {
        const user = await User.findOne({ where: { googleId: req.user.id } });
        if (user.isAdmin) {
            return next();
        }
        return res.status(400).send("You are not allowed to be here. You are not admin.")
    }
    res.status(400).send("You are not allowed to watch here. Log in.")
}