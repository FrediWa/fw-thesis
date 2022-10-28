const KRISTALLEN = "Kristallen_den_fina_t2.musicxml"


function loadSheetMusic(trackName, context){

  const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-container");
  osmd.setOptions({
    backend: "svg",
    drawTitle: false,
    // drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
  });
  osmd
  .load(PATH + trackName)
  .then(
    function() {
      osmd.render();

      // Remove overlay and display sheet after render is completed
      document.querySelector("#load-overlay").style.opacity = 0;
      document.querySelector("#load-overlay").style.height = 0;
      document.querySelector("#osmd-container").style.opacity = 1;

      console.log(osmd)
      ApplicationContext.osmd = osmd
      ApplicationContext.drawnNotes = document.getElementsByClassName("vf-stavenote")
    }
    );
  }

loadSheetMusic(KRISTALLEN)