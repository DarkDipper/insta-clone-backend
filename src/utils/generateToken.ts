import jwt from "jsonwebtoken";
import { Types } from "mongoose";
type User = {
  userName: string;
  role: string;
  _id: Types.ObjectId;
};

function generateToken(user: User, secretKey: string) {
const userToken = jwt.sign(user, secretKey);
  return userToken;
}

export { generateToken };
