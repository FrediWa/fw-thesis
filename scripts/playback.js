// MEMO: Add option to delay dacapo by one invisible measure

// Get ToneJS compliant note strings
function getToneName(semitone, keySignature) {
    if (semitone < 12) return
    const N = ["C", "D", "E", "F", "G", "A", "B", "C"];
    const octave = Math.floor(semitone / 12) - 1;
    const semitone12 = semitone % 12;

    // Check if note is to be played sharpened
    if ( (semitone12 % 2 == 1) ^ (semitone12 > 4) ) enableSharp = false
    else                                            enableSharp = true

    const sharp = enableSharp ? "" : "#";
    const note = N[Math.round(semitone12 / 2)];
    /* --------------------------- */
    return `${note}${sharp}${octave}`;
}

const startPauseButton = document.getElementById("control-play-pause");
const restartButton    = document.getElementById("control-play-restart");
const cursorElement    = document.getElementById("playback-cursor");

const synth = new Tone.Synth().toDestination();

let timer = 0;

function moveCursor(cursor, steps) {
    cursor.show();
    for ( let i = 0; i < steps; i++ ) cursor.next();
}

function moveCursorToMeasure(cursor, measureIndex) {
    cursor.reset()
    while ( cursor.iterator.currentMeasureIndex != measureIndex ) cursor.next()
}
function playMeasure(context, measureIndex){
    console.log(context.playbackOsmd.cursor)
    const cursor = context.playbackOsmd.cursor;
    cursor.show()
    moveCursorToMeasure(cursor, measureIndex);
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now()
    const notes = context.ipf.measures[measureIndex].notes;
    console.log("Measure index:", measureIndex)
    for( let i = 0; i < notes.length; i++){
        cursor.next();
        console.log("NOTES I",notes[i])
        if(notes[i].quiet) continue;
        const toneName = getToneName(notes[i].note)
        console.log(toneName)
        synth.triggerAttack(toneName, now + notes[i].offset);
        synth.triggerRelease(toneName, now + notes[i].offset + notes[i].duration);
    }
}

function playFirstAnacrusis(context, measureLengthInSeconds){
    if (!context.ipf.startAnacrusis)
        return;
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now()

    const notes = context.ipf.measures[0].notes;
    const anacrusisLengthInSeconds = notes.reduce((sum, a) => sum + a.duration, 0);
    const startOffset = measureLengthInSeconds - anacrusisLengthInSeconds;

    for( let i = 0; i < notes.length; i++){
        const toneName = getToneName(notes[i].note)
        console.log(toneName)
        synth.triggerAttack(toneName, now + startOffset + notes[i].offset);
        synth.triggerRelease(toneName, now + startOffset + notes[i].offset + notes[i].duration);
    }
}

function periodicTimer(context){
    const playIndex = context.ipf.playbackMap[context.playbackIndex];
    playMeasure(context, playIndex);
    console.log(context.playIndex);
    context.playbackIndex++;
}

function startPeriodicTimer(interval, context){
    // Boolean trickery, if first measure is anacrusis => true = 1 => starting index = 1
    context.playbackIndex = 0 + context.ipf.startAnacrusis;
    const timer =  setInterval(() => {
        if(context.playbackIndex == context.ipf.playbackMap.length - 1){
            console.log("Stop")
            clearInterval(timer)
        }
        periodicTimer(context);

    }, interval)
}

function pausePlay(context){
    context.pause = true;
    enableInput(restartButton)
}

async function play(ipf, start, context){
    disableInput(restartButton)
    context.pause = false;
    const secondMeasure = context.ipf.measures[1]
    const measureLengthInSeconds = secondMeasure.notes.reduce((sum, a) => sum + a.duration, 0);
    console.log(measureLengthInSeconds)

    if ( context.ipf.startAnacrusis){
        playFirstAnacrusis(context, measureLengthInSeconds)
        context.playbackIndex = 1;
    }

    context.currentPlayer = startPeriodicTimer(measureLengthInSeconds * 1000, context)
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
    console.log(state)
    if ( state ) {
        await Tone.start()
        play(ApplicationContext.ipf, 1000, ApplicationContext)
    } else if ( !state ){
        pausePlay(ApplicationContext)
    }
});

restartButton.addEventListener("click", function (){
    console.log("clicke")
    ApplicationContext.lastIndex = -1;
});
