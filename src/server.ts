import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatbot.routes";
import uploadRoutes from "./routes/upload.routes";
import { initializeDatabase } from "./db/connection";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://mybot-green-rho.vercel.app"],
  }),
);
app.use(express.json());
app.use("/chat", chatRoutes);
app.use("/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Api health check");
});

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(4000, () => {
      console.log("Server running on port 4000");
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
}

void startServer();
