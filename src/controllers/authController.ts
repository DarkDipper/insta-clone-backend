import User from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

type userTemplate = {
  username: string;
  password: string;
  email: string;
};

async function register(req: Request, res: Response) {
  try {
    const { username, password, email }: userTemplate = req.body;
    // const salt = await bcrypt.genSalt(10);
    // throw new Error(`${password}`)
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

export default { register };
