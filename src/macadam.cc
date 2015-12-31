/* Copyright 2015 Christine S. MacNeill

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by appli cable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

#include <node.h>
#include "node_buffer.h"
#include "DeckLinkAPI.h"
#include <stdio.h>

#include "Capture.h"

using namespace v8;

void DeckLinkVersion(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  IDeckLinkIterator* deckLinkIterator;
  HRESULT	result;
  IDeckLinkAPIInformation*	deckLinkAPIInformation;
  deckLinkIterator = CreateDeckLinkIteratorInstance();
  result = deckLinkIterator->QueryInterface(IID_IDeckLinkAPIInformation, (void**)&deckLinkAPIInformation);
  if (result != S_OK) {
    isolate->ThrowException(Exception::Error(
      String::NewFromUtf8(isolate, "Error connecting to DeckLinkAPI.")));
  }

  char deckVer [80];
  int64_t	deckLinkVersion;
  int	dlVerMajor, dlVerMinor, dlVerPoint;

  // We can also use the BMDDeckLinkAPIVersion flag with GetString
  deckLinkAPIInformation->GetInt(BMDDeckLinkAPIVersion, &deckLinkVersion);

  dlVerMajor = (deckLinkVersion & 0xFF000000) >> 24;
  dlVerMinor = (deckLinkVersion & 0x00FF0000) >> 16;
  dlVerPoint = (deckLinkVersion & 0x0000FF00) >> 8;

  sprintf(deckVer, "DeckLinkAPI version: %d.%d.%d", dlVerMajor, dlVerMinor, dlVerPoint);

  deckLinkAPIInformation->Release();

  Local<String> deckVerString = String::NewFromUtf8(isolate, deckVer);
  args.GetReturnValue().Set(deckVerString);
}

void GetFirstDevice(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  IDeckLinkIterator* deckLinkIterator;
  HRESULT	result;
  IDeckLinkAPIInformation *deckLinkAPIInformation;
  IDeckLink* deckLink;
  deckLinkIterator = CreateDeckLinkIteratorInstance();
  result = deckLinkIterator->QueryInterface(IID_IDeckLinkAPIInformation, (void**)&deckLinkAPIInformation);
  if (result != S_OK) {
    isolate->ThrowException(Exception::Error(
      String::NewFromUtf8(isolate, "Error connecting to DeckLinkAPI.")));
  }
  if (deckLinkIterator->Next(&deckLink) != S_OK) {
    args.GetReturnValue().Set(Undefined(isolate));
    return;
  }
  CFStringRef deviceNameCFString = NULL;
  result = deckLink->GetModelName(&deviceNameCFString);
  if (result == S_OK) {
    char deviceName [64];
    CFStringGetCString(deviceNameCFString, deviceName, sizeof(deviceName), kCFStringEncodingMacRoman);
    args.GetReturnValue().Set(String::NewFromUtf8(isolate, deviceName));
    return;
  }
  args.GetReturnValue().Set(Undefined(isolate));
  node::Buffer::New(isolate, 42);
}



/* static Local<Object> makeBuffer(char* data, size_t size) {
  HandleScope scope;

  // It ends up being kind of a pain to convert a slow buffer into a fast
  // one since the fast part is implemented in JavaScript.
  Local<Buffer> slowBuffer = Buffer::New(data, size);
  // First get the Buffer from global scope...
  Local<Object> global = Context::GetCurrent()->Global();
  Local<Value> bv = global->Get(String::NewSymbol("Buffer"));
  assert(bv->IsFunction());
  Local<Function> b = Local<Function>::Cast(bv);
  // ...call Buffer() with the slow buffer and get a fast buffer back...
  Handle<Value> argv[3] = { slowBuffer->handle_, Integer::New(size), Integer::New(0) };
  Local<Object> fastBuffer = b->NewInstance(3, argv);

  return scope.Close(fastBuffer);
} */

void init(Local<Object> exports) {
  NODE_SET_METHOD(exports, "deckLinkVersion", DeckLinkVersion);
  NODE_SET_METHOD(exports, "getFirstDevice", GetFirstDevice);
  streampunk::Capture::Init(exports);
}

NODE_MODULE(macadam, init);
