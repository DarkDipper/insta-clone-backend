import express from "express";
import authController from "../controllers/authController";
import commentController from "../controllers/commentController";
const commentRoute = express.Router();
commentRoute.post("/", authController.verify, commentController.addComment);
commentRoute.get("/:PostId", commentController.getByPostId);

export default commentRoute;
