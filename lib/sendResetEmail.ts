import { env } from "@/env";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export async function sendResetEmail(email: string, link: string) {
  await transporter.sendMail({
    from: `"Failio" <${env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Reset your password</h2>
      <p>Click the button below</p>

      <a href="${link}" 
      style="padding:10px 20px;background:#16a34a;color:white;text-decoration:none;border-radius:6px">
      Reset Password
      </a>

      <p>${link}</p>
    `,
  });
}