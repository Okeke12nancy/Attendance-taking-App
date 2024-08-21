import { Router } from "express";
import { PermissionController } from "../controllers/permission";
import { authenticate } from "../middlewares/authMiddleware";

const permissionRoutes = Router();

permissionRoutes.post(
  "/:eventId/permissions",
  authenticate,
  PermissionController.setPermissions
);

export default permissionRoutes;
