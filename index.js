import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bootstrap from "./app.controller.js";
import authRouter from "./src/modules/auth/auth.controller.js";
import userRouter from "./src/DB/Models/user/user.controller.js";

import cors from "cors";
console.log("ENV TEST =", process.env.USER_ACCESS_TOKEN);


const app = express();
app.use(express.json());
app.get("/", (req, res) => res.send("Server is running ✅"));

app.use(
  cors({
    origin: ["http://localhost:4200", "http://127.0.0.1:4200"],
    credentials: true,
  })
);

// ✅ Mount routes
app.use("/auth", authRouter);
app.use("/user", userRouter);


// ✅ Initialize DB and error handling
await bootstrap(app, express);

// ✅ Debug line (AFTER routes are mounted)
app._router?.stack?.forEach((r) => {
  if (r.route && r.route.path) {
    console.log("✅ Registered route:", r.route.path);
  }
});

// ✅ Start server
const PORT = process.env.PORT || 6322;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
