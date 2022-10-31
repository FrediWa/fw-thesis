function loadSheetMusic(trackName, context){

  const osmd = context.osmd;
  console.log(context.osmd)

  osmd.setOptions({
    backend: "svg",
    drawTitle: false,
    // drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
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

      // context.drawnNotes = document.getElementsByClassName("vf-stavenote")
    }
    );
  }

function osmdInit(context) {
  const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-container");
  context.osmd = osmd;
  loadSheetMusic("mxl/Kristallen_den_fina_t1.mxl", context);
}

osmdInit(ApplicationContext)