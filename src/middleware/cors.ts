import cors from "cors";

const allowedOrigins = [
  "https://mychatbot-lime-alpha.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.some(
      (allowedOrigin) => normalizedOrigin === allowedOrigin.replace(/\/$/, "")
    );

    if (isAllowed) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

export const corsMiddleware = cors(corsOptions);

export const corsPreflightMiddleware = (req: any, res: any, next: any) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(204);
    return;
  }

  next();
};
