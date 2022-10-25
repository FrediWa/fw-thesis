const KRISTALLEN1 = "mxl/Kristallen_den_fina_t1.mxl"
const KRISTALLEN2 = "mxl/Kristallen_den_fina_t2.musicxml"
const HALVAN = "mxl/Halvan_b1.mxl"

const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-container");
  osmd.setOptions({
    backend: "svg",
    drawTitle: false,
    // drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
  });
  osmd
    .load(KRISTALLEN1)
    .then(
      function() {
        osmd.render();
        console.log(osmd)
        document.querySelector("#osmd-container").style.opacity = 1;

        document.querySelector("#load-overlay").style.opacity = 0;
        document.querySelector("#load-overlay").style.height = 0;
      }
    );