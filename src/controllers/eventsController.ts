import { Request, Response } from "express";
import { Event } from "../entity/Event";
import { AppDataSource } from "../data-source";
import { validationResult } from "express-validator";
import { User } from "../entity/User";
import { sendEmail } from "../services/emailService";

class EventController {
  static eventRepository = AppDataSource.getRepository(Event);

  static async createEvent(req: Request, res: Response) {
    const {
      name,
      description,
      date,
      time,
      location,
      visibility,
      visibleTo,
      attendanceStartTime,
      attendanceEndTime,
    } = req.body;
    const userId = req.id;

    const userIdNum = Number(userId);
    console.log("User ID:", userId);

    if (isNaN(userIdNum)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    try {
      const userRepository = AppDataSource.getRepository(User);
      const eventRepository = AppDataSource.getRepository(Event);

      const user = await userRepository.findOneBy({ id: userIdNum });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const event = eventRepository.create({
        name,
        description,
        date,
        time,
        location,
        visibility: visibility || "public",
        visibleTo: visibility === "private" ? visibleTo : null,
        attendanceStartTime,
        attendanceEndTime,
        user,
      });

      await eventRepository.save(event);

      const sanitizedEvent = {
        ...event,
        user: {
          ...event.user,
          password: undefined,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        },
      };

      const subject = "New Event Created";
      const text = `Event ${event.name} has been created. Date: ${event.date}, Time: ${event.time}, Location: ${event.location}.`;
      await sendEmail(user.email, subject, text);

      return res.status(201).json(sanitizedEvent);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }

  static async getEvents(req: Request, res: Response) {
    if (!req.user) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;
    try {
      const events = await EventController.eventRepository.find({
        where: { user: { id: userId } },
      });

      return res.status(200).json({
        status: "Success",
        events,
      });
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).json({
        status: "Internal Server Error",
        message:
          "An error occurred while retrieving events. Please try again later.",
      });
    }
  }

  static async updateEvent(req: Request, res: Response) {
    if (!req.user) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;
    const eventId = parseInt(req.params.eventId, 10);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateEventData = req.body;

    try {
      const event = await EventController.eventRepository.findOne({
        where: { id: eventId, user: { id: userId } },
        relations: ["user"], // Load the user relation
      });

      if (!event) {
        return res.status(404).json({
          status: "Not Found",
          message: "Event not found",
        });
      }

      Object.assign(event, updateEventData);
      await EventController.eventRepository.save(event);

      const subject = "Event Updated";
      const text = `Event ${event.name} has been updated. Date: ${event.date}, Time: ${event.time}, Location: ${event.location}.`;
      await sendEmail(event.user.email, subject, text);

      return res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      return res.status(500).json({
        message: "Internal Server Error",
        error: error,
      });
    }
  }

  static async deleteEvent(req: Request, res: Response) {
    if (!req.user) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const userId = req.user.id;
    const eventId = parseInt(req.params.id);

    try {
      const event = await EventController.eventRepository.findOne({
        where: { id: eventId, user: { id: userId } },
      });

      if (!event) {
        return res.status(404).json({
          status: "Not Found",
          message: "Event not found",
        });
      }

      await EventController.eventRepository.remove(event);

      return res.status(200).json({
        status: "Success",
        message: "Event deleted successfully",
      });
    } catch (error: any) {
      console.error(error.message);
      return res.status(500).json({
        status: "Internal Server Error",
        message:
          "An error occurred while deleting the event. Please try again later.",
      });
    }
  }
}

export default EventController;
