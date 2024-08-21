import { Request, Response } from "express";
import { Permission } from "../entity/permission";
import { Event } from "../entity/Event";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";

export class PermissionController {
  static async setPermissions(req: Request, res: Response) {
    const { eventId } = req.params;
    const userId = req.id;
    const { userIds, canEdit, canMarkAttendance } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    try {
      const eventRepository = AppDataSource.getRepository(Event);
      const userRepository = AppDataSource.getRepository(User);
      const permissionRepository = AppDataSource.getRepository(Permission);
      const userIdNum = Number(userId);

      if (isNaN(userIdNum)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const event = await eventRepository.findOne({
        where: { id: parseInt(eventId), user: { id: userIdNum } },
      });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      for (const uid of userIds) {
        const user = await userRepository.findOneBy({ id: uid });
        if (user) {
          const permission = permissionRepository.create({
            user,
            event,
            canEdit,
            canMarkAttendance,
          });

          await permissionRepository.save(permission);
        }
      }

      return res.json({ message: "Permissions set successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }
}
