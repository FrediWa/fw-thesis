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
                    let duration = note.length.numerator / note.length.denominator;



                    allNotes.push({
                        "note": note.halfTone,
                        "duration": duration,
                        "tempo": note.sourceMeasure.tempoInBPM,
                        "slur": note.slurs.length != 0 ? true : false,
                    })
                }
            }
        }
        iterator.moveToNext()
    }

    // Combine adjecent slurred notes of sae pitch
    const IPF = []
    for(let i = 0; i < allNotes.length; i++){

        const current = allNotes[i]

        // Just push the last note
        if(i == allNotes.length){
            IPF.push(current)
            continue
        }

        const next = allNotes[i+1]
        // Combine adjacent slurred notes with same pitch
        if(current.slur && next.slur && current.note === next.note ){
            const combined = structuredClone(current);
            combined.duration = current.duration + next.duration
            console.log(current.duration, next.duration)
            // Hop over next because it's a part of current and already accounted for
            i++;
            IPF.push(combined)
        }else{
            // Just push all other cases
            IPF.push(current)
        }
    }
    return IPF;
}