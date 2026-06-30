import httpStatus from 'http-status';
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { subscriptionService } from "./subscription.service";

const createCheckoutSession = catchAsync(async (req, res) => {
    const userId = req.user?.id;

    const result = await subscriptionService.createSubscriptionSession(userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Checkout completed successfully",
        data: result
    });
});


export const subscriptionController = {
    createCheckoutSession,
}