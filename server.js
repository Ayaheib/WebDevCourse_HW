/**
 * server.js
 * Main server entry point
 *
 * This file initializes and configures the Express server.
 * It is responsible for:
 * - Loading environment variables
 * - Configuring middleware (JSON parsing, sessions)
 * - Serving static client files
 * - Registering API routes
 * - Starting the server
 */

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth.routes");
const playlistRoutes = require("./routes/playlists.routes");
const youtubeRoutes = require("./routes/youtube.routes");

const app = express();
const PORT = 3000;

/* =========================
   Middleware
   ========================= */

// Parse JSON request bodies
app.use(express.json());

// Configure session-based authentication
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

/* =========================
   Static files
   ========================= */

// Serve client HTML pages
app.use(express.static(path.join(__dirname, "../client/pages")));

// Serve client-side JavaScript files
app.use(
    "/scripts",
    express.static(path.join(__dirname, "../client/scripts"))
);

// Serve client-side CSS files
app.use(
    "/styles",
    express.static(path.join(__dirname, "../client/styles"))
);

// Serve uploaded MP3 files
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

/* =========================
   API Routes
   ========================= */

// Authentication routes
app.use("/api/auth", authRoutes);

// Playlist management routes
app.use("/api/playlists", playlistRoutes);

// YouTube search routes
app.use("/api/youtube", youtubeRoutes);

/* =========================
   Start server
   ========================= */

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
