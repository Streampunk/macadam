var macadam = require('../');
var fs = require('fs');

var frame = fs.readFileSync('EBU_3325_1080_7.v210');

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
var begin = lastFrame;
var count = 0;

playback.on('played', function() {
  console.log('Mind the gap', count++, process.hrtime(lastFrame));
  // frame = Buffer.concat([frame.slice(frame.length - oneRow, frame.length),
  //   frame.slice(0, frame.length - oneRow)], frame.length);
  var gap = process.hrtime(diffTime);
  var diffTime = gap[0] * 1000 + gap[1] / 1000000|0 - 40 * count;
  setTimeout(() => { playback.frame(frame); }, (diffTime > 0) ? diffTime : 0);
  lastFrame = process.hrtime();
});

// process.on('exit', function () {
//   console.log('Exiting node.');
//   playback.stop();
//   process.exit(0);
// });
process.on('SIGINT', function () {
  console.log('Received SIGINT.');
  playback.stop();
  process.exit();
});
