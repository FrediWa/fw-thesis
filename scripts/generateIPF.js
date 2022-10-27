function generateIPFfromOSMD(osmdObject){
    // based on
    // https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/wiki/Tutorial:-Extracting-note-timing-for-playing
    // small changes made
    const allNotes = []

    osmdObject.cursor.reset()
    const iterator = osmdObject.cursor.Iterator;

    while ( !iterator.EndReached ) {
        const voices = iterator.CurrentVoiceEntries;
        for (let i = 0; i < voices.length; i++) {
            const v = voices[i];
            const notes = v.Notes;
            for (let j = 0; j < notes.length; j++) {
                const note = notes[j];
                // make sure our note is not silent
                if ( note != null && note.halfTone != 0 && !note.isRest() ) {
                    allNotes.push({
                        "note": note.halfTone,
                        "time": note.length.numerator / note.length.denominator
                    })
                }
            }
        }
        iterator.moveToNext()
    }

    return allNotes;
}