import httpStatus from 'http-status';
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { postService } from "./post.service";
import { SelfError } from '../../utils/errorResponse';

// ! Single Post
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

// ! Multiple Post
const createMultiplePost = catchAsync(async (req, res) => {
    const id = req.user?.id;

    const result = await postService.createMultiplePostDB(req.body, id as string);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "All Post created successfully",
        data: result
    });
})

const getPosts = catchAsync(async (req, res) => {
    const query = req.query;
    const result = await postService.getPostsFromDB(query);

    if (result.length === 0) {
        throw new SelfError("Post not found", httpStatus.NOT_FOUND);
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All post retrieved successfully",
        data: result
    });
});

const getPostStats = catchAsync(async (req, res) => {
    const result = await postService.getPostStatsFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Post stats retrieved successfully",
        data: result
    });
});

const getMyPosts = catchAsync(async (req, res) => {
    const authorId = req.user?.id;

    const result = await postService.getMyPostsFromDB(authorId as string);

    if (result.length === 0) {
        throw new SelfError("Post not found", httpStatus.NOT_FOUND);
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My Post retrieved successfully",
        data: result
    });
});

const getSinglePost = catchAsync(async (req, res) => {
    const postId = req.params.postId;

    if (!postId) {
        throw new SelfError("Post id required in params", httpStatus.BAD_REQUEST);
    }

    const result = await postService.getSinglePostFromDB(postId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Single post retrieved successfully",
        data: result
    });
});

const updatePost = catchAsync(async (req, res) => {
    const postId = req.params.postId as string;

    if (!postId) {
        throw new SelfError("Post id required in params", httpStatus.BAD_REQUEST);
    }

    const authorId = req.user?.id as string;
    const isAdmin = req.user?.role === "ADMIN";
    const payload = req.body;

    const result = await postService.updatePostIntoDB(postId, authorId, isAdmin, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Post updated successfully",
        data: result
    });
});

const deletePost = catchAsync(async (req, res) => {
    const postId = req.params.postId as string;

    if (!postId) {
        throw new SelfError("Post id required in params", httpStatus.BAD_REQUEST);
    }

    const authorId = req.user?.id as string;
    const isAdmin = req.user?.role === "ADMIN";

    await postService.deletePostFromDB(postId, authorId, isAdmin);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Post deleted successfully",
        data: null
    });
});


export const postController = {
    createPost,
    createMultiplePost,
    getPosts,
    getPostStats,
    getMyPosts,
    getSinglePost,
    updatePost,
    deletePost,
};