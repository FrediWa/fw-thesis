// frequencies from https://mixbutton.com/mixing-articles/music-note-to-frequency-chart/
const O6Frequencies = [1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760, 1864.66, 1975.53];
const letterMap = {"C": 0,"D": 2,"E": 4,"F": 5,"G": 7,"A": 9,"H": 11};

function getNoteFrequency(note){
    let noteIndex;
    const octave = note.match(/[0-9]{1}/)[0];
    const letter = note.match(/[A-Z]{1}/)[0];

    // Get octave difference
    let octaveDiff = 6 - octave;

    // Adjust note index based on semi tone
    if( (semi = note.match(/[a-z]{1}/) ) == null)
        noteIndex = letterMap[letter];
    else
        noteIndex = parseInt(letterMap[letter]) + parseInt(semi == "s" ? 1 : -1);

        // Increase or decrease octave if noteIndex falls out of range
        if (noteIndex < 0)
            octaveDiff++;
        else if(noteIndex > 11)
            octaveDiff--;

        // Wrap noteIndex to range
        noteIndex = (noteIndex + 12) % 12;

    // Return approximate frequency
    return (O6Frequencies[noteIndex] * 100 >> octaveDiff) * 0.01;
}