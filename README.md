# Whendee

โปรเจกต์สำหรับรายวิชา ISE (Innovative System Engineering) รุ่น 2025 🎓  
ทีมงานแบ่งเป็น Backend และ Frontend โดยใช้ monorepo เดียวกัน

---

## 📦 Prerequisites

เตรียมเครื่องมือก่อนเริ่มพัฒนา:

- **Node.js** 20+
- **pnpm** (ง่ายต่อการจัดการ workspace) – `npm i -g pnpm`
- **Expo CLI** – `npm i -g expo-cli`
- **Docker + Docker Compose** สำหรับฐานข้อมูลและ service อื่น ๆ
- **Git**

---

## 🚀 เริ่มใช้งาน Repo

```bash
git clone <repo-url>
cd Whendee
git checkout main
git pull
git checkout -b feature/<ชื่อฟีเจอร์>
```

### รันฐานข้อมูล (ถ้าทำ Backend)

```bash
cd infra/compose
docker compose up -d
cd ../../
```

---

## 🎨📱 Frontend (Expo)

ไฟล์ทั้งหมดอยู่ที่โฟลเดอร์ `frontend/`

```bash
cd frontend
npm install        # ทำครั้งแรกหรือหลังดึง dependency ใหม่
npm start          # = npx expo start
```

ใน Dev Server สามารถกด:

- `i` เปิด iOS Simulator
- `a` เปิด Android Emulator
- `w` เปิดเว็บ
- สแกน QR ด้วย Expo Go บนมือถือ

สคริปต์เพิ่มเติม:

- `npm run ios` / `npm run android` / `npm run web`
- `npm run lint`

> ถ้า Expo cache งอแง ให้ใช้ `npx expo start -c`

---

## 😈🌐 Backend

### Service Owners

- **นัท** → `services/identity-service`
- **น้องเหนือ** → `services/comm-service`
- **ปูน** → `services/event-service`

### ขั้นตอนมาตรฐาน

1. สร้างไฟล์ `.env` จากตัวอย่าง `services/<service>/.env.test`
2. เข้าโฟลเดอร์ service ของตัวเอง  
   `cd services/<service-name>`
3. Prisma migrate & generate  
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
4. รัน service  
   ```bash
   npm run dev
   ```

---

## 🧯 Troubleshooting

- **ต่อ DB ไม่ได้**  
  `docker ps` ต้องเห็น container postgres  
  ถ้าพอร์ตชนให้แก้ `docker-compose.yml` หรือหยุดโปรแกรมอื่น

- **Prisma error: client not initialized**  
  `npx prisma generate`

- **Schema ไม่ตรงหลัง pull**  
  `npx prisma migrate dev`

- **Expo build/cache พัง**  
  `rm -rf frontend/.expo` แล้ว `npm start -c`

---

## 📚 Resources

- [Expo Docs](https://docs.expo.dev/)
- [Learn Expo Tutorial](https://docs.expo.dev/tutorial/introduction/)
- Discord community: [chat.expo.dev](https://chat.expo.dev)

---

ร่วมกันพัฒนาได้เลย 💙 PR ที่ดีควรแนบ screenshot หรือ screen-record หากเป็นงาน UI/UX เสมอ
