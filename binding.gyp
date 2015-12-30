{
  "targets": [{
    "target_name" : "macadam",
    "sources" : [ "macadam.cc" ],
    "include_dirs" : [
      "<!(node -e \"require('nan')\")",
      "/Users/vizigoth/tools/Blackmagic\ DeckLink\ SDK\ 10.5/Mac/include" ],
    "link_settings" : {
      "libraries": [
        "/Library/Frameworks/DeckLinkAPI.framework"
      ]
    }
  }]
}
