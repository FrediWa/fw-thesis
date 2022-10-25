// Statics

let arr2 = [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const startPauseButton = document.getElementById("control-play-pause");

async function nonPeriodicTimer(arr, i) {
    // https://stackoverflow.com/questions/46242600/recursive-async-function-in-javascript

    // Recursion exit
    if ( i == arr.length ) {
        startPauseButton.checked = false;
        lastIndex = -1;
        return
    }
    // Update last index
    lastIndex = i-1;

    if ( pause ){
        return
    }

    // Do stuff
    console.log(arr[i])


    // Sleep
    await sleep(arr[i])

    return nonPeriodicTimer(arr, ++i);
}

function pausePlay(){
    pause = true;
}

async function play(arr, start){
    pause = false;
    return await nonPeriodicTimer(arr, start)
}



startPauseButton.addEventListener('change', async function ( e ) {
    const state = startPauseButton.checked
    if ( state ) {
        play(arr2, lastIndex + 1)
    } else if ( !state ){
        pausePlay()
    }
});