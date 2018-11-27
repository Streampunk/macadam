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

function shift(b, rowBytes) {
  return Buffer.concat([b.slice(-rowBytes), b.slice(0, -rowBytes)], b.length);
}

async function run() {
  let frame = await readFile(__dirname + '/EBU_3325_1080_7.v210');
  console.log(frame.length, frame);
  // let frame2 = Buffer.alloc(frame.length, 0x7f);
  let playback = await macadam.playback({
    displayMode: macadam.bmdModeHD1080i50,
    pixelFormat: macadam.bmdFormat10BitYUV,
    startTimecode: '10:11:12:13'
  });
  console.log(playback);
  process.on('SIGINT', () => {
    console.log('Received SIGINT.');
    playback.stop();
    process.exit();
  });
  console.log(playback.referenceStatus(), playback.scheduledTime());
  for ( let x = 0 ; x < 40 ; x++ ) {
    // console.log('Scheduling', x * 1000);
    // let start = process.hrtime();
    playback.schedule({ video: frame, time: x * 1000 });
    // console.log(process.hrtime(start)[1]);
    // playback.schedule({ video: frame2, time: x * 2000 + 1000 });
    if (x === 3) playback.start({ startTime: 0 });
    if (x > 2) {
      console.log(x, await playback.played(x * 1000 - 3000));
      console.log(playback.hardwareTime());
      console.log();
      // await timer(20);
    }
    /* if (x === 39) {
      playback.played(x * 1000 - 30000).catch(console.error);
    } */
    frame = shift(frame, 5120 * 10);
  }
  console.log(playback.referenceStatus(), playback.scheduledTime());
  playback.stop();
  await timer(1000);
  playback.stop();
}

run().catch(console.error);
