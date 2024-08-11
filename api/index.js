import { configDotenv } from "dotenv";
configDotenv();

import app from "./app.js";
import mongoose from "mongoose";

const port = process.env.PORT || 3000;
const Db = process.env.MONGO_CONNECTION_STR;

let serverLessSystem;

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === "development") {
  server();
} else if (process.env.NODE_ENV === "production") {
  serverLessSystem = serverLess();
}

// server based
function server() {
  mongoose
    .connect(Db)
    .then(() => console.log("connected"))
    .catch((err) => console.log(err));

  app.listen(port, () => console.log("Server running on Port " + port));
}

// serverLess based
function serverLess() {
  let isConnected = false;

  async function connectToDb() {
    if (!isConnected) {
      await mongoose.connect(Db);
      isConnected = true;
    }
    console.log("connected vercel");
  }

  return async function handler(req, res) {
    // CORS setup
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,OPTIONS,PATCH,DELETE,POST,PUT"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    try {
      await connectToDb();
      // Handle request using Express
      await new Promise((resolve, reject) => {
        app(req, res, (err) => {
          if (err) {
            console.error("App error:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (err) {
      console.error("Serverless function error:", err);
      res
        .status(500)
        .json({ status: "Failed", message: err.message || "Server failed" });
    }
  };
}

export default serverLessSystem;
