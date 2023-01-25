import { Response, NextFunction, Express } from "express";
import axios from "axios";
import { CustomRequest } from "./interface";
import dotenv from "dotenv";
import FormData = require("form-data");
// import {m}

dotenv.config();

async function UploadImage(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // const { desc } = req.body;
    const files = req.files as Express.Multer.File[];
    const listImgUrl: string[] = [];
    if (!files) {
      throw new Error("List image empty");
    }
    for (let i = 0; i < files.length; i++) {
      let bodyFormData = new FormData();
      bodyFormData.append("image", files[i].buffer.toString("base64"));
      const imgur_res = await axios
        .post(`https://api.imgur.com/3/image/`, bodyFormData, {
          headers: {
            Authorization: `Client-ID ${process.env.CLIENT_ID_IMGUR}`,
            ...bodyFormData.getHeaders(),
          },
        })
        .catch((e) => {
          throw Error("Can't upload image");
        });
      // console.log(imgur_res.data.data.link);
      listImgUrl.push(imgur_res.data.data.link);
    }
    // console.log(listImgUrl);
    req.listDataImg = listImgUrl;
    next();
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({ status: "Failure", message: e.message });
    } else {
      res.status(500).send({
        status: "Failure",
        message: "Error when upload image to imgbb",
      });
    }
  }
}

export default { UploadImage };
/*
  EXAMPLE RESPONE FROM IMGBB
  {
    "data": {
        "id": "bLj2yTz",
        "title": "cdd181d061c0",
        "url_viewer": "https://ibb.co/bLj2yTz",
        "url": "https://i.ibb.co/xGKfcWJ/cdd181d061c0.jpg",
        "display_url": "https://i.ibb.co/K7cLQdF/cdd181d061c0.jpg",
        "width": 1705,
        "height": 2048,
        "size": 187444,
        "time": 1674306518,
        "expiration": 0,
        "image": {
            "filename": "cdd181d061c0.jpg",
            "name": "cdd181d061c0",
            "mime": "image/jpeg",
            "extension": "jpg",
            "url": "https://i.ibb.co/xGKfcWJ/cdd181d061c0.jpg"
        },
        "thumb": {
            "filename": "cdd181d061c0.jpg",
            "name": "cdd181d061c0",
            "mime": "image/jpeg",
            "extension": "jpg",
            "url": "https://i.ibb.co/bLj2yTz/cdd181d061c0.jpg"
        },
        "medium": {
            "filename": "cdd181d061c0.jpg",
            "name": "cdd181d061c0",
            "mime": "image/jpeg",
            "extension": "jpg",
            "url": "https://i.ibb.co/K7cLQdF/cdd181d061c0.jpg"
        },
        "delete_url": "https://ibb.co/bLj2yTz/fc250959d5a966046ce855ab1d58f797"
    },
    "success": true,
    "status": 200
} */
