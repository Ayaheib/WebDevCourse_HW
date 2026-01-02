/**
 * youtube.service.js
 * Server-side YouTube search and video details service
 *
 * This service communicates directly with the YouTube Data API.
 * The API key is stored securely in environment variables and
 * is never exposed to the client.
 *
 * Responsibilities:
 * - Perform YouTube search requests
 * - Fetch additional video metadata (duration, view count)
 * - Merge search results with video details
 */

const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_KEY = process.env.YOUTUBE_API_KEY;

/* =========================
   Search videos
   ========================= */

/**
 * Searches YouTube videos and enriches the results with
 * duration and view count information.
 *
 * @param {string} query - Search query string
 * @returns {Array} Array of enriched video objects
 */
async function searchYouTube(query) {
    const searchUrl =
        `https://www.googleapis.com/youtube/v3/search` +
        `?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}` +
        `&key=${API_KEY}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    // Collect video IDs from search results
    const videoIds = searchData.items
        .map(v => v.id.videoId)
        .join(",");

    if (!videoIds) {
        return [];
    }

    // Fetch additional video details (duration and view count)
    const detailsUrl =
        `https://www.googleapis.com/youtube/v3/videos` +
        `?part=contentDetails,statistics&id=${videoIds}` +
        `&key=${API_KEY}`;

    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    // Map video details by video ID for quick lookup
    const detailsMap = {};
    detailsData.items.forEach(v => {
        detailsMap[v.id] = {
            duration: v.contentDetails.duration,
            views: v.statistics.viewCount
        };
    });

    // Merge search results with video details
    return searchData.items.map(v => ({
        videoId: v.id.videoId,
        title: v.snippet.title,
        thumbnail: v.snippet.thumbnails.medium.url,
        duration: detailsMap[v.id.videoId]?.duration || "N/A",
        views: detailsMap[v.id.videoId]?.views || "0"
    }));
}

module.exports = { searchYouTube };
