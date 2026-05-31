import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chatRoutes from "./routes/chatbot.routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5174",
  }),
);
app.use(express.json());
app.use("/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Api health check");
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
