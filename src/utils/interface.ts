import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
interface CustomRequest extends Request {
  user?: string | JwtPayload | undefined; // or any other type
  listDataImgBB?: string[];
  query: {
    page?: string;
    limit?: string;
  };
}
export { CustomRequest };
