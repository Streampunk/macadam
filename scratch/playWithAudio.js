var macadam = require('../');
var fs = require('fs');

// This example uses the deprecated event-based playback mode
var frame = fs.readFileSync('EBU_3325_1080_7.v210');
var audio = fs.readFileSync('steam_48000.wav');
audio = audio.slice(0x28);

var playback = new macadam.Playback(0, macadam.bmdModeHD1080i50,
  macadam.bmdFormat10BitYUV);
playback.enableAudio(macadam.bmdAudioSampleRate48kHz, macadam.bmdAudioSampleType16bitInteger, 2);

playback.on('error', console.error.bind(null, 'BMD ERROR:'));

console.log(playback);
console.log(playback.constructor.prototype);

playback.frame(frame, audio.slice(0, 7680));
playback.frame(frame, audio.slice(7680, 7280*2));
playback.frame(frame, audio.slice(7680*2, 7680*3));
playback.frame(frame, audio.slice(7680*3, 7680*4));
playback.frame(frame, audio.slice(7680*4, 7680*5));
// playback.frame(frame);

playback.start();

// var oneRow = 4 * 1920 * 8 / 3;
var count = 5;

var lastFrame = process.hrtime();

playback.on('played', () => {
  console.log('Mind the gap', process.hrtime(lastFrame));
  // frame = Buffer.concat([frame.slice(frame.length - oneRow, frame.length),
  //   frame.slice(0, frame.length - oneRow)], frame.length);
  playback.frame(frame, audio.slice(7680*count++, 7680*count));
  lastFrame = process.hrtime();
});
