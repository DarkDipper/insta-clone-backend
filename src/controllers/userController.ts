import bcrypt from "bcrypt";
import userModel from "../Models/userModel";
import { Response } from "express";
import { CustomRequest } from "../utils/interface";
import { User } from "../utils/generateToken";
async function updateUser(req: CustomRequest, res: Response) {
  const { _id, role } = req.user as User;
  if (_id.toString() === req.params.id || role === "admin") {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (e) {
        res.status(500).send({
          status: "failure",
          message: e.message,
        });
      }
    }
    try {
      const user = await userModel.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
      );
      if (user === null) {
        throw new Error();
      }
      const { jwtToken, pass_word, ...other } = user;
      if (!user) {
        return res.status(400).send({
          status: "failure",
          message: "you can't update this account.",
        });
      }
      res.status(200).send({
        status: "success",
        message: "Account has been updated successfully",
        user: other,
      });
    } catch (e) {
      res.status(500).send({
        status: "failure",
        message: "something is wrong !",
      });
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
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
}

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
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
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
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
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
      const usertofollow = await userModel.findOne({
        username: req.params.username,
      });
      if (!usertofollow) {
        throw new Error("user does not exist");
      }
      if (!currentUser.following.includes(usertofollow._id)) {
        await currentUser.updateOne({
          $push: { followings: usertofollow._id },
        });
        await usertofollow.updateOne({
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
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
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
      const usertounfollow = await userModel.findOne({
        username: req.params.username,
      });
      if (!usertounfollow) {
        throw new Error("user does not exist");
      }
      if (currentUser.following.includes(usertounfollow._id)) {
        await currentUser.updateOne({
          $pull: { followings: usertounfollow._id },
        });
        await usertounfollow.updateOne({
          $pull: { followers: currentUser._id },
        });
        res.status(200).send({
          status: "success",
          message: "user has been unfollowed",
        });
      } else {
        res.status(400).send({
          status: "success",
          message: "you don't follow this user",
        });
      }
    } else {
      throw new Error("you can't unfollow yourself");
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
}

async function searchUser(req: CustomRequest, res: Response) {
  try {
    const { qlimit } = req.query;
    if (typeof qlimit !== "string") {
      throw new Error("Limit invalid");
    }
    const limit = parseInt(qlimit) || 5;
    const search = req.query.search || "";
    const users = await userModel
      .find({
        username: { $regex: search, $options: "i" },
      })
      .select("_id username profilePicture")
      .limit(limit);
    const totalUsers = users.length;
    res.status(200).send({
      status: "success",
      totalUsers: totalUsers,
      limit: limit,
      users: users,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
}
export {
  updateUser,
  getUser,
  getFollower,
  getFollowing,
  followUser,
  unFollowUser,
  searchUser,
};
