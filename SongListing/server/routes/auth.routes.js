/**
 * auth.routes.js
 * Authentication routes: register, login, logout and profile
 *
 * This file defines all server-side authentication endpoints.
 * Authentication is implemented using express-session.
 * User data is stored in a local JSON file for simplicity.
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const DB_PATH = path.join(__dirname, "../database/users.json");

/* =========================
   Helper functions
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
 * Returns a public version of the user object
 * without sensitive fields such as passwords.
 *
 * @param {Object} u - Full user object
 * @returns {Object} Public user data
 */
function publicUser(u) {
    return {
        username: u.username,
        firstName: u.firstName,
        imageUrl: u.imageUrl
    };
}

/* =========================
   Register
   ========================= */

/**
 * Registers a new user.
 * Validates required fields, hashes the password,
 * and stores the user in the local database.
 */
router.post("/register", async (req, res) => {
    const { username, password, firstName, imageUrl } = req.body;

    if (!username || !password || !firstName || !imageUrl) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const users = readUsers();

    if (users.find(u => u.username === username)) {
        return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    users.push({
        username,
        passwordHash,
        firstName,
        imageUrl,
        playlists: []
    });

    writeUsers(users);

    res.json({ ok: true });
});

/* =========================
   Login
   ========================= */

/**
 * Logs in an existing user.
 * Compares the provided password with the stored hash.
 * On success, stores public user data in the session.
 */
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.user = publicUser(user);
    res.json({ ok: true, user: publicUser(user) });
});

/* =========================
   Logout
   ========================= */

/**
 * Logs out the current user by destroying the session.
 */
router.post("/logout", (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
});

/* =========================
   Current user (profile)
   ========================= */

/**
 * Returns the currently authenticated user's profile.
 * Used by the client to protect pages and load user data.
 */
router.get("/me", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }

    res.json({ user: req.session.user });
});

module.exports = router;
