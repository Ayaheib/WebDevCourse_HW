/**
 * playlists.js
 * Playlist management and media playback (MP3 & YouTube)
 *
 * This file handles all client-side logic related to playlists:
 * - Creating, loading and deleting playlists
 * - Displaying playlist contents
 * - Uploading and playing MP3 files
 * - Playing YouTube videos from playlists
 *
 * All playlist operations are performed for the authenticated user only.
 */

let currentPlaylist = null;

/* =========================
   Load all playlists
   ========================= */

/**
 * Fetches and displays all playlists
 * that belong to the current user.
 */
async function loadPlaylists() {
    const res = await fetch("/api/playlists");
    const data = await res.json();
    const div = document.getElementById("playlists");

    div.innerHTML = data.playlists.map(p => `
        <div class="card">
            <h3>${p.name}</h3>
            <button onclick="openPlaylist('${p.id}')">Open</button>
            <button onclick="deletePlaylist('${p.id}')">Delete</button>
        </div>
    `).join("");
}

/* =========================
   Create playlist
   ========================= */

/**
 * Creates a new playlist using the name
 * entered by the user.
 */
async function createPlaylist() {
    if (!plName.value.trim()) return;

    await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: plName.value })
    });

    plName.value = "";
    loadPlaylists();
}

/* =========================
   Delete playlist
   ========================= */

/**
 * Deletes the selected playlist.
 *
 * @param {string} id - Playlist ID
 */
async function deletePlaylist(id) {
    await fetch(`/api/playlists/${id}`, { method: "DELETE" });
    loadPlaylists();
}

/* =========================
   Open playlist
   ========================= */

/**
 * Displays the selected playlist and its items,
 * including MP3 files and YouTube videos.
 *
 * @param {string} id - Playlist ID
 */
async function openPlaylist(id) {
    currentPlaylist = id;

    const res = await fetch("/api/playlists");
    const data = await res.json();
    const pl = data.playlists.find(p => p.id === id);

    const div = document.getElementById("playlists");

    div.innerHTML = `
        <div class="card">
            <h2>${pl.name}</h2>

            <h3>Upload MP3</h3>
            <input type="file" id="mp3" accept=".mp3">
            <button onclick="uploadMp3()">Upload</button>

            <h3>Songs</h3>

            ${pl.items.length
            ? pl.items.map(i => `
                    <div class="card">
                        ${i.type === "youtube"
                    ? `
                                <b>YouTube</b>
                                <button onclick="openVideo('${i.videoId}')">
                                    Play
                                </button>
                              `
                    : `
                                <b>MP3:</b> ${i.originalName || ""}
                                <br>
                                <audio controls src="${i.fileUrl}"></audio>
                              `
                }
                        <br>
                        <button onclick="removeItem('${i.itemId}')">
                            Delete
                        </button>
                    </div>
                  `).join("")
            : "<p>Playlist is empty</p>"
        }

            <button onclick="loadPlaylists()">Back</button>
        </div>
    `;
}

/* =========================
   Upload MP3
   ========================= */

/**
 * Uploads an MP3 file to the server and
 * adds it to the currently opened playlist.
 */
async function uploadMp3() {
    const fileInput = document.getElementById("mp3");

    if (!fileInput.files.length) {
        alert("Choose an MP3 file");
        return;
    }

    const fd = new FormData();
    fd.append("mp3", fileInput.files[0]);

    const up = await fetch("/api/playlists/upload/mp3", {
        method: "POST",
        body: fd
    });

    const data = await up.json();

    await fetch(`/api/playlists/${currentPlaylist}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "mp3",
            fileUrl: data.fileUrl,
            originalName: data.originalName
        })
    });

    openPlaylist(currentPlaylist);
}

/* =========================
   Remove item
   ========================= */

/**
 * Removes a media item (MP3 or YouTube)
 * from the current playlist.
 *
 * @param {string} itemId - Item ID
 */
async function removeItem(itemId) {
    await fetch(
        `/api/playlists/${currentPlaylist}/items/${itemId}`,
        { method: "DELETE" }
    );

    openPlaylist(currentPlaylist);
}

/* =========================
   Play YouTube video
   ========================= */

/**
 * Opens a YouTube video in a new browser tab.
 *
 * @param {string} videoId - YouTube video ID
 */
function openVideo(videoId) {
    window.open(
        `https://www.youtube.com/watch?v=${videoId}`,
        "_blank"
    );
}
