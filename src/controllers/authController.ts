import User from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";


async function register(req: Request, res: Response) {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      user_name: username,
      pass_word: hashedPassword,
      email: email,
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

async function login(req:Request,res:Response) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ user_name: username });
    if (!user) {
      return res.status(401).send({
        stauts: "Failure",
        message:"Cannot find user"
      })
    }
    const match = await bcrypt.compare(password, user.pass_word)
    if (!match) {
      return res.status(401).send({
        stauts: "Failure",
        message: "Password not correct"
      })
    }
    res.status(200).send({
      status: "Success",
      message:"Login successfully"
    })
  }
  catch (e) {
    if (e instanceof Error) {
      res.status(500).send({ stauts: "Failure", message: e.message });
    } else {
      res.status(500).send({ stauts: "Failure", message: "Error unknow" });
    }
  }
}

export default { register,login };
