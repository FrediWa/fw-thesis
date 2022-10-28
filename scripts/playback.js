appContext = ApplicationContext;

// Statics
let arr2 = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007];

const startPauseButton = document.getElementById("control-play-pause");
const restartButton    = document.getElementById("control-play-restart");
const cursor           = document.getElementById("playback-cursor");

function drawCursor(context, i){
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

async function nonPeriodicTimer(arr, i, context) {
    // https://stackoverflow.com/questions/46242600/recursive-async-function-in-javascript

    // Recursion exit condition
    if ( i == arr.length ) {
        startPauseButton.checked = false;
        context.lastIndex = -1;
        return
    }
    // Update last index
    context.lastIndex = (i-1);

    // Stop if pause
    if ( context.pause ){
        startPauseButton.checked = false;
        return
    }

    // Do stuff
    // console.log()

    drawCursor(context, i)

    // Sleep
    await sleep(arr[i])

    // Repeat
    nonPeriodicTimer(arr, ++i, context);
}

function pausePlay(context){
    context.pause = true;
    enableInput(restartButton)
}

async function play(arr, start, context){
    disableInput(restartButton)
    context.pause = false;

    return await nonPeriodicTimer(arr, start, context)
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
        await play(arr2, appContext.lastIndex + 1, appContext)
    } else if ( !state ){
        pausePlay(appContext)
    }
});

restartButton.addEventListener("click", function (){
    console.log("clicke")
    appContext.lastIndex = -1;
    drawCursor(appContext.drawnNotes[0])
})
