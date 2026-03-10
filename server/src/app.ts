import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";

import { setupPassport } from "./config/passport";
import routes from "./routes";


export const app = express();

app.use(express.json());
app.use(cookieParser());

setupPassport();
app.use(passport.initialize());

app.use("/api/v1", routes);

app.get("/", (_req, res) => {
  res.send("BudgetTracker API is running!");
});
