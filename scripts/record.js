// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
/*
let dataArray = [];
if(navigator.mediaDevices){
    const canvas = document.getElementById("oscilloscope");
    const canvasCtx = canvas.getContext("2d");
    //navigator.mediaDevices.getUserMedia({ audio: {deviceId: 'default', kind: 'audiooutput'} })
    .then(stream => {

        // Create a new audio context
    const audioCtx = new AudioContext();

    // Create an analyser node
    const analyser = audioCtx.createAnalyser();

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    console.log(stream)

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = "rgb(200, 200, 200)";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgb(0, 0, 0)";

        canvasCtx.beginPath();

        const sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      }

      draw();

    });
}
*/



// Init capturing
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
            .getUserMedia({ audio: true })

            // Success callback
            .then((stream) => {
                // Init media recorder
                const mediaRecorder = new MediaRecorder(stream);
            })

            // Error callback
            .catch((err) => {
            console.error(`The following getUserMedia error occurred: ${err}`);
            });
} else {
    console.log("getUserMedia not supported on your browser!");
}