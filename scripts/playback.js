appContext = ApplicationContext;


function getNoteFrequency(note){
    const MIDDLE_A = 69
    const EQT      = 1.059463094359

    // https://pages.mtu.edu/~suits/NoteFreqCalcs.html
    // Accessed 25 Oct 2022

    const noteDiff  = note - MIDDLE_A;
    const frequency = 440 * Math.pow(EQT, noteDiff);

    return parseInt(frequency * 100) / 100
}
// Statics
let arr2 = [500, 250, 250, 1000, 250, 250, 500, 1000];

const startPauseButton = document.getElementById("control-play-pause");
const restartButton    = document.getElementById("control-play-restart");
const cursor           = document.getElementById("playback-cursor");

const synth = new Tone.Synth().toDestination();

function playCurrentNote(context, i) {

}

function drawCursor(context, i) {
    const element = context.drawnNotes[i]
    const cursor = context.osmd.cursor;
    cursor.show()
    console.log("hsefioj", cursor)

    // const noteBB = element.getBoundingClientRect();
    // const {topS, rightS, bottomS, leftS} = lastSlurElement.getBoundingClientRect(lastSlurElement);

    // cursor.style.display        = "block";
    // cursor.style.left = noteBB.x
    // cursor.style.top = noteBB.y
    // cursor.style.width = noteBB.width
    // cursor.style.height = noteBB.height

    // console.log("w", clef.style.height,"l", cursor.style.width)

}

// Helper functions
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function nonPeriodicTimer(ipf, i, context) {
    // https://stackoverflow.com/questions/46242600/recursive-async-function-in-javascript
    const now = Tone.now()
    console.log("timer")
    console.log(ipf)
    // Recursion exit condition
    if ( i == ipf.length ) {
        startPauseButton.checked = false;
        context.lastIndex = -1;
        synth.triggerRelease(now)
        return
    }
    // Update last index
    context.lastIndex = (i-1);

    // Stop if pause
    if ( context.pause ){
        startPauseButton.checked = false;
        synth.triggerRelease(now)
        return
    }

    if(ipf[i].note != 0){

        // trigger the attack immediately
        synth.triggerAttack(getNoteFrequency(ipf[i].note + 12), now)
        // wait one second before triggering the release
        synth.triggerRelease(now + ipf[i].duration)
        // Do stuff
    }
    console.log(ipf[i])

    drawCursor(context, i)
    playCurrentNote(context, i);

    // Sleep
    await sleep(ipf[i].duration)

    // Repeat
    nonPeriodicTimer(ipf, ++i, context);
}


function periodicTimer(context){
    console.log(context)

}

function startPeriodicTimer(interval, context){
    setInterval(periodicTimer, interval, context)
}

function pausePlay(context){
    context.pause = true;
    enableInput(restartButton)
}

async function play(ipf, start, context){
    disableInput(restartButton)
    context.pause = false;

    return await nonPeriodicTimer(ipf, start, context)
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
        await play(appContext.ipf, appContext.lastIndex + 1, appContext)
        // startPeriodicTimer(1000, appContext)
    } else if ( !state ){
        pausePlay(appContext)
    }
});

restartButton.addEventListener("click", function (){
    console.log("clicke")
    appContext.lastIndex = -1;
    drawCursor(appContext.drawnNotes[0])
})
