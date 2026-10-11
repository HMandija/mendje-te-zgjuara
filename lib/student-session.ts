// Student credentials and pending work belong to this tab, never persistent storage.
const TOKEN = 'mendje-student-session-v2';
const CACHE = 'mendje-student-cache-v2';
const OLD_PICTURE_TOKEN = 'mendje-picture-token';
const validToken = (value: string | null): value is string => !!value && /^[a-f0-9]{64}$/.test(value);

export function purgeLegacyStudentStorage() {
  try {
    const keys = Array.from({length: localStorage.length}, (_, i) => localStorage.key(i));
    for (const key of keys) {
      if (key && (key === 'mendje-student-token' || key === OLD_PICTURE_TOKEN || key.startsWith('mendje-cloud-student-'))) localStorage.removeItem(key);
    }
    // Preserve display preferences and teacher caches, but remove the shared student selection.
    const raw = localStorage.getItem('mendje-v1');
    if (raw) {
      const preferences = JSON.parse(raw);
      if (preferences && typeof preferences === 'object' && 'activeProfile' in preferences) {
        delete preferences.activeProfile;
        localStorage.setItem('mendje-v1', JSON.stringify(preferences));
      }
    }
  } catch { /* Persistent storage can be disabled; it is never an authentication fallback. */ }
}

export function startStudentSession(value: string) {
  purgeLegacyStudentStorage();
  if (!validToken(value)) throw Error('Lidhja e hyrjes nuk është e vlefshme. Hyr me kodin e klasës.');
  if (sessionStorage.getItem(TOKEN) !== value) sessionStorage.removeItem(CACHE);
  sessionStorage.removeItem(OLD_PICTURE_TOKEN);
  sessionStorage.setItem(TOKEN, value);
}

export function getStudentToken(): string {
  purgeLegacyStudentStorage();
  const value = sessionStorage.getItem(TOKEN);
  if (validToken(value)) return value;
  const previous = sessionStorage.getItem(OLD_PICTURE_TOKEN);
  if (validToken(previous)) {
    startStudentSession(previous);
    return previous;
  }
  clearStudentSession();
  return '';
}

export function readStudentCache(): Record<string, unknown> {
  try { return JSON.parse(sessionStorage.getItem(CACHE) || '{}') || {}; }
  catch { return {}; }
}

export function writeStudentCache(expectedToken: string, data: unknown): boolean {
  // Late requests must not recreate data after logout or after changing students.
  if (!expectedToken || sessionStorage.getItem(TOKEN) !== expectedToken) return false;
  sessionStorage.setItem(CACHE, JSON.stringify(data));
  return true;
}

export function clearStudentSession() {
  for (const key of [TOKEN, CACHE, OLD_PICTURE_TOKEN]) {
    try { sessionStorage.removeItem(key); } catch { /* Continue clearing remaining stores. */ }
  }
  purgeLegacyStudentStorage();
}

export async function endStudentSession(revoke: () => Promise<unknown>, leave: () => void) {
  // Clear immediately, including when the network is offline or server revocation fails.
  clearStudentSession();
  try { await revoke(); } catch { /* Server expiry/revocation is independent of device cleanup. */ }
  finally { leave(); }
}
