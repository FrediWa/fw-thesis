
function moveCursor(cursor, steps) {
    for ( let i = 0; i < steps; i++ ) cursor.next();
}

function moveCursorToMeasure(cursor, measureIndex) {
    while(cursor.iterator.currentMeasureIndex != measureIndex) cursor.next()
}

function generateIPF(context){

    // Based on
    // https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/wiki/Tutorial:-Extracting-note-timing-for-playing
    // small changes made

    const allNotes = [];
    const repeatMap = [];
    const IPF = {"repeatMap": [], "measures":[], "dc": false, "firstAnacrusis": false};
    const sheetOsmd = context.osmd
    const playbackOsmd = context.playbackOsmd;
    const playbackMeasures = playbackOsmd.graphic.measureList;
    const sheetMeasures = sheetOsmd.graphic.measureList;
    const measureTimingInfo = []

    // Assert that both OSMD object are atleast the same length
    // Problematic when OSMD combines multiple only-rest measures into multimeasure rests
    if ( playbackMeasures.length !== sheetMeasures.length  && false) {
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
        if(parentSourceMeasure.firstRepetitionInstructions.length > 0
            && parentSourceMeasure.firstRepetitionInstructions[0].type == 0) {
            // Set starting point to current index
            repeatStart = i;
        } else if(parentSourceMeasure.lastRepetitionInstructions.length > 0
            && parentSourceMeasure.lastRepetitionInstructions[0].type == 2) {
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

    // Handle Da Capo and similar instructions
    const repeatTypes = [
        4, // DC
        9, // DC AF
        10 // DS AC
    ]; // List of enums according to OSMD's RepetitionInstructions.ts
    const lastMeasureRepetitionInstructions = context.playbackOsmd.sheet.sourceMeasures.slice(-1)[0].lastRepetitionInstructions[0];
    IPF.dc = repeatTypes.includes(lastMeasureRepetitionInstructions.type);

    // Add repeat map to IPF
    IPF.repeatMap = repeatMap

    // Reset cursor
    playbackOsmd.cursor.reset()
    const iterator = playbackOsmd.cursor.Iterator;
    let noteOffset = 0;
    let previousMeasureNumber = 0;
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
                if(note.sourceMeasure.measureNumber != previousMeasureNumber){
                    previousMeasureNumber = note.sourceMeasure.measureNumber;
                    noteOffset = 0;
                }
                // Skip rests and muted notes
                console.log(note)
                if ( note != null) {
                    IPF.measures[note.sourceMeasure.measureNumber].notes.push({
                        "note": note.halfTone,
                        "duration": note.length.realValue,
                        "tempo": note.sourceMeasure.tempoInBPM,
                        "slur": note.slurs.length !== 0,
                        "offset": noteOffset
                    })
                }
                noteOffset += note.length.realValue;
            }
        }
        iterator.moveToNext()
    }

    ApplicationContext.ipf = IPF;
}