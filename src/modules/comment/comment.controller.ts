import httpStatus from 'http-status';
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { commentService } from "./comment.service";

const createComment = catchAsync(async (req, res) => {
    const authorId = req.user?.id as string;

    const result = await commentService.createCommentIntoDB(authorId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Comment created successfully",
        data: result
    });
});

const getCommentsByAuthor = catchAsync(async (req, res) => {
    const { authorId } = req.params;

    const result = await commentService.getCommentsByAuthorFromDB(authorId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Comments retrieved successfully",
        data: result
    });
});

const getSingleComment = catchAsync(async (req, res) => {

});

const updateComment = catchAsync(async (req, res) => {

});

const deleteComment = catchAsync(async (req, res) => {

});

const moderateComment = catchAsync(async (req, res) => {

});


export const commentController = {
    createComment,
    getCommentsByAuthor,
    getSingleComment,
    updateComment,
    deleteComment,
    moderateComment,
};