{
  "targets": [{
    "target_name" : "macadam",
    "conditions": [
      ['OS=="mac"', {
        'sources' : [ "src/macadam.cc", "src/Capture.cc", "src/Playback.cc" ],
        'xcode_settings': {
          'GCC_ENABLE_CPP_RTTI': 'YES',
          'MACOSX_DEPLOYMENT_TARGET': '10.7',
          'OTHER_CPLUSPLUSFLAGS': [
            '-std=c++11',
            '-stdlib=libc++'
          ]
        },
        "link_settings": {
          "libraries": [
            "/Library/Frameworks/DeckLinkAPI.framework"
          ]
        },
        "include_dirs" : [
          "decklink/Mac/include"
        ]
      }],
      ['OS=="win"', {
        "sources" : [ "src/macadam.cc", "src/Capture.cc", "src/Playback.cc" ],
        "configurations": {
          "Release": {
            "msvs_settings": {
              "VCCLCompilerTool": {
                "RuntimeTypeInfo": "true"
              }
            }
          }
        },
        "libraries": [
        ],
      	"sources": [ "decklink/Win/include/DeckLinkAPI_i.c" ],
        "include_dirs" : [
          "decklink/Win/include"
        ]
      }]
    ]
  }]
}
