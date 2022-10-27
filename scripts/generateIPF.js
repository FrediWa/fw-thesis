function generateIPFfromOSMD(osmdObject){

    // Based on
    // https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/wiki/Tutorial:-Extracting-note-timing-for-playing
    // small changes made

    const allNotes = [];

    // Reset cursor
    osmdObject.cursor.reset()
    const iterator = osmdObject.cursor.Iterator;

    // Iterate over sheet
    while ( !iterator.EndReached ) {
        const voices = iterator.CurrentVoiceEntries;
        for (let i = 0; i < voices.length; i++) {
            const v = voices[i];
            const notes = v.Notes;
            for (let j = 0; j < notes.length; j++) {
                const note = notes[j];
                // Skip rests and muted notes
                if ( note != null && note.halfTone != 0 && !note.isRest() ) {
                    console.log(note)
                    allNotes.push({
                        "note": note.halfTone,
                        "duration": note.length.numerator / note.length.denominator,
                        "tempo": note.sourceMeasure.tempoInBPM,
                    })
                }
            }
        }
        iterator.moveToNext()
    }

    return allNotes;
}