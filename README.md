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

Other than setting display mode and pixel format, support for device configuration is not yet available via this addon. In the meantime, use the _Blackmagic Desktop Video Setup_ utility before running macadam.

### Capture

The recommended approach to capture is to use promises and `async`/`await`. The process involves creating a capture object and that using its `frame` method to retrieve each frame in sequence.

For the previous event-based version of playback, please see the description of the [deprecated APIs](./deprecated.md).

To capture frames of video and any related audio, inside an `async` function create a capture object.

```javascript
let capture = await macadam.capture({
  displayMode: macadam.bmdModeHD1080i50,
  pixelFormat: macadam.bmdFormat8BitYUV,
  channels: 2, // enables audio - omit if audio is not required
  sampleRate: macadam.bmdAudioSampleRate48kHz,
  stampleType: macadam.bmdAudioSampleType16bitInteger
});
```

An example of the capture object returned is shown below:

```javascript
```

Use the `frame` method provided by the object the wait for the next frames-worth of data. The following example grabs 1000 frames and then stops the capture process.

```javascript
for ( let x = 0 ; x < 1000 ; x++ ) {
  let frame = await capture.frame();
  // Do something with the frame
}
capture.stop();
```

Each frame is self-contained and self-describing. An example of the value of the `frame` variable is shown below:

```javascript
{ type: 'frame',
  video:
  { type: 'videoFrame',
    width: 1920,
    height: 1080,
    rowBytes: 3840,
    frameTime: 200000,
    frameDuration: 1000,
    data: <Buffer 80 10 80 10 80 10 80 10 80 ... >,
    hasNoInputSource: true,
    timecode: false,
    hardwareRefFrameTime: 17379742688,
    hardwareRefFrameDuration: 1000 }
  audio:
  { type: 'audioPacket',
    sampleFrameTime: 1920,
    data: <Buffer 00 a0 00 b0 00 c0 00 d0 ... > } }
```

Note that the `data` buffers returned hold onto RAM allocated by the Blackmagic SDK until the buffer is no longer referenced and garbage collected. Try not to hold on to them for too long or copy the data into another buffer.

Stream capture may be paused and restarted by calling the `pause` method. This will stop the resolution of outstanding frame promises and skip frames on the input.

### Playback

Playback has two modes, scheduled and synchronous. The recommended approach to playback is to use promises with `async`/`await` and the scheduled approach. Lower latency can be achieved with the synchronous approach, but note that this requires the user to manage the timing of sending video and audio with hardware output timing.

For the previous event-based version of playback, please see the description of the [deprecated APIs](./deprecated.md).

#### Scheduled playback

To playback data using the scheduler, you need to place the frames onto a virtual timeline and then start the scheduled clock. You must keep the queue of frames to be played ahead of the current playback position by at least a couple of frames. The best way to do this is to create a promise that waits for a specific frame to be played and use the promise resolution as a trigger to show the next.

Playback starts by creating a playback object inside an `async` function.

```javascript
let playback = await macadam.playback({
  deviceIndex: 0, // Index relative to deviceInfo
  displayMode: macadam.bmdModeHD1080i50,
  pixelFormat: macadam.bmdFormat10BitYUV,
  channels: 2, // omit the channels property if no audio
  sampleRate: macadam.bmdAudioSampleRate48kHz,
  stampleType: macadam.bmdAudioSampleType16bitInteger
});
```

This created playback object will be like the one shown below:

```javascript
```

The following code snippet shows how video and audio data can be scheduled based on scheduled stream time.

```javascript
for ( let x = 0 ; x < 100 ; x++ ) { // Play 100 frames
  // somehow get Node.JS buffers for next 'videoFrame' and 'audioFrame'
  playback.schedule({
    video: videoFrame, // See SDK documentation for byte packing
    audio: audioFrame, // Frames worth of interleaved audio data
    sampleFrameCount: 1920, // Optional - otherwise based on buffer length
    time: x * 1000 }); // Relative to timescale in playback object
                       // Hint: Use 1001 for fractional framerates like 59.94

  if (x === 3) // Need to queue up a few frames - number depends on hardware
   playback.start({ startTime: 0 });
  if (x > 2) { // Regulate playback based on played time - latency depends on hw.
    await playback.played(x * 1000 - 3000));
    // Don't allow the data be garbage collected until after playback
  }
}
playback.stop();
```

The playback `start` method takes the following options:

* `startTime` - Time to start scheduled playback from in unit of playback `frameRate`. Defaults to `0`.
* `playbackSpeed` - Relative playback speed. Allows slower or reverse play. Defaults to `1.0` for real time forward playback.

#### Playback status

The playback object provides a number of utility methods for finding out what the current state of playback is, including:

* `playback.referenceStatus()` - Is the playback output locked to an external clock (_genlock_)? Response is one of three strings: `ReferenceNotSupportedByHardware`, `ReferenceLocked` or `ReferenceNotLocked`.
* `playback.scheduledTime()` - In units of the `frameRate` defined for the playback, how many ticks have elapsed from the start time until now? Returns an object:

```javascript
{ type: 'scheduledStreamTime',
  streamTime: 65036,
  playbackSpeed: 1.0 }
```

* `playback.hardwareTime()` - Details of the current hardware reference clock that is returned as an object shown below. The `hardwareTime` is a relative value with no specific reference to an external clock but that can be compared between values. The `timeInFrame` is the number of ticks relative to the timescale since the last frame was displayed.

```javascript
{ type: 'hardwareRefClock',
  timeScale: 25000,
  hardwareTime: 96263641,
  timeInFrame: 641,
  ticksPerFrame: 1000 }
```

* `playback.bufferedFrames()` - Number of frames currently buffered for playback.
* `playback.bufferedAudioFrames()` - Number of audio frames (e.g. 1920 _audio frames_ per video frame at 1080i50) currently buffered for playback.

#### Synchronous playback

With synchronous playback, frame data is sent to the card immediately for display at the next possible opportunity using the `displayFrame` method. It is up to the use of the synchronous API to make sure that frame data is replaced at a suitable frequency to ensure smooth playback. The `playback.hardwareTime()` method can be used to help with this.

Note that synchronous audio playback is still in development and not covered here.

Synchronous playback starts the same way as scheduled playback by creating a playback object.

```javascript
let playback = await macadam.playback({
  deviceIndex: 0,
  displayMode: macadam.bmdModeHD1080i50,
  pixelFormat: macadam.bmdFormat10BitYUV
});
```

For synchronous playback, do not call `start`. Instead, send frames as shown in the following code snippet:

```javascript
function timer(t) {
  return new Promise((f, r) => {
    setTimeout(f, t);
  });
}
for ( let x = 0 ; x < 100 ; x++ ) {
  // Get hold of frame data as a Node.JS buffer
  await displayFrame(frame); // Does not wait for frame to display ... work done off main thread
  await timer(500); // Replace frame data around every half second
}
```

### Keying

development in progress. To follow shortly.

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
