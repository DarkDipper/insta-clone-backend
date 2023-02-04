import express from "express";
import authController from "../controllers/authController";
import userController from "../controllers/userController";
import { UploadAvatar } from "../utils/upLoadImage";
/*
  Register
  Login
  Verify
  followUser
  unFollowUser
  updateUser
  getFollowing
  getFollower
  searchUser
*/

const userRoute = express.Router();
userRoute.post("/register", authController.register);
userRoute.post("/login", authController.login);
userRoute.post("/auth", authController.auth);
userRoute.get("/u/:username", userController.getUserByUsername);
userRoute.put(
  "/:id",
  authController.verify,
  UploadAvatar,
  userController.updateUser
);
userRoute.put(
  "/:username/follow",
  authController.verify,
  userController.followUser
);
userRoute.put(
  "/:username/unfollow",
  authController.verify,
  userController.unFollowUser
);
export default userRoute;
