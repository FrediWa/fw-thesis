
// Init capturing
  // console.log("Henlo")
  //   let pitch;
  //   const audioContext = new AudioContext();
  //   // Link to pretrained CREPE model
  //   const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

  //   function getPitch(error, frequency) {
  //       if (error) {
  //         console.error(error);
  //       } else {
  //         if (frequency && !ApplicationContext.testMode) {

  //           ApplicationContext.currentNPB.push({timestamp: Date.now(), frequency})
  //           const approxMidi = approxFrequencyToMidi(frequency);
  //           console.log(getToneName(approxMidi))
  //           console.log(ApplicationContext.playbackIndex)
  //         }
  //       }
  //     }
  //   // When the model is loaded
  //   function modelLoaded() {
  //       console.log('Model Loaded!');
  //       while(!ApplicationContext.pause){
  //         console.log("Analyzing")
  //         pitch.getPitch(getPitch);
  //       }
  //   };
 // Init media recorder
//  pitch = ml5.pitchDetection(
//   model_url,
//   audioContext,
//   stream,
//   modelLoaded,
// );

function recordAudio(){
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Constraints for user media devices
    const constraints = {
      audio:true,
    };

    // Record
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      // Record incoming stream
      console.log("WALLAHI")
      const recording = new MediaRecorder(stream)
      let chunks = []

      // Push chunks as they keep coming
      recording.ondataavailable = (e) => {
        console.log("Shalom")
        chunks.push(e.data)
      }

      // Save chunks when recorder stops
      recording.onstop = (e) => {
        const blob     = new Blob(chunks, {type: "audio/mp3"});
        const audioURL = window.URL.createObjectURL(blob);
        AUDIOSAVE.src  = audioURL
        chunks         = []
        AUDIOSAVE.play()
        console.log("Bishmillah")
      }

    })

    // Error callback
    .catch((err) => {
      console.error(`The following getUserMedia error occurred: ${err}`);
    });

  } else {
    console.log("getUserMedia not supported on your browser!");
  }
}

addEventListener("stopRecording", () => console.log("Stop"))

addEventListener("startRecording", () => {
  console.log("SHALLAH")
  recordAudio()
})