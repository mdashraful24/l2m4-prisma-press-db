import { Router } from "express";
import { postController } from "./post.controller";
import authProtected from "../../middleware/auth.protected";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


router.get("/", postController.getPosts);
router.get("/stats", authProtected(Role.ADMIN), postController.getPostStats);
router.get("/my-posts", authProtected(Role.USER, Role.ADMIN), postController.getMyPosts);
router.get("/:postId", postController.getSinglePost);
router.post("/", authProtected(Role.USER, Role.ADMIN, Role.AUTHOR), postController.createPost);
router.post("/multi-post/", authProtected(Role.USER, Role.ADMIN, Role.AUTHOR), postController.createMultiplePost);
router.patch("/:postId", authProtected(Role.USER, Role.ADMIN, Role.AUTHOR), postController.updatePost);
router.delete("/:postId", authProtected(Role.USER, Role.ADMIN, Role.AUTHOR), postController.deletePost);


export const postRoutes = router;