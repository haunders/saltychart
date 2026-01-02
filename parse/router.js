import express from 'express';
import AuthController from "../auth/entry-points/controller.js";
import ParseController from "./entry-points/controller.js";

export const parseRouter = express.Router();
parseRouter.get("/",
    AuthController.requiresAdmin,
    ParseController.getParse
);

export default parseRouter;