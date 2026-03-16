/**
 * App module — main orchestration.
 */
const App = (() => {
  let currentPanel = 'input';

  function showPanel(name) {
    document.querySelectorAll('.panel').forEach(p => {
      p.hidden = true;
      p.classList.remove('panel-active');
    });
    const panel = document.getElementById(`panel-${name}`);
    if (panel) {
      panel.hidden = false;
      panel.classList.add('panel-active');
      currentPanel = name;
    }
  }

  function init() {
    // Navigation
    document.getElementById('btn-objectives').addEventListener('click', () => {
      Objectives.render();
      showPanel('objectives');
    });

    document.getElementById('btn-history').addEventListener('click', () => {
      History.render();
      showPanel('history');
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
      document.getElementById('input-api-key').value = Storage.getApiKey();
      showPanel('settings');
    });

    // Back buttons
    document.getElementById('btn-back-from-objectives').addEventListener('click', () => showPanel('input'));
    document.getElementById('btn-back-from-history').addEventListener('click', () => showPanel('input'));
    document.getElementById('btn-back-from-settings').addEventListener('click', () => showPanel('input'));

    // Settings
    document.getElementById('btn-save-api-key').addEventListener('click', () => {
      const key = document.getElementById('input-api-key').value.trim();
      Storage.setApiKey(key);
      showPanel('input');
    });

    // Objectives
    document.getElementById('btn-add-objective').addEventListener('click', () => {
      const input = document.getElementById('input-new-objective');
      Objectives.addObjective(input.value);
      input.value = '';
    });

    document.getElementById('input-new-objective').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('btn-add-objective').click();
      }
    });

    // Note input — enable/disable reflect button
    const notesInput = document.getElementById('input-notes');
    const reflectBtn = document.getElementById('btn-reflect');

    notesInput.addEventListener('input', () => {
      reflectBtn.disabled = notesInput.value.trim().length === 0;
    });

    // Voice recording
    const recordBtn = document.getElementById('btn-record');
    const recordingStatus = document.getElementById('recording-status');

    if (!Voice.isSupported()) {
      recordBtn.disabled = true;
      recordBtn.title = 'Speech recognition not supported in this browser';
      recordingStatus.textContent = 'Voice not supported — use Chrome or Edge';
    }

    recordBtn.addEventListener('click', () => {
      if (Voice.getIsRecording()) {
        Voice.stop();
        recordBtn.classList.remove('recording');
        recordBtn.querySelector('.record-label').textContent = 'Record';
        recordingStatus.textContent = '';
      } else {
        const started = Voice.start(
          (final, interim) => {
            // Append transcribed text to notes
            const current = notesInput.value;
            const beforeVoice = current.split('\n[Voice] ')[0];
            notesInput.value = beforeVoice + (beforeVoice ? '\n' : '') + '[Voice] ' + final + interim;
            notesInput.dispatchEvent(new Event('input'));
          },
          (status) => {
            if (status === 'recording') {
              recordingStatus.textContent = 'Listening...';
            } else if (status === 'stopped') {
              recordingStatus.textContent = '';
            } else {
              recordingStatus.textContent = status;
            }
          }
        );
        if (started) {
          recordBtn.classList.add('recording');
          recordBtn.querySelector('.record-label').textContent = 'Stop';
        }
      }
    });

    // Reflect button
    reflectBtn.addEventListener('click', async () => {
      const notes = notesInput.value.trim();
      if (!notes) return;

      const title = document.getElementById('input-meeting-title').value.trim();
      const participants = document.getElementById('input-participants').value.trim();

      // Check API key
      if (!Storage.getApiKey()) {
        showPanel('settings');
        document.getElementById('input-api-key').focus();
        return;
      }

      // Show loading
      document.getElementById('loading-overlay').hidden = false;

      try {
        const reflection = await Reflect.analyze(notes, title, participants);

        // Render the reflection
        History.renderReflectionContent(reflection, title || 'Reflection', new Date().toISOString());

        // Store reference for saving
        App._pendingReflection = {
          id: crypto.randomUUID(),
          title: title || 'Untitled reflection',
          participants,
          notes,
          reflection,
          timestamp: new Date().toISOString(),
        };

        showPanel('reflection');
      } catch (err) {
        alert('Reflection failed: ' + err.message);
      } finally {
        document.getElementById('loading-overlay').hidden = true;
      }
    });

    // Save reflection
    document.getElementById('btn-save-reflection').addEventListener('click', () => {
      if (App._pendingReflection) {
        Storage.saveReflection(App._pendingReflection);
        App._pendingReflection = null;
        showPanel('input');
        // Clear inputs
        document.getElementById('input-notes').value = '';
        document.getElementById('input-meeting-title').value = '';
        document.getElementById('input-participants').value = '';
        reflectBtn.disabled = true;
      }
    });

    // New reflection
    document.getElementById('btn-new-reflection').addEventListener('click', () => {
      showPanel('input');
    });

    // History actions
    document.getElementById('btn-export-history').addEventListener('click', History.exportAll);

    document.getElementById('btn-clear-history').addEventListener('click', () => {
      if (confirm('This will delete ALL reflections and objectives. This cannot be undone. Continue?')) {
        Storage.clearAll();
        showPanel('input');
      }
    });

    // Show initial panel
    showPanel('input');

    // Guide new users
    if (!Storage.getApiKey()) {
      recordingStatus.textContent = 'Tip: Set your API key in Settings to get started';
    }
  }

  // Start the app
  document.addEventListener('DOMContentLoaded', init);

  return { showPanel };
})();
