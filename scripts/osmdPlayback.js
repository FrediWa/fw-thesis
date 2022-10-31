function getPlaybackOSMD(trackName, context){

  const playback = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-null");
  playback.setOptions({
    backend: "svg",
    drawTitle: false,
  });
  playback.load(trackName).then({function(){
    context.getPlaybackOSMD = playback;
  }})
}