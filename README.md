# Macadam

Prototype bindings to link [Node.js](http://nodejs.org/) and the BlackMagic DeckLink APIs, enabling asynchronous capture and playback to and from BlackMagic devices via a Javascript API.

This is prototype software and is not yet suitable for production use. Currently supported platforms are Mac and Windows.

## Installation

Macadam has a number of prerequisites:

1. Install [Node.js](http://nodejs.org/) for your platform. This software has been developed against the long term stable (LTS) release.
2. Install the latest version of the BlackMagic Desktop Video tools for your platform, available from [https://www.blackmagicdesign.com/support].
3. Make sure you have the prerequisites for running [node-gyp](https://github.com/nodejs/node-gyp) on your system. This requires a C/C++ compiler and python v2.7.

Macadam is designed to be used as a module included into another project. To include macadam into your project:

    npm install --save macadam

## Using macadam

To use macadam, `require` the module. Capture and playback operations are illustrated below.

### Capture

```javascript
```

### Playback

``` javascript
```

### Device check

```javascript
```

## Status, support and further development

This is prototype software that is not yet suitable for production use. The software is being actively tested and developed.

A variant for the Linux platform is also planned. The developers currently lack a test platform for this work.

Contributions can be made via pull requests and will be considered by the author on their merits. Enhancement requests and bug reports should be raised as github issues. For support, please contact [Streampunk Media](http://www.streampunk.media/). For updates follow (@StrmPunkd)[https://twitter.com/StrmPunkd] on Twitter.

## License

This software is released under the Apache 2.0 license. Copyright 2016 Streampunk Media Ltd.
