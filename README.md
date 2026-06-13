# RU Planner (Pro Edition)

**RU Planner** เป็นเว็บแอปพลิเคชันที่ออกแบบมาเพื่อช่วยให้นักศึกษามหาวิทยาลัยรามคำแหง (โดยเฉพาะคณะวิทยาศาสตร์ สาขาวิทยาการคอมพิวเตอร์ และสามารถประยุกต์ใช้กับคณะอื่นได้) สามารถวางแผนการเรียน ติดตามความคืบหน้าของหลักสูตร และจัดการตารางเรียนตารางสอบได้อย่างเป็นระบบและมีประสิทธิภาพ ด้วยดีไซน์ที่ทันสมัย (Modern UI) และรองรับการใช้งานบนสมาร์ทโฟนเต็มรูปแบบ (Mobile-First)

---

## ฟีเจอร์หลัก (Key Features)

*   **Dashboard (หน้าหลัก):** สรุปข้อมูลภาพรวมการเรียน จำนวนหน่วยกิตสะสม GPAX และตารางสอบที่กำลังจะมาถึง
*   **Learning Roadmap (แผนการเรียนล่วงหน้า):** ออกแบบเส้นทางการเรียนในแต่ละเทอมได้อย่างอิสระ ด้วยระบบ **Drag & Drop** (ลากและวางวิชา) เพื่อย้ายเทอมได้อย่างง่ายดาย พร้อมคำนวณหน่วยกิตรวมแต่ละเทอม
*   **Degree Tracker (เช็คหลักสูตร):** ติดตามโครงสร้างหลักสูตร (วิชาทั่วไป, วิชาแกน, วิชาเอก, วิชาเลือก) เช็ควิชาที่เรียนผ่านแล้ว (สีเขียว), วิชาที่ต้องสอบซ่อม (สีส้ม) และวิชาที่จัดไว้ใน Roadmap แล้ว (สีน้ำเงิน)
*   **Subject Explorer (ค้นหาวิชาเรียน):** ค้นหารายวิชา ข้อมูลหน่วยกิต วันเวลาเรียน และวันเวลาสอบจาก มร.30 
*   **Schedule Master (จัดตารางเรียน):** จัดตารางเรียนรายสัปดาห์ ป้องกันเวลาเรียนและเวลาสอบชนกัน
*   **Notifications & Sync:** รองรับการแจ้งเตือนผ่าน Browser (Web Push) และ LINE Notify (อัปเดตเพิ่มเติมได้ในหน้าตั้งค่า)
*   **Authentication:** ระบบเข้าสู่ระบบที่ปลอดภัยผ่าน NextAuth.js (รองรับอีเมล/รหัสผ่าน และปรับใช้ Google Login ได้)
*   **Responsive & PWA:** ใช้งานได้ลื่นไหลทั้งบนคอมพิวเตอร์และมือถือ พร้อมรองรับการติดตั้งเป็นแอป (Progressive Web App)

---

## เทคโนโลยีที่ใช้ (Tech Stack)

*   **Frontend:** Next.js 16 (App Router), React, Tailwind CSS
*   **UI/Icons:** Lucide React, Custom Glassmorphism UI
*   **Backend/API:** Next.js API Routes (Serverless Functions)
*   **Database:** Supabase (PostgreSQL) + Row Level Security (RLS)
*   **Authentication:** NextAuth.js
*   **Deployment:** Vercel

---

## การติดตั้งและพัฒนาใช้งานจริง (Getting Started)

### 1. คัดลอกโปรเจกต์และติดตั้ง Dependencies
```bash
git clone <your-repo-url>
cd my-app-ru
npm install
```

### 2. การตั้งค่าฐานข้อมูล (Supabase)
โปรเจกต์นี้ใช้ Supabase เป็นฐานข้อมูลหลัก:
1. สร้างโปรเจกต์ใหม่ที่ Supabase
2. คัดลอกโค้ด SQL จากไฟล์ `docs/supabase/SUPABASE_SETUP.txt` ไปรันใน **SQL Editor** บน Supabase Dashboard
3. คำสั่ง SQL จะทำการสร้างตารางทั้งหมด, ตั้งค่าความปลอดภัย (RLS) และนำเข้าหมวดหมู่วิชาเริ่มต้นให้โดยอัตโนมัติ

### 3. การตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` ที่ Root Directory ของโปรเจกต์ และใส่ข้อมูลดังนี้:

```env
# Supabase Configuration (นำมาจากเมนู Settings > API ใน Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here # สร้างด้วยคำสั่ง openssl rand -base64 32

# Push Notifications (ถ้าต้องการใช้งาน Web Push)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

### 4. รันโปรเจกต์ในโหมดพัฒนา
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:3000` เพื่อดูผลลัพธ์

---

## การนำขึ้นระบบออนไลน์ (Deployment)
แนะนำให้ Deploy ผ่าน **Vercel**:
1. เชื่อมต่อ GitHub Repository กับ Vercel
2. ในหน้าตั้งค่า Vercel ให้ไปที่เมนู **Environment Variables**
3. นำค่าใน `.env.local` ทั้งหมดไปใส่ (เปลี่ยนค่า `NEXTAUTH_URL` เป็นโดเมนที่ Vercel กำหนดให้ เช่น `https://ru-planner.vercel.app`)
4. กด Deploy

---
*Built for RU Students.*