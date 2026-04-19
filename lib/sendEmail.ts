import { env } from "@/env";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // เป็น email ที่ใช้ในการส่ง
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email: string, link: string) {
  await transporter.sendMail({
    from: `"Failio" <${env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>
      <p>Click the button below to verify your account.</p>

      <a href="${link}" 
        style="
          display:inline-block;
          padding:10px 20px;
          background:#16a34a;
          color:white;
          text-decoration:none;
          border-radius:6px;
        ">
        Verify Email
      </a>

      <p>If the button doesn't work, copy this link:</p>
      <p>${link}</p>
    `,
  });
}
