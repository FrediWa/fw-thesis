const PATH = "./mxl/"
const KRISTALLEN = "Kristallen_den_fina_t1.mxl"


function loadSheetMusic(id){

  const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-container");
  osmd.setOptions({
    backend: "svg",
    drawTitle: false,
    // drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
  });
  osmd
  .load(PATH + id)
  .then(
    function() {
      osmd.render();

      // Remove overlay and display sheet after render is completed
      document.querySelector("#load-overlay").style.opacity = 0;
      document.querySelector("#load-overlay").style.height = 0;
      document.querySelector("#osmd-container").style.opacity = 1;

      console.log(osmd)
    }
    );
    return osmd
  }

  const osmd = loadSheetMusic(KRISTALLEN)