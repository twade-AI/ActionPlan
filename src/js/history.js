/**
 * History module — display and manage past reflections.
 */
const History = (() => {

  function render() {
    const list = document.getElementById('history-list');
    const reflections = Storage.getReflections();

    if (reflections.length === 0) {
      list.innerHTML = '<p class="history-empty">No reflections yet. Complete your first one to see it here.</p>';
      return;
    }

    list.innerHTML = reflections.map(r => `
      <div class="history-item" data-id="${r.id}">
        <div class="history-item-title">${escapeHtml(r.title || 'Untitled reflection')}</div>
        <div class="history-item-date">${new Date(r.timestamp).toLocaleString()}</div>
        <div class="history-item-preview">${escapeHtml(r.reflection.summary || '')}</div>
      </div>
    `).join('');

    list.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const reflection = reflections.find(r => r.id === id);
        if (reflection) {
          showReflection(reflection);
        }
      });
    });
  }

  function showReflection(data) {
    renderReflectionContent(data.reflection, data.title, data.timestamp);
    App.showPanel('reflection');
  }

  function renderReflectionContent(reflection, title, timestamp) {
    document.getElementById('reflection-title').textContent = title || 'Reflection';
    document.getElementById('reflection-date').textContent = timestamp
      ? new Date(timestamp).toLocaleString()
      : '';

    const container = document.getElementById('reflection-content');

    let html = '';

    // Summary
    if (reflection.summary) {
      html += `<div class="reflection-section">
        <h3>Summary</h3>
        <p>${escapeHtml(reflection.summary)}</p>
      </div>`;
    }

    // Energy read
    if (reflection.energy_read) {
      html += `<div class="reflection-section">
        <h3>Energy Read</h3>
        <p>${escapeHtml(reflection.energy_read)}</p>
      </div>`;
    }

    // Decisions
    if (reflection.decisions && reflection.decisions.length > 0) {
      html += `<div class="reflection-section">
        <h3>Decisions Made</h3>
        <ul>${reflection.decisions.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
      </div>`;
    }

    // Action items
    if (reflection.action_items && reflection.action_items.length > 0) {
      html += `<div class="reflection-section">
        <h3>Action Items</h3>
        <ul>${reflection.action_items.map(a => {
          let text = escapeHtml(a.task);
          if (a.owner) text += ` <strong>(${escapeHtml(a.owner)})</strong>`;
          if (a.objective) text += ` <span class="objective-tag">${escapeHtml(a.objective)}</span>`;
          return `<li>${text}</li>`;
        }).join('')}</ul>
      </div>`;
    }

    // Insights
    if (reflection.insights && reflection.insights.length > 0) {
      html += `<div class="reflection-section">
        <h3>Insights</h3>
        <ul>${reflection.insights.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
      </div>`;
    }

    // Open questions
    if (reflection.open_questions && reflection.open_questions.length > 0) {
      html += `<div class="reflection-section">
        <h3>Open Questions</h3>
        <ul>${reflection.open_questions.map(q => `<li>${escapeHtml(q)}</li>`).join('')}</ul>
      </div>`;
    }

    // Objective alignment
    if (reflection.objective_alignment && reflection.objective_alignment.length > 0) {
      html += `<div class="reflection-section">
        <h3>Objective Alignment</h3>
        <ul>${reflection.objective_alignment.map(a => {
          const statusColors = {
            'advancing': '#16a34a',
            'stalled': '#d97706',
            'at risk': '#dc2626',
            'not addressed': '#78716c'
          };
          const color = statusColors[a.status] || '#78716c';
          return `<li><strong style="color:${color}">[${escapeHtml(a.status).toUpperCase()}]</strong> ${escapeHtml(a.objective)} — ${escapeHtml(a.note)}</li>`;
        }).join('')}</ul>
      </div>`;
    }

    // Time challenge
    if (reflection.time_challenge) {
      html += `<div class="time-challenge">
        <h3>Time Management Challenge</h3>
        <p>${escapeHtml(reflection.time_challenge)}</p>
      </div>`;
    }

    container.innerHTML = html;
  }

  function exportAll() {
    const data = Storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actionplan-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, renderReflectionContent, exportAll };
})();
