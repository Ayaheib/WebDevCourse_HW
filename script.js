// DOM elements
const form = document.getElementById('songForm');
const list = document.getElementById('songList');
const submitBtn = document.getElementById('submitBtn');
const titleInput = document.getElementById('title');
const urlInput = document.getElementById('url');
const ratingInput = document.getElementById('rating');
const viewToggle = document.getElementById('viewToggle');

// state
let songs = JSON.parse(localStorage.getItem('songs')) || [];
let editSongId = null;
let viewMode = "table"; // "table" | "cards"

// on load
document.addEventListener("DOMContentLoaded", () => {
    renderSongs();

    // change sort
    document
        .querySelectorAll('input[name="sort"]')
        .forEach(radio => radio.addEventListener('change', renderSongs));

    // toggle view
    viewToggle.addEventListener("click", () => {
        viewMode = viewMode === "table" ? "cards" : "cards" ? "table" : "cards";
        viewMode = viewMode === "table" ? "cards" : "table"; // simply flip
    });

    viewToggle.onclick = () => {
        viewMode = viewMode === "table" ? "cards" : "table";
        viewToggle.src = viewMode === "table" ? "table.png" : "cards.png";
        renderSongs();
    };

    // stop video on modal close
    const modalEl = document.getElementById('playerModal');
    if (modalEl) {
        modalEl.addEventListener('hidden.bs.modal', () => {
            document.getElementById('playerFrame').src = "";
        });
    }
});

// helpers
function extractYouTubeId(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : "";
}

function save() {
    localStorage.setItem('songs', JSON.stringify(songs));
}

function sortSongs() {
    const selected = document.querySelector('input[name="sort"]:checked').value;

    if (selected === 'title') {
        songs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selected === 'rating') {
        songs.sort((a, b) => b.rating - a.rating);
    } else {
        // date
        songs.sort((a, b) => b.dateAdded - a.dateAdded);
    }
}

// form submit (add / update)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    const rating = Number(ratingInput.value);
    const youtubeId = extractYouTubeId(url);

    if (!youtubeId) {
        alert("Invalid YouTube URL");
        return;
    }

    if (editSongId) {
        // UPDATE
        const song = songs.find(s => s.id === editSongId);
        if (!song) return;

        song.title = title;
        song.youtubeId = youtubeId;
        song.rating = rating;

        editSongId = null;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
    } else {
        // ADD
        const song = {
            id: Date.now(),
            title,
            youtubeId,
            rating,
            dateAdded: Date.now()
        };
        songs.push(song);
    }

    save();
    form.reset();
    renderSongs();
});

// render
function renderSongs() {
    sortSongs();
    list.innerHTML = "";

    if (viewMode === "table") {
        renderTable();
    } else {
        renderCards();
    }
}

function renderTable() {
    list.innerHTML = "";

    songs.forEach(song => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>
              <img
                src="https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg"
                width="80"
                class="rounded me-2">
              <strong>${song.title}</strong>
            </td>
            <td>${song.rating}/10</td>
            <td class="text-end">
                <button class="btn btn-sm btn-info me-1"
                        onclick="playVideo('${song.youtubeId}')">▶</button>
                <button class="btn btn-sm btn-warning me-1"
                        onclick="editSong(${song.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger"
                        onclick="deleteSong(${song.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        list.appendChild(row);
    });
}

function renderCards() {
    list.innerHTML = "";

    const row = document.createElement("div");
    row.className = "row g-3";

    songs.forEach(song => {
        const col = document.createElement("div");
        col.className = "col-md-4";

        col.innerHTML = `
          <div class="card h-100 border-primary">
            <img src="https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg"
                 class="card-img-top">

            <div class="card-body">
              <h5 class="card-title">${song.title}</h5>
              <p class="card-text">Rating: ${song.rating}/10</p>
            </div>

            <div class="card-footer text-center">
              <button class="btn btn-info btn-sm me-1"
                      onclick="playVideo('${song.youtubeId}')">▶</button>
              <button class="btn btn-warning btn-sm me-1"
                      onclick="editSong(${song.id})">✏️</button>
              <button class="btn btn-danger btn-sm"
                      onclick="deleteSong(${song.id})">🗑️</button>
            </div>
          </div>
        `;

        row.appendChild(col);
    });

    list.appendChild(row);
}

// actions
function deleteSong(id) {
    if (!confirm("Delete this song?")) return;
    songs = songs.filter(song => song.id !== id);
    save();
    renderSongs();
}

function editSong(id) {
    const song = songs.find(song => song.id === id);
    if (!song) return;

    titleInput.value = song.title;
    urlInput.value = `https://youtu.be/${song.youtubeId}`;
    ratingInput.value = song.rating;

    editSongId = id;
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update';
}

function playVideo(youtubeId) {
    const iframe = document.getElementById('playerFrame');
    iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;

    const modal = new bootstrap.Modal(
        document.getElementById('playerModal')
    );
    modal.show();
}
