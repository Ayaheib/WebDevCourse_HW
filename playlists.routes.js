/**
 * playlists.routes.js
 * Full CRUD API for playlists and playlist items (YouTube / MP3)
 *
 * This file defines all server-side routes related to playlists:
 * - Creating, reading and deleting playlists
 * - Adding and removing playlist items
 * - Uploading MP3 files
 * - Updating item ratings
 *
 * All routes are protected and accessible only to authenticated users.
 * Playlist data is stored per user in a local JSON database.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const DB_PATH = path.join(__dirname, "../database/users.json");
const UPLOADS_DIR = path.join(__dirname, "../uploads");

/* =========================
   Utility functions
   ========================= */

/**
 * Reads all users from the local JSON database.
 *
 * @returns {Array} Array of user objects
 */
function readUsers() {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8") || "[]");
}

/**
 * Writes the updated users array back to the JSON database.
 *
 * @param {Array} users - Array of user objects
 */
function writeUsers(users) {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

/**
 * Returns the currently authenticated user object.
 *
 * @param {Object} req - Express request object
 * @returns {Object} User object
 */
function getUser(req) {
    const users = readUsers();
    return users.find(u => u.username === req.session.user.username);
}

/* =========================
   Multer configuration (MP3 upload)
   ========================= */

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Configure Multer storage for MP3 uploads.
 * Files are stored with a sanitized filename.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
        cb(null, Date.now() + "-" + safeName);
    }
});

/**
 * Multer instance with file type validation.
 * Only MP3 files are allowed.
 */
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "audio/mpeg" ||
            file.originalname.endsWith(".mp3")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only MP3 files allowed"));
        }
    }
});

/* =========================
   Routes
   ========================= */

/**
 * GET /
 * Returns all playlists of the authenticated user.
 */
router.get("/", requireAuth, (req, res) => {
    const user = getUser(req);
    res.json({ playlists: user.playlists || [] });
});

/**
 * POST /
 * Creates a new playlist for the authenticated user.
 */
router.post("/", requireAuth, (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Missing name" });
    }

    const users = readUsers();
    const user = users.find(u => u.username === req.session.user.username);

    const playlist = {
        id: "pl-" + Date.now(),
        name,
        createdAt: new Date().toISOString(),
        items: []
    };

    user.playlists.push(playlist);
    writeUsers(users);

    res.json({ playlist });
});

/**
 * DELETE /:playlistId
 * Deletes the specified playlist.
 */
router.delete("/:playlistId", requireAuth, (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.username === req.session.user.username);

    user.playlists = user.playlists.filter(
        p => p.id !== req.params.playlistId
    );

    writeUsers(users);
    res.json({ ok: true });
});

/**
 * POST /:playlistId/items
 * Adds a YouTube or MP3 item to a playlist.
 */
router.post("/:playlistId/items", requireAuth, (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.username === req.session.user.username);
    const playlist = user.playlists.find(
        p => p.id === req.params.playlistId
    );

    if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
    }

    const item = {
        ...req.body,
        itemId: "it-" + Date.now(),
        rating: 0
    };

    playlist.items.push(item);
    writeUsers(users);

    res.json({ item });
});

/**
 * POST /upload/mp3
 * Uploads an MP3 file and returns its public URL.
 */
router.post(
    "/upload/mp3",
    requireAuth,
    upload.single("mp3"),
    (req, res) => {
        res.json({
            fileUrl: "/uploads/" + req.file.filename,
            originalName: req.file.originalname
        });
    }
);

/**
 * PATCH /:playlistId/items/:itemId
 * Updates the rating of a playlist item.
 */
router.patch("/:playlistId/items/:itemId", requireAuth, (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.username === req.session.user.username);
    const playlist = user.playlists.find(
        p => p.id === req.params.playlistId
    );

    const item = playlist.items.find(
        i => i.itemId === req.params.itemId
    );

    item.rating = Number(req.body.rating || 0);

    writeUsers(users);
    res.json({ ok: true });
});

/**
 * DELETE /:playlistId/items/:itemId
 * Removes an item from a playlist.
 */
router.delete("/:playlistId/items/:itemId", requireAuth, (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.username === req.session.user.username);
    const playlist = user.playlists.find(
        p => p.id === req.params.playlistId
    );

    playlist.items = playlist.items.filter(
        i => i.itemId !== req.params.itemId
    );

    writeUsers(users);
    res.json({ ok: true });
});

module.exports = router;
