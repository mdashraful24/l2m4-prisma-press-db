import httpStatus from "http-status";
import { IUser } from "./user.interface"
import { prisma } from "../../lib/prisma";
import { SelfError } from "../../utils/errorResponse";
import bcrypt from "bcryptjs";
import config from "../../config";

const registerUserIntoDB = async (payload: IUser) => {
    const { name, email, password, activeStatus, role, profilePhoto, bio } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });

    if (isUserExist) {
        throw new SelfError("User already exists with this email", httpStatus.CONFLICT);
    }

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

    // await prisma.profile.create({
    //     data: {
    //         userId: createdUser.id,
    //         profilePhoto,
    //         bio
    //     }
    // });

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


export const userService = {
    registerUserIntoDB,

};