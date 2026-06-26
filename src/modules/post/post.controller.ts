import httpStatus from 'http-status';
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { postService } from "./post.service";

const createPost = catchAsync(async (req, res) => {
    const id = req.user?.id;

    const result = await postService.createPostIntoDB(req.body, id as string);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Post created successfully",
        data: result
    });
});

const getPosts = catchAsync(async (req, res) => {
    const result = await postService.getPostsFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All post fetched successfully",
        data: result
    });
});

const getPostStats = catchAsync(async (req, res) => {

});

const getMyPosts = catchAsync(async (req, res) => {

});

const getSinglePost = catchAsync(async (req, res) => {

});

const updatePost = catchAsync(async (req, res) => {

});

const deletePost = catchAsync(async (req, res) => {

});


export const postController = {
    createPost,
    getPosts,
    getPostStats,
    getMyPosts,
    getSinglePost,
    updatePost,
    deletePost,
};