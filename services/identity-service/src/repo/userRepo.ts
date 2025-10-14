import { OTPRequest, User } from "@/types/user";
import prisma from "@/utils/prisma";

const UserRepo = {
    createUser: async (data: OTPRequest):Promise<User> => {
        // Create user with refresh token

        // Insert refresh token if needed
        const user:User = await prisma.user.create({ 
            data,
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true,
            }
        }) as User;

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: "your_refresh_token_here",
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            }
        });

        return user;
    },

    findUserbyEmail: async (email:string):Promise<User | null> => {
        return await prisma.user.findUnique({ where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            }
        }) as User;
    },

    findUserById: async (id:string):Promise<User | null> => {
        return await prisma.user.findUnique({ where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            }
        }) as User | null;
    },

    updateUser: async (id:string, data: Partial<OTPRequest>):Promise<void> => {
        await prisma.user.update({
            where: { id },
            data,
        });
    },

    deleteUser: async (id:string):Promise<void> => {
        await prisma.user.delete({ where: { id } });
    },

    findByPhone: async (phone:string):Promise<User | null> => {
        return await prisma.user.findUnique({ where: { phoneNumber: phone },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                updatedAt: true,
            }
        }) as User | null;
    },

    updatePassword: async (id:string, hashedPassword:string):Promise<void> => {
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    },

    updatedRefreshToken: async (id:string, refreshToken:string):Promise<void> => {
        const existingToken = await prisma.refreshToken.findFirst({
            where: { userId: id },
        });

        if (!existingToken) {
            await prisma.refreshToken.create({
                data: {
                    userId: id,
                    token: refreshToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                }
            });
        }

        await prisma.refreshToken.updateMany({
            where: { userId: id },
            data: { token: refreshToken },
        });
    },

    clearRefreshToken: async (id:string):Promise<void> => {
        await prisma.account.updateMany({
            where: { userId: id },
            data: { refreshToken: null },
        });
    }

}

export default UserRepo;