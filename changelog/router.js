import express from 'express';
import { ChangelogInsert } from "./models.js";
import { User } from "../auth/models.js";
import { requiresAuthentication, requiresAdmin } from "../auth/controller.js";

export const changelogRouter = express.Router();

changelogRouter.get("/", requiresAuthentication, async (req, res) => {
    const changelog = await ChangelogInsert.findAll({
        raw: true,
        order: [
            ['releaseDate', 'DESC'],
        ],
    });
    res.render('changelog', {
        changelog: changelog
    });
});

export default changelogRouter;