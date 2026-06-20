import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatbot.routes";
import uploadRoutes from "./routes/upload.routes";
import { initializeDatabase } from "./db/connection";
import  searchRoutes  from "./routes/search.routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://mybot-green-rho.vercel.app"],
  }),
);
app.use(express.json());
app.use("/chat", chatRoutes);
app.use("/upload", uploadRoutes);
app.use("/search", searchRoutes);

app.get("/", (req, res) => {
  res.send("Api health check");
});

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(8000, () => {
      console.log("Server running on port 8000");
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
}

void startServer();
