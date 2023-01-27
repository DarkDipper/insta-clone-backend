import express from "express";
import authController from "../controllers/authController";

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

export default userRoute;
