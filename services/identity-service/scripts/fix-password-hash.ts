import 'dotenv/config';
import { PrismaClient } from '../src/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixPasswordHash() {
  try {
    // ค้นหา user tester
    const user = await prisma.user.findUnique({
      where: { email: 'tester@example.com' },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      console.log('❌ User not found: tester@example.com');
      return;
    }

    console.log('📋 Current password hash:', user.password);
    console.log('  - Length:', user.password?.length || 0);
    console.log('  - Is valid bcrypt format:', user.password ? /^\$2[aby]\$\d+\$/.test(user.password) : false);

    // สร้าง hash ใหม่ที่ถูกต้อง
    const correctPassword = 'test-pass';
    const correctHash = await bcrypt.hash(correctPassword, 10);
    
    console.log('\n✅ New correct hash:', correctHash);
    console.log('  - Length:', correctHash.length);
    console.log('  - Is valid bcrypt format:', /^\$2[aby]\$\d+\$/.test(correctHash));

    // ตรวจสอบว่า hash ใหม่ทำงานได้
    const verify = await bcrypt.compare(correctPassword, correctHash);
    console.log('  - Verification test:', verify ? '✅ PASS' : '❌ FAIL');

    if (!verify) {
      console.log('❌ Hash verification failed, aborting update');
      return;
    }

    // Update password ในฐานข้อมูล
    console.log('\n🔄 Updating password in database...');
    await prisma.user.update({
      where: { email: 'tester@example.com' },
      data: { password: correctHash },
    });

    console.log('✅ Password updated successfully!');

    // ตรวจสอบอีกครั้ง
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'tester@example.com' },
      select: {
        email: true,
        password: true,
      },
    });

    if (updatedUser?.password) {
      const finalVerify = await bcrypt.compare(correctPassword, updatedUser.password);
      console.log('\n🔍 Final verification:', finalVerify ? '✅ Password works correctly!' : '❌ Still not working');
      console.log('  - Stored hash:', updatedUser.password);
      console.log('  - Hash format valid:', /^\$2[aby]\$\d+\$/.test(updatedUser.password));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswordHash();

