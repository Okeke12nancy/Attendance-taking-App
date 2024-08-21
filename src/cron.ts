import cron from "node-cron";
import { AppDataSource } from "./data-source";
import { Event } from "./entity/Event";
import { User } from "./entity/User";
import { sendEmail } from "./services/emailService";

// Initialize database connection if not already initialized
AppDataSource.initialize()
  .then(() => {
    console.log("Database initialized successfully");
  })
  .catch((error) => console.log(error));

// Schedule a cron job to run every 3 days
cron.schedule("0 0 */3 * *", async () => {
  try {
    const eventRepository = AppDataSource.getRepository(Event);
    const events = await eventRepository.find({ relations: ["user"] });

    for (const event of events) {
      const subject = `Reminder: Event ${event.name} Attendance`;
      const text = `Reminder: Event ${event.name} is scheduled on ${event.date} at ${event.time}. Please mark your attendance.`;

      await sendEmail(event.user.email, subject, text);
    }

    console.log("Reminders sent successfully");
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
});
