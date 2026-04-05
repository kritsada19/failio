import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

// getRequestConfig คือฟังก์ชันของ next-intl ที่ใช้สร้าง config สำหรับ แต่ละ request
// ทุกครั้งที่มี request เข้ามา next-intl จะเรียก callback นี้
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const headerStore = await headers();
  const localeFromHeader = headerStore.get('X-NEXT-INTL-LOCALE');

  const locale = localeFromCookie || localeFromHeader || 'en';

  // return config ให้ next-intl
  return {
    // คือบอกว่า request นี้จะใช้ภาษาอะไร
    locale,

    // โหลดไฟล์คำแปลตาม locale
    // dynamic import
    // .default เพื่อดึงข้อมูลจริงของไฟล์ JSON ออกมา
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
