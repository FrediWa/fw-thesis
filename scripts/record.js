// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

if(navigator.mediaDevices){
    
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
    
        // Create a new audio context
    const audioCtx = new AudioContext();

    // Create an analyser node
    const analyser = audioCtx.createAnalyser();
    
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    console.log(stream)
    
        
    });
}