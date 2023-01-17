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

const router = express.Router();
router.post("/register", authController.register);
router.post("/login", authController.login);

export = router;
