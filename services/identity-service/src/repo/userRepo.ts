import { UserAuthInput } from "@/types/user";
import { PrismaClient } from "@prisma/client";
import prisma from "@/utils/prisma";

const UserRepo = {
    createUser: async (data: UserAuthInput) => {
        return await prisma.user.create({ data });
    },

    findUserbyEmail: async (email:string) => {
        return await prisma.user.findUnique({ where: { email } });
    },

    findUserById: async (id:string) => {
        return await prisma.user.findUnique({ where: { id } });
    },

    updateUser: async (id:string, data: Partial<UserAuthInput>) => {
        return await prisma.user.update({
            where: { id },
            data,
        });
    },

    deleteUser: async (id:string) => {
        return await prisma.user.delete({ where: { id } });
    }
}

export default UserRepo;