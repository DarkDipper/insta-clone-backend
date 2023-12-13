import commentModel from "../models/commentModel";
import postModel from "../models/postModel";
import { Response } from "express";
import { CustomRequest } from "../utils/interface";
import { User } from "../utils/generateToken";
async function addComment(req: CustomRequest, res: Response) {
  // #swagger.tags = ['Comment']
  // #swagger.summary = 'Add Comment'
  // #swagger.description = 'Endpoint for add comment'
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
  // #swagger.tags = ['Comment']
  // #swagger.summary = 'Get Comment By Post Id'
  // #swagger.description = 'Endpoint for get comment by post id'
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

async function updateComment(req: CustomRequest, res: Response) {
  // #swagger.tags = ['Comment']
  // #swagger.summary = 'Update Comment'
  // #swagger.description = 'Endpoint for update comment'
  try {
    const comment = await commentModel.findOneAndUpdate(
      { _id: req.params.id },
      { content: req.body.content }
    );
    res.status(200).send({
      status: "success",
      message: "Comment has been updated",
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

async function deleteComment(req: CustomRequest, res: Response) {
  // #swagger.tags = ['Comment']
  // #swagger.summary = 'Delete Comment'
  // #swagger.description = 'Endpoint for delete comment'
  try {
    const comment = await commentModel.findOneAndDelete({
      _id: req.params.id,
    });
    res.status(200).send({
      status: "success",
      message: "Comment has been deleted",
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

export default { addComment, getByPostId, updateComment, deleteComment };
