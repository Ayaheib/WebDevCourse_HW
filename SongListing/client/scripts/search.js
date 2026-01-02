/**
 * search.js
 * YouTube search via a secure server API
 *
 * This file handles the client-side logic for searching YouTube videos.
 * The actual YouTube API key is never exposed to the client and is used
 * only on the server side.
 *
 * Features implemented in this file:
 * - Sending search queries to the server
 * - Rendering search results dynamically
 * - Truncating long video titles and displaying full titles via tooltips
 * - Displaying video thumbnails, duration and view count
 * - Opening videos for playback
 * - Adding videos to user playlists (favorites)
 */

/* =========================
   Helper functions
   ========================= */

/**
 * Shortens long video titles and appends "..." if needed.
 * The full title is still available via a tooltip.
 *
 * @param {string} title - Full video title
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Shortened title
 */
function shortTitle(title, maxLength = 40) {
    return title.length > maxLength
        ? title.slice(0, maxLength) + "..."
        : title;
}

/**
 * Converts YouTube ISO 8601 duration format (e.g. PT3M33S)
 * into a human-readable mm:ss format.
 *
 * @param {string} iso - ISO duration string
 * @returns {string} Formatted duration
 */
function formatDuration(iso) {
    if (!iso || iso === "N/A") return "N/A";

    const match = iso.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return iso;

    const minutes = match[1] || "0";
    const seconds = (match[2] || "0").padStart(2, "0");
    return `${minutes}:${seconds}`;
}

/* =========================
   Search YouTube
   ========================= */

/**
 * Sends a search request to the server and renders
 * the returned YouTube results on the page.
 */
async function search() {
    const q = query.value.trim();
    const resultsDiv = document.getElementById("results");
    if (!q) return;

    resultsDiv.innerHTML = "Searching...";

    try {
        const res = await fetch(
            `/api/youtube/search?q=${encodeURIComponent(q)}`
        );

        if (!res.ok) {
            resultsDiv.innerHTML = "Search failed";
            return;
        }

        const data = await res.json();
        const videos = data.results;

        if (!videos || !videos.length) {
            resultsDiv.innerHTML = "No results found";
            return;
        }

        resultsDiv.innerHTML = videos.map(v => `
            <div class="card">
                <img src="${v.thumbnail}" alt="thumbnail">

                <!-- Truncated title with tooltip -->
                <h3 title="${v.title}">
                    ${shortTitle(v.title)}
                </h3>

                <p>⏱️ ${formatDuration(v.duration)}</p>
                <p>👀 ${Number(v.views).toLocaleString()} views</p>

                <button onclick="openVideo('${v.videoId}')">
                    Watch
                </button>

                <button onclick="addToPlaylist(
                    '${v.videoId}',
                    '${v.title.replace(/'/g, "")}'
                )">
                    Add to Playlist
                </button>
            </div>
        `).join("");

    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = "Error while searching";
    }
}

/* =========================
   Video playback
   ========================= */

/**
 * Opens the selected YouTube video in a new browser tab.
 *
 * @param {string} videoId - YouTube video ID
 */
function openVideo(videoId) {
    window.open(
        `https://www.youtube.com/watch?v=${videoId}`,
        "_blank"
    );
}

/* =========================
   Add video to playlist
   ========================= */

/**
 * Adds a selected YouTube video to one of the user's playlists.
 * The user chooses the playlist via a simple prompt dialog.
 *
 * @param {string} videoId - YouTube video ID
 * @param {string} title - Video title
 */
async function addToPlaylist(videoId, title) {
    const res = await fetch("/api/playlists");
    const data = await res.json();

    if (!data.playlists || !data.playlists.length) {
        alert("No playlists available");
        return;
    }

    const names = data.playlists
        .map((p, i) => `${i + 1}. ${p.name}`)
        .join("\n");

    const choice = prompt(
        "Choose playlist number:\n\n" + names
    );

    const index = Number(choice) - 1;
    if (isNaN(index) || !data.playlists[index]) {
        alert("Invalid choice");
        return;
    }

    const playlistId = data.playlists[index].id;

    const addRes = await fetch(
        `/api/playlists/${playlistId}/items`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "youtube",
                videoId,
                title
            })
        }
    );

    if (addRes.ok) {
        alert("Added to playlist!");
    } else {
        alert("Failed to add");
    }
}
