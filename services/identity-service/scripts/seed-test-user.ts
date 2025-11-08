import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../src/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'tester@example.com';
  const plainPassword = 'Password123!';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Tester User',
      phoneNumber: '+66900000000',
      avatarUrl: 'https://placehold.co/128x128',
      password: hashedPassword,
    },
    create: {
      name: 'Tester User',
      email,
      phoneNumber: '+66900000000',
      avatarUrl: 'https://placehold.co/128x128',
      password: hashedPassword,
    },
  });

  console.log('✅ Seeded mock user:');
  console.log(`   email: ${user.email}`);
  console.log(`   password: ${plainPassword}`);
}

main()
  .catch((error) => {
    console.error('Failed to seed mock user', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
