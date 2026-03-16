/**
 * Voice module — Web Speech API for on-device speech-to-text.
 * No audio is uploaded anywhere.
 */
const Voice = (() => {
  let recognition = null;
  let isRecording = false;

  function isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  function init(onResult, onStatusChange) {
    if (!isSupported()) return false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      onResult(finalTranscript, interim);
    };

    recognition.onend = () => {
      if (isRecording) {
        // Restart if still supposed to be recording (browser may stop it)
        recognition.start();
      } else {
        onStatusChange('stopped');
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return; // Ignore silence
      console.warn('Speech recognition error:', event.error);
      onStatusChange('error: ' + event.error);
    };

    return true;
  }

  function start(onResult, onStatusChange) {
    if (!recognition) {
      if (!init(onResult, onStatusChange)) {
        onStatusChange('Speech recognition not supported in this browser');
        return false;
      }
    }

    // Re-init to reset transcript
    init(onResult, onStatusChange);

    isRecording = true;
    recognition.start();
    onStatusChange('recording');
    return true;
  }

  function stop() {
    isRecording = false;
    if (recognition) {
      recognition.stop();
    }
  }

  function getIsRecording() {
    return isRecording;
  }

  return { isSupported, start, stop, getIsRecording };
})();
