// eventRoutes.ts
import { Router } from "express";
import EventController from "../controllers/eventsController";
import { authenticateJWT, authenticate } from "../middlewares/authMiddleware";
import { eventValidation } from "../validations/eventValidators";

const router = Router();

router.post(
  "/events",
  authenticate,
  eventValidation,
  EventController.createEvent
);
router.get("/events", authenticateJWT, EventController.getEvents);
router.put("/events/:eventId", authenticateJWT, EventController.updateEvent);
router.delete("/events/:id", authenticateJWT, EventController.deleteEvent);

export default router;
