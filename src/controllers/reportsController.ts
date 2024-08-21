// import fs from "fs";
// import { Request, Response } from "express";
// import ReportService from "../services/reportsService";

// class ReportController {
//   static async downloadCSV(req: Request, res: Response) {
//     try {
//       const { eventId } = req.params;
//       const csvFilePath = await ReportService.generateCSVReport(
//         Number(eventId)
//       );

//       if (!csvFilePath || !fs.existsSync(csvFilePath)) {
//         return res
//           .status(500)
//           .json({ message: "Failed to generate CSV report or file not found" });
//       }

//       res.download(csvFilePath, (err) => {
//         if (err) {
//           console.error("Error during file download:", err);
//           return res
//             .status(500)
//             .json({ message: "Error downloading file", error: err.message });
//         }
//       });
//     } catch (error) {
//       console.error("Error generating CSV report:", error);
//       return res.status(500).json({
//         message: "Error generating report",
//         error: error,
//       });
//     }
//   }

//   static async downloadPDF(req: Request, res: Response) {
//     try {
//       const { eventId } = req.params;
//       const pdfFilePath = await ReportService.generatePDFReport(
//         Number(eventId)
//       );

//       if (!pdfFilePath || !fs.existsSync(pdfFilePath)) {
//         return res
//           .status(500)
//           .json({ message: "Failed to generate PDF report or file not found" });
//       }

//       res.download(pdfFilePath, (err) => {
//         if (err) {
//           console.error("Error during file download:", err);
//           return res
//             .status(500)
//             .json({ message: "Error downloading file", error: err.message });
//         }
//       });
//     } catch (error) {
//       console.error("Error generating PDF report:", error);
//       return res.status(500).json({
//         message: "Error generating report",
//         error: error,
//       });
//     }
//   }
// }

// export default ReportController;
