const macadam = require('../index.js');

async function run() {
  let capture = await macadam.capture({
    pixelFormat: macadam.bmdFormat8BitYUV,
    channels: 2
  });
  for ( let x = 0 ; x < 100 ; x++ ) {
    let frame = await capture.frame();
    /* let frame = await Promise.all([
      capture.frame(), capture.frame(), capture.frame()
    ]); */
    if (x % 10 === 0) console.log(x, frame);
    // frame = null;
    // if (x % 10 === 0) global.gc();
  }
  capture.pause();
  capture.frame().then(console.log);
  setTimeout(() => { capture.pause(); }, 500);
  setTimeout(() => { capture.stop(); }, 1000);
}

run();
