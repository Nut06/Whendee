# 🚀 คู่มือทดสอบ Notification แบบรวดเร็ว

## ขั้นตอนที่ 1: ตั้งค่า Environment (ทำครั้งเดียว)

```bash
# เพิ่ม USER_SERVICE_URL ใน event-service
cd /Users/poon/Work/Whendee/services/event-service
echo "" >> .env
echo "USER_SERVICE_URL=http://localhost:3002" >> .env
```

## ขั้นตอนที่ 2: เริ่ม Services

เปิด terminal 3 ตัว:

### Terminal 1: Identity Service
```bash
cd /Users/poon/Work/Whendee
pnpm --filter identity-service dev
```
**รอจนเห็น:** `identity Service is running on port 3002`

### Terminal 2: Event Service  
```bash
cd /Users/poon/Work/Whendee
pnpm --filter event-service dev
```
**รอจนเห็น:** `Event Service is running on port 3001`

### Terminal 3: Frontend
```bash
cd /Users/poon/Work/Whendee/frontend
npm start
```
**แล้วกด:** `i` (iOS) หรือ `a` (Android) หรือ `w` (Web)

## ขั้นตอนที่ 3: ทดสอบ

### 1. Login ด้วย User A (ผู้เชิญ)
- Email: `tester@example.com`
- Password: `test-pass`

### 2. สร้าง Event และเชิญเพื่อน
1. สร้าง event ใหม่
2. ไปที่หน้า "Add Members"
3. เชิญเพื่อน เช่น `nina@example.com`

### 3. ดู Logs
ใน **Terminal 2 (Event Service)** ควรเห็น:
```
[Notification] Sending event invite notification ...
[Notification] Event invite notification sent successfully
```

ใน **Terminal 1 (Identity Service)** ควรเห็น:
```
[Notification Controller] createEventInviteNotification called ...
[Notification Controller] Notification created successfully
```

### 4. Login ด้วย User B (ผู้ถูกเชิญ)
- Logout จาก User A
- Login ด้วย:
  - Email: `nina@example.com`
  - Password: `nina-pass`

### 5. ตรวจสอบ Notification
- ไปที่หน้า "Notifications"
- **ควรเห็นคำเชิญจาก User A** พร้อมปุ่ม Accept/Decline

## ✅ สิ่งที่ควรเห็น

1. ✅ Logs ใน Terminal 1 และ 2 แสดงการสร้าง notification สำเร็จ
2. ✅ เมื่อ login ด้วย user ที่ถูกเชิญ จะเห็น notification
3. ✅ Notification แสดงชื่อผู้เชิญและชื่อ event
4. ✅ สามารถ Accept หรือ Decline ได้

## 🐛 ถ้าไม่เห็น Notification

### ตรวจสอบ:
1. ✅ `USER_SERVICE_URL=http://localhost:3002` ใน `services/event-service/.env`
2. ✅ Identity service ทำงานอยู่ (Terminal 1)
3. ✅ Event service ทำงานอยู่ (Terminal 2)
4. ✅ ดู logs ว่ามี error หรือไม่

### ดู Logs:
- **Event Service (Terminal 2):** ควรเห็น `[Notification] Sending event invite notification`
- **Identity Service (Terminal 1):** ควรเห็น `[Notification Controller] createEventInviteNotification called`

### ตรวจสอบ Database:
```bash
# เชื่อมต่อ PostgreSQL
psql postgresql://dev:dev@localhost:5432/appdb

# ดู notifications
SELECT id, "userId", title, "eventId", status, "createdAt" 
FROM "Notification" 
ORDER BY "createdAt" DESC 
LIMIT 5;
```

## 📝 Test Users

- `tester@example.com` / `test-pass` (User A - ผู้เชิญ)
- `nina@example.com` / `nina-pass` (User B - ผู้ถูกเชิญ)
- `leo@example.com` / `leo-pass`
- `maya@example.com` / `maya-pass`
- `jonas@example.com` / `jonas-pass`

---

**หมายเหตุ:** หากต้องการ seed users ใหม่:
```bash
cd services/identity-service
npx ts-node -r tsconfig-paths/register scripts/seed-test-users.ts
```

