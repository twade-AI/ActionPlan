/**
 * Objectives module — manage strategic objectives.
 */
const Objectives = (() => {
  function render() {
    const list = document.getElementById('objectives-list');
    const objectives = Storage.getObjectives();

    if (objectives.length === 0) {
      list.innerHTML = '<p class="history-empty">No objectives yet. Add your strategic priorities above.</p>';
      return;
    }

    list.innerHTML = objectives.map((obj, i) => `
      <div class="objective-item" data-index="${i}">
        <span class="objective-text">${escapeHtml(obj)}</span>
        <button class="btn-remove" data-index="${i}" title="Remove">&times;</button>
      </div>
    `).join('');

    list.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        removeObjective(idx);
      });
    });
  }

  function addObjective(text) {
    if (!text.trim()) return;
    const objectives = Storage.getObjectives();
    objectives.push(text.trim());
    Storage.setObjectives(objectives);
    render();
  }

  function removeObjective(index) {
    const objectives = Storage.getObjectives();
    objectives.splice(index, 1);
    Storage.setObjectives(objectives);
    render();
  }

  function getAll() {
    return Storage.getObjectives();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, addObjective, getAll };
})();
