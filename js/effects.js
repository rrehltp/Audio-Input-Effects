let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioInput = null,
    audioSource = null,
    effectInput = null,
    wetGain = null,
    outputMix = null,
    currentEffectNode = null;    

let constraints = {
    audio: true,
    video: false
};

function convertToMono(input) {
    const splitter = audioContext.createChannelSplitter(2);
    const merger = audioContext.createChannelMerger(2);

    input.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 0, 1);
    return merger;
}

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

var lpInputFilter = null;

// this is ONLY because we have massive feedback without filtering out
// the top end in live speaker scenarios.
function createLPInputFilter() {
    lpInputFilter = audioContext.createBiquadFilter();
    lpInputFilter.frequency.value = 2048;
    return lpInputFilter;
}

var useFeedbackReduction = true;

function gotStream(stream) {
    // Create an AudioNode from the stream.
    audioSource = audioContext.createMediaElementSource(stream);

    audioInput = convertToMono(audioSource);

    if (useFeedbackReduction) {
        audioInput.connect(createLPInputFilter());
        audioInput = lpInputFilter;

    }
    // create mix gain nodes
    outputMix = audioContext.createGain();
    wetGain = audioContext.createGain();
    effectInput = audioContext.createGain();
    audioInput.connect(analyser1);
    audioInput.connect(effectInput);
    wetGain.connect(outputMix);
    outputMix.connect(audioContext.destination);
    outputMix.connect(analyser2);

    currentEffectNode = createPitchShifter();

    addEffect();
}

// function gotSources(sourceInfos) {
//     for (var i = 0; i != sourceInfos.length; ++i) {
//         var sourceInfo = sourceInfos[i];
//         if (sourceInfo.kind === 'audioinput') {
//             var option = document.createElement("option");
//             option.value = sourceInfo.id;
//         }
//     }
// }

function setEventListener() {
    const videoElement = document.getElementById('video-player');
    videoElement.addEventListener('canplaythrough', initAudio);
    videoElement.addEventListener('play', addEffect);
    videoElement.addEventListener('stop', removeEffect);

    document.addEventListener('visibilitychange', () => {
        console.log(`visibilityState: ${document.visibilityState}`);
        if (document.visibilityState === 'visible' && audioContext) {
            audioContext.resume();
        }
    });
}

function initAudio() {
    analyser1 = audioContext.createAnalyser();
    analyser1.fftSize = 2048;
    analyser2 = audioContext.createAnalyser();
    analyser2.fftSize = 2048;

    const videoElement = document.getElementById('video-player');

    gotStream(videoElement);

}

window.addEventListener('DOMContentLoaded', setEventListener);
// window.addEventListener('keydown', keyPress );
function addEffect() {
    if(audioContext)
        audioContext.resume();
    
    audioInput.connect(currentEffectNode);
}
function removeEffect() {
    if(audioContext)
        audioContext.suspend();
    currentEffectNode.disconnect();
}

function createPitchShifter() {
    effect = new Jungle(audioContext);
    effect.output.connect(wetGain);
    return effect.input;
}
