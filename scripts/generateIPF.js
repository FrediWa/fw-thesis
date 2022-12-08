


function isAnacrusis(timeSignature, measureDuration) {
    // If measure duration mismatches with time signature, the current measure is anacrusis
    return timeSignature.realValue != measureDuration.realValue;
}


function generateIPF(context){

    const IPF = {"playbackMap": [], "measures":[], "startAnacrusis": false};
    const repeatMap = [];
    const sheetOsmd = context.osmd
    const playbackOsmd = context.playbackOsmd;
    const playbackMeasures = playbackOsmd.graphic.measureList;
    const sheetMeasures = sheetOsmd.graphic.measureList;

    // Assert that both OSMD object are atleast the same length
    const enableLengthAssertion = true;
    if ( playbackMeasures.length !== sheetMeasures.length  && enableLengthAssertion) {
        console.error("Graphic and playback length mismatch");
        return undefined;
    }

    /* ---------- Extract measure and repeat information ---------- */

    // Generate repeat map and insert measure info into object
    let repeatStart = 0;
    let repeatEnd = 0;
    for ( let i = 0; i < playbackMeasures.length; i++ ) {
        const currentMeasure = playbackMeasures[i];
        const parentSourceMeasure = currentMeasure[0].parentSourceMeasure;
        IPF.measures.push(
            {
                "timeSignature": parentSourceMeasure.activeTimeSignature,
                "tempo": parentSourceMeasure.tempoInBPM,
                "notes": [],
                "boundingBox": []
            }
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
            This makes it easy for the playback function to check if a repeat should
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
    const dc = repeatTypes.includes(lastMeasureRepetitionInstructions?.type);

    /* ---------- Construct playbackMap ---------- */

    const measureIndeces = [];
    const sectionRepeats = [];
    for(let i = 0; i < IPF.measures.length; i++) {
        measureIndeces[i] = i;
    }
    let playbackMap = measureIndeces.slice();
    // Keep track of insertion index as not to overwrite existing information
    let totalShift = 0;
    for(let i = 0; i < repeatMap.length; i++) {
        const repeatIterator = repeatMap[i];
        if(repeatIterator != undefined){
            // Get measures to repeat
            const repeatedSection = measureIndeces.slice(repeatIterator[0], repeatIterator[1] + 1);
            const insertionIndex = repeatIterator[1] + 1 + totalShift;

            //console.log("Repeated section", repeatedSection);
            //console.log("Slice 0 to insert start", ...playbackMap.slice(0, insertionIndex))

            // Construct a playback map by appending it to the middle of itself at certain positions
            playbackMap = [...playbackMap.slice(0, insertionIndex),   // Everything up to insertion index
                           ...repeatedSection,                                     // New instructions
                           ...playbackMap.slice(insertionIndex)       // The rest
            ]

            // Increment shift
            totalShift += repeatedSection.length
        }
    }

    // Duplicate playbackMap in case of Da Capo
    if(dc)
        playbackMap = [...playbackMap, ...playbackMap]

    //console.log("Completed playback map", playbackMap)
    //console.log(sectionRepeats)

    // Append playbackMap to IPF
    IPF.playbackMap = playbackMap

    /* ---------- Extract note information ---------- */

    // Based on
    // https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/wiki/Tutorial:-Extracting-note-timing-for-playing
    // small changes made

    // Reset cursor
    playbackOsmd.cursor.reset()
    const iterator = playbackOsmd.cursor.Iterator;
    let noteOffset = 0;
    let anacrusisShift = 0;
    let previousMeasureNumber = 0;
    // Iterate over sheet
    while ( !iterator.EndReached ) {
        const voices = iterator.CurrentVoiceEntries;

        for (let i = 0; i < voices.length; i++) {
            const v = voices[i];
            const notes = v.Notes;
            anacrusisShift = 0;
            for (let j = 0; j < notes.length; j++) {
                const note = notes[j];
                const currentMeasureDuration = note.sourceMeasure.duration;
                const currentTimeSignature   = note.sourceMeasure.activeTimeSignature;
                const anacrusis              = isAnacrusis(currentTimeSignature, currentMeasureDuration);


                // Blend slurs in different measures
                if(note.sourceMeasure.measureNumber != previousMeasureNumber){
                    previousMeasureNumber = note.sourceMeasure.measureNumber;
                    noteOffset = 0;
                }
                // Calculate anacrusis padding
                if(anacrusis && i == 0)
                    anacrusisShift = currentTimeSignature.realValue - currentMeasureDuration.realValue

                const measureIndex = note.sourceMeasure.measureListIndex

                if ( note != null) {
                    // //console.log("Note", note)
                    IPF.measures[measureIndex].notes.push({
                        "note": note.halfTone + 12,
                        "duration": note.length.realValue,
                        "tempo": note.sourceMeasure.tempoInBPM,
                        "quiet": ((note.slurs.length !== 0) && IPF.measures[measureIndex-1].notes.slur === true) || note.isRest(),
                        "offset": noteOffset + anacrusisShift
                    })
                    noteOffset += note.length.realValue;
                }
            }
        }
        iterator.moveToNext()
    }

    ApplicationContext.ipf = IPF;
}