import express from 'express';
import bodyParser from 'body-parser';
import AuthController from "../auth/entry-points/controller.js";
import ParseAPIController from "../parse/entry-points/api.js";
import ChartAPIController from "../chart/entry-points/api.js";
import ArtistAPIController from "../artists/entry-points/api.js";
import { upload } from "../artists/multer.js";

const jsonParser = bodyParser.json();
export const apiRouter = express.Router();

apiRouter.post("/parse",
    AuthController.requiresAdmin,
    jsonParser,
    ParseAPIController.doParse
);

apiRouter.get("/update",
    AuthController.requiresAdmin,
    ChartAPIController.updateMain
);

apiRouter.get("/update/:year",
    AuthController.requiresAdmin,
    ChartAPIController.updateYear
);

apiRouter.post("/uploadartist",
    AuthController.requiresAdmin,
    upload.single("singleFile"),
    ArtistAPIController.uploadPhoto
);

export default apiRouter;