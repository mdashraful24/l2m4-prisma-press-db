import httpStatus from 'http-status';
import { prisma } from "../../lib/prisma";
import { SelfError } from "../../utils/errorResponse";
import { IPost, IUpdatePostPayload } from "./post.interface";

const createPostIntoDB = async (payload: IPost, userId: string) => {
    const post = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId
        }
    });

    return post;
};

const getPostsFromDB = async () => {
    const posts = await prisma.post.findMany({
        include: {
            author: {
                omit: {
                    id: true,
                    email: true,
                    password: true,
                    activeStatus: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            },
            comments: true
        }
    });

    return posts;
};

const getPostStatsFromDB = async () => {

};

const getMyPostsFromDB = async (authorId: string) => {
    const myPost = await prisma.post.findMany({
        where: { authorId },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            comments: true,
            author: {
                omit: {
                    password: true
                }
            },
            _count: {
                select: {
                    comments: true
                }
            }
        }
    });

    return myPost;
};

const getSinglePostFromDB = async (postId: string) => {
    const findPost = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!findPost) {
        throw new SelfError("Post not found", httpStatus.NOT_FOUND);
    }

    const post = await prisma.post.update({
        where: { id: postId },
        omit: { authorId: true },
        data: {
            views: {
                increment: 1
            }
        },
        include: {
            author: {
                omit: {
                    id: true,
                    email: true,
                    password: true,
                    activeStatus: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            },
            comments: true
        }
    });

    return post;
};

const updatePostIntoDB = async (postId: string, authorId: string, isAdmin: boolean, payload: IUpdatePostPayload) => {
    const findPost = await prisma.post.findUniqueOrThrow({
        where: { id: postId }
    });

    if (!isAdmin && findPost.authorId !== authorId) {
        throw new SelfError("You are not eligible to update this post");
    }

    const post = await prisma.post.update({
        where: { id: postId },
        data: payload,
        include: {
            author: {
                omit: {
                    id: true,
                    password: true,
                    activeStatus: true,
                    // role: true,
                    createdAt: true,
                    updatedAt: true
                }
            },
            comments: true
        }
    });

    return post;
};

const deletePostFromDB = async (postId: string, authorId: string, isAdmin: boolean) => {
    const findPost = await prisma.post.findUniqueOrThrow({
        where: { id: postId }
    });

    if (!isAdmin && findPost.authorId !== authorId) {
        throw new SelfError("You are not eligible to delete this post", httpStatus.INTERNAL_SERVER_ERROR);
    }

    const post = await prisma.post.delete({
        where: { id: postId }
    });

    return post;
};


export const postService = {
    createPostIntoDB,
    getPostsFromDB,
    getPostStatsFromDB,
    getMyPostsFromDB,
    getSinglePostFromDB,
    updatePostIntoDB,
    deletePostFromDB,
};