import { PrismaClient } from "@prisma/client";
import prisma from "@/utils/prisma";

export type UserAuthInput = {
    fullname?:string;
    email: string;
    phonenumber?:string;
    password?: string;
    otp?:string
}

export type Token = {
    accessToken: string;
    refreshToken: string;
}