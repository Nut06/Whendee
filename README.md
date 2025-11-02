<<<<<<< HEAD
# Whendee

โค้ดเบสนี้ใช้สำหรับงานกลุ่มรายวิชา ISE 2025 🎓  
รีโพนี้จัดเป็น [pnpm](https://pnpm.io)-based monorepo (frontend + backend services + infrastructure) และใช้ [Turborepo](https://turbo.build) สำหรับรันสคริปต์ข้ามแพ็กเกจ

---

## 📦 Prerequisites

เตรียมสภาพแวดล้อมให้พร้อมก่อนเริ่ม

- **Node.js 20+** – แนะนำติดตั้งผ่าน nvm แล้วตรวจสอบด้วย `node -v`
- **pnpm 9+** – ถ้าใช้ Node 16+ ให้สั่ง `corepack enable` แล้ว `corepack prepare pnpm@latest --activate`
- **Docker + Docker Compose** – สำหรับรัน PostgreSQL (และสามารถต่อ Container services ได้ภายหลัง)
- **Expo CLI** – `pnpm add -g expo-cli` (เฉพาะทีม frontend)
- **Git**

---

## 🚀 Quick start

```bash
git clone <repo-url>
cd Whendee
pnpm install
```

### 1. ตั้งค่า Environment Variables

แต่ละ backend service มีไฟล์ `services/<name>/.env.example` ตัวอย่างค่าเริ่มต้นแล้ว

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

คำสั่งนี้จะสตาร์ท PostgreSQL (พร้อม volume เก็บข้อมูล) และถ้าต้องการสามารถเพิ่มบริการอื่น ๆ ภายหลังได้

### 3. รัน Backend Services

รันทีละบริการ (แทนการรันทั้งหมดพร้อมกันเพื่อความยืดหยุ่น)

```bash
pnpm --filter identity-service dev      # http://localhost:3002
pnpm --filter event-service dev         # http://localhost:3001
pnpm --filter comm-service dev          # http://localhost:3000
```

> ⚠️ สคริปต์ `dev` ใช้ `ts-node` + `nodemon` ถ่ายทอดสด ดังนั้นต้องรันคำสั่งบนเทอร์มินัลแยกกันหรือใช้ `tmux`/VSCode split terminal

- รายละเอียดการพัฒนา UC-2 (Create Event) และ UC-6 (Poll & Voting) ดูเพิ่มใน `services/event-service/README.md`

### 4. รัน Frontend (Expo)

```bash
pnpm --filter frontend dev              # เปิด Expo DevTools
# หรือเข้าโฟลเดอร์แล้วสั่ง
cd frontend
pnpm dev
```

---

## 🧰 Monorepo Commands

- `pnpm dev` – ใช้ Turbo รัน `dev` script ของทุกแพ็กเกจพร้อมกัน (frontend + backend)  
  > ใช้ได้เมื่อพร้อมรับ log หลายตัวในเทอร์มินัลเดียว
- `pnpm build` – (placeholder) รัน build ทุกแพ็กเกจ
- `pnpm lint` – (placeholder) รันตัวตรวจ lint ถ้าแพ็กเกจนั้น ๆ กำหนดไว้
- `pnpm --filter <pkg> <command>` – รันสคริปต์ของแพ็กเกจที่เลือก เช่น `pnpm --filter identity-service prisma:migrate`

---

## 🧯 Troubleshooting

- **ต่อฐานข้อมูลไม่ได้**  
  ตรวจสอบ container `postgres`  
  ```bash
  docker ps | grep postgres
  docker compose logs postgres           # ดู log ขณะเริ่มต้น
  ```
  ถ้าพอร์ต `5432` ถูกใช้งาน ให้ปรับพอร์ตภายใน `infra/compose/docker-compose.yml`

- **Prisma client error** (เตรียมเพิ่ม schema ในอนาคต)  
  เมื่อเพิ่ม schema แล้วให้รัน  
  ```bash
  pnpm --filter <service> prisma:migrate
  pnpm --filter <service> prisma:generate
  ```

- **Expo cache โดนแคชเดิม**  
  `pnpm --filter frontend exec expo start -c`

- **ต้องล้าง node_modules ของบริการใดบริการหนึ่ง**  
  ```bash
  pnpm --filter <service> install
  ```

---

## 🗺️ โครงสร้างไดเรกทอรี (สรุป)

```
frontend/                  # ทีมจิง-โฟร์ท (Expo app)
infra/compose/docker-compose.yml
services/
  identity-service/        # นัท
  event-service/           # ปูน
  comm-service/            # น้องเหนือ
pnpm-workspace.yaml        # กำหนดแพ็กเกจทั้งหมดให้ pnpm เห็น
package.json               # scripts + turborepo root
turbo.json                 # pipeline definition
```

---

## ✅ สิ่งที่ควรทำต่อ

- เติม Prisma schema & migration ให้แต่ละบริการ
- สร้างสคริปต์ทดสอบ (unit/integration) ในแต่ละ service
- ระบุ environment variables เพิ่มเติมที่จำเป็นใน `.env.example`
- เพิ่ม CI (เช่น GitHub Actions) เพื่อรัน lint/test อัตโนมัติ