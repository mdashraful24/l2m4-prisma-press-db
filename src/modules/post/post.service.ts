import httpStatus from 'http-status';
import { prisma } from "../../lib/prisma";
import { SelfError } from "../../utils/errorResponse";
import { IPost, IUpdatePostPayload } from "./post.interface";
import { CommentStatus, PostStatus } from '../../../generated/prisma/enums';

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
        // where: {
        //     title: "My first post",
        //     content: "100% right"
        // },
        where: {
            AND: [
                {
                    title: "My first post"
                },
                {
                    content: "100% right"
                },
                {
                    tags: {
                        equals: ["My", "first", "post"],
                        has: "My"
                    }
                }
            ]
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

    return posts;
};

const getPostStatsFromDB = async () => {
    const transactionResult = await prisma.$transaction(
        async (tx) => {
            // const totalPosts = await tx.post.count();

            // const totalPublishedPosts = await tx.post.count({
            //     where: {
            //         status: PostStatus.PUBLISHED
            //     }
            // });

            // const totalDraftedPost = await tx.post.count({
            //     where: {
            //         status: PostStatus.DRAFT
            //     }
            // });

            // const totalArchivedPosts = await tx.post.count({
            //     where: {
            //         status: PostStatus.ARCHIVED
            //     }
            // });

            // const totalComments = await tx.comment.count({});

            // const totalApprovedComments = await tx.comment.count({
            //     where: {
            //         status: CommentStatus.APPROVED
            //     }
            // });

            // const totalRejectedComments = await tx.comment.count({
            //     where: {
            //         status: CommentStatus.REJECTED
            //     }
            // });

            // const countAllPostViews = await tx.post.aggregate({
            //     _sum: {
            //         views: true
            //     }
            // });

            // const totalPostViews = countAllPostViews._sum.views;

            // return {
            //     totalPosts,
            //     totalPublishedPosts,
            //     totalDraftedPost,
            //     totalArchivedPosts,
            //     totalComments,
            //     totalApprovedComments,
            //     totalRejectedComments,
            //     totalPostViews
            // };

            const [totalPosts,
                totalPublishedPosts,
                totalDraftedPost,
                totalArchivedPosts,
                totalComments,
                totalApprovedComments,
                totalRejectedComments,
                totalPostViewsAggregate
            ] = await Promise.all([
                await tx.post.count(),
                await tx.post.count({
                    where: {
                        status: PostStatus.PUBLISHED
                    }
                }),
                await tx.post.count({
                    where: {
                        status: PostStatus.DRAFT
                    }
                }),
                await tx.post.count({
                    where: {
                        status: PostStatus.ARCHIVED
                    }
                }),
                await tx.comment.count(),
                await tx.comment.count({
                    where: {
                        status: CommentStatus.APPROVED
                    }
                }),
                await tx.comment.count({
                    where: {
                        status: CommentStatus.REJECTED
                    }
                }),
                await tx.post.aggregate({
                    _sum: {
                        views: true
                    }
                })
            ]);

            return {
                totalPosts,
                totalPublishedPosts,
                totalDraftedPost,
                totalArchivedPosts,
                totalComments,
                totalApprovedComments,
                totalRejectedComments,
                totalPostViews: totalPostViewsAggregate._sum.views
            };
        }
    );

    return transactionResult;
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
    // await prisma.post.update({
    //     where: {
    //         id: postId
    //     },
    //     data: {
    //         views: {
    //             increment: 1
    //         }
    //     }
    // });

    // const post = await prisma.post.findUniqueOrThrow({
    //     where: {
    //         id: postId
    //     },
    //     include: {
    //         author: {
    //             omit: {
    //                 id: true,
    //                 email: true,
    //                 password: true,
    //                 activeStatus: true,
    //                 role: true,
    //                 createdAt: true,
    //                 updatedAt: true
    //             }
    //         },
    //         comments: {
    //             where: {
    //                 status: CommentStatus.APPROVED
    //             },
    //             orderBy: {
    //                 createdAt: "desc"
    //             }
    //         },
    //         _count: {
    //             select: {
    //                 comments: true
    //             }
    //         }
    //     }
    // });

    // return post;

    const transactionResult = await prisma.$transaction(
        async (tx) => {
            await tx.post.update({
                where: {
                    id: postId
                },
                data: {
                    views: {
                        increment: 1
                    }
                }
            });

            // throw new SelfError("Fake error");

            const post = await tx.post.findUniqueOrThrow({
                where: {
                    id: postId
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
                    comments: {
                        where: {
                            status: CommentStatus.APPROVED
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    },
                    _count: {
                        select: {
                            comments: true
                        }
                    }
                }
            });

            return post;
        }
    );

    return transactionResult;
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