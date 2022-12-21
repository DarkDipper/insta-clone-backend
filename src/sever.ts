import express, { Request, Response } from "express";
import cors from "cors";
import userRoute from "./routes/userRoute"



const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/", (req: Request, res: Response) => {
  res.send("API on");
});

//get user
app.use("/api/v1/user", userRoute);


app.use((req, res, next) => {
  // res.send("Fuck you");
  res.status(404).json({ error: `${req.method} Route ${req.path} not found` });
});

// app.use("/*", (req, res) => {
//   res.status(404).json({ error: "not found" });
// });

export default app;
