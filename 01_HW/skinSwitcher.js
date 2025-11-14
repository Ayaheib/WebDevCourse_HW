let skins = ["/Users/ayaheib/Desktop/WebDevCourse_HW/01_HW/SKINS/basic.css", "/Users/ayaheib/Desktop/WebDevCourse_HW/01_HW/SKINS/dark.css", "/Users/ayaheib/Desktop/WebDevCourse_HW/01_HW/SKINS/modern.css"];
let currentSkin = 0;

function switchSkin() {
    currentSkin++;

    if (currentSkin >= skins.length) {
        currentSkin = 0;
    }

    document.getElementById("skinLink").href = skins[currentSkin];
}
