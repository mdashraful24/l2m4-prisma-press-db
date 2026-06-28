import httpStatus from 'http-status';
import { prisma } from "../../lib/prisma";
import { SelfError } from "../../utils/errorResponse";
import { ICommentCreate, ICommentStatusModerate, ICommentUpdate } from "./comment.interface";

const createCommentIntoDB = async (authorId: string, payload: ICommentCreate) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    });

    const comment = await prisma.comment.create({
        data: {
            ...payload,
            authorId
        }
    });

    return comment;
};

const getCommentsByAuthorFromDB = async (authorId: string) => {
    const comments = await prisma.comment.findMany({
        where: { authorId },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    });

    return comments;
};

const getSingleCommentFromDB = async (commentId: string) => {
    const comment = await prisma.comment.findUniqueOrThrow({
        where: { id: commentId },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true
                }
            }
        }
    });

    return comment;
};

const updateCommentIntoDB = async (authorId: string, commentId: string, data: ICommentUpdate) => {
    const existingComment = await prisma.comment.findUniqueOrThrow({
        where: { id: commentId }
    });

    if (existingComment?.authorId !== authorId) {
        throw new SelfError("You are not authorized to update this comment.", httpStatus.FORBIDDEN);
    }

    const comment = await prisma.comment.update({
        where: { id: commentId },
        data
    });

    return comment;
};

const deleteCommentFromDB = async (authorId: string, commentId: string) => {
    const existingComment = await prisma.comment.findUniqueOrThrow({
        where: { id: commentId }
    });

    if (existingComment?.authorId !== authorId) {
        throw new SelfError("You are not authorized to delete this comment.", httpStatus.FORBIDDEN);
    }

    await prisma.comment.delete({
        where: { id: commentId }
    });

    return null;
};

const moderateCommentIntoDB = async (commentId: string, data: ICommentStatusModerate) => {
    const findComment = await prisma.comment.findUniqueOrThrow({
        where: { id: commentId }
    });

    if (findComment.status === data.status) {
        throw new SelfError(`Your provided status (${data.status}) is already up to date.`, httpStatus.BAD_REQUEST)
    }

    const comment = await prisma.comment.update({
        where: { id: commentId },
        data
    });

    return comment;
};


export const commentService = {
    createCommentIntoDB,
    getCommentsByAuthorFromDB,
    getSingleCommentFromDB,
    updateCommentIntoDB,
    deleteCommentFromDB,
    moderateCommentIntoDB,
};