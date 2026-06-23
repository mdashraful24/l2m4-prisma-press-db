import httpStatus from "http-status";
import { TypeController } from "../../types/express.types";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";

const registerUser: TypeController = catchAsync(async (req, res, next) => {
    const result = await userService.registerUserIntoDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User registered successfully",
        data: result,
    });
});


export const userController = {
    registerUser,

}