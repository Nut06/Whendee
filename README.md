# Whendee

โปรเจ็กต์กลุ่มรายวิชา ISE 2025 🎓 ใช้โครงสร้าง monorepo (pnpm + Turborepo) รวมทั้ง frontend (Expo) และ backend services

---

## 📦 Prerequisites

เตรียมสภาพแวดล้อมก่อนเริ่มงาน

- **Node.js 20+** (แนะนำติดตั้งผ่าน `nvm` และตรวจด้วย `node -v`)
- **pnpm 9+** – เปิด corepack แล้ว `corepack prepare pnpm@latest --activate`
- **Expo CLI** – `pnpm add -g expo-cli` (หรือ `npm i -g expo-cli`)
- **Docker + Docker Compose** – สำหรับฐานข้อมูล/บริการประกอบ
- **Git**

---

## 🚀 Quick Start

```bash
git clone <repo-url>
cd Whendee
git checkout main
git pull
git checkout -b feature/<ชื่อฟีเจอร์>
pnpm install
```

---

## 😈 Backend Setup

### 1. สร้าง Environment Variables

ภายใน `services/<service>/.env.example` มีค่าเริ่มต้นให้ พร้อมพ้อยท์ไปที่ Postgres บนเครื่อง

```bash
cp services/identity-service/.env.example services/identity-service/.env
cp services/event-service/.env.example services/event-service/.env
cp services/comm-service/.env.example services/comm-service/.env
cp frontend/.env.example frontend/.env
```

โดยค่าเริ่มต้นจะพ้อยท์ไปที่ฐานข้อมูล Postgres ภายในเครื่อง (`localhost:5432`) และตั้งค่า `PORT` ให้ตรงกับ service นั้น ๆ หากต้องการปรับแก้ให้แก้ในไฟล์ `.env`

สำหรับฝั่ง frontend (`expo`) สามารถตั้งค่า base URL ของ API ได้ที่ `frontend/.env`

### 2. รันฐานข้อมูล (Docker)

```bash
cd infra/compose
docker compose up -d
cd ../../
```

### 3. รัน Backend Services

เปิดเทอร์มินัลแยกกันเพื่อความง่าย

```bash
pnpm --filter identity-service dev      # http://localhost:3002
pnpm --filter event-service dev         # http://localhost:3001
pnpm --filter comm-service dev          # http://localhost:3000
```

> `dev` script ใช้ ts-node + nodemon จึงรันแบบ live reload

### เจ้าของบริการ

- **นัท** → `services/identity-service`
- **น้องเหนือ** → `services/comm-service`
- **ปูน** → `services/event-service`

เมื่อ schema Prisma เปลี่ยนให้รัน

```bash
pnpm --filter <service> prisma:migrate
pnpm --filter <service> prisma:generate
```

---

## 🎨 Frontend (Expo)

งานทั้งหมดอยู่ใน `frontend/`

```bash
cd frontend
npm install            # ครั้งแรก
npm start              # = npx expo start
```

คำสั่ง Dev Server:

- กด `i` เปิด iOS simulator
- กด `a` เปิด Android emulator
- กด `w` เปิดเว็บ
- หรือสแกน QR ผ่าน Expo Go

สคริปต์ที่ใช้บ่อย

- `npm run ios`, `npm run android`, `npm run web`
- `npm run lint`
- `npx expo start -c` (ล้าง cache ถ้า Expo งอแง)

> ภายใต้แท็บ Home, Friends, Calendar, Settings มีไฟล์ใน `frontend/app/(main)/` ที่ใช้ file-based routing (Expo Router)

---

## 🧰 Monorepo Tips

- `pnpm dev` – ให้ Turbo รัน `dev` script ทุกแพ็กเกจพร้อมกัน (จะมี log ปนกัน)
- `pnpm --filter <pkg> <command>` – รันเฉพาะแพ็กเกจ เช่น `pnpm --filter identity-service prisma:migrate`
- `pnpm build`, `pnpm lint` – placeholder ให้ตั้งเพิ่มตามความต้องการ

---

## 🧯 Troubleshooting

- **ต่อฐานข้อมูลไม่ได้**  
  ตรวจ log Docker  
  ```bash
  docker ps | grep postgres
  docker compose logs postgres
  ```  
  ถ้าพอร์ต 5432 ถูกใช้ ปรับใน `infra/compose/docker-compose.yml`

- **Prisma client error / schema mismatch**  
  รัน `pnpm --filter <service> prisma:migrate` และ `pnpm --filter <service> prisma:generate`

- **Expo cache ค้าง**  
  `pnpm --filter frontend exec expo start -c`

- **ต้องล้าง node_modules บาง service**  
  `pnpm --filter <service> install`

---

## 🗂 Directory Overview

```
frontend/                     # Expo app (ทีมจิง-โฟร์ท)
infra/compose/docker-compose.yml
services/
  identity-service/           # นัท
  event-service/              # ปูน
  comm-service/               # น้องเหนือ
pnpm-workspace.yaml           # รายการแพ็กเกจทั้งหมด
```
