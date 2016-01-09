{
  "targets": [{
    "target_name" : "macadam",
    "sources" : [ "src/macadam.cc", "src/Capture.cc", "src/Playback.cc" ],
    "include_dirs" : [
      "/Users/streampunk/Documents/streampunk/Blackmagic\ DeckLink\ SDK\ 10.5/Mac/include" ],
    "link_settings" : {
      "libraries": [
        "/Library/Frameworks/DeckLinkAPI.framework"
      ]
    }
  }]
}
