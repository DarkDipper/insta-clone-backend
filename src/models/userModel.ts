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
    profile_picture: {
      type: String,
      default: "https://i.ibb.co/gWjhxPq/defaultavatar.png",
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
    }
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("User", UserSchema,"users");
