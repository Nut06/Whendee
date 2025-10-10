import { RequestOTP } from "@/types/user";
import { PrismaClient } from "@prisma/client";
import prisma from "@/utils/prisma";

const UserRepo = {
    createUser: async (data: RequestOTP) => {
        return await prisma.user.create({ data });
    },

    findUserbyEmail: async (email:string) => {
        return await prisma.user.findUnique({ where: { email } });
    },

    findUserById: async (id:string) => {
        return await prisma.user.findUnique({ where: { id } });
    },

    updateUser: async (id:string, data: Partial<RequestOTP>) => {
        return await prisma.user.update({
            where: { id },
            data,
        });
    },

    deleteUser: async (id:string) => {
        return await prisma.user.delete({ where: { id } });
    },

    findByPhone: async (phone:string) => {
        return await prisma.user.findUnique({ where: { phoneNumber: phone } });
    },
    updatePassword: async (id:string, hashedPassword:string) => {
        return await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    },

    updatedRefreshToken: async (id:string, refreshToken:string) => {
        return await prisma.account.updateMany({
            where: { userId: id },
            data: { refreshToken },
        });
    },

    clearRefreshToken: async (id:string) => {
        return await prisma.account.updateMany({
            where: { userId: id },
            data: { refreshToken: null },
        });
    }

}

export default UserRepo;