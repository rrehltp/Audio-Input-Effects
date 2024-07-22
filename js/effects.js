var audioContext = new AudioContext;
var audioInput = null,
    effectInput = null,
    wetGain = null,
    outputMix = null,
    currentEffectNode = null;
    

var constraints = {
    audio: true,
    video: false
};

function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

var lpInputFilter=null;

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
    var input = audioContext.createMediaStreamSource(stream);

    audioInput = convertToMono( input );

    if (useFeedbackReduction) {
        audioInput.connect( createLPInputFilter() );
        audioInput = lpInputFilter;
        
    }
    // create mix gain nodes
    outputMix = audioContext.createGain();
    wetGain = audioContext.createGain();
    effectInput = audioContext.createGain();
    audioInput.connect(analyser1);
    audioInput.connect(effectInput);
    wetGain.connect(outputMix);
    outputMix.connect( audioContext.destination);
    outputMix.connect(analyser2);
    changeEffect();
}

function gotSources(sourceInfos) {
    for (var i = 0; i != sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'audioinput') {
            var option = document.createElement("option");
            option.value = sourceInfo.id;
        }
    }
}

function initAudio() {
    analyser1 = audioContext.createAnalyser();
    analyser1.fftSize = 1024;
    analyser2 = audioContext.createAnalyser();
    analyser2.fftSize = 1024;


    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
        return(alert("Error: getUserMedia not supported!"));

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            gotStream(stream);
        }).catch(error => {
            alert('Error getting audio');
            console.log(e);
        });

    navigator.mediaDevices.enumerateDevices().then(gotSources);
}

window.addEventListener('load', initAudio );

// window.addEventListener('keydown', keyPress );

var lastEffect = -1;
function changeEffect() {
    if (currentEffectNode) 
        currentEffectNode.disconnect();
    if (effectInput)
        effectInput.disconnect();

    currentEffectNode = createPitchShifter();

    audioInput.connect( currentEffectNode );
}

function createPitchShifter() {
    effect = new Jungle( audioContext );
    effect.output.connect( wetGain );
    return effect.input;
}
