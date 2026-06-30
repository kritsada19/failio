import { env } from "@/env";
import nodemailer from "nodemailer";

import { getTranslations } from "next-intl/server";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export async function sendResetEmail(email: string, link: string, locale: string = "en") {
  const t = await getTranslations({ locale, namespace: "Email" });
  await transporter.sendMail({
    from: `"Failio" <${env.EMAIL_USER}>`,
    to: email,
    subject: t("resetSubject"),
    html: `
      <h2>${t("resetTitle")}</h2>
      <p>${t("resetDesc")}</p>

      <a href="${link}" 
      style="padding:10px 20px;background:#16a34a;color:white;text-decoration:none;border-radius:6px">
      ${t("resetBtn")}
      </a>

      <p>${link}</p>
    `,
  });
}