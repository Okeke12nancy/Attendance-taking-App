import { Router } from "express";
import { AttendanceController } from "../controllers/attendanceController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// Existing routes
router.post(
  "/:eventId/mark",
  authenticate,
  AttendanceController.markAttendance
);

router.get("/:eventId", authenticate, AttendanceController.getAttendance);

router.get(
  "/:eventId/report",
  authenticate,
  AttendanceController.getAttendanceReport
);

router.get(
  "/:eventId/report/csv",
  authenticate,
  AttendanceController.downloadAttendanceReportCSV
);

router.get(
  "/:eventId/report/pdf",
  authenticate,
  AttendanceController.downloadAttendanceReportPDF
);

export default router;
