import express,{Request,Response} from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/api/v1/", (req:Request, res:Response) => {
  res.send("API on");
});

// app.use("/", (req, res, next) => {
//   res.send("Fuck you");
// });

app.use("*", (req, res) => {
  res.status(404).json({ error: "not found" });
});


export default app;
