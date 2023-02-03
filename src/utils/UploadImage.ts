import { Response, NextFunction, Express } from "express";
import axios from "axios";
import { CustomRequest } from "./interface";
import dotenv from "dotenv";
import FormData from "form-data";
import { encode } from "blurhash";
import sharp from "sharp";
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
    const listImgUrl: {
      srcURL: string;
      width: number;
      height: number;
      blurHash: string;
    }[] = [];
    if (!files) {
      throw new Error("List image empty");
    }
    for (let i = 0; i < files.length; i++) {
      const { data } = await sharp(files[i].buffer)
        .ensureAlpha()
        .raw()
        .toBuffer({
          resolveWithObject: true,
        });
      let bodyFormData = new FormData();
      bodyFormData.append("image", files[i].buffer.toString("base64"));
      const imgur_res = await axios
        .post(`https://api.imgur.com/3/upload/`, bodyFormData, {
          headers: {
            // Authorization: `Client-ID ${process.env.CLIENT_ID_IMGUR}`,
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          },
        })
        .catch((e) => {
          throw Error("Can't upload image");
        });
      const encodeHash = encode(
        new Uint8ClampedArray(data),
        imgur_res.data.data.width,
        imgur_res.data.data.height,
        4,
        4
      );
      listImgUrl.push({
        srcURL: imgur_res.data.data.link,
        width: imgur_res.data.data.width,
        height: imgur_res.data.data.height,
        blurHash: encodeHash,
      });
    }
    req.listDataImg = listImgUrl;
    next();
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({ status: "Failure", message: e.message });
    } else {
      res.status(500).send({
        status: "Failure",
        message: "Error when upload image to imgur",
      });
    }
  }
}

async function UploadAvatar(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const fileBase64 = req.body.avatar as string;
    // let avatarURL: {
    //   srcURL: string;
    //   width: number;
    //   height: number;
    // };
    if (fileBase64 !== "") {
      let bodyFormData = new FormData();
      bodyFormData.append("image", fileBase64);
      const imgur_res = await axios
        .post(`https://api.imgur.com/3/upload/`, bodyFormData, {
          headers: {
            // Authorization: `Client-ID ${process.env.CLIENT_ID_IMGUR}`,
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          },
        })
        .catch((e) => {
          throw Error("Can't upload image");
        });
      req.avatar = imgur_res.data.data.link;
    }
    next();
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).send({ status: "Failure", message: e.message });
    } else {
      res.status(500).send({
        status: "Failure",
        message: "Error when upload image to imgur",
      });
    }
  }
}

export { UploadImage, UploadAvatar };
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
