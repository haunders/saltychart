import { getUser, updateUser } from "../requests.js";

export const AuthController = new class {
    requiresAuthentication = async function (req, res, next) {
        if (req.user) {
            return next();
        }
        res.status(400).send("You are not allowed to watch here. Log in.")
    };

    requiresAdmin = async function (req, res, next) {
        if (req.user) {
            const user = await getUser(req.user.emails[0].value);
            if (user.isAdmin) {
                return next();
            }
            return res.status(400).send("You are not allowed to be here. You are not admin.")
        }
        res.status(400).send("You are not allowed to watch here. Log in.")
    };

    authCallback = async function (req, res) {
        const user = await getUser(req.user.emails[0].value);
        if (user) {
            const response = await updateUser(req.user);
            res.render('auth/success');
        }
        else {
            req.logOut();
            res.render('auth/fail');
        }
    };

    authLogout = async function (req, res) {
        req.logOut();
        res.redirect("/");
    };
};

export default AuthController;