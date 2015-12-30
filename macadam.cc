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

#include <nan.h>
#include "DeckLinkAPI.h"
#include <stdio.h>

using namespace v8;

NAN_METHOD(DeckLinkVerison) {
  IDeckLinkIterator* deckLinkIterator;
  HRESULT	result;
  IDeckLinkAPIInformation*	deckLinkAPIInformation;
  deckLinkIterator = CreateDeckLinkIteratorInstance();
  result = deckLinkIterator->QueryInterface(IID_IDeckLinkAPIInformation, (void**)&deckLinkAPIInformation);
  if (result != S_OK) {
    Nan::ThrowError("Error connecting to DeckLinkAPI.");
  }

  char deckVer [80];
  int64_t	deckLinkVersion;
  int	dlVerMajor, dlVerMinor, dlVerPoint;

  // We can also use the BMDDeckLinkAPIVersion flag with GetString
  deckLinkAPIInformation->GetInt(BMDDeckLinkAPIVersion, &deckLinkVersion);

  dlVerMajor = (deckLinkVersion & 0xFF000000) >> 24;
  dlVerMinor = (deckLinkVersion & 0x00FF0000) >> 16;
  dlVerPoint = (deckLinkVersion & 0x0000FF00) >> 8;

  sprintf(deckVer, "DeckLinkAPI version: %d.%d.%d\n", dlVerMajor, dlVerMinor, dlVerPoint);

  deckLinkAPIInformation->Release();

  MaybeLocal<String> maybeStr = Nan::New<String>(deckVer);
  v8::Local<String> str;
  if (maybeStr.ToLocal(&str) == false) {
    Nan::ThrowError("Error converting stupid string!");
  };
  info.GetReturnValue().Set(str);
}

NAN_METHOD(GetFirstDevice) {
  IDeckLinkIterator* deckLinkIterator;
  HRESULT	result;
  IDeckLinkAPIInformation*deckLinkAPIInformation;
  IDeckLink* deckLink;
  deckLinkIterator = CreateDeckLinkIteratorInstance();
  result = deckLinkIterator->QueryInterface(IID_IDeckLinkAPIInformation, (void**)&deckLinkAPIInformation);
  if (result != S_OK) {
    Nan::ThrowError("Error connecting to DeckLinkAPI.");
  }
  if (deckLinkIterator->Next(&deckLink) != S_OK) {
    info.GetReturnValue().Set(Nan::Undefined());
    return;
  }
  CFStringRef deviceNameCFString = NULL;
  result = deckLink->GetModelName(&deviceNameCFString);
  if (result == S_OK) {
    char deviceName [64];
    CFStringGetCString(deviceNameCFString, deviceName, sizeof(deviceName), kCFStringEncodingMacRoman);
    info.GetReturnValue().Set(Nan::New(deviceName).ToLocalChecked());
    return;
  }
  info.GetReturnValue().Set(Nan::Undefined());
  return;
}

NAN_MODULE_INIT(Init) {
  Nan::Set(target, Nan::New("deckLinkVersion").ToLocalChecked(),
      Nan::GetFunction(Nan::New<FunctionTemplate>(DeckLinkVerison)).ToLocalChecked());
  Nan::Set(target, Nan::New("getFirstDevice").ToLocalChecked(),
    Nan::GetFunction(Nan::New<FunctionTemplate>(GetFirstDevice)).ToLocalChecked());
}

NODE_MODULE(macadam, Init);
