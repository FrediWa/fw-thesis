// Static strings
const PATH = "./mxl/"

// Initialize application context
const ApplicationContext = {
        currentMeasure: 0,
        appReady: false,
        pause: false,
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
}
