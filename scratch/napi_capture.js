const macadam = require('../index.js');

async function run() {
  let capture = await macadam.capture({
    pixelFormat: macadam.bmdFormat8BitYUV,
    channels: 0
  });
  for ( let x = 0 ; x < 100 ; x++ ) {
    //let frame = await capture.frame();
    let frames = await Promise.all([
      capture.frame(), capture.frame(), capture.frame()
    ]);
    console.log(x, frames);
  }
  setTimeout(() => { capture.stop(); }, 500);
}

run();
