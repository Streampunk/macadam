# Macadam

Prototype bindings to link [Node.js](http://nodejs.org/) and the Blackmagic Desktop Video SDK, enabling asynchronous capture and playback to and from [Blackmagic Design](https://www.blackmagicdesign.com/) devices via a simple Javascript API.

This is prototype software and is not yet suitable for production use. Currently supported platforms are Mac and Windows.

Why _macadam_? _Tarmacadam_ is the black stuff that magically makes roads, so it seemed appropriate as a name for a steampunk-style BlackMagic binding.

## Installation

Macadam has a number of prerequisites:

1. Install [Node.js](http://nodejs.org/) for your platform. This software has been developed against the long term stable (LTS) release.
2. Install the latest version of the Blackmagic Desktop Video SDKs for your platform, available from https://www.blackmagicdesign.com/support.
3. Install [node-gyp](https://github.com/nodejs/node-gyp) and make sure that you have the prerequisites for compiling Javascript addons for your platform. This requires a C/C++ development kit and python v2.7.

Macadam is designed to be used as a module included into another project. To include macadam into your project:

    npm install --save macadam

## Using macadam

To use macadam, `require` the module. Capture and playback operations are illustrated below.

### Capture

The macadam capture class is an event emitter that produces buffers containing video frames. Make sure you release the reference quickly (within ten frames or so) so that the frame data is garbage collected.

```javascript
var macadam = require('macadam');

// First argument is the DeckLink device number.
// Set appropriate values from display mode and pixel format from those macadam provides.
var capture = new macadam.Capture(0, macadam.bmdModeHD1080i50, macadam.bmdFormat10BitYUV);

// If audio capture is required, call the following method on capture
// First param is the audio sample rate, second is bits per sample, third in number of channels
// Defaults are shown. BMD hardware only supports: 48kHz; 16 or 32 bits; 2, 8 or 16 channels.
capture.enableAudio(macadam.bmdAudioSampleRate48kHz, macadam.bmdAudioSampleType16bitInteger, 2);

capture.on('frame', function (videoData, audioData) {
  // Do something with each frame received.
  // frameData is a node.js Buffer, and may be null if only audio is provided
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

### Playback

The playback event emitter works by sending a sequence of frame buffers (node.js `Buffer` objects) to the playback object. For smooth playback, build a few frames first and then keep adding frames as they are played. A `played` event is emitted each time playback of a frame is complete.

Take care not to hold on to frame buffer references so that they can be garbage collected.

``` javascript
var macadam = require('macadam');

// First argument is the DeckLink device number.
// Set appropriate values from display mode and pixel format from those macadam provides.
var playback = new macadam.Playback(0, macadam.bmdModeHD1080i50, macadam.bmdFormat10BitYUV);

playback.frame( /* first frame */);
playback.frame( /* second frame */);
// Add more here to have a larger buffer to ensure smooth playback

playback.on('played', function (x) {
  // Send the next frame in sequence.
});

playback.on('error', function (err) {
  // Handle errors found during playback.
});

// start playback, typically after 4-10 frames have been accumulatedvar
playback.start();

// ... eventually ...
playback.stop();
```

The audio and ancillary data outputs of the card are not yet supported.

### Check the DeckLink API version

To check the DeckLinkAPI version:

```javascript
var macadam = require('macadam');
console.log(macadam.deckLinkVersion());
```

### Modes and formats

The Blackmagic mode and format enumerations are available as constants, as in the examples
shown above: `macadam.bmdModeHD1080i50` and `macadam.bmdFormat10BitYUV`. For more
information on the modes, see the Blackmagic DeckLink API documentation provided
with the Blackmagic SDK. Note that not all cards support every mode and format.

A set of utility functions are provided that allow access to the mode functions.
In summary, there are:

* `modeWidth`, `modeHeight`, `modeGrainDuration` and `modeInterlace`: Extract
  parameters from a Blackmagic _mode_.
* `formatDepth`, `formatFourCC`, `formatSampling` and `formatColorimetry`: Extract
  parameters from a Blackmagic _format_.

## Status, support and further development

This is prototype software that is not yet suitable for production use. The software is being actively tested and developed.

A variant for the Linux platform is also planned. The developers currently lack a test platform for this work.

Contributions can be made via pull requests and will be considered by the author on their merits. Enhancement requests and bug reports should be raised as github issues. For support, please contact [Streampunk Media](http://www.streampunk.media/). For updates follow [@StrmPunkd](https://twitter.com/StrmPunkd) on Twitter.

## License

This software is released under the Apache 2.0 license. Copyright 2017 Streampunk Media Ltd.

The software links to the BlackMagic Desktop Video libraries. Include files and examples from which this code is derived include the BlackMagic License in their respective header files. The BlackMagic DeckLink SDK can be downloaded from https://www.blackmagicdesign.com/support.
