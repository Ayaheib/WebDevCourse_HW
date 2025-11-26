

document.addEventListener("DOMContentLoaded", () => {

});


const form = document.getElementById('songForm');
const list = document.getElementById('songList');
const submitBtn = document.getElementById('submitBtn');

let songs = JSON.parse(localStorage.getItem('songs')) || [];


form.addEventListener('submit', (e) => {
    e.preventDefault();


    const title = document.getElementById('title').value;
    const url = document.getElementById('url').value;


    // TO DO : VALIDATE FIELDS

    const song = {
        id: Date.now(),  // Unique ID
        title: title,
        url: url,
        dateAdded: Date.now()
    };


    songs.push(song);

    saveAndRender();
    //TO DO SAVE  AND RERENDER 

    form.reset();
});


function saveAndRender() {

    localStorage.setItem('songs', JSON.stringify(songs));

    //TODO: RELOAD UI
    renderSongs();
}


function renderSongs() {
    list.innerHTML = ''; // Clear current list

    songs.forEach(song => {
        // Create table row
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${song.title}</td>
            <td><a href="${song.url}" target="_blank" class="text-info">Watch</a></td>
            <td class="text-end">
                <button class="btn btn-sm btn-warning me-2" onclick="editSong(${song.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSong(${song.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        list.appendChild(row);
    });
}


function deleteSong(id) {
    if (confirm('Are you sure?')) {
        // Filter out the song with the matching ID
        songs = songs.filter(song => song.id !== id);
        saveAndRender();
    }
}
