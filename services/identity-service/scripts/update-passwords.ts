import 'dotenv/config';
import { PrismaClient } from '../src/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const users = [
  { email: 'tester@example.com', password: 'test-pass' },
  { email: 'nina@example.com', password: 'nina-pass' },
  { email: 'leo@example.com', password: 'leo-pass' },
  { email: 'maya@example.com', password: 'maya-pass' },
  { email: 'jonas@example.com', password: 'jonas-pass' },
];

async function main() {
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    await prisma.user.update({
      where: { email: user.email },
      data: { password: hash },
    });
  }
  console.log('Updated test user passwords');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
