import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import authUser from "../middlewares/auth.middleware.js";

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @description Login user with email and password
 * @access Public
 */
authRouter.post("/login", authController.loginUserController);

/**
 * @route POST /api/auth/logout
 * @description Clear token cookie and blacklist the token
 * @access Public
 */
authRouter.post("/logout", authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description Get the current logged-in user details
 * @access Private
 */
authRouter.get(
    "/get-me",
    authUser,
    authController.getMeController
);

export default authRouter;
