var macadam = require('../');
var fs = require('fs');

var frame = fs.readFileSync('frame_v210.raw');

var playback = new macadam.Playback(0, macadam.bmdModeHD1080i50,
  macadam.bmdFormat10BitYUV);

playback.on('error', console.error.bind(null, 'BMD ERROR:'));

console.log(playback);

playback.frame(frame);

playback.start();

process.on('exit', playback.stop);
