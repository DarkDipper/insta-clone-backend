import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    pass_word: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      default: "user",
    },
    profile_picture: {
      type: String,
      default: "https://i.imgur.com/uITbeDy.png",
    },
    followers: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
    gender: {
      type: String,
    },
    jwtToken: {
      type: String,
    },
    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "light",
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("User", UserSchema, "users");
