var macadam = require('../');
var fs = require('fs');

var frame = fs.readFileSync('frame_v210.raw');

var playback = new macadam.Playback(0, macadam.bmdModeHD1080i50,
  macadam.bmdFormat10BitYUV);

playback.on('error', console.error.bind(null, 'BMD ERROR:'));

console.log(playback);
console.log(playback.constructor.prototype);

playback.frame(frame);
playback.frame(frame);
playback.frame(frame);
playback.frame(frame);
playback.frame(frame);
// playback.frame(frame);

playback.start();

var oneRow = 4 * 1920 * 8 / 3;

var lastFrame = process.hrtime();

playback.on('played', function() {
  console.log('Mind the gap', process.hrtime(lastFrame));
  frame = Buffer.concat([frame.slice(frame.length - oneRow, frame.length),
    frame.slice(0, frame.length - oneRow)], frame.length);
  playback.frame(frame);
  lastFrame = process.hrtime();
});

process.on('exit', function () {
  console.log('Exiting node.');
  playback.stop();
  process.exit(0);
});
process.on('SIGINT', function () {
  console.log('Received SIGINT.');
  playback.stop();
});
