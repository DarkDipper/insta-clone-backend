import express, { Request, Response } from "express";
import cors from "cors";
import postRoute from "./routes/postRoute";
import userRoute from "./routes/userRoute";
import multer from "multer";
const app = express();
const upload = multer();
app.use(cors());
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// app.use((req, res, next) => {
//   upload.array("listImage")(req, res, (err) => {
//     if (err) {
//       res.status(500).send("Form data failed");
//     }
//     next();
//   });
// });
app.get("/api/v1/", (req: Request, res: Response) => {
  res.send("API on");
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);

app.use((req, res) => {
  res.status(404).json({ error: `${req.method} Route ${req.path} not found` });
});

export default app;
