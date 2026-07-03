import { HISTORY_KEY, IDEAS_KEY, MAX_HISTORY, SETTINGS_KEY, DEFAULT_SETTINGS } from './constants';

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error leyendo historial', err);
    return [];
  }
}

export function addToHistory(entry) {
  const current = getHistory();
  const next = [entry, ...current].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function removeFromHistory(id) {
  const current = getHistory();
  const next = current.filter((item) => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  return [];
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error leyendo settings', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getSavedIdeas() {
  try {
    const raw = localStorage.getItem(IDEAS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveIdeas(ideas) {
  localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas.slice(0, 5)));
}

export function clearIdeas() {
  localStorage.removeItem(IDEAS_KEY);
}
