


function isAnacrusis(timeSignature, measureDuration) {
    // If measure duration mismatches with time signature, the current measure is anacrusis
    return timeSignature.realValue != measureDuration.realValue;
}


function generateIPF(context){



    const repeatMap = [];
    const measureIndeces = [];
    const IPF = {"playbackMap": [], "measures":[], "dc": false, "startAnacrusis": false};
    const sheetOsmd = context.osmd
    const playbackOsmd = context.playbackOsmd;
    const playbackMeasures = playbackOsmd.graphic.measureList;
    const sheetMeasures = sheetOsmd.graphic.measureList;

    // Assert that both OSMD object are atleast the same length
    // TODO: Fix multirest
    const enableLengthAssertion = false;
    if ( playbackMeasures.length !== sheetMeasures.length  && enableLengthAssertion) {
        console.error("Graphic and playback length mismatch");
        return undefined;
    }

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
    IPF.dc = repeatTypes.includes(lastMeasureRepetitionInstructions.type);

    // Add repeat map to IPF
    // IPF.repeatMap = repeatMap

    // Generate playbackMap from repeat information

    const FLAT_DEPTH = 10;
    for(let i = 0; i < IPF.measures.length; i++) {
        measureIndeces[i] = i;
    }
    let playbackMap = measureIndeces.slice();
    let totalShift = 0;
    const sectionRepeats = [];
    for(let i = 0; i < repeatMap.length; i++) {
        console.log(repeatMap[i])
        if(repeatMap[i] != undefined){
            const repeatedSection = measureIndeces.slice(repeatMap[i][0], 1 + repeatMap[i][1]);
            console.log("prkl", repeatedSection);
            const insertStart = repeatMap[i][1] + 1;
            const insertEnd = insertStart + repeatedSection.length;
            console.log("Slice 0 to insert start", ...playbackMap.slice(0, insertStart))
            playbackMap = [...playbackMap.slice(0, insertStart + totalShift), ...repeatedSection, ...playbackMap.slice(insertStart + totalShift)]
            console.log("öjhagsefui", playbackMap)
            totalShift += repeatedSection.length

            // Get section to repeat
            // const repeatedSection = measureIndeces.slice(repeatMap[i][0], 1 + repeatMap[i][1]);
            // Get index of insertion
            // const insertIndex = 1 + repeatMap[i][1];


            // sectionRepeats.push(repeatedSection)
        }
    }
    console.log(sectionRepeats)

    IPF.playbackMap = playbackMap
    IPF.repeatMap = repeatMap

    // Based on
    // https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/wiki/Tutorial:-Extracting-note-timing-for-playing
    // small changes made

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

                const currentMeasureDuration = note.sourceMeasure.duration;
                const currentTimeSignature   = note.sourceMeasure.activeTimeSignature;
                const anacrusis              = isAnacrusis(currentTimeSignature, currentMeasureDuration);

                // Note if the first measure is anacrusis
                if(anacrusis && note.sourceMeasure.measureNumber == 0)
                    IPF.startAnacrusis = true;

                // Skip anacrusis if it isn't the first measure
                if ( note != null && (!anacrusis || (anacrusis && note.sourceMeasure.measureNumber == 0))) {
                    const measureIndex = note.sourceMeasure.measureListIndex
                    IPF.measures[measureIndex].notes.push({
                        "note": note.halfTone + 12,
                        "duration": note.length.realValue * 3,
                        "tempo": note.sourceMeasure.tempoInBPM,
                        "quiet": ((note.slurs.length !== 0) && IPF.measures[measureIndex-1].notes.slur === true) || note.isRest(),
                        "offset": noteOffset
                    })
                }
                noteOffset += note.length.realValue * 3;
            }
        }
        iterator.moveToNext()
    }

    ApplicationContext.ipf = IPF;
}