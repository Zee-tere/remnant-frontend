export function readSessionValue(key: string) {
  try {
    const current = window.sessionStorage.getItem(key);
    if (current) return current;

    const legacy = window.localStorage.getItem(key);
    if (!legacy) return null;
    window.sessionStorage.setItem(key, legacy);
    window.localStorage.removeItem(key);
    return legacy;
  } catch {
    return null;
  }
}

export function writeSessionValue(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
    window.localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

export function removeSessionValue(key: string) {
  try {
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
  } catch {
    // Clearing the available storage is sufficient.
  }
}
