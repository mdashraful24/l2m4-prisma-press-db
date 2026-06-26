import { prisma } from "../../lib/prisma";
import { IPost } from "./post.interface";

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
            author: true,
            comments: true
        }
    });

    return posts;
};

const getPostStatsFromDB = async () => {

};

const getMyPostsFromDB = async () => {

};

const getSinglePostFromDB = async () => {

};

const updatePostIntoDB = async () => {

};

const deletePostFromDB = async () => {

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