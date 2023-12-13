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
postRoute.put(
  "/:id",
  authController.verify,
  upload.array("listImage"),
  UploadImage,
  postController.updatePost
);
postRoute.get("/timeline", authController.verify, postController.getTimeline);
postRoute.get("/u/:username", postController.getPostsUser);
postRoute.get("/:id/like", authController.verify, postController.likeUnlike);
postRoute.get("/:id", postController.getPost);
postRoute.delete("/:id", authController.verify, postController.deletePost);
export default postRoute;
