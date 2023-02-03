import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
interface CustomRequest extends Request {
  user?: string | JwtPayload | undefined; // or any other type
  listDataImg?: {
    srcURL: string;
    width: number;
    height: number;
    blurHash: string;
  }[];
  avatar?: string;
  query: {
    page?: string;
    limit?: string;
    qlimit?: string;
    search?: string;
  };
}
export { CustomRequest };
