import express from 'express';
import AuthController from "../auth/entry-points/controller.js";
import ArtistController from "./entry-points/controller.js";

export const artistRouter = express.Router();
artistRouter.get("/:tech_name",
    AuthController.requiresAuthentication,
    ArtistController.getArtist
);

artistRouter.get("/",
    AuthController.requiresAuthentication,
    ArtistController.getArtistHub
);

export default artistRouter;