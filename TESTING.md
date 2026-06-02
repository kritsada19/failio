# คู่มือการทำ Integration Test สำหรับ Failio 🚀

ไฟล์นี้คือคำอธิบายสรุปเกี่ยวกับการทดสอบแบบ Integration ในโปรเจกต์นี้ เพื่อให้คุณเข้าใจภาพรวมได้ง่ายๆ ครับ

## 1. Integration Test คืออะไร?
การทดสอบแบบ **Integration** คือการทดสอบที่ให้โค้ดทำงานร่วมกับระบบจริงๆ (ในที่นี้คือ Database) แทนที่จะ Mock ทุกอย่างทิ้งไป เพื่อให้มั่นใจว่า Action ของเราเขียนข้อมูลลงฐานข้อมูลได้ถูกต้องจริงๆ

---

## 2. ไฟล์สำคัญที่เกี่ยวข้อง

- **`vitest.config.ts`**: ไฟล์ตั้งค่าหลักของ Vitest โดยมีการปิด `fileParallelism` เพื่อป้องกัน Database Conflict
- **`vitest.setup.ts`**: ไฟล์ที่รัน "ก่อน" เริ่มเทสทุุกครั้ง ใช้สำหรับโหลด `.env.test` และทำ Mock พื้นฐาน 
- **`.env.test`**: เก็บ DATABASE_URL สำหรับเทสโดยเฉพาะ
- **`actions/failure.test.ts`**: ทดสอบ Server Action (Create, Update, Delete)
- **`app/api/failure/[id]/route.test.ts`**: ทดสอบ API Route และการทำงานร่วมกับ Redis Cache

---

## 3. กลไกการทำงานและความปลอดภัย

1. **Isolated Testing**: ในแต่ละไฟล์เทสจะมีการรัน `beforeEach` เพื่อล้างข้อมูลในตาราง `User` และ `Failure` ทิ้งเสมอ เพื่อให้แต่ละเคสเริ่มจากความว่างเปล่า
2. **Sequential Execution**: เราปิดการรันเทสแบบขนาน (Parallel) เพื่อไม่ให้ไฟล์เทสสองไฟล์แย่งกันลบ/แก้ไขข้อมูลใน Database ก้อนเดียวกัน
3. **Deterministic Data**: ใช้ `findUnique` เพื่อดึงข้อมูล Seed แทน `findFirst` เพื่อความแม่นยำในการเลือกหมวดหมู่ (Category) หรืออารมณ์ (Emotion)
4. **Implementation Reset**: ใช้ `vi.resetAllMocks()` เพื่อล้างทั้งประวัติการเรียกและค่าที่ Mock ไว้ ทำให้แต่ละเทสเริ่มด้วยสถานะที่สะอาดจริงๆ

---

## 4. ขั้นตอนการทดสอบ (AAA Pattern)

1. **Arrange (เตรียม)**: จำลอง Login, เตรียม FormData, ดึงข้อมูลเงื่อนไขจาก DB
2. **Act (ทำ)**: เรียกฟังก์ชัน Action หรือ API จริงๆ
3. **Assert (ตรวจ)**: เช็คสถานะที่คืนมา และเช็คข้อมูลใน Database จริงๆ อีกรอบ

---

## 5. คำสั่งที่ต้องรู้ (Scripts)

- `npm run test:db:setup`: **ทำครั้งแรกหรือหลังแก้ Schema** เพื่อล้าง DB เทสและใส่ข้อมูล Category/Emotion (Seed)
- `npm test -- --run`: รันการทดสอบทั้งหมดหนึ่งรอบ
- `npm run test:ui`: เปิดหน้า UI ของ Vitest ใน Browser

---

## 6. ข้อควรระวัง ⚠️

- **Flaky Test**: หากเทสผ่านบ้างไม่ผ่านบ้าง มักเกิดจาก Redis Mock ค้าง หรือ Database Conflict (ซึ่งเราแก้ไขด้วยการปิด Parallel และ Reset Mocks แล้ว)
- **Auto Increment ID**: อย่าระบุ ID เป็นตัวเลขตรงๆ เช่น `id: 1` เพราะค่า ID ใน DB จะเพิ่มขึ้นเรื่อยๆ ให้ใช้วิธีเก็บค่าจาก Record ที่เพิ่งสร้างมาทดสอบแทน หรือ Mock ID ในกรณีของ Redis
