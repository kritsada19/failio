import { env } from "@/env";
import nodemailer from "nodemailer";

import { getTranslations } from "next-intl/server";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // เป็น email ที่ใช้ในการส่ง
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email: string, link: string, locale: string = "en") {
  const t = await getTranslations({ locale, namespace: "Email" });
  await transporter.sendMail({
    from: `"Failio" <${env.EMAIL_USER}>`,
    to: email,
    subject: t("verifySubject"),
    html: `
      <h2>${t("verifyTitle")}</h2>
      <p>${t("verifyDesc")}</p>

      <a href="${link}" 
        style="
          display:inline-block;
          padding:10px 20px;
          background:#16a34a;
          color:white;
          text-decoration:none;
          border-radius:6px;
        ">
        ${t("verifyBtn")}
      </a>

      <p>${t("verifyBackup")}</p>
      <p>${link}</p>
    `,
  });
}
