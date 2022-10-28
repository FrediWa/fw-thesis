function getPlaybackArray(trackName, context){

  const playback = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-null");
  playback.setOptions({
    backend: "svg",
    drawTitle: false,
  });
  playback.load(PATH + trackName).then({function(){
    context.ipf = generateIPFfromOSMD(playback)
  }})
}