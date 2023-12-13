import bcrypt from "bcrypt";
import { Response, NextFunction } from "express";
import userModel from "../models/userModel";
import { generateToken } from "../utils/generateToken";
import { registerVerify } from "../utils/verifyRegister";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { CustomRequest } from "../utils/interface";
import Logging from "../library/Logging";
dotenv.config();

// Send back status
async function register(req: CustomRequest, res: Response) {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Register'
  // #swagger.description = 'Endpoint for register user'
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

// Send back token
async function login(req: CustomRequest, res: Response) {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Login'
  // #swagger.description = 'Endpoint for login user'
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
    res.status(200).send({
      status: "Success",
      message: "Login successfully",
      userToken: token,
      _id: user._id,
      user_name: user.user_name,
      avatar: user.profile_picture,
    });
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({ status: "Failure", message: e.message });
    } else {
      res.status(500).send({ status: "Failure", message: "Error unknow" });
    }
  }
}

// Auth cookie
async function auth(req: CustomRequest, res: Response, next: NextFunction) {
  // #swagger.ignore = true
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader === undefined) {
      res.status(403).json("You are not authorized");
    } else {
      const token = authHeader.split(" ")[1];
      if (authHeader) {
        jwt.verify(token, process.env.SECRET_KEY_TOKEN, async (err, user) => {
          if (err) {
            res.status(500).send({
              status: false,
              message: "token is not valid!",
            });
          } else {
            const userInfo = await userModel.findOne({
              _id: (user as JwtPayload)._id,
            });
            res.status(200).send({
              status: true,
              user: {
                _id: userInfo?._id,
                token: token,
                userName: userInfo?.user_name,
                avatar: userInfo?.profile_picture,
                theme: userInfo?.theme,
              },
            });
            // res.status(200).send({ user: "All good" });
          }
        });
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: false,
        message: e.message,
      });
    }
  }
}

// Verify token
async function verify(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    // Logging.log(req.headers.authorization);
    if (!authHeader || authHeader === undefined) {
      res.status(403).json("You are not authorized");
    } else {
      const token = authHeader.split(" ")[1];
      if (authHeader) {
        jwt.verify(token, process.env.SECRET_KEY_TOKEN, (err, user) => {
          if (err) {
            throw new Error("token is not valid!");
          }
          // console.log(user);
          req.user = user;
          next();
        });
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: false,
        message: e.message,
      });
    }
  }
}

export default { register, login, verify, auth };
