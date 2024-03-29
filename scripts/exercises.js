const request = new Request("../exercises/exercises.json")

function createDropdownItem(label, value) {
    const option = document.createElement("OPTION");
    option.value = value;
    option.innerHTML = label;
    return option
}

function populateSheetAndPlayback(value){
    // Sheet is what is shown
    // Playback is what is played

    // Get handles for both list elements
    const playbackDropdownElement = document.getElementById("playback-selection")
    const sheetDropdownElement = document.getElementById("sheet-selection")

    // Clear both lists
    playbackDropdownElement.innerHTML = ""
    sheetDropdownElement.innerHTML = ""

    const tracks = ApplicationContext.data.exerciseSrcURLList[value].tracks
    tracks.forEach(element => {
        sheetDropdownElement.append(createDropdownItem(
            element.name,
            element.url
        ))
        playbackDropdownElement.append(createDropdownItem(
            element.name,
            element.url
        ))
    });
    loadSheetMusic(tracks[0].url, ApplicationContext)
    loadPlayback(tracks[0].url, ApplicationContext)

}

function populateCollections(jsonData){
    const array = jsonData["exerciseSrcURLList"];
    const dropdownElement = document.getElementById("collection-selection")

    // Clear dropdown
    dropdownElement.innerHTML = ""

    // Create options for dropdown
    array.forEach(element => {
        dropdownElement.append(createDropdownItem(
            element.collectionName,
            element.collectionID
        ))
    });
}

// Change collection
document.getElementById("collection-selection").addEventListener("change", () => {
    populateSheetAndPlayback(document.getElementById("collection-selection").value)
});

// Change current sheet
document.getElementById("sheet-selection").addEventListener("change", () => {
    loadSheetMusic(document.getElementById("sheet-selection").value, ApplicationContext)
    loadPlayback(document.getElementById("sheet-selection").value, ApplicationContext)
    document.getElementById("playback-selection").value = document.getElementById("sheet-selection").value
});

// Change playback track
document.getElementById("playback-selection").addEventListener("change", () => {
    loadPlayback(document.getElementById("playback-selection").value, ApplicationContext)
});

// Fetch JSON and populate collections dropdown
fetch("../exercises/exercises.json").then((response) => response.json()).then((data) => {
    populateCollections(data);
    ApplicationContext.data = data;
    // Set default
    const DEFAULT_COLLECTION = 0
    document.getElementById('collection-selection').value = DEFAULT_COLLECTION;
    populateSheetAndPlayback(DEFAULT_COLLECTION)
});