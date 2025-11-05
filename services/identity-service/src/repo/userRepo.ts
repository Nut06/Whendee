import { PreferenceCategory, User, UserPreference } from "@/types/user";
import prisma from "@/utils/prisma";

const userSelect = {
    id: true,
    name: true,
    email: true,
    phoneNumber: true,
    password: false,
    avatarUrl: true,
    createdAt: true,
    updatedAt: true,
    preferences: {
        include: {
            category: true,
        },
    },
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
    createUser: async (data: CreateUserInput): Promise<User> => {
        const record = await prisma.user.create({
            data,
            select: userSelect,
        });
        return mapUser(record);
    },

    findUserbyEmail: async (email: string): Promise<User | null> => {
        const record = await prisma.user.findUnique({
            where: { email },
            select: userSelect,
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