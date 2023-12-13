import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import postRoute from "./routes/postRoute";
import userRoute from "./routes/userRoute";
import commentRoute from "./routes/commentRoute";
import { rateLimit } from "express-rate-limit";
import timeout from "connect-timeout";

// swagger
import swaggerUi from "swagger-ui-express";
import swaggerDoc from "./utils/swagger.json";
import { SwaggerTheme } from "swagger-themes";
const theme = new SwaggerTheme("v3");
const swaggerOption = {
  customCss: theme.getBuffer(
    `${process.env.ENV_STATE !== "PRODUCT" ? "dark" : "classic"}`
  ),
  customSiteTitle: "Insta-clone API",
};

// load env variables
dotenv.config();

const app = express();
app.use(timeout("3s"));
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(express.static("public"));
app.use(limiter);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// routes
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, swaggerOption)
);

app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/comment", commentRoute);

app.use("*", (req, res) => {
  res.status(404).json({ error: `${req.method} Route ${req.path} not found` });
});

export default app;
