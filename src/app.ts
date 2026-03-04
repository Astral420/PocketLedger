import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes";


export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", routes);

app.get("/", (_req, res) => {
  res.send("BudgetTracker API is running!");
});
