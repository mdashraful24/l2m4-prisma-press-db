import httpStatus from 'http-status';
import { NextFunction, Request, RequestHandler, Response } from "express";
import { sendResponse } from './sendResponse';
import { errorHandle } from './errorResponse';

export const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            const err = errorHandle(error);

            sendResponse(res, {
                statusCode: err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
                success: false,
                message: err.message,
                // error: err,
            });
        }
    }
};