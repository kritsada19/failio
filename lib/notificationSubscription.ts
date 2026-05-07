import { env } from "@/env";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    }
})

export async function sendNotificationSubscript(email: string) {
    await transporter.sendMail({
        from: `"Failio" <${env.EMAIL_USER}>`,
        to: email,
        subject: "Subscription Activated Successfully",
        html: `
  <div
    style="
      max-width:520px;
      margin:0 auto;
      padding:40px 32px;
      background:#0f172a;
      border:1px solid #1e293b;
      border-radius:20px;
      font-family:Arial,sans-serif;
      color:#e2e8f0;
      text-align:center;
    "
  >
    <div
      style="
        width:64px;
        height:64px;
        margin:0 auto 24px;
        border-radius:16px;
        background:linear-gradient(135deg,#22c55e,#16a34a);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:30px;
      "
    >
      ✓
    </div>

    <h1
      style="
        margin:0 0 16px;
        font-size:28px;
        color:#ffffff;
      "
    >
      Welcome to Failio
    </h1>

    <p
      style="
        margin:0 0 12px;
        font-size:16px;
        line-height:1.7;
        color:#cbd5e1;
      "
    >
      Your subscription has been activated successfully.
    </p>

    <p
      style="
        margin:0;
        font-size:15px;
        line-height:1.7;
        color:#94a3b8;
      "
    >
      Thank you for supporting Failio.  
      You now have access to all premium features.
    </p>

    <div
      style="
        margin-top:32px;
        padding-top:20px;
        border-top:1px solid #1e293b;
        font-size:13px;
        color:#64748b;
      "
    >
      © 2026 Failio. All rights reserved.
    </div>
  </div>
`,
    })
}