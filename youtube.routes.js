/**
 * youtube.routes.js
 * Server-side YouTube search API
 *
 * This file defines a protected API endpoint for searching YouTube videos.
 * The YouTube API key is stored securely on the server and is never exposed
 * to the client.
 *
 * The route delegates the actual YouTube interaction to a service layer,
 * which enriches search results with additional metadata such as duration
 * and view count.
 */

const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { searchYouTube } = require("../services/youtube.service");

const router = express.Router();

/* =========================
   Search YouTube videos
   ========================= */

/**
 * GET /search
 * Searches YouTube videos based on a query string.
 *
 * This endpoint:
 * - Requires user authentication
 * - Forwards the query to the YouTube service
 * - Returns enriched video data (title, thumbnail, duration, views)
 *
 * Query parameters:
 * @param {string} q - Search query
 */
router.get("/search", requireAuth, async (req, res) => {
    const q = req.query.q;

    if (!q) {
        return res.status(400).json({ error: "Missing query parameter" });
    }

    try {
        const results = await searchYouTube(q);

        res.json({
            query: q,
            results
        });
    } catch (err) {
        console.error("YouTube search error:", err);
        res.status(500).json({ error: "YouTube search failed" });
    }
});

module.exports = router;
