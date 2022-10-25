


function getNoteFrequency(note){
    const MIDDLE_A = 69
    const EQT      = 1.059463094359

    // https://pages.mtu.edu/~suits/NoteFreqCalcs.html
    // Accessed 25 Oct 2022

    const noteDiff  = note - MIDDLE_A;
    const frequency = 440 * Math.pow(EQT, noteDiff);

    return parseInt(frequency * 100) / 100
}