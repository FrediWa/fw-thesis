function loadPlayback(trackName, context){
  const osmd = context.playbackOsmd
  osmd.setOptions({
    backend: "svg",
    drawTitle: false,
    autoGenerateMutipleRestMeasuresFromRestMeasures: false,
  });
  osmd
  .load(trackName)
  .then(function(){
    osmd.render();
    context.ipf = generateIPF(context, context.playbackOsmd)
  })
}

function loadSheetMusic(trackName, context){

  const osmd = context.osmd;

  osmd.setOptions({
    backend: "svg",
    drawTitle: false,
    followCursor: true,
    autoGenerateMutipleRestMeasuresFromRestMeasures: false,
  });
  osmd
  .load(trackName)
  .then(
    function() {
      osmd.render();

      // Remove overlay and display sheet after render is completed
      document.querySelector("#load-overlay").style.opacity = 0;
      document.querySelector("#load-overlay").style.height = 0;
      document.querySelector("#osmd-container").style.opacity = 1;
      console.log("ctx", context)
      
      context.sheetIPF = generateIPF(context, context.osmd)

    }
    );
  }

function osmdInit(context) {

  // Init both sheet osmd and playback osmd
  const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-container");
  const playbackOsmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-null");

  context.osmd = osmd;
  context.playbackOsmd = playbackOsmd;

  // This should be the first track in the default collection set in exercises.js
  const DEFAULT = "mxl/Kristallen_den_fina_t1.mxl"
  loadSheetMusic(DEFAULT, context);
  loadPlayback(DEFAULT, context)
}

osmdInit(ApplicationContext)