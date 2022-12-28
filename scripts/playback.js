// Register custom events
const startRecording = new CustomEvent("startRecording")
const stopRecording  = new CustomEvent("stopRecording")

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
const muteButton       = document.getElementById("control-mute-playback");
const cursorElement    = document.getElementById("playback-cursor");

// Init synth
const synth = new Tone.PolySynth(Tone.Synth).toDestination();

function calculateBeatLength(measure){
    const bpm = measure.tempo * measure.timeSignature.denominator / 4;
    const bps = bpm/60;
    return (1 / bps);
}

function calculateMeasureLength(measure){
    return measure.timeSignature.numerator * calculateBeatLength(measure) * 1000;
}

function moveCursor(cursor, steps) {
    for ( let i = 0; i < steps; i++ ) cursor.next();
}

function moveCursorToMeasure(cursor, measureIndex) {
    cursor.reset()
    while ( (cursor.iterator.currentMeasureIndex) < measureIndex ) cursor.next()

}
async function playNote(context, notes, i, scalar, cursor){
    // Sleep function
    // https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    // Get duration of note
    const noteDuration = notes[i].duration * scalar
    // Play if note is not quiet
    const note = notes[i].note;
    context.ipf.timestamps.push({note, "timestamp": Date.now()})
    if(!notes[i].quiet && !context.mutePlayback){
        const toneName = getToneName(note)
        // Play note
        synth.triggerAttackRelease(toneName, noteDuration, Tone.now());
        
       
    }
    
    // Wait until playing next note
    await sleep(noteDuration * 1000)

    if(notes.length-1 > i){
        if(!notes[i].quiet) cursor.next()
        playNote(context, notes, i+1, scalar, cursor)
    }
    return
}

function playMeasure(context, measureIndex){
    // Cancel playback asap if pause
    if( context.pause ) return;

    const cursor = context.osmd.cursor;
    const currentMeasure = context.ipf.measures[measureIndex];
    
    cursor.show()
    moveCursorToMeasure(cursor, measureIndex);

    // Shitty metronome
    if (context.metronome) synth.triggerAttackRelease("C7", now, 0.01)
    const notes = currentMeasure.notes;

    // Calculate how long a "beat" is in milliseconds
    const scalar = currentMeasure.timeSignature.denominator * calculateBeatLength(currentMeasure);

    playNote(context, notes, 0, scalar, cursor)

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
        ApplicationContext.errors                        = [];
        ApplicationContext.testMode           = true;
        play(ApplicationContext.ipf, 1000, ApplicationContext)
    } else if ( !state ){
        dispatchEvent(stopRecording) // Signal recorder to stop recording
        ApplicationContext.pause    = true;        // Stop playback
        ApplicationContext.testMode = false;
    }
});

cursorButton.addEventListener('change', function ( e ) {
    const state = cursorButton.checked
    document.getElementById("cursorImg-0").style.opacity = state ? "1" : "0";
});

muteButton.addEventListener('change', function ( e ) {
    const state = muteButton.checked;
    console.log("Button is", (state ? "muted" : "unmuted"))
    ApplicationContext.mutePlayback = state;
});

restartButton.addEventListener("click", function ( e ){
    restart(ApplicationContext);
});

startToneButton.addEventListener("click", function ( e ){
    // Find first note that isn't muted
    const startTone = ApplicationContext.ipf.measures[0].notes.find(note => note.note != undefined)
    const toneName  = getToneName(startTone.note)

    synth.triggerAttackRelease(toneName, 0.5, Tone.now());
})

