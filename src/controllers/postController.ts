import { Response } from "express";
import Post from "../Models/postModel";
import userModel from "../models/userModel";
import Comment from "../Models/commentModel";
import { CustomRequest } from "../utils/interface";
import { JwtPayload } from "jsonwebtoken";

const createPost = async (req: CustomRequest, res: Response) => {
  if (req.user !== undefined) {
    const { _id } = req.user as JwtPayload;
    const newPost = new Post({
      user: _id,
      description: req.body.desc,
      imgbburl: req.listDataImgBB,
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
    const post = await Post.findById(req.params.id);
    if (post === null || post.user === undefined) {
      throw Error("Post is null or user is undefined");
    } else {
      if (_id === post.user.toString()) {
        await Post.updateOne({ $set: req.body });
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
    const post = await Post.findById(req.params.id);
    if (post === null || post.user === undefined) {
      throw Error("Post is null or user is undefined");
    } else {
      if (_id === post.user.toString() || role === "admin") {
        await Comment.deleteMany({ user: _id });
        await Post.findByIdAndDelete(req.params.id);
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
    const { _id } = req.user as JwtPayload;
    const userid = _id;
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 3;
    const user = await userModel.findById(userid).select("followings");
    if (user === null) {
      throw Error("User is null");
    } else {
      const myPosts = await Post.find({ user: userid })
        .skip(page * limit)
        .limit(3)
        .sort({ createdAt: "desc" })
        .populate("user", "username profilePicture");
      const followingsPosts = await Promise.all(
        user.following.map((followingId) => {
          return Post.find({
            user: followingId,
            createdAt: {
              $gte: new Date(new Date().getTime() - 86400000).toISOString(),
            },
          })
            .skip(page * 3)
            .limit(3)
            .sort({ createdAt: "desc" })
            .populate("user", "username profilePicture");
        })
      );
      const arr = myPosts.concat(...followingsPosts);
      res.status(200).send({
        status: "success",
        Posts: arr,
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
    if (req.user === undefined) {
      throw new Error("User is undefined");
    }
    const user = await userModel.findOne({ username: req.params.username });
    if (user === null) {
      throw Error("User is null");
    } else {
      const posts = await Post.find({ user: user._id });
      res.status(200).json(posts);
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
const getPost = async (req: CustomRequest, res: Response) => {
  try {
    if (req.user === undefined) {
      throw new Error("User is undefined");
    }
    const post = await Post.findOne({ _id: req.params.id }).populate("comment");
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
    const post = await Post.findById(req.params.id);
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
