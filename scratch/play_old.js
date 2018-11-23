/* Copyright 2018 Streampunk Media Ltd.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// This example uses the deprecated event-based playback mode
var macadam = require('../');
var fs = require('fs');

var frame = fs.readFileSync(__dirname + '/EBU_3325_1080_7.v210');

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

// var oneRow = 4 * 1920 * 8 / 3;

var lastFrame = process.hrtime();
// var begin = lastFrame;
var count = 0;

playback.on('played', () => {
  console.log('Mind the gap', count++, process.hrtime(lastFrame));
  // frame = Buffer.concat([frame.slice(frame.length - oneRow, frame.length),
  //   frame.slice(0, frame.length - oneRow)], frame.length);
  var gap = process.hrtime(diffTime);
  var diffTime = gap[0] * 1000 + gap[1] / 1000000|0 - 40 * count;
  setTimeout(() => { playback.frame(frame); }, (diffTime > 0) ? diffTime : 0);
  lastFrame = process.hrtime();
});
