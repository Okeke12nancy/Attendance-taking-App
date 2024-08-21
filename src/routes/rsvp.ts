import { Router } from "express";
import { RSVPController } from "../controllers/rsvp";
import { authenticate } from "../middlewares/authMiddleware";

const rsvpRoutes = Router();

rsvpRoutes.post("/:eventId/rsvp", authenticate, RSVPController.rsvp);

export default rsvpRoutes;
