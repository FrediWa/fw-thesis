// Initialize application context
const ApplicationContext = {
        pause: false,
        lastIndex: -1,
        differentSheets: 0,
        sheetArray: [],
        playbackArray: []
}

// Static constants

// https://mosaicmusicinstruction.com/wp-content/uploads/2018/07/basic-tempo-markings.pdf
const TEMPO = {
    LARGO: 50,
    LENTO: 55,
    ADAGIO: 70,
    MODERATO: 110,
    ALLEGRETTO: 120,
    ALLEGRO: 145,
    PRESTO: 180,
}

