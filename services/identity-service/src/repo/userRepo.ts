import { PreferenceCategory, User, UserPreference } from "@/types/user";
import prisma from "@/utils/prisma";
import { get } from "http";

const userSelect = {
    id: true,
    name: true,
    email: true,
    phoneNumber: true,
    password: false,
    avatarUrl: true,
    createdAt: true,
    updatedAt: true,
    friends: {
        include: {
            user: true,
        },
    },
    preferences: {
        include: {
            category: true,
        },
    },
} as const;

const userSelectWithPassword = {
    ...userSelect,
    password: true,
} as const;

type PreferenceRecord = {
    id: string;
    score: number | null;
    category: PreferenceCategory;
};

type CreateUserInput = {
    name?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    password?: string | null;
    avatarUrl?: string | null;
};

const mapUser = (record: any): User => ({
    id: record.id,
    name: record.name ?? undefined,
    email: record.email ?? undefined,
    phoneNumber: record.phoneNumber ?? undefined,
    password: record.password ?? undefined,
    avatarUrl: record.avatarUrl ?? undefined,
    createdAt: record.createdAt ?? undefined,
    updatedAt: record.updatedAt ?? undefined,
    preferences: Array.isArray(record.preferences)
        ? record.preferences.map(mapPreference)
        : undefined,
});

const mapPreference = (record: PreferenceRecord): UserPreference => ({
    id: record.id,
    score: record.score ?? 0,
    category: {
        id: record.category.id,
        key: record.category.key,
        label: record.category.label,
        icon: record.category.icon ?? null,
    },
});

type PreferencePayload = {
    key: string;
    label?: string;
    icon?: string | null;
    score?: number;
};

const UserRepo = {
    listUsers: async (options: {
        page?: number;
        limit?: number;
        search?: string;
        excludeUserId?: string;
        orderBy?: 'createdAt' | 'updatedAt';
        sort?: 'asc' | 'desc';
    } = {}): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }> => {
        const page = Number.isFinite(options.page as number) && (options.page as number) > 0 ? Math.trunc(options.page as number) : 1;
        const rawLimit = Number.isFinite(options.limit as number) && (options.limit as number) > 0 ? Math.trunc(options.limit as number) : 20;
        const limit = Math.min(Math.max(rawLimit, 1), 100);
        const search = (options.search ?? '').trim();
        const orderBy = options.orderBy ?? 'createdAt';
        const sort = options.sort ?? 'desc';

        const where: any = {};
        if (options.excludeUserId) {
            where.id = { not: options.excludeUserId };
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
                { phoneNumber: { contains: search, mode: 'insensitive' as const } },
            ];
        }

        const [records, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: userSelect,
                orderBy: { [orderBy]: sort },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        const users = records.map(mapUser);
        const totalPages = Math.max(Math.ceil(total / limit), 1);
        return { users, total, page, limit, totalPages };
    },

    updateUserProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: updates.name ?? undefined,
                email: updates.email ?? undefined,
                phoneNumber: updates.phoneNumber ?? undefined,
                avatarUrl: updates.avatarUrl ?? undefined,
            },
        });
    },
    
    findUsersByIds: async (ids: string[]): Promise<User[]> => {
        const unique = Array.from(new Set(ids.filter((x) => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim())));
        if (unique.length === 0) return [];

        const records = await prisma.user.findMany({
            where: { id: { in: unique } },
            select: userSelect,
        });
        const mapped = records.map(mapUser);
        const byId = new Map(mapped.map((u) => [u.id, u] as const));
        // preserve input order, omit not-found ids
        return unique.map((id) => byId.get(id)).filter((v): v is User => Boolean(v));
    },
    listFriends: async (userId: string): Promise<User[]> => {
        if (!userId) {
            return [];
        }

        const records = await prisma.userFriend.findMany({
            where: { userId },
            select: {
                friend: {
                    select: userSelect,
                },
            },
        });

        return records
            .map((record) => record.friend)
            .filter(Boolean)
            .map(mapUser);
    },
    createUser: async (data: CreateUserInput): Promise<User> => {
        const record = await prisma.user.create({
            data,
            select: userSelect,
        });
        return mapUser(record);
    },
    getPreferences: async (userId: string): Promise<string[]> => {
        const record = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                preferences: {
                    include: {
                        category: true,
                    },
                },
            },
        });
        if (!record) {
            return [];
        }
        return record.preferences.map((pref) => pref.category.key);
    },

    addFriend: async (userId: string, friendId: string): Promise<User> => {
        if (userId === friendId) {
            throw new Error("Cannot add yourself as a friend");
        }

        return prisma.$transaction(async (tx) => {
            // Ensure both users exist
            const [userA, userB] = await Promise.all([
                tx.user.findUnique({ where: { id: userId } }),
                tx.user.findUnique({ where: { id: friendId } }),
            ]);

            if (!userA || !userB) {
                throw new Error("User or friend not found");
            }

            await tx.userFriend.upsert({
                where: { userId_friendId: { userId, friendId } },
                update: {},
                create: { userId, friendId },
            });

            await tx.userFriend.upsert({
                where: { userId_friendId: { userId: friendId, friendId: userId } },
                update: {},
                create: { userId: friendId, friendId: userId },
            });

            const record = await tx.user.findUnique({ where: { id: userId }, select: userSelect });
            if (!record) throw new Error("User not found");
            return mapUser(record);
        });
    },

    findUserbyEmail: async (email: string, options?: { includePassword?: boolean }): Promise<User | null> => {
        const select = options?.includePassword ? userSelectWithPassword : userSelect;
        const record = await prisma.user.findUnique({
            where: { email },
            select,
        });
        return record ? mapUser(record) : null;
    },

    findUserById: async (id: string): Promise<User | null> => {
        const record = await prisma.user.findUnique({
            where: { id },
            select: userSelect,
        });
        return record ? mapUser(record) : null;
    },

    updateUser: async (id: string, data: Partial<CreateUserInput>): Promise<User> => {
        const record = await prisma.user.update({
            where: { id },
            data,
            select: userSelect,
        });
        return mapUser(record);
    },

    deleteUser: async (id: string): Promise<void> => {
        await prisma.user.delete({ where: { id } });
    },

    findByPhone: async (phone: string): Promise<User | null> => {
        const record = await prisma.user.findUnique({
            where: { phoneNumber: phone },
            select: userSelect,
        });
        return record ? mapUser(record) : null;
    },

    updatePassword: async (id: string, hashedPassword: string): Promise<void> => {
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    },

    upsertAccessToken: async (id: string, token: string, expiresAt: Date | null): Promise<void> => {
        await prisma.user.update({
            where: { id },
            data: {
                accessToken: token,
                accessTokenExpiry: expiresAt,
            },
        });
    },

    replaceRefreshToken: async (userId: string, token: string, expiresAt: Date | null): Promise<void> => {
        await prisma.refreshToken.deleteMany({ where: { userId } });
        await prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt: expiresAt ?? new Date(),
            },
        });
    },

    findRefreshToken: async (token: string) => {
        return prisma.refreshToken.findUnique({ where: { token } });
    },

    deleteRefreshToken: async (token: string): Promise<void> => {
        await prisma.refreshToken.delete({ where: { token } });
    },

    deleteRefreshTokensByUser: async (userId: string): Promise<void> => {
        await prisma.refreshToken.deleteMany({ where: { userId } });
    },

    replacePreferences: async (userId: string, preferences: PreferencePayload[]): Promise<UserPreference[]> => {
        return prisma.$transaction(async (tx) => {
            await tx.userPreference.deleteMany({ where: { userId } });

            if (!preferences.length) {
                return [];
            }

            const categoryRecords = await Promise.all(
                preferences.map((item) =>
                    tx.preferenceCategory.upsert({
                        where: { key: item.key },
                        update: {
                            label: item.label ?? undefined,
                            icon: item.icon ?? undefined,
                        },
                        create: {
                            key: item.key,
                            label: item.label ?? item.key,
                            icon: item.icon ?? null,
                        },
                    })
                )
            );

            await Promise.all(
                categoryRecords.map((category, index) =>
                    tx.userPreference.create({
                        data: {
                            userId,
                            categoryId: category.id,
                            score: preferences[index]?.score ?? 5,
                        },
                    })
                )
            );

            const stored = await tx.userPreference.findMany({
                where: { userId },
                include: { category: true },
            });

            return stored.map(mapPreference);
        });
    },
};

export default UserRepo;
