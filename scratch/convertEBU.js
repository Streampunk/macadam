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

// Convert and play EBU test files in .yuv10 format
// .yuv10 format is headerless 4:2:2 10-bit video in order U Y0 V Y1
// Tightly packed - three samples in 30-bits followed by 2 zero bits

// v210 documentation is here ... https://developer.apple.com/library/content/technotes/tn2162/_index.html#//apple_ref/doc/uid/DTS40013070-CH1-TNTAG8-V210__4_2_2_COMPRESSION_TYPE

var H = require('highland');
var fs = require('fs');
var mac = require('../index.js');

var readdir = H.wrapCallback(fs.readdir);
var readFile = H.wrapCallback(fs.readFile);
var writeFile = H.wrapCallback(fs.writeFile);

var playback = new mac.Playback(0, mac.bmdModeHD1080i50, mac.bmdFormat10BitYUV);

var rootFolder = 'E:/media/EBU_test_sets/filexchange.ebu.ch/EBU test sets - Creative Commons (BY-NC-ND)/HDTV test sequences/1080i25/';

var material = {
  crowdrun: rootFolder + 'crowdrun_1080i/crowdrun_1080i_0000',
  flowers: rootFolder + 'flowers_1080i/flowers_1080i',
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
  waterrocks1: rootFolder + 'waterrocks1_1080i_/waterrocks1_1080i_'
};

var baseFolder = (process.argv[2] && material[process.argv[2]]) ?
  material[process.argv[2]] : material.graphics;

var count = 0;

H((push, next) => { push(null, baseFolder); next(); })
  .take((process.argv[3] && !isNaN(+process.argv[3]) && +process.argv[3] > 0) ?
    +process.argv[3] : 1)
  .flatMap(x => readdir(x).flatten().filter(y => y.endsWith('yuv10')).sort())
  .map(x => baseFolder + '/' + x)
  .map(x => readFile(x).map(y => ({ name: x, contents: y })))
  .parallel(4)
  .ratelimit(1, 40)
  .map(z => {
    var x = z.contents;
    for ( var y = 0 ; y < x.length ; y += 16) {
      var a = x.readUInt8(y + 0);
      var b = x.readUInt8(y + 1);
      var c = x.readUInt8(y + 2);
      var d = x.readUInt8(y + 3);

      var e = x.readUInt8(y + 4);
      var f = x.readUInt8(y + 5);
      var g = x.readUInt8(y + 6);
      var h = x.readUInt8(y + 7);

      var i = x.readUInt8(y + 8);
      var j = x.readUInt8(y + 9);
      var k = x.readUInt8(y + 10);
      var l = x.readUInt8(y + 11);

      var m = x.readUInt8(y + 12);
      var n = x.readUInt8(y + 13);
      var o = x.readUInt8(y + 14);
      var p = x.readUInt8(y + 15);

      var cb0 = (a << 2) | (b >>> 6);
      var y0 = (((b & 0x3f) << 4) | (c >>> 4));
      var cr0 = (((c & 0x0f) << 6) | (d >>> 2));

      var y1 = (e << 2) | (f >>> 6);
      var cb1 = (((f & 0x3f) << 4) | (g >>> 4));
      var y2 = (((g & 0x0f) << 6) | (h >>> 2));

      var cr1 = (i << 2) | (j >>> 6);
      var y3 = (((j & 0x3f) << 4) | (k >>> 4));
      var cb2 = (((k & 0x0f) << 6) | (l >>> 2));

      var y4 = (m << 2) | (n >>> 6);
      var cr2 = (((n & 0x3f) << 4) | (o >>> 4));
      var y5 = (((o & 0x0f) << 6) | (p >>> 2));

      x.writeUInt8(cb0 & 0xff, y + 0);
      x.writeUInt8(((y0 & 0x3f) << 2) | (cb0 >>> 8), y + 1);
      x.writeUInt8((y0 >>> 6) | ((cr0 & 0x0f) << 4), y + 2);
      x.writeUInt8((cr0 >>> 4), y + 3);

      x.writeUInt8(y1 & 0xff, y + 4);
      x.writeUInt8(((cb1 & 0x3f) << 2) | (y1 >>> 8), y + 5);
      x.writeUInt8((cb1 >>> 6) | ((y2 & 0x0f) << 4), y + 6);
      x.writeUInt8((y2 >>> 4), y + 7);

      x.writeUInt8(cr1 & 0xff, y + 8);
      x.writeUInt8(((y3 & 0x3f) << 2) | (cr1 >>> 8), y + 9);
      x.writeUInt8((y3 >>> 6) | ((cb2 & 0x0f) << 4), y + 10);
      x.writeUInt8((cb2 >>> 4), y + 11);

      x.writeUInt8(y4 & 0xff, y + 12);
      x.writeUInt8(((cr2 & 0x3f) << 2) | (y4 >>> 8), y + 13);
      x.writeUInt8((cr2 >>> 6) | ((y5 & 0x0f) << 4), y + 14);
      x.writeUInt8((y5 >>> 4), y + 15);

    }
    return { name : z.name, contents: x };
  })
  .doto(x => { playback.frame(x.contents); })
  .doto(() => { if (count++ == 4) { playback.start(); } })
  .flatMap(x => writeFile(x.name.replace('.yuv10', '.v210'), x.contents))
  .errors(H.log)
  .done(() => { playback.stop(); });
