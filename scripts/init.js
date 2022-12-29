// Static strings
const PATH = "./mxl/"

const AUDIOSAVE = document.getElementById("recorded-audio")

// Initialize application context
const ApplicationContext = {
        currentMeasure: 0,
        pause: true,
        lastIndex: 0,
        data: [],
        osmd: null,
        playbackOsmd: null,
        ipf: [],
        showCursor: true,
        mutePlayback: false,
        predictions: [],
        errors: [],
        notesPlot: []
}

