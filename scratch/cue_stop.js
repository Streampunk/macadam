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

const macadam = require('../index.js');

function timer(t) {
  console.log(`Waiting ${t}`);
  return new Promise((f) => {
    setTimeout(f, t);
  });
}

async function run() {

  let bmdPlayback = await macadam.playback({
    deviceIndex: 0,
    displayMode: macadam.bmdModeHD1080i50,
    pixelFormat: macadam.bmdFormat10ButYUV,
  });

  await timer(1000);
  bmdPlayback.stop();
  await timer(1000);
  global.gc();
  bmdPlayback = await macadam.playback({
    deviceIndex: 0,
    displayMode: macadam.bmdModeHD720p60,
    pixelFormat: macadam.bmdFormat10ButYUV,
  });
  await timer(1000);
  bmdPlayback.stop();
}

run();
