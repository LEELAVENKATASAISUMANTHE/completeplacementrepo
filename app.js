import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from './routes/admin.routes.js';
import { getPool } from './db/setup.db.js';
import pg from 'connect-pg-simple';
import { graphQLHandler } from './db/graphql-server.js';

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
let pools;
try {
  // assign to outer `pools` instead of creating a new local const (fixes undefined pool)
  pools = getPool();
} catch (error) {
  console.error("Error initializing database connection pool:", error);
}
const PGStore = pg(session);
const sessionStore = new PGStore({
  pool: pools, // Use your existing database connection pool
  tableName: 'user_sessions', // The table name to store sessions
  createTableIfMissing: true,
});

app.use(
  session({
    store: sessionStore, // Use the Postgres store
    secret: process.env.SESSION_SECRET || 'fallback_secret', // Make sure this is a strong, random secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    },
  })
);

app.use(express.static("public"));
app.use(cookieParser());

// Add routes
app.use('/api', adminRoutes);

// Add GraphQL endpoint
app.all('/graphql', graphQLHandler);

// Example route
app.get("/", (req, res) => {
  res.send("Backend is running on Vercel 🚀");
});

// Export app for both local development and Vercel
export { app };

// ✅ This is the fix for Vercel
export default function handler(req, res) {
  return app(req, res);
}
