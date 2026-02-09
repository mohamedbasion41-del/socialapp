import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from "./src/DB/DBconnection.js";
import {
  globalerrorhandling,
  notfoundhandler,
} from "./src/utils/errorhandling/asynchandler.js";

import authRouter from "./src/modules/auth/auth.controller.js";
import userRouter from "./src/DB/Models/user/user.controller.js";
import postRouter from "./src/modules/post/post.controller.js";
import { commentRouter } from "./src/modules/comment/comment.controller.js";
import adminRouter from "./src/DB/Models/admin/admin.controller.js";
import cors from "cors";

const bootstrap = async (app, express) => {
  await connectDB();

  app.use(cors());
  //   const whitelist = ["http://localhost:4200", "http://localhost:6322"];
  // app.use((req, res, next) => {
  //   if (!whitelist.includes(req.header("origin"))) {
  //     return next(new Error("Blocked by CORS!!"));
  //   }
  //   res.header("Access-Control-Allow-origin", req.header("origin"));
  //   res.header("Access-Control-Allow-Methods", "*");
  //   res.header("Access-Control-Allow-Headers", "*");
  //   res.header("Access-Control-Private-Network", true);
  //   return next();
  // });
  app.use(express.json());
  app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));
  app.get("/", (req, res) => res.semd("hello world"));

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/post", postRouter);
  app.use("/comment", commentRouter);
  app.use("/admin", adminRouter);

  app.use(notfoundhandler);
  app.use(globalerrorhandling);
};

export default bootstrap;
