import 'dotenv/config';
import { PrismaClient } from '../src/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const testUsers = [
  { email: 'tester@example.com', password: 'test-pass' },
  { email: 'nina@example.com', password: 'nina-pass' },
  { email: 'leo@example.com', password: 'leo-pass' },
  { email: 'maya@example.com', password: 'maya-pass' },
  { email: 'jonas@example.com', password: 'jonas-pass' },
];

async function fixAllTestPasswords() {
  try {
    console.log('🔍 Checking all test users...\n');

    for (const testUser of testUsers) {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });

      if (!user) {
        console.log(`❌ User not found: ${testUser.email}`);
        continue;
      }

      const isValidFormat = user.password ? /^\$2[aby]\$\d+\$/.test(user.password) : false;
      const needsFix = !user.password || !isValidFormat;

      console.log(`📋 ${testUser.email}:`);
      console.log(`  - Has password: ${!!user.password}`);
      console.log(`  - Valid format: ${isValidFormat}`);
      console.log(`  - Needs fix: ${needsFix}`);

      if (needsFix) {
        const correctHash = await bcrypt.hash(testUser.password, 10);
        const verify = await bcrypt.compare(testUser.password, correctHash);
        
        if (!verify) {
          console.log(`  ⚠️  Hash verification failed, skipping`);
          continue;
        }

        await prisma.user.update({
          where: { email: testUser.email },
          data: { password: correctHash },
        });

        console.log(`  ✅ Password fixed!`);
      } else {
        // ตรวจสอบว่า password ที่มีอยู่ทำงานได้หรือไม่
        const verify = await bcrypt.compare(testUser.password, user.password!);
        console.log(`  - Password works: ${verify ? '✅' : '❌'}`);
        
        if (!verify) {
          // ถ้า password ไม่ทำงาน แก้ไขใหม่
          const correctHash = await bcrypt.hash(testUser.password, 10);
          await prisma.user.update({
            where: { email: testUser.email },
            data: { password: correctHash },
          });
          console.log(`  ✅ Password re-hashed and fixed!`);
        }
      }
      console.log('');
    }

    console.log('✅ All test users checked and fixed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllTestPasswords();

