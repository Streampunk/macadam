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

var H = require('highland');
var fs = require('fs');
var mac = require('../index.js');

var readdir = H.wrapCallback(fs.readdir);
var readFile = H.wrapCallback(fs.readFile);

var playback = new mac.Playback(0, mac.bmdModeHD1080i50, mac.bmdFormat10BitYUV);

var rootFolder = 'E:/media/EBU_test_sets/filexchange.ebu.ch/EBU test sets - Creative Commons (BY-NC-ND)/HDTV test sequences/1080i25/';

var material = {
  crowdrun: rootFolder + 'crowdrun_1080i/crowdrun_1080i_0000',
  flowers: rootFolder + 'crowdrun_1080i/crowdrun_1080i_0000',
  girlflower1: rootFolder + 'girlflower1_1080i_/girlflower1_1080i_',
  girlflower2: rootFolder + 'girlflower2_1080i_/girlflower2_1080i_',
  graphics: rootFolder + 'Graphics_1080i_/Graphics_1080i_',
  horse: rootFolder + 'horse_1080i_/horse_1080i_',
  kidssoccer: rootFolder + 'kidssoccer_1080i_/kidssoccer_1080i_',
  rainroses: rootFolder + 'rainroses_1080i_/rainroses_1080i_',
  vegicandle: rootFolder + 'vegicandle_1080i_/vegicandle_1080i_',
  vegies: rootFolder + 'vegies_1080i_/vegies_1080i_',
  waterfall: rootFolder + 'waterfall_1080i_/waterfall_1080i_',
  waterrocks_close: rootFolder + 'waterrocks_close_1080i_/waterrocks_close_1080i_',
  waterrocks1: rootFolder + 'waterrocks1_1080i_/waterrocks1_1080i_',
  sheep: 'E:/media/streampunk/sheep',
  tree: 'E:/media/streampunk/tree',
  view: 'E:/media/streampunk/view',
  truffles: 'E:/media/streampunk/truffles',
  flowersHome: 'E:/media/streampunk/flowers'
};

var baseFolder = (process.argv[2] && material[process.argv[2]]) ?
  material[process.argv[2]] : material.graphics;

var count = 0;

var baseTime = process.hrtime();

H((push, next) => { push(null, baseFolder); next(); })
  .take((process.argv[3] && !isNaN(+process.argv[3]) && +process.argv[3] > 0) ?
    +process.argv[3] : 1)
  .flatMap(x => readdir(x).flatten().filter(y => y.endsWith('v210')).sort())
  .map(x => baseFolder + '/' + x)
  .map(x => readFile(x).map(y => ({ name: x, contents: y })))
  .parallel(10)
  .consume((err, x, push, next) => {
    if (err) { push(err); next(); }
    else if (x === H.nil) { push(null, H.nil); }
    else {
      var diffTime = process.hrtime(baseTime);
      var dtms = diffTime[0] * 1000 + diffTime[1] / 1000000|0;
      var wait = count * 40 - dtms;
      // console.log('dtms = ', dtms, 'so waiting', wait, 'at count', count);
      setTimeout(() => { push(null, x); next(); }, (wait > 0) ? wait : 0); }
  })
  .doto(x => { playback.frame(x.contents); })
  .doto(() => { if (count++ == 4) { playback.start(); } })
  .errors(H.log)
  .done(() => { playback.stop(); });
