#!/usr/bin/env node
/**
 * Manual seed script for the identity-service database.
 *
 * Usage:
 *   pnpm --filter identity-service node scripts/seed-data.cjs
 *
 * The script is idempotent: rerunning it updates the same sample users while
 * keeping their stable IDs so other services can reuse the data.
 */

const path = require('path');
const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load the local env file so DATABASE_URL (and friends) are available.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('../src/prisma/client');

const prisma = new PrismaClient();

const preferenceCatalog = [
  { key: 'karaoke', label: 'Karaoke Nights', icon: 'mic' },
  { key: 'coffee', label: 'Coffee Crawl', icon: 'coffee' },
  { key: 'hiking', label: 'Hiking Trails', icon: 'mountain' },
  { key: 'cooking', label: 'Cooking Club', icon: 'utensils' },
  { key: 'boardgames', label: 'Board Games', icon: 'dice' },
];

const seedUsers = [
  {
    id: '11111111-2222-4333-8444-555555555555',
    label: 'alice-organizer',
    name: 'Alice Organizer',
    email: 'alice.organizer@whendee.local',
    phoneNumber: '+66950000001',
    avatarUrl: 'https://cdn.whendee.local/avatars/alice.png',
    password: 'OrganizeMe123',
    preferences: [
      { key: 'karaoke', score: 9 },
      { key: 'coffee', score: 7 },
      { key: 'boardgames', score: 6 },
    ],
    friends: ['ben-guest', 'cami-host'],
  },
  {
    id: '22222222-3333-4444-8555-666666666666',
    label: 'ben-guest',
    name: 'Ben Guest',
    email: 'ben.guest@whendee.local',
    phoneNumber: '+66950000002',
    avatarUrl: 'https://cdn.whendee.local/avatars/ben.png',
    password: 'GuestPass123',
    preferences: [
      { key: 'coffee', score: 8 },
      { key: 'hiking', score: 7 },
      { key: 'boardgames', score: 5 },
    ],
    friends: ['alice-organizer'],
  },
  {
    id: '33333333-4444-5555-8666-777777777777',
    label: 'cami-host',
    name: 'Cami Host',
    email: 'cami.host@whendee.local',
    phoneNumber: '+66950000003',
    avatarUrl: 'https://cdn.whendee.local/avatars/cami.png',
    password: 'HostPass123',
    preferences: [
      { key: 'hiking', score: 9 },
      { key: 'cooking', score: 8 },
      { key: 'karaoke', score: 4 },
    ],
    friends: ['alice-organizer', 'ben-guest'],
  },
];

const refreshTtlDays = 30;

const log = (...args) => console.log('[identity-seed]', ...args);

async function ensurePreferenceCatalog() {
  log('Syncing preference catalog...');
  for (const category of preferenceCatalog) {
    await prisma.preferenceCategory.upsert({
      where: { key: category.key },
      update: {
        label: category.label,
        icon: category.icon,
      },
      create: category,
    });
  }

  const stored = await prisma.preferenceCategory.findMany();
  return new Map(stored.map((item) => [item.key, item]));
}

async function upsertUser(sample, categoryMap) {
  const hashedPassword = await bcrypt.hash(sample.password, 10);

  const user = await prisma.user.upsert({
    where: { email: sample.email },
    update: {
      name: sample.name,
      phoneNumber: sample.phoneNumber,
      avatarUrl: sample.avatarUrl,
      password: hashedPassword,
    },
    create: {
      id: sample.id,
      name: sample.name,
      email: sample.email,
      phoneNumber: sample.phoneNumber,
      avatarUrl: sample.avatarUrl,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
    },
  });

  await prisma.userPreference.deleteMany({
    where: { userId: user.id },
  });

  const preferencePayload = sample.preferences
    .map((pref, index) => {
      const category = categoryMap.get(pref.key);
      if (!category) {
        return null;
      }
      return {
        userId: user.id,
        categoryId: category.id,
        score: pref.score ?? 5,
        order: index,
      };
    })
    .filter(Boolean);

  if (preferencePayload.length) {
    await prisma.userPreference.createMany({
      data: preferencePayload.map(({ userId, categoryId, score }) => ({
        userId,
        categoryId,
        score,
      })),
    });
  }

  const accessToken = `seed-access-${randomUUID()}`;
  const refreshToken = `seed-refresh-${randomUUID()}`;
  const accessTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  const refreshTokenExpiry = new Date(
    Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      accessToken,
      accessTokenExpiry,
    },
  });

  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiry,
    },
  });

  return {
    id: user.id,
    label: sample.label,
    email: sample.email,
    accessToken,
    refreshToken,
  };
}

async function rebuildFriendships(userMap) {
  const userIds = Array.from(userMap.values()).map((entry) => entry.id);
  if (!userIds.length) {
    return;
  }

  await prisma.userFriend.deleteMany({
    where: {
      userId: { in: userIds },
    },
  });

  const friendTuples = [];
  for (const sample of seedUsers) {
    const owner = userMap.get(sample.label);
    if (!owner || !sample.friends?.length) continue;

    for (const friendLabel of sample.friends) {
      const friend = userMap.get(friendLabel);
      if (!friend) continue;

      friendTuples.push({
        userId: owner.id,
        friendId: friend.id,
      });
    }
  }

  if (friendTuples.length) {
    await prisma.userFriend.createMany({
      data: friendTuples,
      skipDuplicates: true,
    });
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not configured. Update services/identity-service/.env first.',
    );
  }

  log('Connecting to database...');
  const categoryMap = await ensurePreferenceCatalog();
  const seededUsers = [];
  const userMap = new Map();

  for (const sample of seedUsers) {
    const summary = await upsertUser(sample, categoryMap);
    seededUsers.push(summary);
    userMap.set(sample.label, summary);
  }

  await rebuildFriendships(userMap);

  log('Seed completed. Users you can reference from other services:');
  console.table(
    seededUsers.map((user) => ({
      label: user.label,
      id: user.id,
      email: user.email,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    })),
  );
}

main()
  .catch((error) => {
    console.error('[identity-seed] Failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
