const startRecording = new CustomEvent("startRecording")
const stopRecording = new CustomEvent("stopRecording")

// Get ToneJS compliant note strings
function getToneName(semitone, keySignature) {
    if (semitone < 12) return
    const N = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"];
    const semitone12 = semitone % 12;

    const octave = Math.floor(semitone / 12) - 1;
    const note = N[semitone12];
    return `${note}${octave}`;
}

function approxFrequencyToMidi(frequency){
    // Formula from https://newt.phys.unsw.edu.au/jw/notes.html
    const approxMidi = 12 * Math.log2(frequency / 440) + 69
    return(Math.round(approxMidi));
}

// Element handles
const startPauseButton = document.getElementById("control-play-pause");
const startTestButton  = document.getElementById("control-test-mode");
const startToneButton  = document.getElementById("control-start-tone");
const restartButton    = document.getElementById("control-play-restart");
const cursorButton     = document.getElementById("control-cursor-show");
const metronomeButton  = document.getElementById("control-metronome");
const cursorElement    = document.getElementById("playback-cursor");

// Init synth
const synth = new Tone.PolySynth(Tone.Synth).toDestination();

function calculateMSPB(measure){
    const bpm = measure.tempo * measure.timeSignature.denominator / 4;
    const bps = bpm/60;
    return (1 / bps);
}

function calculateMeasureLength(measure){
    const bpm = measure.tempo * measure.timeSignature.denominator / 4;
    const bps = bpm / 60;
    return measure.timeSignature.numerator / bps * 1000;
}

function moveCursor(cursor, steps) {
    for ( let i = 0; i < steps; i++ ) cursor.next();
}

function moveCursorToMeasure(cursor, measureIndex) {
    cursor.reset()
    while ( (cursor.iterator.currentMeasureIndex) < measureIndex ) cursor.next()

}
function playMeasure(context, measureIndex){
    // Cancel playback asap if pause
    if(context.pause) return;

    const cursor = context.osmd.cursor;
    const currentMeasure = context.ipf.measures[measureIndex];
    const now = Tone.now()
    cursor.show()
    moveCursorToMeasure(cursor, measureIndex);

    // Shitty metronome
    if (context.metronome) synth.triggerAttackRelease("C7", now, 0.01)
    const notes = currentMeasure.notes;

    // Calculate how long a "beat" is in milliseconds
    const scalar = currentMeasure.timeSignature.denominator * calculateMSPB(currentMeasure);
    for( let i = 0; i < notes.length; i++){
        if(notes[i].quiet) continue;
        const toneName = getToneName(notes[i].note)
        const noteDuration = notes[i].duration * scalar
        const noteOffset   = notes[i].offset   * scalar

        synth.triggerAttackRelease(toneName, noteDuration, now + noteOffset);
    }
    context.lastIndex = context.playbackIndex;

}

function periodicTimer(context){
    const playIndex = context.ipf.playbackMap[context.playbackIndex];
    playMeasure(context, playIndex);
    context.playbackIndex++;
}

function restart(context){
    moveCursorToMeasure(context.osmd.cursor, 0);
    context.lastIndex = 0;
}

function pausePlay(context){
    context.pause = true;
    enableInput(restartButton)
}

function startPeriodicTimer(interval, context){
    context.playbackIndex = context.lastIndex;
    console.log(context.playbackIndex)
    periodicTimer(context);
    const timer =  setInterval(() => {
        if(context.playbackIndex == context.ipf.playbackMap.length - 1 || context.pause){
            clearInterval(timer)
        }

        periodicTimer(context);

    }, interval)
}

async function play(ipf, start, context){
    disableInput(restartButton)
    context.pause = false;

    const measureLengthInMS = calculateMeasureLength(ipf.measures[1])
    context.currentPlayer = startPeriodicTimer(measureLengthInMS, context)
}

function disableInput(element, useId=false){
    // Change between using id or element
    const input = useId ? document.getElementById(element): element;
    input.disabled = true;
    input.classList.add("control-inactive")
}

function enableInput(element, useId=false){
    // Change between using id or element
    const input = useId ? document.getElementById(element): element;
    input.disabled = false;
    input.classList.remove("control-inactive")

}

startPauseButton.addEventListener('change', async function ( e ) {
    const state = startPauseButton.checked
    if ( state ) {
        await Tone.start()
        play(ApplicationContext.ipf, 1000, ApplicationContext)
    } else if ( !state ){
        pausePlay(ApplicationContext)
    }
});

startTestButton.addEventListener('change', async function ( e ) {
    const state = startTestButton.checked
    if ( state ) {
        dispatchEvent(startRecording) // Signal recorder to start recording
        await Tone.start()
        ApplicationContext.testStartTimestamp = Date.now();
        ApplicationContext.lastIndex          = 0
        ApplicationContext.currentNPB         = [];
        ApplicationContext.testMode           = true;
        play(ApplicationContext.ipf, 1000, ApplicationContext)
    } else if ( !state ){
        dispatchEvent(stopRecording) // Signal recorder to stop recording
        ApplicationContext.pause = true;        // Stop playback
    }
});

cursorButton.addEventListener('change', async function ( e ) {
    const state = cursorButton.checked
    document.getElementById("cursorImg-0").style.opacity = state ? "1" : "0";
});

restartButton.addEventListener("click", function ( e ){
    restart(ApplicationContext);
});

metronomeButton.addEventListener("click", function ( e ){
    const state = metronomeButton.checked
    ApplicationContext.metronome = state;
});

startToneButton.addEventListener("click", function ( e ){
    const startTone = ApplicationContext.ipf.measures[0].notes[0]
    const toneName  = getToneName(startTone.note)
    const now       = Tone.now()
    synth.triggerAttackRelease(toneName, 0.5, now);
})