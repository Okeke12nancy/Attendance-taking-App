import { AppDataSource } from "../data-source";
import { Event } from "../entity/Event";
import { Attendance } from "../entity/attendance";
import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";
import PDFDocument from "pdfkit";

class ReportService {
  static async generateAttendanceReport(eventId: number) {
    const eventRepository = AppDataSource.getRepository(Event);
    const attendanceRepository = AppDataSource.getRepository(Attendance);

    const event = await eventRepository.findOne({
      where: { id: eventId },
      relations: ["attendances", "attendances.user"],
    });

    if (!event) throw new Error("Event not found");

    const attendances = await attendanceRepository.find({
      where: { event },
      relations: ["user"],
    });

    console.log(
      `Found ${attendances.length} attendances for event: ${event.name}`
    );

    return { event, attendances };
  }

  static async generateCSVReport(eventId: number): Promise<string> {
    const { event, attendances } = await this.generateAttendanceReport(eventId);

    const reportsDir = path.join(__dirname, "../../reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const csvFilePath = path.join(reportsDir, `attendance_${eventId}.csv`);
    console.log(`Generating CSV report at: ${csvFilePath}`);

    const writableStream = fs.createWriteStream(csvFilePath);
    const csvStream = csv.format({ headers: true });

    return new Promise((resolve, reject) => {
      writableStream.on("finish", () => {
        console.log(`CSV report generated successfully: ${csvFilePath}`);
        resolve(csvFilePath);
      });
      writableStream.on("error", (error) => {
        console.error("Error writing CSV report:", error);
        reject(error);
      });

      csvStream.pipe(writableStream);

      attendances.forEach((attendance) => {
        csvStream.write({
          Name: attendance.user.firstName,
          Email: attendance.user.email,
          Status: attendance.attended ? "Attended" : "Absent",
          Timestamp: attendance.timestamp,
        });
      });

      csvStream.end();
    });
  }

  static async generatePDFReport(eventId: number): Promise<string> {
    const { event, attendances } = await this.generateAttendanceReport(eventId);

    const reportsDir = path.join(__dirname, "../../reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const pdfFilePath = path.join(reportsDir, `attendance_${eventId}.pdf`);
    console.log(`Generating PDF report at: ${pdfFilePath}`);

    const doc = new PDFDocument();

    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(pdfFilePath);

      writeStream.on("finish", () => {
        console.log(`PDF report generated successfully: ${pdfFilePath}`);
        resolve(pdfFilePath);
      });
      writeStream.on("error", (error) => {
        console.error("Error writing PDF report:", error);
        reject(error);
      });

      doc.pipe(writeStream);

      doc
        .fontSize(20)
        .text(`Attendance Report for ${event.name}`, { align: "center" });
      doc.moveDown();

      attendances.forEach((attendance) => {
        doc.fontSize(12).text(`Name: ${attendance.user.firstName}`);
        doc.text(`Email: ${attendance.user.email}`);
        doc.text(`Status: ${attendance.attended ? "Attended" : "Absent"}`);
        doc.text(`Timestamp: ${attendance.timestamp}`);
        doc.moveDown();
      });

      doc.end();
    });
  }
}

export default ReportService;
