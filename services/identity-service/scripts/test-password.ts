import 'dotenv/config';
import { PrismaClient } from '../src/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testPassword() {
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

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length || 0,
      passwordPreview: user.password ? `${user.password.substring(0, 20)}...` : 'null',
      passwordStartsWith: user.password?.substring(0, 7) || 'null',
    });

    // ตรวจสอบ format ของ hash
    if (user.password) {
      const isBcryptFormat = /^\$2[aby]\$\d+\$/.test(user.password);
      console.log('\n📋 Password Hash Analysis:');
      console.log('  - Is valid bcrypt format:', isBcryptFormat);
      console.log('  - Full hash:', user.password);
      
      if (!isBcryptFormat) {
        console.log('  ⚠️  WARNING: Password hash does not have valid bcrypt format!');
        console.log('  ⚠️  Expected format: $2a$10$... or $2b$10$...');
      }
    }

    // ทดสอบ compare password
    console.log('\n🔐 Testing password comparison:');
    const testPassword = 'test-pass';
    
    if (!user.password) {
      console.log('  ❌ User has no password stored');
      return;
    }

    // ทดสอบกับ hash ที่มีอยู่
    const compareResult1 = await bcrypt.compare(testPassword, user.password);
    console.log('  - Compare "test-pass" with stored hash:', compareResult1 ? '✅ MATCH' : '❌ NO MATCH');

    // ทดสอบกับ hash ที่คุณให้มา
    const providedHash = 'b0.NS6QNwdiKoHjgRbw80GlPsf/Zu';
    console.log('\n📝 Testing with provided hash fragment:', providedHash);
    
    // ลองสร้าง hash ใหม่จาก password เดียวกัน
    console.log('\n🔧 Generating new hash from "test-pass":');
    const newHash10 = await bcrypt.hash(testPassword, 10);
    const newHash12 = await bcrypt.hash(testPassword, 12);
    console.log('  - New hash (10 rounds):', newHash10);
    console.log('  - New hash (12 rounds):', newHash12);
    
    // ตรวจสอบว่า hash ที่สร้างใหม่ match กับ password หรือไม่
    const verifyNewHash10 = await bcrypt.compare(testPassword, newHash10);
    const verifyNewHash12 = await bcrypt.compare(testPassword, newHash12);
    console.log('  - Verify new hash (10 rounds):', verifyNewHash10 ? '✅' : '❌');
    console.log('  - Verify new hash (12 rounds):', verifyNewHash12 ? '✅' : '❌');

    // ตรวจสอบว่า hash ที่คุณให้มาเป็นส่วนหนึ่งของ hash ที่ถูกต้องหรือไม่
    if (user.password.includes(providedHash)) {
      console.log('\n✅ Provided hash fragment found in stored hash');
    } else {
      console.log('\n❌ Provided hash fragment NOT found in stored hash');
      console.log('  - Stored hash ending:', user.password.substring(user.password.length - 30));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();

