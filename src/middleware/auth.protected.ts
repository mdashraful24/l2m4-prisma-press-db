import httpStatus from 'http-status';
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { catchAsync } from "../utils/catchAsync";
import { SelfError } from "../utils/errorResponse";
import { jwtUtils } from "../utils/jwt";
import { prisma } from "../lib/prisma";

const authProtected = (...requiredRoles: Role[]) => {
    return catchAsync(async (req, res, next) => {

        try {
            const token = req.cookies["access-token"] ?
                req.cookies["access-token"]
                : req.headers.authorization?.startsWith("Bearer ") ?
                    req.headers.authorization?.split(" ")[1]
                    : req.headers.authorization;

            if (!token) {
                throw new SelfError("You are not logged in. Please log in to access this resource.", httpStatus.UNAUTHORIZED);
            }

            const verifiedToken = jwtUtils.verifyToken(token, config.jwt.accessSecret);

            if (!verifiedToken.success) {
                throw new SelfError(verifiedToken.error, httpStatus.UNAUTHORIZED);
            }

            const { id, name, email, role } = verifiedToken.data as JwtPayload;

            if (requiredRoles.length && !requiredRoles.includes(role)) {
                throw new SelfError("Forbidden. You don't have permission to access this resource.", httpStatus.FORBIDDEN);
            }

            const user = await prisma.user.findUnique({
                where: { id, name, email, role }
            });

            if (!user) {
                throw new SelfError("User not found. Please log in again.", httpStatus.BAD_REQUEST);
            }

            if (user.activeStatus === "BLOCKED") {
                throw new SelfError("Your account has been blocked. Please contact support.", httpStatus.FORBIDDEN);
            }

            req.user = { id, name, email, role };

            next();
        } catch (error) {
            next(error)
        }
    });
};

export default authProtected;
