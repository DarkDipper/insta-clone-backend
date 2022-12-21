import dotenv from "dotenv";
import app from "./sever";
import connectDB from "./database/database";
import Logging from "./library/Logging";

// load env variables
dotenv.config();

const port = process.env.PORT || 5050;


// connect to database before start server
connectDB()
  .then(() => {
  app.listen(port, () => {
    Logging.log(`[Server]: Server running on port http://localhost:${port}`);
  });
});
