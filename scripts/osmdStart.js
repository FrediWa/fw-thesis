const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-container");
  osmd.setOptions({
    backend: "svg",
    drawTitle: false,
    // drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
  });
  osmd
    .load("chopin.mxl")
    .then(
      function() {
        osmd.render();
        console.log(osmd)
        document.querySelector("#osmd-container").style.opacity = 1;

        document.querySelector("#load-overlay").style.opacity = 0;
        document.querySelector("#load-overlay").style.height = 0;
      }
    );