appContext = ApplicationContext;

// MEMO: Add option to delay dacapo by one invisible measure

function getToneName(semitone) {
    const N = ["C", "D", "E", "F", "G", "A", "B", "C"];
    semitone -= 12;
    const octave = Math.floor(semitone / 12);

    /* --------------------------- */
    // THIS DOES NOT WORK
    const sharp = (semitone % 2 == 0) ? "" : "#";
    const note = (N[Math.floor((semitone % 12) / 2)]);
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
    while ( cursor.iterstor.currentMeasureIndex != measureIndex ) cursor.next()
}

function playMeasure(context, measureIndex, tempo){
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now()
    const notes = context.ipf.measures[measureIndex].notes;
    for( let i = 0; i < notes.length; i++){
        synth.triggerAttack(notes[i].note, now + notes[i].offset);
        synth.triggerRelease(notes[i].note, now + notes[i].offset + notes[i].duration);
    }

synth.triggerRelease(notes, now + 4);
    //for i in note:
    //  moveCursor()
    //  playNote()

}

function periodicTimer(context){
    // metronome.Tick()
    const currentMeasure = context.currentMeasure;
    playMeasure()
    console.log(context.currentMeasure++)

}

function startPeriodicTimer(interval, context){
    if ( context.lastIndex ==  -1){
        playAnacrusis()
    }
    return setInterval(periodicTimer, interval, context)
}

function pausePlay(context){
    context.pause = true;
    enableInput(restartButton)
}

async function play(ipf, start, context){
    disableInput(restartButton)
    context.pause = false;

    //return await nonPeriodicTimer(ipf, start, context)
    startPeriodicTimer(1000, context)
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
        //await play(appContext.ipf, appContext.lastIndex + 1, appContext)
        startPeriodicTimer(1000, appContext)
    } else if ( !state ){
        pausePlay(appContext)
    }
});

restartButton.addEventListener("click", function (){
    console.log("clicke")
    appContext.lastIndex = -1;
    // drawCursor(appContext.drawnNotes[0])
})
