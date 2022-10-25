appContext = ApplicationContext;

// Statics
let arr2 = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const startPauseButton = document.getElementById("control-play-pause");

async function nonPeriodicTimer(arr, i, context) {
    // https://stackoverflow.com/questions/46242600/recursive-async-function-in-javascript

    // Recursion exit
    if ( i == arr.length ) {
        startPauseButton.checked = false;
        context.lastIndex = -1;
        return
    }
    // Update last index
    context.lastIndex = (i-1);

    if ( context.pause ){
        return
    }

    // Do stuff
    console.log(arr[i])


    // Sleep
    await sleep(arr[i])

    return nonPeriodicTimer(arr, ++i, context);
}

function pausePlay(context){
    context.pause = true;
}

async function play(arr, start, context){
    context.pause = false;
    return await nonPeriodicTimer(arr, start, context)
}

startPauseButton.addEventListener('change', async function ( e ) {
    const state = startPauseButton.checked
    if ( state ) {
        play(arr2, appContext.lastIndex + 1, appContext)
    } else if ( !state ){
        pausePlay(appContext)
    }
});