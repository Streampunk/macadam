# Macadam

Prototype bindings to link [Node.js](http://nodejs.org/) and the Blackmagic Desktop Video SDK, enabling asynchronous capture and playback to and from [Blackmagic Design](https://www.blackmagicdesign.com/) devices via a simple Javascript API.

This is prototype software and is not yet suitable for production use. Linux is now a fully supported platform. However, please note that Blackmagic USB3 devices are not supported under Linux.

Why _macadam_? _Tarmacadam_ is the black stuff that magically makes roads, so it seemed appropriate as a name for a steampunk-style BlackMagic binding.

## Installation

Macadam has a number of prerequisites:

1. Install [Node.js](http://nodejs.org/) for your platform. This software has been developed against version 10.11.0 which is the current version and will soon be LTS.
2. Install the latest version of the Blackmagic Desktop Video SDKs for your platform, available from https://www.blackmagicdesign.com/support. At least version 10.12.0 is required.
3. Install [node-gyp](https://github.com/nodejs/node-gyp) and make sure that you have the prerequisites for compiling Javascript addons for your platform. This requires a C/C++ development kit and python v2.7.

Macadam is designed to be used as a module included into another project. To include macadam into your project:

    npm install --save macadam

## Using macadam

To use macadam, `require` the module. Capture and playback operations are illustrated below.

### Device information

To get the name of the first device connected to the system, use `getFirstDevice()`. If the result is _undefined_ then no Blackmagic devices are connected to the system. Use tools like the _Blackmagic Desktop Video Setup_ utility to track down any issues.

In depth information about the BlackMagic devices currently connected to the system can be found by calling `getDeviceInfo()`.

```javascript
const macadam = require('macadam');
let deviceInfo = macadam.getDeviceInfo();
```

The `deviceInfo` result is an array of objects, with each object representing the capabilities of a device. For example ...

```JSON
{
  "modelName": "Intensity Extreme",
  "displayName": "Intensity Extreme",
  "vendorName": "Blackmagic",
  "deviceHandle": "54:00000000:00360600",
  "hasSerialPort": false,
  "topologicalID": 3540480,
  "numberOfSubDevices": 1,
  "subDeviceIndex": 0,
  "maximumAudioChannels": 2,
  "maximumAnalogAudioInputChannels": 2,
  "maximumAnalogAudioOutputChannels": 2,
  "supportsInputFormatDetection": false,
  "hasReferenceInput": false,
  "supportsFullDuplex": false,
  "supportsExternalKeying": false,
  "supportsInternalKeying": false,
  "supportsHDKeying": false,
  "hasAnalogVideoOutputGain": true,
  "canOnlyAdjustOverallVideoOutputGain": true,
  "videoInputGainMinimum": -1.8,
  "videoInputGainMaximum": 1.8,
  "videoOutputGainMinimum": -1.8,
  "videoOutputGainMaximum": 1.8,
  "hasVideoInputAntiAliasingFilter": false,
  "hasLinkBypass": false,
  "supportsClockTimingAdjustment": false,
  "supportsFullFrameReferenceInputTimingOffset": false,
  "supportsSMPTELevelAOutput": false,
  "supportsDualLinkSDI": false,
  "supportsQuadLinkSDI": false,
  "supportsIdleOutput": true,
  "hasLTCTimecodeInput": false,
  "supportsDuplexModeConfiguration": false,
  "supportsHDRMetadata": false,
  "supportsColorspaceMetadata": false,
  "deviceInterface": "Thunderbolt",
  "deviceSupports": [ "Capture", "Playback" ],
  "controlConnections": [],
  "videoInputConnections": [ "HDMI", "Component", "Composite", "S-Video" ],
  "audioInputConnections": [ "Embedded", "Analog", "AnalogRCA" ],
  "audioInputRCAChannelCount": 2,
  "audioInputXLRChannelCount": 0,
  "videoOutputConnections": [ "HDMI", "Component", "Composite", "S-Video" ],
  "audioOutputConnections": [ "Embedded", "AESEBU", "Analog", "AnalogRCA" ],
  "audioOutputRCAChannelCount": 2,
  "audioOutputXLRChannelCount": 0,
  "inputDisplayModes": [ {
      "name": "NTSC",
      "width": 720,
      "height": 486,
      "frameRate": [ 1001, 30000 ],
      "videoModes": [ "8-bit YUV", "10-bit YUV" ]
    }, { "..." }, {
      "name": "1080p29.97",
      "width": 1920,
      "height": 1080,
      "frameRate": [ 1001, 30000 ],
      "videoModes": [ "8-bit YUV" ]
    },
    {
      "name": "1080p30",
      "width": 1920,
      "height": 1080,
      "frameRate": [
        1000,
        30000
      ],
      "videoModes": [
        "8-bit YUV"
      ]
    },
    {
      "name": "1080i50",
      "width": 1920,
      "height": 1080,
      "frameRate": [
        1000,
        25000
      ],
      "videoModes": [
        "8-bit YUV"
      ]
    }, {
      "name": "720p60",
      "width": 1280,
      "height": 720,
      "frameRate": [
        1000,
        60000
      ],
      "videoModes": [
        "8-bit YUV"
      ]
    }
  ]
}
```

The index of a device in this array is used as the `deviceIndex` in calls to capture, playback and keying.

### Device configuration

Other than setting dispplay mode Support for device configuration is not yet available via this addon. In the meantime, use the _Blackmagic Desktop Video Setup_ utility before using macadam

### Capture

Description of new native promises-backed API for capture to follow.

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

### Playback

Description of the N-API based playback API to follow.

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

### Keying

Develop in progress. To follow shortly.

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

A variant for the Linux platform is also available but still in an experimental stage.

Contributions can be made via pull requests and will be considered by the author on their merits. Enhancement requests and bug reports should be raised as github issues. For support, please contact [Streampunk Media](http://www.streampunk.media/). For updates follow [@StrmPunkd](https://twitter.com/StrmPunkd) on Twitter.

## License

This software is released under the Apache 2.0 license. Copyright 2018 Streampunk Media Ltd.

The software links to the BlackMagic Desktop Video libraries. Include files and examples from which this code is derived include the BlackMagic License in their respective header files. The BlackMagic DeckLink SDK can be downloaded from https://www.blackmagicdesign.com/support.
