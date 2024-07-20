function Effect() {
	this.controls = [];
	this.input = null;
	this.output = null;
}

Effect.prototype.addLinearControls = function( params, name, min, max, step, initial ) {
//	[leftDelay.delayTime, rightDelay.delayTime], "Delay", 0.01, 2.0, 0.01, delayTime )


}

function EffectControl(type, min, max, initial, values) {

}


const startProcessing = document.getElementById('start-processing');
console.log('::test', {startProcessing});
startProcessing && startProcessing.addEventListener('load', () => {
    console.log('Page loading finished for the element!');
    audioContext.resume();
    changeInput();
    document.getElementById('autoplay').style='display:none';
});
