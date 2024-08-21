import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (
  firstName: string,
  lastName: string,
  email: string,
  token: string
) => {
  try {
    const url = `${process.env.BASE_URL}/auth/verify/${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      html: `<div>
        Hello ${firstName} ${lastName}, Please verify your email by clicking this <a href="${url}">link</a>.
      </div>`,
    });
  } catch (err) {
    console.log(err);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    const url = `${process.env.BASE_URL}/auth/reset-password/${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<div>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <a href="${url}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    </div>`,
    });
  } catch (err) {
    console.error("Error sending password reset email:", err);
    throw new Error("Could not send password reset email");
  }
};
export const sendEmail = async (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
