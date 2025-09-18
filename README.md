
````markdown
# Whendee

This project is a part of ISE (Innovative System Engineering) coursework class of 2025 🎓

---

## 📦 Prerequisites

ก่อนเริ่มทำงานให้เตรียมเครื่องมือดังนี้:

- **Node.js** เวอร์ชัน 20 ขึ้นไป  
  ```bash
  node -v
````

* **pnpm** สำหรับจัดการ dependency

  ```bash
  npm i -g pnpm
  ```
* **Expo CLI** สำหรับรัน mobile app

  ```bash
  npm i -g expo-cli
  ```
* **Docker + Docker Compose** สำหรับรัน PostgreSQL (ฐานข้อมูล) และ pgAdmin (ไว้ดู DB)
* **Git** สำหรับจัดการ source code

---

## 🚀 การเริ่มต้นโปรเจกต์

### 1. Clone โปรเจกต์

```bash
git clone <GitHub-link>
cd Whendee
```

### 2. อัปเดต branch หลัก

```bash
git checkout main
git pull
```

### 3. สร้าง branch งานของตัวเอง

```bash
git checkout -b feature/<ชื่อฟีเจอร์หรืองาน>
```

### 4. รันฐานข้อมูล

```bash
cd infra/compose
docker compose up -d
cd ../../
```

---

## 🎨📱 สำหรับทีม Frontend (A, B)

1. เข้าโฟลเดอร์ frontend:

   ```bash
   cd apps/mobile-app
   ```

2. ติดตั้ง dependencies:

   ```bash
   pnpm install
   ```

3. สร้างไฟล์ `.env` ที่ `apps/mobile-app/.env`
   โดยดูตัวแปรอ้างอิงจาก `apps/mobile-app/.env.test`

4. รันแอป:

   ```bash
   pnpm start
   ```

---

## 😈🌐 สำหรับทีม Backend (C, D, E)

### 🗂 Service Responsibility

* **นัท** → `identity-service`
* **น้องเหนือ** → `comm-service`
* **ปูน** → `event-service`

### 1. สร้างไฟล์ `.env`

สร้างใน `services/{service-name}/.env`
โดยดูตัวแปรจาก reference file:
`services/{service-name}/.env.test`

### 2. เข้าโฟลเดอร์ service ของตัวเอง

ตัวอย่างเช่น นัท (identity service):

```bash
cd services/identity-service
```

### 3. Prisma migrate & generate

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

### 4. รัน service

```bash
pnpm dev
```

---

## 🧯 Troubleshooting

* **ต่อ DB ไม่ได้**

  ```bash
  docker ps   # ต้องเห็น container postgres
  ```

  ถ้าพอร์ตชน → แก้ `docker-compose.yml` หรือหยุดโปรแกรมที่ใช้พอร์ต 5432

* **Prisma error: “client not initialized”**

  ```bash
  pnpm prisma generate
  ```

* **Mismatch schema**

  ```bash
  pnpm prisma migrate dev
  ```

  → รันทุกครั้งหลัง `git pull` เพื่อ sync schema

```
