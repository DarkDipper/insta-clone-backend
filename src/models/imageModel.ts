import mongoose from "mongoose";
const imageSchema = new mongoose.Schema({
  path: { type: String, require: true },
  width: { type: Number, require: true },
  height: { type: Number, require: true },
  blurHash: { type: String, require: true },
});

export default mongoose.model("Image", imageSchema, "Images");
