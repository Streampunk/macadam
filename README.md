# Macadam

Bindings to link [Node.js](http://nodejs.org/) and the Blackmagic Desktop Video devices, enabling asynchronous capture and playback to and from [Blackmagic Design](https://www.blackmagicdesign.com/) devices via a simple Javascript API. Keying is supported where it is available on the device.

Linux, Windows and MacOSX are all supported by this release. Please note that Blackmagic USB3 devices are not supported under Linux.

Why _macadam_? _Tarmacadam_ is the black stuff that magically makes roads, so it seemed appropriate as a name for a steampunk-style Blackmagic binding.

## Installation

Macadam has a number of prerequisites:

1. Install [Node.js](http://nodejs.org/) for your platform. This software has been developed against version 10.11.0 and will track the Node LTS version.
2. Install the latest version of the Blackmagic Desktop Video software for your platform, available from https://www.blackmagicdesign.com/support. At least version 10.11.2 is required.
3. Install [node-gyp](https://github.com/nodejs/node-gyp) and make sure that you have the prerequisites for compiling Javascript native addons for your platform as described. This requires a C/C++ development kit and python v2.7.

Note: For MacOSX _Mojave_, install the following package after `xcode-select --install`:

    /Library/Developer/CommandLineTools/Packages/macOS_SDK_headers_for_macOS_10.14.pkg

Macadam is designed to be used as a module included into another project. To include macadam into your project (`--save` is now assumed so could be omitted):

    npm install --save macadam

## Using macadam

To use macadam, `require` the module. Capture and playback operations are illustrated in sections below.

### Device information

To get the name of the first device connected to the system, use `getFirstDevice()`. If the result is _undefined_ then no Blackmagic devices are connected to the system. Use tools like the _Blackmagic Desktop Video Setup_ utility to track down any issues.

In depth information about the Blackmagic devices currently connected to the system can be found by calling `getDeviceInfo()`.

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

Device configuration can be carried out either by using the _Blackmagic Desktop Video Setup_ utility before running macadam, or by using the `getDeviceConfig()` and `setDeviceConfig()` functions.

Use `getDeviceInfo()` to work out the index of the DeckLink device that you would like to configure. To find out the current configuration of that device, call the get function with the device index as an argument (defaults to `0`). For example, for the third device at index `2`:

```javascript
const macadam = require('macadam');
let config = getDeviceConfig(2);
```

The returned configuration object has the known configruration parameters of a DeckLink device listed as property values. For example:

```javascript
{ type: 'configuration',
  deviceIndex: 2,
  swapSerialRxTx: undefined,
  HDMI3DPackingFormat: null,  
  bypass: null,
  fieldFlickerRemoval: false,
  HD1080p24ToHD1080i5994Conversion: false,
  videoOutputMode: 1853125475,
  defaultVideoModeOutputFlags: 0,
  videoInputConnection: 1,
  deviceInformationLabel: '',
  ... }
```

Many more properties are shown as the object contains a list of all the current known properties for all DeckLink hardware.

Some properties are _undefined_ meaning that a call to get the configuration parameter failed for this device. Others are _null_ which means that the configuration parameter is understood but not implemented for this hardware. Other properties include values that are integer and floating point numbers, multi-part flags, strings and enumerations.

The enumerations tend to appear as a large integer value, e.g. `videoOutputMode` has value `1853125475`. In this example, the enumeration value is defined as a constant in macadam [index.js](./index.js) called `bmdModeNTSC`. The number is a representation of a four character ASCII string that can be printed using function `intToBMCode()`, for example in the REPL:

```jacascript
> macadam.intToBMCode(1853125475);
'ntsc'
>
```

For details of what the configuration parameters are, see the description in the Blackmagic SDK Documentation (section 2.7.1 _DeckLink Configuration ID_, page 226, June 2018 edition). The names have been altered to make them suitable for use as Javascript object properties but the relationship between the SDK enumeration names and Javascript names should be obvious.

Multiple configuration parameters can be set at one time. Using the same configuration parameter names as returned by the get request, create an object with property names and values. To specify the device to be configured, add in a `deviceIndex` property. For example, to set _field flicker removal_ to on and _video output idle operation_ to display the last frame (rather than black), try:

```javascript
macadam.setDeviceConfig({
  deviceIndex: 2,
  fieldFlickerRemoval: true,
  videoOutputIdleOperation: macadam.bmdIdleVideoOutputLastFrame
});
```

The result returned is an object containing properties for any configuration parameters successfully changed. Any errors in setting a parameter are contained in a sub-object called `errors`. Note that setting certain parameters on certain operating systems may require administrator privileges and macadam will throw an error if their is insufficient permissions.

### Capture

The recommended approach to capture is to use promises and `async`/`await`. The process involves creating a capture object and that using its `frame` method to retrieve each frame in sequence.

For the previous event-based version of playback, please see the description of the [deprecated APIs](./deprecated.md).

To capture frames of video and any related audio, inside an `async` function create a capture object.

```javascript
let capture = await macadam.capture({
  deviceIndex: 0, // Index relative to the 'macadam.getDeviceInfo()' array
  displayMode: macadam.bmdModeHD1080i50,
  pixelFormat: macadam.bmdFormat8BitYUV,
  channels: 2, // enables audio - omit if audio is not required
  sampleRate: macadam.bmdAudioSampleRate48kHz,
  sampleType: macadam.bmdAudioSampleType16bitInteger
});
```

An example of the capture object returned is shown below:

```javascript
{ type: 'capture',
  displayModeName: '1080i50',
  width: 1920,
  height: 1080,
  fieldDominance: 'upperFieldFirst',
  frameRate: [ 1000, 25000 ],
  pixelFormat: '8-bit YUV',
  audioEnabled: true,
  sampleRate: 48000,
  sampleType: 16,
  channels: 2,
  pause: [Function: pause],
  stop: [Function: stop],
  frame: [Function: frame],
  deckLinkInput: [External] }
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
    timecode: '10:11:12:13', // set to false when not available
    userbits: 0, // timecode userbits
    hardwareRefFrameTime: 17379742688,
    hardwareRefFrameDuration: 1000 }
  audio:
  { type: 'audioPacket',
    sampleFrameTime: 1920,
    data: <Buffer 00 a0 00 b0 00 c0 00 d0 ... > } }
```

Note that the `data` buffers returned hold onto RAM allocated by the Blackmagic SDK until the buffer is no longer referenced and garbage collected. Try not to hold on to these buffers for too long, perhaps by copying the data into another buffer.

Stream capture may be paused and restarted by calling the `pause` method. This will stop the resolution of outstanding frame promises and skip frames on the input.

### Playback

Playback has two modes, scheduled and synchronous. The recommended approach to playback is to use promises with `async`/`await` and the scheduled approach. Lower latency can be achieved with the synchronous approach, but note that this requires the user to control the timing of sending video and audio with respect to hardware output timing.

For the previous event-based version of playback, please see the description of the [deprecated APIs](./deprecated.md).

#### Scheduled playback

To playback data using the scheduler, you need to place the frames onto a virtual timeline and then start the scheduler's clock. You must keep the queue of frames to be played ahead of the current playback position by at least a couple of frames. The best way to do this is to create a promise that waits for a specific frame to be played and use the promise resolution as a trigger to show the next one.

Playback starts by creating a playback object inside an `async` function.

```javascript
let playback = await macadam.playback({
  deviceIndex: 0, // Index relative to the 'macadam.getDeviceInfo()' array
  displayMode: macadam.bmdModeHD1080i50,
  pixelFormat: macadam.bmdFormat10BitYUV,
  channels: 2, // omit the channels property if no audio
  sampleRate: macadam.bmdAudioSampleRate48kHz,
  sampleType: macadam.bmdAudioSampleType16bitInteger,
  startTimecode: '10:11:12:13' // Leave unset or set to undefined for no timecode
});
```

This created playback object will be like the one shown below:

```javascript
{ type: 'playback',
  displayModeName: '1080i50',
  width: 1920,
  height: 1080,
  rowBytes: 5120,
  bufferSize: 5529600,
  fieldDominance: 'upperFieldFirst',
  frameRate: [ 1000, 25000 ],
  pixelFormat: '10-bit YUV',
  audioEnabled: true,
  sampleRate: 48000,
  sampleType: 16,
  channels: 2,
  rejectTimeout: 1000,
  startTimecode: '10:11:12:13', // Will be undefined if no timecode required
  displayFrame: [Function: displayFrame],
  start: [Function: start],
  stop: [Function: stop],
  schedule: [Function: schedule],
  played: [Function: played],
  referenceStatus: [Function: referenceStatus],
  scheduledTime: [Function: scheduledTime],
  hardwareTime: [Function: hardwareTime],
  bufferedFrames: [Function: bufferedFrames],
  bufferedAudioFrames: [Function: bufferedAudioFrames],
  setTimecode: [Function: setTimecode],
  getTimecode: [Function: getTimecode],
  setTimecodeUserbits: [Function: getTimecodeUserbits],
  getTimecodeUserbits: [Function: getTimecodeUserbits],
  deckLinkOutput: [External] }
```

The following code snippet shows how video and audio data can be scheduled based on scheduled stream time.

```javascript
for ( let x = 0 ; x < 100 ; x++ ) { // Play 100 frames
  // somehow get Node.JS buffers for next 'videoFrame' and 'audioFrame'
  playback.schedule({
    video: videoFrame, // Video frame data. Decklink SDK docs have byte packing
    audio: audioFrame, // Frames-worth of interleaved audio data
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

* `startTime` - Time to start scheduled playback from, measured in units of playback `frameRate`. Defaults to `0`.
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

With synchronous playback, frame data is sent to the card immediately for display at the next possible opportunity using the `displayFrame` method. It is up to the user of the synchronous API to make sure that frame data is replaced at a suitable frequency to ensure smooth playback. The `playback.hardwareTime()` method (see previous section) can be used to help with this.

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
  await playback.displayFrame(frame); // Does not wait for frame to display ... work done off main thread
  await timer(500); // Replace frame data around every half second
}
```

Once playback if finished, call `playback.stop()` to release the associated resources.

### Keying

Keying is implemented as an extension of the playback functionality and can be used with both the scheduled and synchronous mode. Keying allows the combination of a provided graphics overlay with a video source, either within the Blackmagic card (_internal keying_) or by outputting a _key and fill_ signal on two separate SDI outputs (_external keying_).

Not all Blackmagic devices support keying. Use the `macadam.getDeviceInfo()` call to check the `supportsExternalKeying` and `supportsInternalKeying`. Also, for HD keying support, check `supportsHDKeying`.

Keys must be provided as 8-bit BGRA or ARGB uncompressed images, with the 8-bit alpha channel providing a variable key defining whether the graphic's fill pixel is transparent (`0`) or opaque (`255`). Any conversions required to or from YCbCr are done by the Blackmagic hardware. For internal keying, the pixel format must match that of the expected input. In this mode, the configured pixel format is that of the graphic key and fill (either `bmdFormat8BitARGB` or `bmdFormat8BitBGRA`) but the output format is based on the input format.

To set up keying, set playback property `enableKeying` to `true`. Use the `isExternal` property to switch on _external keying_ by setting the value to `true` or leave as the default value of `false` for internal keying. You can also set an overall key level, with a range between `0` (fully translucent) and `255` (opaque) and a default value of `255`. The alpha level in the image key is reduced according to overall level set for the keyer.

To create a playback object with keying:

```javascript
let playback = await macadam.playback({
  deviceIndex: 0,
  displayMode: macadam.bmdModeHD1080i50,
  pixelFormat: macadam.bmdFormat8BitBGRA,
  enableKeying: true,
  isExternal: true, // omit or set to false for internal keying
  level: 255 // or just omit this line. Only really useful if key level is changed
});
```

Send the graphics images to key as if they were frames of video. The keyer is stopped and destroyed with the `stop()` method.

The overall key level can be set with the `setLevel(<level>)` method of the playback object.

The key level can be ramped up to `255` over a given number of frames using the `rampUp(<count>)` method or ramped down to zero with the `rampDown(<count>)` method.

### Check the DeckLink API version

To check the DeckLink API version:

```javascript
const macadam = require('macadam');
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

### Timecode

On capture with devices that have timecode support, timecode is available in the incoming stream as values in the resolved `frame` object.

    frame.video.timecode // a string, or 'false' if not available
    frame.video.userBits // a number - C-type `uint32_t`

Non-drop frame timecode is formatted as `HH:MM:SS:FF.f`, where `HH` is the hour, `MM` is the minute, `SS` is the second, `FF` is the frame, or represents a pair of frames for rates above 30fps. The `.f` extension is the optional frame pair indicator, used only for rates above 30fps. A value of `.0` indicates the first frame in a pair and `.1` for the second. If no timecode is available, the value is set to Boolean value `false` (not string `'false'`). For drop frame timecode, the format is the same except that the last colon (`:`) is changes to a semi-colon (`;`), as shown: `HH:MM:SS;FF.f`.

For playout devices that support timecode insertion, to enable timecode output, set the `startTimecode` property on the options object passed to `macadam.playout({ ... })`. The format of the string is the same as for capture. This timecode will be used for the first frame, whether using scheduled or synchronous playback, and the timecode value is then incremented for each subsequent frame. The timecode's internal frames-per-second is derived from the display mode, as is the timecode type (VITC/SMPTE RP188).

Make sure to use a colon to set non-drop frame and a semi-colon to set drop frame. Get this wrong and timecode output will be suppressed.

The playout object has four utility methods for managing timecode:

* `playout.getTimecode()` - gets the current timecode value - the one to be used for the next frame to be output - as a string.
* `playout.setTimecode(`_timecode_`)` - sets a new timecode value based on the given string to be used. Used from the next frame onwards.
* `playout.getTimecodeUserbits()` - gets the current timecode user bits represented as a 32-bit integer. These are the user bits to be sent with the next frame.
* `playout.setTimecodeUserbits(`_userbits_`)` - sets the timecode user bits field from a 32-bit integer. These become the user bits to be sent with the next frame.

## Status, support and further development

The software is being actively tested and developed. Please note that some of the asynchronous features of the N-API used by this software are marked as _experimental_ in Node v10 LTS.

Contributions can be made via pull requests and will be considered by the author on their merits. Enhancement requests and bug reports should be raised as github issues. For support, please contact [Streampunk Media](https://www.streampunk.media/). For updates follow [@StrmPunkd](https://twitter.com/StrmPunkd) on Twitter.

## License

This software is released under the Apache 2.0 license. Copyright 2018 Streampunk Media Ltd.

The software links to the BlackMagic Desktop Video libraries. Include files and examples from which this code is derived include the BlackMagic License in their respective header files. The BlackMagic DeckLink SDK can be downloaded from https://www.blackmagicdesign.com/support.
