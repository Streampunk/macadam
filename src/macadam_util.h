/* Copyright 2018 Streampunk Media Ltd.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

#ifndef MACADAM_UTIL_H
#define MACADAM_UTIL_H

#include <chrono>
#include <stdio.h>
#include <string>
#include "DeckLinkAPI.h"
#include "node_api.h"

#define DECLARE_NAPI_METHOD(name, func) { name, 0, func, 0, 0, 0, napi_default, 0 }

// Handling NAPI errors - use "napi_status status;" where used
#define CHECK_STATUS if (checkStatus(env, status, __FILE__, __LINE__ - 1) != napi_ok) return nullptr
#define CHECK_BAIL if (checkStatus(env, status, __FILE__, __LINE__ - 1) != napi_ok) goto bail
#define PASS_STATUS if (status != napi_ok) return status

napi_status checkStatus(napi_env env, napi_status status,
  const char * file, uint32_t line);

// High resolution timing
#define HR_TIME_POINT std::chrono::high_resolution_clock::time_point
#define NOW std::chrono::high_resolution_clock::now()
long long microTime(std::chrono::high_resolution_clock::time_point start);

// Argument processing
napi_status checkArgs(napi_env env, napi_callback_info info, char* methodName,
  napi_value* args, size_t argc, napi_valuetype* types);

// Async error handling
#define MACADAM_ERROR_START 4000
#define MACADAM_OUT_OF_BOUNDS 4001
#define MACADAM_NO_INPUT 4002
#define MACADAM_CALL_FAILURE 4003
#define MACADAM_NO_CONVERESION 4004
#define MACADAM_MODE_NOT_SUPPORTED 4005
#define MACADAM_INVALID_ARGS 4006
#define MACADAM_ACCESS_DENIED 4007
#define MACADAM_OUT_OF_MEMORY 4008
#define MACADAM_ALREADY_STOPPED 4009
#define MACADAM_NO_OUTPUT 4010
#define MACADAM_FRAME_CREATE_FAIL 4011
#define MACADAM_INSUFFICIENT_BYTES 4012
#define MACADAM_FRAME_TIMEOUT 4013
#define MACADAM_SUCCESS 0

struct carrier {
  virtual ~carrier() {}
  napi_ref passthru = nullptr;
  int32_t status = MACADAM_SUCCESS;
  std::string errorMsg;
  long long totalTime;
  napi_deferred _deferred;
  napi_async_work _request = nullptr;
};

void tidyCarrier(napi_env env, carrier* c);
int32_t rejectStatus(napi_env env, carrier* c, char* file, int32_t line);

#define REJECT_STATUS if (rejectStatus(env, c, (char*) __FILE__, __LINE__) != MACADAM_SUCCESS) return;
#define REJECT_BAIL if (rejectStatus(env, c, (char*) __FILE__, __LINE__) != MACADAM_SUCCESS) goto bail;
#define REJECT_RETURN if (rejectStatus(env, c, (char*) __FILE__, __LINE__) != MACADAM_SUCCESS) return promise;
#define FLOATING_STATUS if (status != napi_ok) { \
  printf("Unexpected N-API status not OK in file %s at line %d value %i.\n", \
    __FILE__, __LINE__ - 1, status); \
}

#define NAPI_THROW_ERROR(msg) { \
  char errorMsg[100]; \
  sprintf(errorMsg, msg); \
  napi_throw_error(env, nullptr, errorMsg); \
  return nullptr; \
}

#define REJECT_ERROR(msg, status) { \
  c->errorMsg = msg; \
  c->status = status; \
  REJECT_STATUS; \
}

#define REJECT_ERROR_RETURN(msg, stat) { \
  c->errorMsg = msg; \
  c->status = stat; \
  REJECT_RETURN; \
}

// List of known pixel formats and their matching display names
extern const BMDPixelFormat gKnownPixelFormats[]; // = {bmdFormat8BitYUV, bmdFormat10BitYUV, bmdFormat8BitARGB, bmdFormat8BitBGRA, bmdFormat10BitRGB, bmdFormat12BitRGB, bmdFormat12BitRGBLE, bmdFormat10BitRGBXLE, bmdFormat10BitRGBX, (BMDPixelFormat) 0};
extern const char* gKnownPixelFormatNames[]; //= {"8-bit YUV", "10-bit YUV", "8-bit ARGB", "8-bit BGRA", "10-bit RGB", "12-bit RGB", "12-bit RGBLE", "10-bit RGBXLE", "10-bit RGBX", NULL};

napi_value nop(napi_env env, napi_callback_info info);

typedef uint32_t MacadamConfigType;
enum _MacadamConfigType {
    macadamFlag = 1,
    macadamInt64 = 2,
    macadamFloat = 3,
    macadamString = 4
};

extern const BMDDeckLinkConfigurationID knownConfigValues[];
extern const char* knownConfigNames[];
extern const MacadamConfigType knownConfigTypes[];

#endif // MACADAM_UTIL_H
