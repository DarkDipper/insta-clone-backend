import express from "express";
import authController from "../controllers/authController";
import postController from "../controllers/postController";
import { UploadImage } from "../utils/UploadImage";
import multer from "multer";
const upload = multer();
const postRoute = express.Router();
postRoute.post(
  "/create",
  authController.verify,
  upload.array("listImage"),
  UploadImage,
  postController.createPost
);
postRoute.get("/timeline", authController.verify, postController.getTimeline);
postRoute.get("/u/:username", postController.getPostsUser);
postRoute.get("/:id/like", authController.verify, postController.likeUnlike);
export default postRoute;
