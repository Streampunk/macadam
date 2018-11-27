const macadam = require('../index.js');

async function run() {
  let capture = await macadam.capture({
    displayMode: macadam.bmdModeHD1080i2997,
    pixelFormat: macadam.bmdFormat10BitYUV
  });
  console.log(capture);
  for ( let x = 0 ; x < 1000 ; x++ ) {
    let frame = await capture.frame();
    /* let frame = await Promise.all([
      capture.frame(), capture.frame(), capture.frame()
    ]); */
    console.log(x, frame.video.timecode);
    if (x % 100 === 0) console.log(x, frame);
    // frame = null;
    // if (x % 10 === 0) global.gc();
  }
  //capture.pause();
  //capture.frame().then(console.log);
  //setTimeout(() => { capture.pause(); }, 500);
  setTimeout(() => { capture.stop(); }, 1000);
}

run();
