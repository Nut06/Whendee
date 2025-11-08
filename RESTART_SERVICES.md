# 🔄 วิธี Restart Services

## ปัญหา: `USER_SERVICE_URL is not configured`

ถ้าเห็น error นี้ แสดงว่า **Event Service ต้อง restart** เพื่อโหลด environment variable ใหม่

## ✅ วิธีแก้ไข

### 1. หยุด Event Service
- ไปที่ Terminal ที่รัน Event Service
- กด `Ctrl + C` เพื่อหยุด service

### 2. Restart Event Service
```bash
cd /Users/poon/Work/Whendee
pnpm --filter event-service dev
```

### 3. ตรวจสอบว่า Service เริ่มต้นสำเร็จ
ควรเห็น:
```
Event Service is running on port 3001
```

### 4. ทดสอบอีกครั้ง
- เชิญเพื่อนอีกครั้ง
- ตรวจสอบ logs ว่าเห็น:
  ```
  [Notification] Sending event invite notification
  ```
  แทนที่จะเป็น:
  ```
  [Notification] USER_SERVICE_URL is not configured
  ```

## 📋 Checklist

- [ ] `.env` file มี `USER_SERVICE_URL=http://localhost:3002`
- [ ] Event Service ถูก restart แล้ว
- [ ] เห็น log `Event Service is running on port 3001`
- [ ] ทดสอบเชิญเพื่อนแล้ว ไม่เห็น error `USER_SERVICE_URL is not configured`

## 🔍 ตรวจสอบ Environment Variable

ตรวจสอบว่า `.env` มีค่าถูกต้อง:
```bash
cd /Users/poon/Work/Whendee/services/event-service
cat .env | grep USER_SERVICE_URL
```

ควรเห็น:
```
USER_SERVICE_URL=http://localhost:3002
```

## 🚀 Quick Restart All Services

ถ้าต้องการ restart ทุก services:

```bash
# Terminal 1: Identity Service
cd /Users/poon/Work/Whendee
pnpm --filter identity-service dev

# Terminal 2: Event Service (ต้อง restart นี้!)
cd /Users/poon/Work/Whendee
pnpm --filter event-service dev

# Terminal 3: Frontend (optional)
cd /Users/poon/Work/Whendee/frontend
npm start
```

---

**หมายเหตุ:** หลังจากแก้ไข `.env` file ต้อง restart service เสมอ!

