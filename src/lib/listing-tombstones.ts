const STORAGE_KEY = 'remnant-deleted-listings';
const MAX_RECORDS = 80;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1_000;

type Tombstones = Record<string, number>;

function readTombstones(): Tombstones {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as Tombstones;
    const cutoff = Date.now() - MAX_AGE_MS;
    return Object.fromEntries(Object.entries(parsed).filter(([, deletedAt]) => Number(deletedAt) >= cutoff));
  } catch {
    return {};
  }
}

export function isListingTombstoned(id: string) {
  return Boolean(readTombstones()[id]);
}

export function rememberDeletedListing(id: string) {
  if (typeof window === 'undefined') return;
  const entries = Object.entries({ ...readTombstones(), [id]: Date.now() })
    .sort((left, right) => right[1] - left[1])
    .slice(0, MAX_RECORDS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // The in-page event still removes the card when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent('remnant:listing-deleted', { detail: { id } }));
}

export function isListingTombstoneStorageEvent(event: StorageEvent) {
  return event.key === STORAGE_KEY;
}
