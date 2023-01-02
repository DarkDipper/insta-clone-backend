import bcrypt from "bcrypt";
import { Request, Response } from "express";
import cookie from "cookie";
import userModel from "../models/userModel";
import { generateToken } from "../utils/generateToken";
import { registerVerify } from "../utils/verify";
import dotenv from "dotenv";

dotenv.config();

// Send back status
async function register(req: Request, res: Response) {
  try {
    const { username, password, email } = req.body;
    const verify = await registerVerify(username, email);
    if (!verify.check) {
      throw Error(verify.ErrorMessage);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      user_name: username,
      pass_word: hashedPassword,
      email: email,
      role: "user",
    });
    await newUser.save();
    res.status(200).send({
      status: "Success",
      message: "Register user successfully",
      data: {
        user: username,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({ stauts: "Failure", message: e.message });
    } else {
      res.status(500).send({ stauts: "Failure", message: "Error unknow" });
    }
  }
}

// Send back token (Not use anymore)
// Setting token cookie
async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ user_name: username });
    if (!user) {
      return res.status(401).send({
        stauts: "Failure",
        message: "Cannot find user",
      });
    }
    const match = await bcrypt.compare(password, user.pass_word);
    if (!match) {
      return res.status(401).send({
        stauts: "Failure",
        message: "Password not correct",
      });
    }
    const token = generateToken(
      { userName: user.user_name, role: user.role, _id: user._id },
      process.env.SECRET_KEY_TOKEN
    );
    await userModel.findByIdAndUpdate(user._id, {
      jwtToken: token,
    });
    // res.setHeader(
    //   "Set-Cookie",
    //   cookie.serialize("userAuth", token, {
    //     httpOnly: true,
    //     secure: false,
    //     maxAge: 60 * 60,
    //     sameSite: "strict",
    //     path: "/",
    //   })
    // );
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", "ABCD", {
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60,
        sameSite: "lax",
        path: "/",
      })
    );
    // res.cookie("userAuth", token);
    res.status(200).send({
      status: "Success",
      message: "Login successfully",
      userToken: token,
    });
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({ stauts: "Failure", message: e.message });
    } else {
      res.status(500).send({ stauts: "Failure", message: "Error unknow" });
    }
  }
}

export default { register, login };
