import httpStatus from "http-status";
import { IUser } from "./user.interface"
import { prisma } from "../../lib/prisma";
import { SelfError } from "../../utils/errorResponse";
import bcrypt from "bcryptjs";
import config from "../../config";

const registerUserIntoDB = async (payload: IUser) => {
    const { name, email, password, activeStatus, role, profilePhoto, bio } = payload;

    await prisma.user.findUniqueOrThrow({
        where: { email }
    });

    // if (isUserExist) {
    //     throw new SelfError("User already exists with this email");
    // }

    const hashedPassword = await bcrypt.hash(password, Number(config.security.bcryptSaltRounds));

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            activeStatus,
            role,
            profile: {
                create: {
                    profilePhoto,
                    bio
                }
            }
        }
    });

    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email || email
        },
        omit: { password: true },
        include: { profile: true }
    });

    return user;
};

const getMyProfileIntoDB = async (userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        omit: { password: true },
        include: { profile: true }
    });

    return user;
};

const updateMyProfileIntoDB = async (userId: string, payload: IUser) => {
    const { name, email, password, profilePhoto, bio } = payload;

    const hashedPassword = await bcrypt.hash(password, Number(config.security.bcryptSaltRounds));

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            name,
            email,
            password: hashedPassword,
            profile: {
                update: {
                    profilePhoto, bio
                }
            }
        },
        omit: { password: true },
        include: { profile: true }
    });

    return updatedUser;
};


export const userService = {
    registerUserIntoDB,
    getMyProfileIntoDB,
    updateMyProfileIntoDB,

};
