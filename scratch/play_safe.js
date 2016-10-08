var macadam = require('../');
var fs = require('fs');

var frame = fs.readFileSync('frame_v210.raw');

var playback = new macadam.Playback(0, macadam.bmdModeHD1080i50,
  macadam.bmdFormat10BitYUV);

playback.on('error', console.error.bind(null, 'BMD ERROR:'));

console.log(playback);
console.log(playback.constructor);

playback.frame(frame);
playback.frame(frame);

playback.start();

playback.on('played', function() {
  playback.frame(frame);
});

process.on('exit', function () {
  console.log('Exiting node.');
  playback.stop();
}
process.on('SIGINT', function () {
  console.log('Received SIGINT.');
  playback.stop();
}
