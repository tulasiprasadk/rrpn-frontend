import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import bodyParser from "body-parser";
import passport from "../passport.js";
import routes from "../routes/index.js";

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://rrw-frontend.vercel.app",
      "https://rrnagarfinal-frontend.vercel.app"
    ],
    credentials: true,
  })
);

app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Root
app.get("/", (req, res) => {
  res.json({
    message: "RR Nagar Backend API",
    status: "running"
  });
});

// Routes
app.use("/api", routes);

// Error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 👇 THIS IS CRITICAL: Export the app directly
export default app;
