// Static strings
const PATH = "./mxl/"

const AUDIOSAVE = document.getElementById("recorded-audio")

// Initialize application context
const ApplicationContext = {
        currentMeasure: 0,
        appReady: false,
        pause: true,
        lastIndex: 0,
        data: [],
        osmd: null,
        playbackOsmd: null,
        ipf: [],
        nextPlaybackMeasure: -1,
        drawnNotes: [],
        metronome: false,
        timer: null,
        showCursor: true,
        currentNPB: [],
        mutePlayback: false,
        detectedPlot: [],
        errors: [],
        notesPlot: []
}


