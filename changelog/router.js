import express from 'express';
import AuthController from "../auth/entry-points/controller.js";
import ChangelogController from "./entry-points/controller.js";

export const changelogRouter = express.Router();

changelogRouter.get("/",
    AuthController.requiresAuthentication,
    ChangelogController.getChangelog
);

export default changelogRouter;