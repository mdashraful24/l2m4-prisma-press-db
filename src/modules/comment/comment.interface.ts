import { CommentStatus } from "../../../generated/prisma/enums";

export interface ICommentCreate {
    postId: string;
    authorId: string;
    content: string;
}

export interface ICommentUpdate {
    content?: string,
    status?: CommentStatus
}

export interface ICommentStatusModerate {
    status: CommentStatus
}