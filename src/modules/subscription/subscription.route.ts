import { Router } from "express";
import { subscriptionController } from "./subscription.controller";
import authProtected from "../../middleware/auth.protected";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


router.post(
    "/checkout",
    authProtected(Role.USER, Role.AUTHOR, Role.ADMIN),
    subscriptionController.createCheckoutSession
);


export const subscriptionRoutes = router;