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

        // * Filtering (exact match) without AND operator
        // where: {
        //     title: "My first post",
        //     content: "100% right"
        // },


        // * Filtering (exact match) with AND operator
        // where: {
        //     AND: [
        //         {
        //             title: "My first post"
        //         },
        //         {
        //             content: "100% right"
        //         },
        //         {
        //             tags: {
        //                 equals: ["My", "first", "post"],
        //                 has: "My"
        //             }
        //         }
        //     ]
        // },


        // * Searching (partial match) with AND type
        // where: {
        //     title: {
        //         contains: "RonAld",
        //         mode: "insensitive"
        //     },
        //     content: {
        //         contains: "Ronald",
        //         mode: "default"
        //     }
        // },


        // * Searching (partial match) with OR operator
        // where: {
        //     OR:[
        //         {
        //             title: {
        //                 contains: "RonAld",
        //                 mode: "insensitive"
        //             },
        //         },
        //         {
        //             content: {
        //                 contains: "Ronald",
        //                 mode: "insensitive"
        //             }
        //         }
        //     ]
        // },


        // * Combining SEARCH (OR operator) and FILTERING (AND operator)
        // where: {
        //     AND: [
        //         {
        //             // * Searching
        //             OR: [
        //                 {
        //                     title: {
        //                         contains: "Ronald",
        //                         mode: "insensitive"
        //                     }
        //                 },
        //                 {
        //                     content: {
        //                         contains: "Ron",
        //                         mode: "insensitive"
        //                     }
        //                 }
        //             ]
        //         },
        //         // * Filtering
        //         {
        //             title: {
        //                 contains: "Ronald"
        //             }
        //         },
        //         {
        //             content: {
        //                 contains: "ronald"
        //             }
        //         }
        //     ]
        // },


        // * Pagination
        take: 1, // for first page skip is 0
        skip: 1, // visiting page 2
        // skip: 2, // visiting page 3
        // skip: 3, // visiting page 4
        // * page = 4, limit / take = 1 => skip: (page - 1) * limit => 4


        // * Sorting
        orderBy: {
            createdAt: "desc",
            title: "asc",
            content: "desc"
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