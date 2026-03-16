/**
 * Storage module — all data stays in localStorage.
 * No server, no cookies, no tracking.
 */
const Storage = (() => {
  const KEYS = {
    API_KEY: 'actionplan_api_key',
    OBJECTIVES: 'actionplan_objectives',
    REFLECTIONS: 'actionplan_reflections',
  };

  function get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  // API Key
  function getApiKey() {
    return localStorage.getItem(KEYS.API_KEY) || '';
  }

  function setApiKey(key) {
    localStorage.setItem(KEYS.API_KEY, key);
  }

  // Objectives
  function getObjectives() {
    return get(KEYS.OBJECTIVES) || [];
  }

  function setObjectives(objectives) {
    set(KEYS.OBJECTIVES, objectives);
  }

  // Reflections
  function getReflections() {
    return get(KEYS.REFLECTIONS) || [];
  }

  function saveReflection(reflection) {
    const reflections = getReflections();
    reflections.unshift(reflection);
    set(KEYS.REFLECTIONS, reflections);
  }

  function deleteReflection(id) {
    const reflections = getReflections().filter(r => r.id !== id);
    set(KEYS.REFLECTIONS, reflections);
  }

  function clearAll() {
    remove(KEYS.OBJECTIVES);
    remove(KEYS.REFLECTIONS);
  }

  function exportAll() {
    return {
      objectives: getObjectives(),
      reflections: getReflections(),
      exportedAt: new Date().toISOString(),
    };
  }

  return {
    getApiKey, setApiKey,
    getObjectives, setObjectives,
    getReflections, saveReflection, deleteReflection,
    clearAll, exportAll,
  };
})();
