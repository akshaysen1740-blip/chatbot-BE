import "dotenv/config";
import express from "express";
import chatRoutes from "./routes/chatbot.routes";
import { corsMiddleware, corsPreflightMiddleware } from "./middleware/cors";
import uploadRoutes from "./routes/upload.routes";
import { initializeDatabase } from "./db/connection";
import { toolRegistry } from "./controllers/chat/tool-registry";
import searchRoutes from "./routes/search.routes";
import { registerTools } from "./controllers/chat/register-tools";

const app = express();

app.use(corsMiddleware);
app.use(corsPreflightMiddleware);
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
    registerTools();

    app.listen(8000, () => {
      console.log("Server running on port 8000");
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
}

void startServer();
