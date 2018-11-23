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

const macadam = require('../');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

function timer(t) {
  console.log(`Waiting ${t}`);
  return new Promise((f) => {
    setTimeout(f, t);
  });
}

async function run() {
  let [frame, audio] = await Promise.all([
    readFile(__dirname + '/EBU_3325_1080_7.v210'),
    readFile(__dirname + '/steam_48000.wav')]);
  audio = audio.slice(0x28);
  console.log(frame.length, frame);
  let frame2 = Buffer.alloc(frame.length, 0xf7);
  let playback = await macadam.playback({
    displayMode: macadam.bmdModeHD1080i50,
    pixelFormat: macadam.bmdFormat10BitYUV,
    channels: 2,
    sampleRate: macadam.bmdAudioSampleRate48kHz,
    stampleType: macadam.bmdAudioSampleType16bitInteger
  });
  console.log(playback);
  process.on('SIGINT', () => {
    console.log('Received SIGINT.');
    playback.stop();
    process.exit();
  });
  for ( let x = 0 ; x < 1000 ; x++ ) {
    // let start = process.hrtime();
    let fp = playback.displayFrame(frame,
      audio.slice(x * 15360, x * 15360 + 7680)).catch(console.error);
    await fp;
    console.log(playback.hardwareTime());
    // let end = process.hrtime(start)[1];
    await timer(35);
    await playback.displayFrame(frame2,
      audio.slice(x * 15360 + 7680, x * 15360 + 15360)).catch(console.error);
    await timer(35);
  }
  playback.stop();
}

run();
