import { prisma } from "../../lib/prisma";
import { IComment } from "./comment.interface";

const createCommentIntoDB = async (authorId: string, payload: IComment) => {
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
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    });

    return comment;
};

const updateCommentIntoDB = async () => {

};

const deleteCommentFromDB = async () => {

};

const moderateCommentIntoDB = async () => {

};


export const commentService = {
    createCommentIntoDB,
    getCommentsByAuthorFromDB,
    getSingleCommentFromDB,
    updateCommentIntoDB,
    deleteCommentFromDB,
    moderateCommentIntoDB,
};