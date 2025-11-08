import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../src/prisma/client';

const prisma = new PrismaClient();

const users = [
  {
    id: 'u_tester',
    name: 'Tester User',
    email: 'tester@example.com',
    phoneNumber: '+66900000000',
    avatarUrl: 'https://placehold.co/128x128',
    password: 'test-pass',
  },
  {
    id: 'u_nina',
    name: 'Nina Park',
    email: 'nina@example.com',
    phoneNumber: '+66900000001',
    avatarUrl: 'https://placehold.co/150?img=2',
    password: 'nina-pass',
  },
  {
    id: 'u_leo',
    name: 'Leo Tan',
    email: 'leo@example.com',
    phoneNumber: '+66900000002',
    avatarUrl: 'https://placehold.co/150?img=3',
    password: 'leo-pass',
  },
  {
    id: 'u_maya',
    name: 'Maya Chen',
    email: 'maya@example.com',
    phoneNumber: '+66900000003',
    avatarUrl: 'https://placehold.co/150?img=4',
    password: 'maya-pass',
  },
  {
    id: 'u_jonas',
    name: 'Jonas Lim',
    email: 'jonas@example.com',
    phoneNumber: '+66900000004',
    avatarUrl: 'https://placehold.co/150?img=5',
    password: 'jonas-pass',
  },
];

const friendPairs: Array<[string, string]> = [
  ['u_tester', 'u_nina'],
  ['u_tester', 'u_leo'],
  ['u_tester', 'u_maya'],
  ['u_tester', 'u_jonas'],
];

async function seedUsers() {
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        password: hashedPassword,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        password: hashedPassword,
      },
    });
  }
}

async function seedFriendships() {
  for (const [userId, friendId] of friendPairs) {
    await prisma.userFriend.upsert({
      where: {
        userId_friendId: {
          userId,
          friendId,
        },
      },
      update: {},
      create: {
        userId,
        friendId,
      },
    });

    await prisma.userFriend.upsert({
      where: {
        userId_friendId: {
          userId: friendId,
          friendId: userId,
        },
      },
      update: {},
      create: {
        userId: friendId,
        friendId: userId,
      },
    });
  }
}

async function main() {
  await seedUsers();
  await seedFriendships();
  console.log('✅ Seeded test users & friendships');
}

main()
  .catch((error) => {
    console.error('Failed to seed users', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
