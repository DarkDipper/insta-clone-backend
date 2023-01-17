import Post from "../Models/postModel";
import User from "../Models/userModel";
import Comment from "../Models/commentModel";

const createPost = async (req, res) => {
  req.body.user = req.user._id;
  const newPost = new Post(req.body);
  try {
    await newPost.save();
    res.status(200).send({
      status: "success",
      message: "post has been created",
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post === null || post.user === undefined) {
      throw Error("Post is null or user is undefined");
    } else {
      if (req.user._id === post.user.toString()) {
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
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post === null || post.user === undefined) {
      throw Error("Post is null or user is undefined");
    } else {
      if (req.user._id === post.user.toString() || req.user.role === "admin") {
        await Comment.deleteMany({ user: req.user._id });
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
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getTimeline = async (req, res) => {
  try {
    const userid = req.user._id;
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 3;
    const user = await User.findById(userid).select("followings");
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
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getPostsUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (user === null) {
      throw Error("User is null");
    } else {
      const posts = await Post.find({ user: user._id });
      res.status(200).json(posts);
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id }).populate("comment");
    res.status(200).json(post);
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};
const likeUnlike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post === null) {
      throw Error("Post is null");
    } else {
      if (!post.likes.includes(req.user._id)) {
        await post.updateOne({ $push: { likes: req.user._id } });
        res.status(200).send({
          status: "success",
          message: "the post has been liked",
        });
      } else {
        await post.updateOne({ $pull: { likes: req.user._id } });
        res.status(200).send({
          status: "success",
          message: "the post has been disliked",
        });
      }
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
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
