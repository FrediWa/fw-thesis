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
const cursorButton     = document.getElementById("control-cursor-show");
const cursorElement    = document.getElementById("playback-cursor");
const synth = new Tone.PolySynth(Tone.Synth).toDestination();
// const synth = new Tone.Synth().toDestination();

let timer = 0;

function moveCursor(cursor, steps) {
    // cursor.show();
    for ( let i = 0; i < steps; i++ ) cursor.next();
}

function moveCursorToMeasure(cursor, measureIndex) {
    cursor.reset()
    // cursor.show()
    while ( cursor.iterator.currentMeasureIndex <= measureIndex ) cursor.next()
}
function playMeasure(context, measureIndex){
    ////console.log(context.playbackOsmd.cursor)
    const cursor = context.osmd.cursor;

    cursor.show()
    moveCursorToMeasure(cursor, measureIndex - 1);
    const now = Tone.now()
    // Shitty metronome
    synth.triggerAttackRelease("C7", now, 0.01)
    const notes = context.ipf.measures[measureIndex].notes;
    
    let cumulativeOffset = 0
    for( let i = 0; i < notes.length; i++){
        if(notes[i].quiet) continue;
        const toneName = getToneName(notes[i].note)
        const noteDuration = notes[i].duration * 3
        const noteOffset = notes[i].offset * 3
        ////console.log(toneName)
        //synth.triggerAttack( toneName, now + noteOffset);
        //synth.triggerRelease(toneName, now + noteOffset + noteDuration);
        setTimeout(() => {
            synth.triggerAttackRelease(toneName, noteDuration, now+noteOffset); 
            console.log("Next", i, cumulativeOffset, now)
            cursor.next()
        }, noteOffset + noteDuration);
    }
}

function periodicTimer(context){
    const playIndex = context.ipf.playbackMap[context.playbackIndex];
    playMeasure(context, playIndex);
    ////console.log(context.playIndex);
    context.playbackIndex++;
}

function startPeriodicTimer(interval, context){
    context.playbackIndex = 0
    const timer =  setInterval(() => {
        if(context.playbackIndex == context.ipf.playbackMap.length - 1 || context.pause){
            ////console.log("Stop")
            clearInterval(timer)
        }
        ////console.log(interval)
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
    const measureLength = secondMeasure.notes.reduce((sum, a) => sum + a.duration, 0);
    ////console.log(measureLength)

    if ( context.ipf.startAnacrusis){
        playFirstAnacrusis(context, measureLength)
        context.playbackIndex = 1;
    }

    context.currentPlayer = startPeriodicTimer(measureLength * 1000 * 3, context)
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
    ////console.log(state)
    if ( state ) {
        await Tone.start()
        play(ApplicationContext.ipf, 1000, ApplicationContext)
    } else if ( !state ){
        pausePlay(ApplicationContext)
    }
});

cursorButton.addEventListener('change', async function ( e ) {
    const state = cursorButton.checked
    document.getElementById("cursorImg-0").style.opacity = state ? "1" : "0";
});

restartButton.addEventListener("click", function ( e ){
    ////console.log("clicke")
    ApplicationContext.lastIndex = -1;
});
