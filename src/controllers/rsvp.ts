import { Request, Response } from "express";
import { RSVP } from "../entity/rsvp";
import { Event } from "../entity/Event";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";

export class RSVPController {
  static async rsvp(req: Request, res: Response) {
    const { eventId } = req.params;
    const userId = req.id;

    const eventIdNum = parseInt(eventId);
    const userIdNum = Number(userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    if (isNaN(eventIdNum) || isNaN(userIdNum)) {
      return res.status(400).json({ message: "Invalid event or user ID" });
    }

    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const userRepository = AppDataSource.getRepository(User);
      const rsvpRepository = AppDataSource.getRepository(RSVP);

      const event = await eventRepository.findOneBy({ id: eventIdNum });
      const user = await userRepository.findOneBy({ id: userIdNum });

      if (!event || !user) {
        return res.status(404).json({ message: "Event or User not found" });
      }

      const rsvp = rsvpRepository.create({
        event,
        user,
        status: "confirmed",
      });

      await rsvpRepository.save(rsvp);
      return res.status(201).json(rsvp);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }
}
