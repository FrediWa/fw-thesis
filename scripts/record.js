
// Init capturing
  // console.log("Henlo")
  //   let pitch;
  //   const audioContext = new AudioContext();
  //   // Link to pretrained CREPE model
  //   const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

  //   
  //   // When the model is loaded
  //   
 // Init media recorder
// 

let pitch;
function getPitch(error, frequency) {
  if (error) {
    console.error(error);
  } else {
    if (frequency) {
      ApplicationContext.currentNPB.push({timestamp: Date.now(), frequency})
      const approxMidi = approxFrequencyToMidi(frequency);
      console.log(getToneName(approxMidi))
      // const pitchDetected = new CustomEvent("pitchDetected", {detail: approxMidi})
    //   dispatchEvent(pitchDetected)
    //   addEventListener("pitchDetected", function ( e ){
    //     context.notesPlot.push({"detected": e.detail, "played": note})

    //     if(e.detail == note) context.errors.push(0)
    //     if(Math.abs(e.detail - note) % 12 == 0) context.errors.push(0)
    //     if(Math.abs(e.detail - note) < 12 && e.detail != note) context.errors.push(Math.abs(e.detail - note))
    // })
    }

    if(!ApplicationContext.testMode){
      return
    } 


    pitch.getPitch(getPitch);
  }
}
function modelLoaded() {
  analyze()
};
function analyze(){
  pitch.getPitch(getPitch);
}

function recordAudio(){
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Constraints for user media devices
    const constraints = {
      audio:true,
    };

    // Record
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {      
      const audioContext = new AudioContext();
      const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';  

      // Record incoming stream
      console.log("Stream", stream)
      pitch = ml5.pitchDetection(
        model_url,
        audioContext,
        stream,
        modelLoaded,
      );

    })

    // Error callback
    .catch((err) => {
      console.error(`The following getUserMedia error occurred: ${err}`);
    });

  } else {
    console.log("getUserMedia not supported on your browser!");
  }
}



addEventListener("startRecording", () => {
  console.log("SHALLAH")
  mediaRecorder = recordAudio()
})