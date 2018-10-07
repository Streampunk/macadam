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

#ifndef ASYNC_TEST_H
#define ASYNC_TEST_H

#include "macadam_util.h"
#include "node_api.h"

napi_value asyncTest(napi_env env, napi_callback_info info);

struct asyncCarrier {
  virtual ~asyncCarrier() {}
  napi_ref passthru = nullptr;
  int32_t status = MACADAM_SUCCESS;
  std::string errorMsg;
  long long totalTime;
  napi_deferred _deferred;
  napi_async_work _request = nullptr;
};

#endif // ASYNC_TEST_H
