# Macadam

Prototype bindings to link [Node.js](http://nodejs.org/) and the BlackMagic DeckLink APIs, enabling asynchronous capture and playback to and from BlackMagic devices via a simple Javascript API.

This is prototype software and is not yet suitable for production use. Currently supported platforms are Mac and Windows.

Why _macadam_? _Tarmacadam_ is the black stuff that magically makes roads, so it seemed appropriate as a name for a steampunk-style BlackMagic library.

## Installation

Macadam has a number of prerequisites:

1. Install [Node.js](http://nodejs.org/) for your platform. This software has been developed against the long term stable (LTS) release.
2. Install the latest version of the BlackMagic Desktop Video tools for your platform, available from https://www.blackmagicdesign.com/support.
3. Make sure you have the prerequisites for running [node-gyp](https://github.com/nodejs/node-gyp) on your system. This requires a C/C++ compiler and python v2.7.

Macadam is designed to be used as a module included into another project. To include macadam into your project:

    npm install --save macadam

## Using macadam

To use macadam, `require` the module. Capture and playback operations are illustrated below.

### Capture

The macadam capture class is an event emitter that produces buffers containing video frames.

```javascript
var macadam = require('macadam');

// First argument is the DeckLink device number
// Set appropriate values from display mode and pixel format from those provided.
var capture = new macadam.Capture(0, macadam.bmdModeHD1080i50, macadam.bmdFormat10BitYUV);

capture.on('frame', function (frameData) {
  // Do something with each frame received.
});

capture.on('error', function (err) {
  // Handle errors found during the capture
});

capture.start(); // Start capture

// eventually
capture.stop(); // Stop capture
```

The audio and ancillary data inputs of the card are not yet supported.

### Playback

``` javascript
var macadam = require('macadam');

// Set appropriate values from display mode and pixel format from those provided.
var playback = new macadam.Playback(0, macadam.bmdModeHD1080i50, macadam.bmdFormat10BitYUV);

playback.frame( /* first frame */);
playback.frame( /* second frame */);
// more to have a larger buffers

playback.on('played', function (x) {
  // send the next frame in sequence
});

playback.on('error', function (err) {
  // Handle errors found during playback
});

// eventually
playback.stop();
```

The audio and ancillary data outputs of the card are not yet supported.

### Check the DeckLink API version

To check the DeckLinkAPI version:

```javascript
var macadam = require('macadam');
console.log(macadam.deckLinkVersion());
```

## Status, support and further development

This is prototype software that is not yet suitable for production use. The software is being actively tested and developed.

A variant for the Linux platform is also planned. The developers currently lack a test platform for this work.

Contributions can be made via pull requests and will be considered by the author on their merits. Enhancement requests and bug reports should be raised as github issues. For support, please contact [Streampunk Media](http://www.streampunk.media/). For updates follow [@StrmPunkd](https://twitter.com/StrmPunkd) on Twitter.

## License

This software is released under the Apache 2.0 license. Copyright 2016 Streampunk Media Ltd.

The software links to the BlackMagic Desktop Video libraries. Include files and examples from which this code is derived include the BlackMagic License in their respective header files. The BlackMagic DeckLink SDK can be downloaded from https://www.blackmagicdesign.com/support.
