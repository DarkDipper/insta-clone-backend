import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
interface CustomRequest extends Request {
  user?: string | JwtPayload | undefined; // or any other type
  listDataImg?: string[];
  query: {
    page?: string;
    limit?: string;
    qlimit?: string;
    search?: string;
  };
}
export { CustomRequest };
