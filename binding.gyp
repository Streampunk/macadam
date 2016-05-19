{
  "targets": [{
    "target_name" : "macadam",
    "sources" : [ "src/macadam.cc", "src/Capture.cc", "src/Playback.cc" ],
    "conditions": [
      ['OS=="mac"', {
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
            "-l../ffmpeg/bin/avcodec.lib"
        ],
        "include_dirs" : [
          "decklink/Win/include"
        ]
      }]
    ]
  }]
}
