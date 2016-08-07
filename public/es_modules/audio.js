window.AudioContext = window.AudioContext || window.webkitAudioContext
window.context = parent.context || new AudioContext()


export function tone(frequency, volume){
  var zero = 0.0001;// FF doesn't like 0

  var vco             = context.createOscillator();
  vco.frequency.value = Math.round(frequency);

  // VCA
  var vca        = context.createGain();
  vca.gain.value = zero;

  // Envelope
  var now = window.context.currentTime;
  vca.gain.cancelScheduledValues(now);
  vca.gain.exponentialRampToValueAtTime(volume || 0.9, now + 0.25);
  vca.gain.exponentialRampToValueAtTime(zero, now + 1)
  vca.gain.setTargetAtTime(zero, now + 2, zero)


  // Patchbay
  vco.connect(vca);
  vca.connect(context.destination);

  vco.start(0);


  setTimeout(function(){
    vco.stop(0);
    vco.disconnect();
    vca.disconnect();
  },2500)

}
