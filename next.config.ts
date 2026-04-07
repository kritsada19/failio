import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// สร้าง plugin ที่ชี้ไปยังไฟล์ ./i18n/request.ts
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

// เพิ่มความสามารถของ next-intl ให้กับ next.config.ts
export default withNextIntl(nextConfig);
