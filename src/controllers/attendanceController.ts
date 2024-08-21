import { Request, Response } from "express";
import { Attendance } from "../entity/attendance";
import { Event } from "../entity/Event";
import { User } from "../entity/User";
import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";
import PDFDocument from "pdfkit";
import { Parser as Json2CsvParser, Parser } from "json2csv";

export class AttendanceController {
  static async markAttendance(req: Request, res: Response) {
    const { eventId } = req.params;
    const userId = req.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    const userIdNum = Number(userId);
    const eventIdNum = Number(eventId);

    if (isNaN(userIdNum) || isNaN(eventIdNum)) {
      return res.status(400).json({ message: "Invalid user ID or event ID" });
    }

    try {
      const user = await User.findOneBy({ id: userIdNum });
      const event = await Event.findOneBy({ id: eventIdNum });

      if (!user || !event) {
        return res.status(404).json({ message: "User or Event not found" });
      }

      // Ensure `attendanceStartTime` and `attendanceEndTime` are valid Date objects
      const currentTime = new Date();
      const startTime = new Date(event.attendanceStartTime);
      const endTime = new Date(event.attendanceEndTime);

      console.log("Current Time:", currentTime);
      console.log("Attendance Start Time:", startTime);
      console.log("Attendance End Time:", endTime);

      if (
        isNaN(startTime.getTime()) ||
        isNaN(endTime.getTime()) ||
        currentTime < startTime ||
        currentTime > endTime
      ) {
        return res
          .status(400)
          .json({ message: "Attendance window is not open" });
      }

      let attendance = await Attendance.findOneBy({
        user: { id: userIdNum },
        event: { id: eventIdNum },
      });

      if (attendance) {
        attendance.attended = true;
      } else {
        attendance = Attendance.create({
          user,
          event,
          timestamp: new Date(),
          attended: true,
        });
      }

      await Attendance.save(attendance);

      return res.status(201).json(attendance);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }

  static async getAttendance(req: Request, res: Response) {
    const { eventId } = req.params;
    const userId = req.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID not provided" });
    }

    const eventIdNum = parseInt(eventId);

    if (isNaN(eventIdNum)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    try {
      const event = await Event.findOneBy({ id: eventIdNum });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const attendances = await Attendance.find({
        where: { event: { id: eventIdNum }, attended: true },
        relations: ["user"],
      });

      const sanitizedAttendances = attendances.map((attendance) => ({
        id: attendance.id,
        timestamp: attendance.timestamp,
        attended: attendance.attended,
        user: {
          id: attendance.user.id,
          firstName: attendance.user.firstName,
          lastName: attendance.user.lastName,
          email: attendance.user.email,
        },
      }));

      return res.json(sanitizedAttendances);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }

  static async getAttendanceReport(req: Request, res: Response) {
    const { eventId } = req.params;

    const eventIdNum = Number(eventId);

    if (isNaN(eventIdNum)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    try {
      const event = await Event.findOneBy({ id: eventIdNum });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const attendances = await Attendance.find({
        where: { event: { id: eventIdNum } },
        relations: ["user"],
      });

      const reportData = {
        event: event.name,
        date: event.date,
        time: event.time,
        location: event.location,
        attendees: attendances.map((a) => ({
          userId: a.user.id,
          username: a.user.firstName,
          attended: a.attended,
        })),
      };

      return res.json(reportData);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }
  static async downloadAttendanceReportCSV(req: Request, res: Response) {
    const { eventId } = req.params;

    const eventIdNum = Number(eventId);

    if (isNaN(eventIdNum)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    try {
      const event = await Event.findOneBy({ id: eventIdNum });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const attendances = await Attendance.find({
        where: { event: { id: eventIdNum }, attended: true },
        relations: ["user"],
      });

      const reportData = attendances.map((a) => ({
        userId: a.user.id,
        username: a.user.firstName,
        attended: a.attended,
      }));

      const json2csvParser = new Json2CsvParser();
      const csv = json2csvParser.parse(reportData);

      res.header("Content-Type", "text/csv");
      res.attachment("attendance-report.csv");
      res.send(csv);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }

  static async downloadAttendanceReportPDF(req: Request, res: Response) {
    const { eventId } = req.params;

    const eventIdNum = Number(eventId);

    if (isNaN(eventIdNum)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    try {
      const event = await Event.findOneBy({ id: eventIdNum });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const attendances = await Attendance.find({
        where: { event: { id: eventIdNum }, attended: true },
        relations: ["user"],
      });

      const reportData = {
        event: event.name,
        date: event.date,
        time: event.time,
        location: event.location,
        attendees: attendances.map((a) => ({
          userId: a.user.id,
          username: a.user.firstName,
          attended: a.attended,
        })),
      };

      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="attendance-report.pdf"'
      );

      doc.pipe(res);

      doc
        .fontSize(16)
        .text(`Attendance Report for ${reportData.event}`, { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${reportData.date}`);
      doc.text(`Time: ${reportData.time}`);
      doc.text(`Location: ${reportData.location}`);
      doc.moveDown();

      reportData.attendees.forEach((a) => {
        doc.text(
          `User ID: ${a.userId}, Username: ${a.username}, Attended: ${
            a.attended ? "Yes" : "No"
          }`
        );
      });

      doc.end();
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }
}
