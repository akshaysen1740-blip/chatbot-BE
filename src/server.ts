import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatbot.routes";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5174", "https://mybot-green-rho.vercel.app"],
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
