import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// PORT (not actually used by Vercel, but useful for local dev)
const port = process.env.PORT || 3000;

// Allowed CORS origins
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://placement-frontend-chi.vercel.app", // Vercel frontend
];

// Proxy setup (needed for secure cookies behind Vercel proxy)
app.set("trust proxy", 1);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "26kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));
app.use(cookieParser());

// ✅ Make sure SESSION_SECRET is set in Vercel environment variables
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // only HTTPS in production
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Example route
app.get("/", (req, res) => {
  res.send("Backend is running on Vercel 🚀");
});

// ✅ This is the fix for Vercel
export default function handler(req, res) {
  return app(req, res);
}

// For local dev
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running locally on http://localhost:${port}`);
  });
}
