import { Response } from "express";
import { Types } from "mongoose";
import postModel from "../Models/postModel";
import userModel from "../models/userModel";
import imageModel from "../models/imageModel";
import Comment from "../Models/commentModel";
import { CustomRequest } from "../utils/interface";
import { JwtPayload } from "jsonwebtoken";

const createPost = async (req: CustomRequest, res: Response) => {
  if (req.user !== undefined && req.listDataImg) {
    const { _id: userID } = req.user as JwtPayload;
    const listImage: Types.ObjectId[] = [];
    for (const img of req.listDataImg) {
      const newImage = new imageModel({
        path: img.srcURL,
        width: img.width,
        height: img.height,
        blurHash: img.blurHash,
      });
      const { _id: imageID } = await newImage.save();
      listImage.push(imageID);
    }
    const newPost = new postModel({
      user: userID,
      description: req.body.desc,
      list_image: listImage,
    });
    try {
      await newPost.save();
      res.status(200).send({
        status: "success",
        message: "post has been created",
      });
    } catch (e) {
      if (e instanceof Error) {
        res.status(500).send({
          status: "failure",
          message: e.message,
        });
      }
    }
  } else {
    res.status(500).send({
      status: "failure",
      message: "Create a pose have been failed",
    });
  }
};
const updatePost = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user === undefined) {
      throw new Error("User is undefined");
    }
    const { _id } = req.user as JwtPayload;
    const post = await postModel.findById(req.params.id);
    if (post === null || post.user === undefined) {
      throw Error("Post is null or user is undefined");
    } else {
      if (_id === post.user.toString()) {
        await postModel.updateOne({ $set: req.body });
        res.status(200).send({
          status: "success",
          message: "post has been updated",
        });
      } else {
        res.status(401).send({
          status: "failure",
          message: "you are not authorized",
        });
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: "failure",
        message: e.message,
      });
    }
  }
};
const deletePost = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user === undefined) {
      throw new Error("User is undefined");
    }
    const { _id, role } = req.user as JwtPayload;
    const post = await postModel.findById(req.params.id);
    if (post === null || post.user === undefined) {
      throw Error("Post is null or user is undefined");
    } else {
      if (_id === post.user.toString() || role === "admin") {
        await Comment.deleteMany({ user: _id });
        await postModel.findByIdAndDelete(req.params.id);
        res.status(200).send({
          status: "success",
          message: "post has been deleted",
        });
      } else {
        res.status(401).send({
          status: "failure",
          message: "you are not authorized",
        });
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: "failure",
        message: e.message,
      });
    }
  }
};
const getTimeline = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user === undefined) {
      throw new Error("User is undefined");
    }
    if (!req.query.page || !req.query.limit) {
      throw new Error("Query not valid");
    }
    const { _id: userID } = req.user as JwtPayload;
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 3;
    const userFollowing = await userModel.findById(userID).select("following");
    if (userFollowing === null) {
      throw Error("User is null");
    } else {
      const myPosts = await postModel
        .find({ user: userID })
        .skip(page * limit)
        // .limit(3)
        .sort({ createdAt: "desc" })
        .populate("user", "user_name profile_picture")
        .populate("list_image");
      const followingsPosts = await Promise.all(
        userFollowing.following.map((followingId) => {
          return postModel
            .find({
              user: followingId,
              createdAt: {
                $gte: new Date(new Date().getTime() - 86400000).toISOString(),
              },
            })
            .skip(page * 3)
            .limit(3)
            .sort({ createdAt: "desc" })
            .populate("user", "user_name profile_picture")
            .populate("list_image");
        })
      );
      const arr = myPosts.concat(...followingsPosts);
      res.status(200).send({
        status: "success",
        Posts: arr,
        length: arr.length,
        limit: limit,
      });
    }
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: "failure",
        message: e.message,
      });
    }
  }
};
const getPostsUser = async (req: CustomRequest, res: Response) => {
  try {
    const user = await userModel.findOne({ username: req.params.username });
    if (user === null) {
      throw Error("User is null");
    } else {
      const posts = await postModel
        .find({ user: user._id })
        .sort({ createdAt: "desc" })
        .populate("user", "user_name profile_picture")
        .populate("list_image");
      res
        .status(200)
        .json({ status: false, posts: posts, length: posts.length });
    }
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: false,
        message: e.message,
      });
    }
  }
};
const getPost = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user === undefined) {
      throw new Error("User is undefined");
    }
    const post = await postModel
      .findOne({ _id: req.params.id })
      .populate("comment");
    res.status(200).json(post);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: "failure",
        message: e.message,
      });
    }
  }
};
const likeUnlike = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user === undefined) {
      throw new Error("User is undefined");
    }
    const { _id } = req.user as JwtPayload;
    const post = await postModel.findById(req.params.id);
    if (post === null) {
      throw Error("Post is null");
    } else {
      if (!post.likes.includes(_id)) {
        await post.updateOne({ $push: { likes: _id } });
        res.status(200).send({
          status: "success",
          message: "the post has been liked",
        });
      } else {
        await post.updateOne({ $pull: { likes: _id } });
        res.status(200).send({
          status: "success",
          message: "the post has been disliked",
        });
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: "failure",
        message: e.message,
      });
    }
  }
};
export default {
  createPost,
  updatePost,
  deletePost,
  getTimeline,
  getPostsUser,
  getPost,
  likeUnlike,
};
