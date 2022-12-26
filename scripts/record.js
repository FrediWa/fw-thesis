
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
    console.log(frequency)
    if (frequency) {
      
      ApplicationContext.currentNPB.push({timestamp: Date.now(), frequency})
      const approxMidi = approxFrequencyToMidi(frequency);
      const pitchDetected = new CustomEvent("pitchDetected", {detail: approxMidi})
      dispatchEvent(pitchDetected)
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