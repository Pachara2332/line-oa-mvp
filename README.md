# LINE OA Membership & CRM MVP

ระบบ Customer Relationship Management (CRM) และระบบจัดการสมาชิกสำหรับ **LINE Official Account (LINE OA)** ที่ออกแบบมาสำหรับแบรนด์ 1-3 แบรนด์ (Multi-tenant) โดยรองรับการสมัครสมาชิกผ่าน LINE LIFF, การสแกน QR Code จากแหล่งต่างๆ (QR Source Attribution), ระบบคูปองส่วนลด, และหลังบ้าน (Admin Dashboard) สำหรับจัดการข้อมูลแบบครบวงจร

---

## 🎯 ฟีเจอร์หลัก (Key Features)

### ฝั่งผู้ใช้งาน (LINE LIFF - Member Flow)
- **Login via LINE**: สมัครสมาชิกดึงข้อมูลจาก LINE Profile อัตโนมัติ ปลอดภัยด้วยการยืนยัน ID Token ผ่านเซิร์ฟเวอร์
- **Coupon Claim**: กดรับสิทธิ์คูปองส่วนลดตามแคมเปญต่างๆ
- **Responsive UI**: หน้า UI สมัครสมาชิกที่รองรับมือถืออย่างสมบูรณ์แบบ พร้อมระบบ Loading และ Modal แจ้งเตือน

### ฝั่งผู้ดูแลระบบ (Admin Dashboard)
- **Multi-tenant Architecture**: แบ่งข้อมูลแยกตามแบรนด์ (Brand A จะไม่เห็นข้อมูลลูกค้า Brand B)
- **Role-based Access**: 
  - `SUPER_ADMIN`: จัดการได้ทุกแบรนด์ (เพิ่ม/ลดแบรนด์ได้)
  - `BRAND_ADMIN`: จัดการได้เฉพาะแบรนด์ของตัวเอง
- **QR Source Tracking**: สร้าง QR Code ให้แต่ละสาขา/ช่องทาง เพื่อติดตามว่าลูกค้าสแกนมาจากไหน พร้อมระบบ Generate ภาพ QR Code ให้เซฟไปใช้งานได้เลย
- **Coupon Management**: สร้างและจัดการคูปอง กำหนดจำนวนโควต้า (Quota) 
- **Member Management**: ดูรายชื่อสมาชิกของแบรนด์ และสามารถ **Export เป็น CSV** ได้
- **CRUD Operations**: ระบบเพิ่ม/ลด/แก้ไขข้อมูล พร้อม Modal ยืนยันเพื่อป้องกันความผิดพลาด

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **LINE SDK**: `@line/liff` สำหรับฝั่ง Frontend และ `jose` สำหรับยืนยัน ID Token
- **Tools**: ngrok สำหรับทำ HTTPS Tunnel ระหว่างพัฒนา

---

## 🚀 การติดตั้งและรันโปรเจกต์ (Setup Guide)

### 1. เตรียมความพร้อม
- ต้องมี **Node.js** (v18 ขึ้นไป) และ **npm**
- ต้องมีฐานข้อมูล **PostgreSQL** (เช่น โหลดลงเครื่องเอง หรือใช้บริการบน Cloud อย่าง Supabase/Neon)

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` เป็น `.env` และตั้งค่าต่างๆ:
```bash
cp .env.example .env
```
เปิดไฟล์ `.env` และแก้ค่าที่สำคัญ:
- `DATABASE_URL`: URL สำหรับเชื่อมต่อ PostgreSQL ของคุณ (เช่น `postgresql://user:pass@localhost:5432/line_oa_mvp`)
- `SESSION_SECRET`: รหัสลับความยาวอย่างน้อย 32 ตัวอักษร (สุ่มเองได้เลย)
- `NEXT_PUBLIC_APP_URL`: URL ของเว็บคุณ (เช่น `http://localhost:3000` หรือ URL ของ ngrok)

### 4. เตรียมฐานข้อมูล (Database Migration & Seeding)
ระบบจะทำการสร้างตารางและข้อมูลตั้งต้น (เช่น แบรนด์ตัวอย่าง และบัญชีแอดมิน)
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. รันเซิร์ฟเวอร์
```bash
npm run dev
```
เข้าใช้งาน Admin Dashboard ได้ที่: `http://localhost:3000/login`

---

## 🔑 บัญชีแอดมินสำหรับทดสอบ (Seeded Accounts)

| Role | Username | Password | สิ่งที่มองเห็น |
| --- | --- | --- | --- |
| Super Admin | `admin` | `ChangeMe123!` | มองเห็นทุกแบรนด์ จัดการได้ทั้งหมด |
| Brand Admin | `brandadmin` | `ChangeMe123!` | มองเห็นเฉพาะข้อมูลของ "Demo Brand" |

*(**ข้อควรระวัง:** โปรดเปลี่ยนรหัสผ่านทันทีเมื่อนำขึ้นใช้งานจริง (Production))*

---

## 📱 การตั้งค่าเชื่อมต่อกับ LINE (สำหรับใช้งานจริง)

หากต้องการให้แอปเชื่อมต่อกับผู้ใช้ LINE ได้จริง ต้องตั้งค่าใน [LINE Developers Console](https://developers.line.biz/):

1. สร้าง Provider และ Channel แบบ **LINE Login**
2. เพิ่ม **LIFF App** ใน Channel นั้น 
3. นำ URL ที่เป็น HTTPS (เช่น Vercel หรือ **ngrok**) ไปใส่เป็น Endpoint URL ของ LIFF
4. นำค่าที่ได้มาใส่ในไฟล์ `.env`:
   - `NEXT_PUBLIC_LIFF_ID`: ใส่ LIFF ID ที่ได้จาก LINE
   - `LINE_LIFF_CHANNEL_ID`: ใส่ Channel ID
   - `ALLOW_DEMO_LIFF="false"`: ปิดโหมด Demo
   - `NEXT_PUBLIC_APP_URL`: ใส่ URL จริง (เช่น URL จาก ngrok หรือ Vercel)

---

## 🌐 การรันผ่าน ngrok (สำหรับทดสอบเชื่อมกับ LINE)

เนื่องจาก LINE บังคับใช้ HTTPS ในการตั้ง Webhook และ LIFF เราจึงต้องใช้ `ngrok` ขณะพัฒนาในเครื่อง:

1. รันโปรเจกต์ทิ้งไว้: `npm run dev`
2. เปิด Terminal ใหม่อีกหน้าต่าง แล้วรัน ngrok:
   ```bash
   ngrok http 3000
   ```
3. นำ URL ของ ngrok (เช่น `https://1a2b-3c4d.ngrok.app`) ไปอัปเดตที่:
   - ไฟล์ `.env` (`NEXT_PUBLIC_APP_URL`)
   - LINE Developers Console (LIFF Endpoint URL)
4. Restart เซิร์ฟเวอร์ `npm run dev` อีกครั้งเพื่อให้จำ URL ใหม่

*(หากไม่อยากใช้ ngrok สามารถรันผ่าน `npx localtunnel --port 3000` แทนได้)*

---

## ☁️ การนำขึ้นระบบ (Deployment)

แนะนำให้ Deploy ผ่าน **Vercel**:
1. สมัคร Vercel และผูกกับ GitHub Repository ของคุณ
2. ในหน้าตั้งค่าโปรเจกต์ของ Vercel ให้กำหนด **Environment Variables** ให้ครบทุกตัว (เหมือนใน `.env`)
3. `DATABASE_URL` **ต้องเป็นฐานข้อมูลบน Cloud** (ห้ามใช้ `localhost` เด็ดขาด)
4. ไฟล์ `package.json` ได้ตั้งค่า `"postinstall": "prisma generate"` ไว้ให้แล้ว Vercel จะสร้าง Prisma Client อัตโนมัติตอน Build
5. กด Deploy!

---

## 🔒 แนวทางสำหรับระบบ Production

โปรเจกต์นี้เป็นโครงสร้าง MVP เพื่อความรวดเร็วในการพัฒนา หากจะนำไปใช้สเกลใหญ่ แนะนำให้เพิ่ม:
- Rate Limits เพื่อป้องกันการยิง API สแปม
- เพิ่มการยืนยันตัวตน 2 ชั้น (MFA) สำหรับ Super Admin
- Row-Level Security (RLS) ในฐานข้อมูล PostgreSQL เพื่อความปลอดภัยของข้อมูลแยก Tenant
