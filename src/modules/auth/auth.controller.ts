import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";

const loginUser = catchAsync(async (req, res) => {
    const result = await authService.loginUserIntoDB(req.body);

    const { accessToken, refreshToken } = result;

    res.cookie("access-token", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24      // * 24 hours or 1 day
    });

    res.cookie("refresh-token", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7        // * 7 days
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully",
        data: result
    });
});

const authRefreshToken = catchAsync(async (req, res) => {
    const refreshToken = req.cookies["refresh-token"];

    const { accessToken } = await authService.authRefreshTokenIntoDB(refreshToken);

    res.cookie("access-token", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24      // * 24 hours or 1 day
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken }
    });
});


export const authController = {
    loginUser,
    authRefreshToken
};