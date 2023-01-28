import express from "express";
import authController from "../controllers/authController";
import userController from "../controllers/userController";

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

export default userRoute;
