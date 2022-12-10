
// Init capturing
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    let pitch;
    const audioContext = new AudioContext();
    // Link to pretrained CREPE model
    const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

    function getPitch(error, frequency) {
        if (error) {
          console.error(error);
        } else {
          //console.log(frequency);
          if (frequency) {

            ApplicationContext.currentNPB.push({timestamp: Date.now(), frequency})
            const approxMidi = approxFrequencyToMidi(frequency);
            console.log(getToneName(approxMidi))
          }
          pitch.getPitch(getPitch);
        }
      }
    // When the model is loaded
    function modelLoaded() {
        console.log('Model Loaded!');
        pitch.getPitch(getPitch);
    };

     // Constraints for user media devices
    const constraints = {
        audio:true,
    };

    navigator.mediaDevices
        .getUserMedia(constraints)

        // Success callback
        .then((stream) => {
            // Init media recorder
            pitch = ml5.pitchDetection(
                model_url,
                audioContext,
                stream,
                modelLoaded,
            );
            // while(true){


            // }
        })

        // Error callback
        .catch((err) => {
        console.error(`The following getUserMedia error occurred: ${err}`);
        });
} else {
    console.log("getUserMedia not supported on your browser!");
}