# Macadam deprecated APIs

The event-based APIs for capture and playback are now deprecated in favour of the [promise-based API](./README.md) using `async`/`await`. The older APIs are only emulated in this version of macadam based on the promises API and so may behave differently. The related documentation is included on this page.

### Capture - deprecated

The macadam capture class is an event emitter that produces buffers containing video frames. Make sure you release the reference quickly (within ten frames or so) so that the frame data is garbage collected.

```javascript
const macadam = require('macadam');

// First argument is the DeckLink device number.
// Set appropriate values from display mode and pixel format from those macadam provides.
var capture = new macadam.Capture(0, macadam.bmdModeHD1080i50, macadam.bmdFormat10BitYUV);

// If audio capture is required, call the following method on capture
// First param is the audio sample rate, second is bits per sample, third in number of channels
// Defaults are shown. BMD hardware only supports: 48kHz; 16 or 32 bits; 2, 8 or 16 channels.
capture.enableAudio(macadam.bmdAudioSampleRate48kHz, macadam.bmdAudioSampleType16bitInteger, 2);

capture.on('frame', function (videoData, audioData) {
  // Do something with each frame received.
  // videoData is a node.js Buffer, and may be null if only audio is provided
  // audioData is a node.js Buffer, or null is audio is not enabled/available
});

capture.on('error', function (err) {
  // Handle errors found during the capture.
});

capture.start(); // Start capture.

// ... eventually ...
capture.stop(); // Stop capture.
```

The ancillary data inputs of the card are not yet supported.

### Playback - deprecated

The playback event emitter works by sending a sequence of frame buffers and frame-sized chunks of interleaved audio data as node.js `Buffer` objects to a playback object. For smooth playback, build a few frames first and then keep adding frames as they are played. A `played` event is emitted each time playback of a frame is complete.

Take care not to hold on to frame buffer references so that they can be garbage collected.

```javascript
var macadam = require('macadam');

// First argument is the DeckLink device number.
// Set appropriate values from display mode and pixel format from those macadam provides.
var playback = new macadam.Playback(0, macadam.bmdModeHD1080i50, macadam.bmdFormat10BitYUV);

// If you want to play audio alongside the video, enable audio
// First param is the audio sample rate, second is bits per sample, third in number of channels
// Defaults are shown. BMD hardware only supports: 48kHz; 16 or 32 bits; 2, 8 or 16 channels.
playback.enableAudio(macadam.bmdAudioSampleRate48kHz, macadam.bmdAudioSampleType16bitInteger, 2);

playback.frame( /* first frame */, /* opt frame of audio */);
playback.frame( /* second frame */, /* opt frame of audio */);
// Add more here to have a larger buffer to ensure smooth playback

playback.on('played', function (x) {
  // Use this callback to send next frame, or use an accurate timer. See note below
});

playback.on('error', function (err) {
  // Handle errors found during playback.
});

// start playback, typically after 4-10 frames have been accumulated
playback.start();

// ... eventually ...
playback.stop();
```

Ancillary data outputs of the card are not yet supported.

Note that experience shows that the `played` event is not a good way to clock the sending of frames to the video card. It provides an indication that the frame has played. It is best to send frames to the card regularly based on a clock, such as deriving a `setTimeout` interval from `process.hrtime()`.
