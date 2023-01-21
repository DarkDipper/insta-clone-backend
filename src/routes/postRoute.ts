import express from "express";
import authController from "../controllers/authController";
import postController from "../controllers/postController";
import UploadImage from "../utils/upLoadImage";
const postRoute = express.Router();
postRoute.post(
  "/create",
  authController.verify,
  UploadImage.UploadImage,
  postController.createPost
);

export default postRoute;
