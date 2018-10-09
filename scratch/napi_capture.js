const macadam = require('../index.js');

async function run() {
  let capture = await macadam.capture({
    pixelFormat: macadam.bmdFormat8BitYUV
  });
  for ( let x = 0 ; x < 100 ; x++ ) {
    let frame = await capture.frame();
    console.log(x, frame);
  }
  capture.stop();
}

run();
