import bcrypt from "bcrypt";
import { Types } from "mongoose";
import userModel from "../models/userModel";
import { Response } from "express";
import { CustomRequest } from "../utils/interface";
import { User } from "../utils/generateToken";
import { JwtPayload } from "jsonwebtoken";

async function updateUser(req: CustomRequest, res: Response) {
  const { _id, role } = req.user as User;
  if (_id.toString() === req.params.id || role === "admin") {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (e) {
        if (e instanceof Error) {
          res.status(500).send({
            status: "failure",
            message: e.message,
          });
        }
      }
    }
    try {
      const uniqueUser = await userModel.findOne({
        user_name: req.body.user_name,
      });
      if (uniqueUser && _id.toString() !== req.params.id) {
        throw new Error("The name is already exists");
      }
      const UpdateUser: { [k: string]: any } = {};
      UpdateUser["user_name"] = req.body.user_name;
      UpdateUser["email"] = req.body.email;
      UpdateUser["gender"] = req.body.gender;
      if (req.avatar) {
        UpdateUser["profile_picture"] = req.avatar;
      }
      const user = await userModel.findOneAndUpdate(
        { _id: req.params.id },
        UpdateUser,
        { new: true }
      );
      if (user === null) {
        throw new Error();
      }
      // const { jwtToken, pass_word, ...other } = user;
      if (!user) {
        return res.status(400).send({
          status: "failure",
          message: "you can't update this account.",
        });
      }
      res.status(200).send({
        status: "success",
        message: "Account has been updated successfully",
        user: {
          _id: user._id,
          token: user.jwtToken,
          avatar: user.profile_picture,
          userName: user.user_name,
        },
      });
    } catch (e) {
      if (e instanceof Error) {
        res.status(500).send({
          status: "failure",
          message: e.message,
        });
      } else {
        res.status(500).send({
          status: "failure",
          message: "something is wrong !",
        });
      }
    }
  } else {
    return res.status(400).send({
      status: "failure",
      message: "you can't update this account.",
    });
  }
}

async function getUser(req: CustomRequest, res: Response) {
  try {
    const id = req.params.id;
    const user = await userModel.findOne({ _id: id });
    if (!user) {
      throw new Error("user does not exist");
    }
    const { pass_word, jwtToken, role, ...otherInfo } = user;
    res.status(200).send({
      status: "success",
      message: "user info",
      user: otherInfo,
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

const getUserByUsername = async (req: CustomRequest, res: Response) => {
  try {
    const username = req.params.username;
    const user = await userModel.findOne({ user_name: username });
    // console.log(user);
    if (!user) {
      throw new Error("user does not exist");
    }
    res.status(200).send({
      status: true,
      message: "user info",
      user: {
        _id: user._id,
        email: user.email,
        user_name: user.user_name,
        role: user.role,
        profile_picture: user.profile_picture,
        followers: user.followers,
        following: user.following,
        gender: user.gender,
      },
    });
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: false,
        message: e.message,
      });
    }
  }
};

async function getFollowing(req: CustomRequest, res: Response) {
  try {
    const username = req.params.username;
    const userfollowings = await userModel.findOne({ username: username });
    if (!userfollowings) {
      throw new Error("user does not exist");
    }
    const followings = await Promise.all(
      userfollowings.following.map((following) => {
        return userModel.findById(following, {
          username: true,
          profilePicture: true,
        });
      })
    );
    res.status(200).send({
      status: "success",
      message: "user info",
      followings: followings,
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

async function getFollower(req: CustomRequest, res: Response) {
  try {
    const username = req.params.username;
    const userfollowers = await userModel.findOne({ username: username });
    if (!userfollowers) {
      throw new Error("user does not exist");
    }
    const followers = await Promise.all(
      userfollowers.followers.map((follower) => {
        return userModel.findById(follower, {
          username: true,
          profilePicture: true,
        });
      })
    );
    res.status(200).send({
      status: "success",
      message: "user info",
      data: {
        followings: followers,
      },
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

async function followUser(req: CustomRequest, res: Response) {
  try {
    const { _id } = req.user as User;
    const currentUser = await userModel.findById({ _id: _id.toString() });
    if (currentUser === null) {
      throw new Error("Current User have problem");
    }
    if (currentUser.user_name !== req.params.username) {
      const userToFollow = await userModel.findOne({
        user_name: req.params.username,
      });
      if (!userToFollow) {
        throw new Error("user does not exist");
      }
      if (!currentUser.following.includes(userToFollow._id)) {
        await currentUser.updateOne({
          $push: { following: userToFollow._id },
        });
        await userToFollow.updateOne({
          $push: { followers: currentUser._id },
        });
        res.status(200).send({
          status: "success",
          message: "user has been followed",
        });
      } else {
        res.status(400).send({
          status: "success",
          message: "you allready follow this user",
        });
      }
    } else {
      throw new Error("you can't follow yourself");
    }
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: "failure",
        message: e.message,
      });
    }
  }
}

async function unFollowUser(req: CustomRequest, res: Response) {
  try {
    const { _id } = req.user as User;
    const currentUser = await userModel.findById({ _id: _id.toString() });
    if (currentUser === null) {
      throw new Error("Current User have problem");
    }
    if (currentUser.user_name !== req.params.username) {
      const userToUnfollow = await userModel.findOne({
        user_name: req.params.username,
      });
      if (!userToUnfollow) {
        throw new Error("user does not exist");
      }
      // console.log(currentUser.following.includes(userToUnfollow._id));
      if (currentUser.following.includes(userToUnfollow._id)) {
        await currentUser.updateOne({
          $pull: { following: userToUnfollow._id },
        });
        await userToUnfollow.updateOne({
          $pull: { followers: currentUser._id },
        });
        res.status(200).send({
          status: "success",
          message: "user has been unfollowed",
        });
      } else {
        res.status(400).send({
          status: false,
          message: "you don't follow this user",
        });
      }
    } else {
      throw new Error("you can't unfollow yourself");
    }
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({
        status: "failure",
        message: e.message,
      });
    }
  }
}

async function searchUsers(req: CustomRequest, res: Response) {
  try {
    const limit = parseInt(req.query.limit || "") || 5;
    const search = req.query.search || "";
    const users = await userModel
      .find({
        user_name: { $regex: search, $options: "i" },
      })
      .select("_id user_name profile_picture")
      .limit(limit);
    const totalUsers = users.length;
    res.status(200).send({
      status: "success",
      totalUsers: totalUsers,
      limit: limit,
      users: users,
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
async function suggestUser(req: CustomRequest, res: Response) {
  try {
    const { _id, userName } = req.user as JwtPayload;
    // const users = await userModel.findOne();
    // console.log(_id);
    const userSuggest = await userModel.aggregate([
      {
        $match: {
          _id: { $ne: new Types.ObjectId(_id) },
          followers: { $ne: new Types.ObjectId(_id) },
        },
      },
      {
        $sample: {
          size: 5,
        },
      },
      {
        $group: {
          _id: "$_id",
          result: { $push: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $first: "$result" },
        },
      },
      {
        $project: {
          _id: 1,
          user_name: 1,
          profile_picture: 1,
        },
      },
    ]);

    res.status(200).send({
      status: "success",
      userSuggest,
      // users: users,
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

async function changeTheme(req: CustomRequest, res: Response) {
  try {
    const { _id } = req.user as JwtPayload;
    if (!req.body.theme) {
      throw new Error("No theme to change");
    }
    await userModel.findOneAndUpdate(
      {
        _id: _id,
      },
      { $set: { theme: req.body.theme } }
    );
    res.status(200).send({
      status: true,
      message: "Change theme successfully",
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
export default {
  updateUser,
  getUser,
  getFollower,
  getFollowing,
  followUser,
  unFollowUser,
  searchUsers,
  getUserByUsername,
  suggestUser,
  changeTheme,
};
