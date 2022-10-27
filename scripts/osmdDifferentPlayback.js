const osmd2 = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-null");
  osmd2.setOptions({
    backend: "svg",
    drawTitle: false,
    // drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
  });
  osmd2.load(PATH + KRISTALLEN)