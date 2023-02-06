import express, { Request, Response } from "express";
import cors from "cors";
import postRoute from "./routes/postRoute";
import userRoute from "./routes/userRoute";
import commentRoute from "./routes/commentRoute";
import { rateLimit } from "express-rate-limit";
const app = express();
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(express.static("public"));
app.use(limiter);
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
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/api/v1", (req: Request, res: Response) => {
  res.send("API on");
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/comment", commentRoute);

app.use("*", (req, res) => {
  res.status(404).json({ error: `${req.method} Route ${req.path} not found` });
});

export default app;
