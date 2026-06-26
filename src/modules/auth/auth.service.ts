import httpStatus from 'http-status';
import { JwtPayload, SignOptions } from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import { prisma } from "../../lib/prisma";
import { SelfError } from "../../utils/errorResponse";
import { ILoginUser } from './auth.interface';
import config from '../../config';
import { jwtUtils } from '../../utils/jwt';

const loginUserIntoDB = async (payload: ILoginUser) => {
    const { email, password } = payload;

    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    });

    if (user.activeStatus === "BLOCKED") {
        throw new SelfError("Your account has been blocked. Please contact support.", httpStatus.FORBIDDEN);
    }

    const isPasswordMatched = await bcrypt.compare(
        password,
        user.password
    )

    if (!isPasswordMatched) {
        throw new SelfError("Incorrect password!", httpStatus.UNAUTHORIZED);
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt.accessSecret,
        config.jwt.accessExpiresIn as SignOptions
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt.refreshSecret,
        config.jwt.refreshExpiresIn as SignOptions
    );

    return { accessToken, refreshToken };
};

const authRefreshTokenIntoDB = async (refreshToken: string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt.refreshSecret);

    if (!verifiedRefreshToken.success) {
        throw new SelfError(verifiedRefreshToken.error);
    }

    const { id } = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where: { id }
    });

    if (user.activeStatus === "BLOCKED") {
        throw new SelfError("Your account has been blocked. Please contact support.", httpStatus.FORBIDDEN);
    }

    const JwtPayload = {
        id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const accessToken = jwtUtils.createToken(
        JwtPayload,
        config.jwt.accessSecret,
        config.jwt.accessExpiresIn as SignOptions
    );

    return { accessToken };
};


export const authService = {
    loginUserIntoDB,
    authRefreshTokenIntoDB
};