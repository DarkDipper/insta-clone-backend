import commentModel from "../models/commentModel";
import postModel from "../models/postModel";
import { Response } from "express";
import { CustomRequest } from "../utils/interface";
import { User } from "../utils/generateToken";
async function addComment(req: CustomRequest, res: Response) {
  try {
    const { postId, ...comment } = req.body;
    comment.user = (req.user as User)._id;
    const commenttosave = new commentModel(comment);
    const savedcomment = await commenttosave.save();
    // console.log(postId);
    await postModel.findOneAndUpdate(
      { _id: postId },
      { $push: { comment: savedcomment._id } }
    );
    res.status(200).send({
      status: "success",
      commentId: savedcomment._id,
      message: "Comment has been created",
    });
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: "failure",
        message: e.message,
      });
    }
  }
}

async function getByPostId(req: CustomRequest, res: Response) {
  const PostId = req.params.PostId;
  try {
    const post = await postModel.findOne({ _id: PostId }).populate({
      path: "comment",
      populate: {
        path: "user",
        select: "user_name profile_picture",
      },
    });
    if (post === null) {
      throw new Error("Post invalid");
    }
    res.status(200).send({
      status: "success",
      comments: post.comment,
    });
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: "failure",
        message: e.message,
      });
    }
  }
}

export default { addComment, getByPostId };
