// Statics

let arr2 = [1500, 2250, 2250, 1000,1500, 2250, 2250, 1000];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


async function nonPeriodicTimer(arr, i) {
    // https://stackoverflow.com/questions/46242600/recursive-async-function-in-javascript

    // Recursion exit
    if ( i == arr.length ) {
        return -1
    }

    // Return i-1 because pause happenend in previous function call
    if ( pause ){
        return i-1
    }

    // Do stuff
    console.log(arr[i])
    console.log(pause)


    // Sleep and do recursive stuff
    await sleep(arr[i])
    return nonPeriodicTimer(arr, ++i);
}

function pausePlay(){
    pause = true;
}

async function play(arr, start){
    pause = false;
    console.log("play")
    return await nonPeriodicTimer(arr, start)
}

const startPauseButton = document.getElementById("control-play-pause");

startPauseButton.addEventListener('change', async function ( e ) {
    const state = startPauseButton.checked
    if ( state ) {
        play(arr2, lastIndex + 1).then( (a) => {
            console.log(a)
        } )
    } else if ( !state ){
        pausePlay()
    }
});