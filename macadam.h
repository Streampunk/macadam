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

#include "DeckLinkAPI.h"

class CaptureWorker : public IDeckLinkInputCallback
{
private:
  IDeckLink *					m_deckLink;
  IDeckLinkInput *			m_deckLinkInput;

  // The mutex and condition variable are used to wait for
  // - a deck to be connected
  // - the capture to complete
  pthread_mutex_t				m_mutex ;
  pthread_cond_t				m_condition;
  bool						m_waitingForDeckConnected;
  bool						m_waitingForCaptureEnd;
  bool						m_captureStarted;

  // video mode
  long						m_width;
  long						m_height;
  BMDTimeScale				m_timeScale;
  BMDTimeValue				m_frameDuration;

  // frame count values for the capture in- and out-points
  uint32_t					m_inPointFrameCount;
  uint32_t					m_outPointFrameCount;

  // setup the IDeckLinkInput interface (video standard, pixel format, callback object, ...)
  bool			setupDeckLinkInput();

  void			cleanupDeckLinkInput();
public:
  CaptureWorker(IDeckLink *deckLink);
  virtual			~CaptureWorker();

  // init() must be called after the constructor.
  // if init() fails, call the destructor
  bool			init();

  // start the capture operation. returns when the operation has completed
  void			doCapture();

  // IDeckLinkInputCallback
  virtual HRESULT	VideoInputFormatChanged (BMDVideoInputFormatChangedEvents notificationEvents, IDeckLinkDisplayMode* newDisplayMode, BMDDetectedVideoInputFormatFlags detectedSignalFlags) {return S_OK;};
  virtual HRESULT	VideoInputFrameArrived (IDeckLinkVideoInputFrame* arrivedFrame, IDeckLinkAudioInputPacket*);

  // IUnknown
  HRESULT			QueryInterface (REFIID iid, LPVOID *ppv)	{return E_NOINTERFACE;}
  ULONG			AddRef ()									{return 1;}
  ULONG			Release ()									{return 1;}
};
