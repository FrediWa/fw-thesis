

function generateIPF(context){

    // Based on
    // https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/wiki/Tutorial:-Extracting-note-timing-for-playing
    // small changes made

    const allNotes = [];
    const repeatMap = [];
    const IPF = {"repeatMap": [], "measures":[]};
    const sheetOsmd = context.osmd
    const playbackOsmd = context.playbackOsmd;
    const playbackMeasures = playbackOsmd.graphic.measureList;
    const sheetMeasures = sheetOsmd.graphic.measureList;
    const measureTimingInfo = []

    // Assert that both OSMD object are atleast the same length
    if ( playbackMeasures.length !== sheetMeasures.length ) {
        console.error("Graphic and playback length mismatch");
        return undefined;
    }

    // Generate repeat map and insert measure info into object
    let repeatStart = 0;
    let repeatEnd = 0;
    for ( let i = 0; i < playbackMeasures.length; i++ ) {
        const currentMeasure = playbackMeasures[i];
        const parentSourceMeasure = currentMeasure[0].parentSourceMeasure;
        IPF.measures.push({
            "timeSignature": parentSourceMeasure.activeTimeSignature,
            "tempo": parentSourceMeasure.tempoInBPM,
            "notes": [],
            "boundingBox": []}
        );

        // Find repeat starts and ends
        if(parentSourceMeasure.firstRepetitionInstructions.length > 0 ) {
            // Set starting point to current index
            repeatStart = i;
        } else if(parentSourceMeasure.lastRepetitionInstructions.length > 0 ) {
            // Set repeat end to current index
            repeatEnd = i;

            /* Push repeat instructions to index which corresponds to repeatEnd.
            Thismakes it easy for the playback function to check if a repeat should
            occur after finishing the current measure */

            repeatMap[repeatEnd] = ([repeatStart, repeatEnd]);

            // Reset repeat start
            repeatStart = 0;
        }

    }
    // Add repeat map to IPF
    IPF.repeatMap = repeatMap

    console.log(IPF)

    // Reset cursor
    playbackOsmd.cursor.reset()
    const iterator = playbackOsmd.cursor.Iterator;

    // Iterate over sheet
    while ( !iterator.EndReached ) {
        const voices = iterator.CurrentVoiceEntries;
        // console.log("voices", voices)

        for (let i = 0; i < voices.length; i++) {
            const v = voices[i];
            // console.log("v", v)
            const notes = v.Notes;
            for (let j = 0; j < notes.length; j++) {
                const note = notes[j];
                // Skip rests and muted notes
                if ( note != null) {
                    let duration = (note.length.numerator / note.length.denominator)
                    IPF.measures[note.sourceMeasure.measureNumber].notes.push({
                        "note": note.halfTone,
                        "duration": duration,
                        "tempo": note.sourceMeasure.tempoInBPM,
                        "slur": note.slurs.length !== 0
                    })
                }
            }
        }
        iterator.moveToNext()
    }

    // // Combine adjecent slurred notes of same pitch
    // for(let i = 0; i < allNotes.length; i++){

    //     const current = allNotes[i]

    //     // Just push the last note
    //     if(i == allNotes.length){
    //         IPF.push(current)
    //         continue
    //     }

    //     const next = allNotes[i+1]
    //     // Combine adjacent slurred notes with same pitch
    //     if(current.slur && next.slur && current.note === next.note ){
    //         const combined = structuredClone(current);
    //         combined.duration = current.duration + next.duration
    //         console.log(current.duration, next.duration)
    //         // Hop over next because it's a part of current and already accounted for
    //         i++;
    //         IPF.push(combined)
    //     }else{
    //         // Just push all other cases
    //         IPF.push(current)
    //     }
    // }
    ApplicationContext.ipf = IPF;
}