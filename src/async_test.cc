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

#include <assert.h>
#include <stdlib.h>

// #include "async_test.h"
#define NAPI_EXPERIMENTAL
#include <unistd.h>
#include "node_api.h"
#include <uv.h>


// This structure holds per-thread state.
typedef struct {
  uv_thread_t thread;
  napi_threadsafe_function ts_fn;
  bool is_even;
  napi_deferred _deferred;
  void f() { printf("Is even %i.\n", is_even ); };
} ThreadData;

// This is the structure of an item we wish to send to JavaScript.
typedef struct {
  int value = 0;
  ThreadData* thread_data;
} JSData;

// This context governs the operation of the thread-safe function from beginning
// to end.
typedef struct {
  bool main_released;
  napi_threadsafe_function ts_fn;
  napi_ref js_finalize_cb;
} Context;

// This is the worker thread. It produces even or odd numbers, depending on the
// contents of the ThreadData it receives.
static void one_thread(void* data) {
  napi_status status;
  ThreadData* thread_data = (ThreadData*) data;

  sleep(2);
  // The first step is always to acquire the thread-safe function. This
  // indicates that the function must not be destroyed, because it's still in
  // use.
  status = napi_acquire_threadsafe_function(thread_data->ts_fn);
  assert(status == napi_ok);

  thread_data->f();

  // Perform our iterations, and call the thread-safe function with each value.
  JSData* item = (JSData*) malloc(sizeof(JSData));

  item->value = 42;
  item->thread_data = thread_data;
  status = napi_call_threadsafe_function(thread_data->ts_fn,
                                         item,
                                         napi_tsfn_blocking);

  // A return value of napi_closing informs us that the thread-safe function
  // is about to be destroyed. Therefore this thread must exit immediately,
  // without making any further thread-safe-function-related calls.
  if (status == napi_closing) {
    return;
  }

  // The final task of this thread is to release the thread-safe function. This
  // indicates that, if there are no other threads using of the function, it may
  // be destroyed.
  status =
      napi_release_threadsafe_function(thread_data->ts_fn, napi_tsfn_release);
  assert(status == napi_ok);
}

// This function is responsible for translating the JSData items produced by the
// secondary threads into an array of napi_value JavaScript values which may be
// passed into a call to the JavaScript function.
static void call_into_javascript(napi_env env,
                                 napi_value js_callback,
                                 void* ctx,
                                 void* data) {
  JSData* item = (JSData*) data;
  napi_status status;
  napi_value result, undefined;

  // env and js_callback may be NULL if we're in cleanup mode.
  if (!(env == NULL || js_callback == NULL)) {
    // The first parameter to the JavaScript callback will be the integer value
    // that was produced on the thread.
    status = napi_create_int32(env, item->value, &result);
    assert(status == napi_ok);

    // The second value will be a boolean indicating whether the thread that
    // produced the value is done.
    // status = napi_get_boolean(env, !!(item->thread_to_join), &args[1]);
    // assert(status == napi_ok);

    // Since a function call must have a receiver, we use undefined, as in
    // strict mode.
    status = napi_get_undefined(env, &undefined);
    assert(status == napi_ok);

    status = napi_resolve_deferred(env, item->thread_data->_deferred, result);
    assert(status == napi_ok || status == napi_pending_exception);
  }

  // If the thread producing this item has indicated that its job is finished
  // by setting thread_to_join to something other than NULL, we must call
  // uv_thread_join() to avoid a resource leak and we must free all the data
  // associated with the thread.
  if (item->thread_data) {
    uv_thread_join(&(item->thread_data->thread));
    free(item->thread_data);
  }

  // Free the data item created by the thread.
  free(item);
}

// When all threads have released the thread-safe function, we may free any
// resources associated with it. Additionally, we call one last time into
// JavaScript to inform that the thread-safe function is about to be destroyed.
static void finalize_tsfn(napi_env env, void* data, void* ctx) {
  napi_status status;
  Context* context = (Context*) ctx;

  // Retrieve the JavaScript undefined value so it may serve as a receiver
  // for the JavaScript callback.
  napi_value undefined;
  status = napi_get_undefined(env, &undefined);
  assert(status == napi_ok);

  // Retrieve the JavaScript finalize callback from the persistent reference.
  napi_value js_finalize_cb;
  status = napi_get_reference_value(env,
                                    context->js_finalize_cb,
                                    &js_finalize_cb);
  assert(status == napi_ok);

  // Call the JavaScript finalizer.
  status = napi_call_function(env, undefined, js_finalize_cb, 0, NULL, NULL);
  assert(status == napi_ok || status == napi_pending_exception);

  // Delete the persistent reference to the JavaScript finalizer callback.
  status = napi_delete_reference(env, context->js_finalize_cb);
  assert(status == napi_ok);

  // Finally, we free the context associated with this thread-safe function.
  free(context);
}

napi_value doNothing(napi_env env, napi_callback_info info) {

  printf("NO FUCKING OP!\n");

  return nullptr;
}

// Signature in JavaScript: createFunction(callback, finalizer)
// Creates a thread-safe function and returns it wrapped in an external.
napi_value asyncTest(napi_env env, napi_callback_info info) {
  napi_status status;

  // Ensure that we have two arguments.
  size_t argc = 2;
  napi_value args[2];
  status = napi_get_cb_info(env, info, &argc, args, NULL, NULL);
  assert(argc == 2 && status == napi_ok);

  // Ensure that the first argument is a JavaScript function.
  napi_valuetype type_of_argument;
  status = napi_typeof(env, args[0], &type_of_argument);
  assert(status == napi_ok && type_of_argument == napi_function);

  // Ensure that the second argument is a JavaScript function.
  status = napi_typeof(env, args[1], &type_of_argument);
  assert(status == napi_ok && type_of_argument == napi_function);

  // Create a string that describes this asynchronous operation.
  napi_value async_name;
  status = napi_create_string_utf8(env,
                                   "AsyncProducer",
                                   NAPI_AUTO_LENGTH,
                                   &async_name);
  assert(status == napi_ok);

  // Allocate and initialize a context that will govern this thread-safe
  // function. This includes creating the thread-safe function itself.
  Context* context = (Context*) malloc(sizeof(Context));
  assert(context != NULL);
  context->main_released = false;
  status = napi_create_reference(env, args[1], 1, &(context->js_finalize_cb));
  assert(status == napi_ok);
  napi_value emptyFn;
  status = napi_create_function(env, "nop", NAPI_AUTO_LENGTH, doNothing, nullptr, &emptyFn);
  assert(status == napi_ok);
  status = napi_create_threadsafe_function(env,
                                          emptyFn,
                                          NULL, // optional async object
                                          async_name, // name of async operation
                                          20, // max queue size
                                          1, // initial thread count
                                          NULL, // thread finalize data
                                          finalize_tsfn, // finalizer
                                          context, // context,
                                          call_into_javascript, // marshaller
                                          &context->ts_fn);
  assert(status == napi_ok);

  // Allocate data for a new thread.
  ThreadData* thread_data = (ThreadData*) malloc(sizeof(ThreadData));
  assert(thread_data != NULL);
  thread_data->ts_fn = context->ts_fn;
  thread_data->is_even = true;

  napi_value promise;
  status = napi_create_promise(env, &thread_data->_deferred, &promise);
  assert(status == napi_ok);

  // Start the new thread.
  int result;
  result = uv_thread_create(&(thread_data->thread), one_thread, thread_data);
  assert(result == 0);

  return promise;
}
