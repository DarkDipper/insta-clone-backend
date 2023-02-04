import mongoose from "mongoose";
const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String, max: 500 },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema, "Comments");
