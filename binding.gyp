{
  "targets": [{
    "target_name" : "macadam",
    "include_dirs" : [
      "<!(node -e \"require('nan')\")"
    ],
    "conditions": [
      ['OS=="mac"', {
        'sources' : [ "src/macadam_util.cc", "src/macadam.cc", "src/async_test.cc",
          "src/capture_promise.cc" ],
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
      ['OS=="linux"', {
        'sources' : [ "src/macadam_util.cc", "src/macadam.cc", "src/async_test.c",
          "src/capture_promise.cc" ],
        'link_settings' : {
          "libraries": [
            "/usr/lib/libDeckLinkAPI.so"
          ],
          "ldflags" : [
            "-lm -ldl -lpthread"
	      ]
        },
        "include_dirs" : [
          "decklink/Linux/include"
        ]
      }],
      ['OS=="win"', {
        "sources" : [ "src/macadam_util.cc", "src/macadam.cc",
          "decklink/Win/include/DeckLinkAPI_i.c" ],
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
        "include_dirs" : [
          "decklink/Win/include"
        ]
      }]
    ]
  }]
}
