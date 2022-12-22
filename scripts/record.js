
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
  console.log("Get pitch")
  if (error) {
    console.error(error);
  } else {
    console.log(frequency)
    if (frequency) {
      
      ApplicationContext.currentNPB.push({timestamp: Date.now(), frequency})
      const approxMidi = approxFrequencyToMidi(frequency);
      console.log(getToneName(approxMidi))
      console.log(ApplicationContext.playbackIndex)
    }
  }
  pitch.getPitch(getPitch);
}
function modelLoaded() {
  console.log('Model Loaded!');
  
  pitch.getPitch(getPitch);
  
};
function analyze(srcElemenent, chunks){
  console.log("Analyzing...")
  const audioContext = new AudioContext();
  const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';  
  const stream = srcElemenent.captureStream()
  chunks.forEach(c => {
    console.log(c)
  })
  console.log("Stream", stream)
  pitch = ml5.pitchDetection(
    model_url,
    audioContext,
    stream,
    modelLoaded,
  );
}

function recordAudio(){
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Constraints for user media devices
    const constraints = {
      audio:true,
    };

    // Record
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      // Record incoming stream
      console.log("WALLAHI", stream)
      const recording = new MediaRecorder(stream)
      let chunks = []
      recording.start(1000)

      // Push chunks as they keep coming
      recording.ondataavailable = (e) => {
        chunks.push(e.data)
      }

      addEventListener("stopRecording", () => {
        if(recording.state != "inactive") recording.stop()
      })

      // Save chunks when recorder stops
      recording.onstop = (e) => {
        stream.getTracks().forEach(track => track.stop())
        const blob     = new Blob(chunks, {type: "audio/mp3"});
        const audioURL = window.URL.createObjectURL(blob);
        AUDIOSAVE.src  = audioURL
        AUDIOSAVE.play()
        analyze(AUDIOSAVE, chunks)
        chunks         = []
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

let mediaRecorder = null;


addEventListener("startRecording", () => {
  console.log("SHALLAH")
  mediaRecorder = recordAudio()
})