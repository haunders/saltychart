import express from 'express';
import AuthController from "../auth/entry-points/controller.js";
import ChartController from "./entry-points/controller.js";

export const chartRouter = express.Router();
chartRouter.get("/:year-:month-:day",
    AuthController.requiresAuthentication,
    ChartController.getChart
);

chartRouter.get("/",
    AuthController.requiresAuthentication,
    ChartController.getLastChart
);

export default chartRouter;