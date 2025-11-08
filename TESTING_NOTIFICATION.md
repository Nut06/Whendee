# คู่มือการทดสอบระบบ Notification

## 📋 ขั้นตอนการทดสอบ

### 1. ตรวจสอบ Environment Variables

#### Event Service (.env)
ตรวจสอบว่า `services/event-service/.env` มี:
```bash
DATABASE_URL=postgresql://dev:dev@localhost:5432/appdb?schema=public
PORT=3001
USER_SERVICE_URL=http://localhost:3002  # ← สำคัญ! ต้องตั้งค่านี้
```

#### Identity Service (.env)
ตรวจสอบว่า `services/identity-service/.env` มี:
```bash
DATABASE_URL=postgresql://dev:dev@localhost:5432/appdb?schema=public
PORT=3002
```

### 2. เริ่ม Services

เปิด terminal แยกกัน 3 ตัว:

**Terminal 1 - Identity Service:**
```bash
cd /Users/poon/Work/Whendee
pnpm --filter identity-service dev
```
ควรเห็น: `identity Service is running on port 3002`

**Terminal 2 - Event Service:**
```bash
cd /Users/poon/Work/Whendee
pnpm --filter event-service dev
```
ควรเห็น: `Event Service is running on port 3001`

**Terminal 3 - Frontend:**
```bash
cd /Users/poon/Work/Whendee/frontend
npm start
```

### 3. ทดสอบการเชิญเพื่อน

#### ขั้นตอนที่ 1: Login ด้วย User A (ผู้เชิญ)
1. เปิด app ใน Expo
2. Login ด้วย:
   - Email: `tester@example.com`
   - Password: `test-pass`

#### ขั้นตอนที่ 2: สร้าง Event และเชิญเพื่อน
1. สร้าง event ใหม่
2. ไปที่หน้า Add Members
3. เชิญเพื่อน (เช่น `nina@example.com` หรือ `leo@example.com`)

#### ขั้นตอนที่ 3: ตรวจสอบ Logs

**ใน Terminal 2 (Event Service)** ควรเห็น:
```
[Notification] Sending event invite notification {
  url: 'http://localhost:3002/notification/event-invite',
  targetUserId: 'u_nina',
  eventId: '...',
  eventTitle: '...',
  inviterId: 'u_tester',
  inviterName: 'Tester User'
}
[Notification] Event invite notification sent successfully
```

**ใน Terminal 1 (Identity Service)** ควรเห็น:
```
[Notification Controller] createEventInviteNotification called {
  targetUserId: 'u_nina',
  eventId: '...',
  eventTitle: '...',
  inviterId: 'u_tester',
  inviterName: 'Tester User'
}
[Notification Controller] Notification created successfully {
  notificationId: '...',
  userId: 'u_nina',
  eventId: '...'
}
```

#### ขั้นตอนที่ 4: Login ด้วย User B (ผู้ถูกเชิญ)
1. Logout จาก User A
2. Login ด้วย:
   - Email: `nina@example.com`
   - Password: `nina-pass`

#### ขั้นตอนที่ 5: ตรวจสอบ Notification
1. ไปที่หน้า Notifications
2. ควรเห็นคำเชิญจาก User A
3. ควรเห็น:
   - Title: "You're invited to [Event Title]"
   - Message: "Tester User invited you to join this event."
   - ปุ่ม Accept และ Decline

### 4. ตรวจสอบใน Database (Optional)

```bash
# เชื่อมต่อ PostgreSQL
psql postgresql://dev:dev@localhost:5432/appdb

# ตรวจสอบ notifications
SELECT id, "userId", type, title, message, "eventId", "inviterId", status, payload, "createdAt"
FROM "Notification"
ORDER BY "createdAt" DESC
LIMIT 10;

# ตรวจสอบ event members
SELECT id, "eventId", "userId", status, "invitedAt", "joinedAt"
FROM "EventMember"
ORDER BY "invitedAt" DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### ปัญหา: ไม่เห็น notification

**ตรวจสอบ:**
1. ✅ `USER_SERVICE_URL` ถูกตั้งค่าใน event-service `.env` หรือไม่
2. ✅ Identity service ทำงานอยู่หรือไม่ (port 3002)
3. ✅ ดู logs ใน Terminal 1 และ 2 ว่ามี error หรือไม่
4. ✅ ตรวจสอบว่า notification ถูกสร้างใน database หรือไม่

**Logs ที่ควรเห็น:**
- Event Service: `[Notification] Sending event invite notification`
- Identity Service: `[Notification Controller] createEventInviteNotification called`

### ปัญหา: Error "USER_SERVICE_URL is not configured"

**แก้ไข:**
```bash
# แก้ไข services/event-service/.env
echo "USER_SERVICE_URL=http://localhost:3002" >> services/event-service/.env
# รีสตาร์ท event-service
```

### ปัญหา: Notification ไม่แสดงในหน้า Notifications

**ตรวจสอบ:**
1. Login ด้วย user ที่ถูกเชิญ (ไม่ใช่ user ที่เชิญ)
2. ตรวจสอบ logs ใน Terminal 1:
   ```
   [Notification Controller] listNotifications called { userId: 'u_nina', ... }
   [Notification Controller] Notifications retrieved { userId: 'u_nina', count: 1, ... }
   ```
3. ตรวจสอบ database ว่า notification มี userId ตรงกับ user ที่ login หรือไม่

### ปัญหา: Frontend ไม่สามารถเรียก API ได้

**ตรวจสอบ:**
1. Frontend `.env` มี:
   ```
   EXPO_PUBLIC_IDENTITY_SERVICE_URL=http://localhost:3002
   EXPO_PUBLIC_EVENT_SERVICE_URL=http://localhost:3001
   ```
2. Restart Expo dev server
3. ตรวจสอบ network tab ใน browser/dev tools

## ✅ Checklist การทดสอบ

- [ ] Services ทั้งหมดทำงาน (identity, event, frontend)
- [ ] `USER_SERVICE_URL` ถูกตั้งค่าใน event-service
- [ ] สามารถ login ได้ด้วย test users
- [ ] สามารถสร้าง event และเชิญเพื่อนได้
- [ ] เห็น logs ใน event-service เมื่อเชิญเพื่อน
- [ ] เห็น logs ใน identity-service เมื่อสร้าง notification
- [ ] Notification ถูกสร้างใน database
- [ ] Login ด้วย user ที่ถูกเชิญแล้วเห็น notification
- [ ] สามารถ Accept/Decline notification ได้

## 📝 หมายเหตุ

- Test users:
  - `tester@example.com` / `test-pass`
  - `nina@example.com` / `nina-pass`
  - `leo@example.com` / `leo-pass`
  - `maya@example.com` / `maya-pass`
  - `jonas@example.com` / `jonas-pass`

- หากต้องการ seed users ใหม่:
  ```bash
  cd services/identity-service
  npx ts-node -r tsconfig-paths/register scripts/seed-test-users.ts
  ```

