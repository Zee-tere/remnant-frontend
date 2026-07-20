type ActivityListener = (activeCount: number) => void;

const listeners = new Set<ActivityListener>();
const active = new Set<number>();
let nextId = 0;

function emit() {
  listeners.forEach((listener) => listener(active.size));
}

export function beginActivity() {
  const id = ++nextId;
  active.add(id);
  emit();
  return id;
}

export function endActivity(id?: number) {
  if (id === undefined) return;
  active.delete(id);
  emit();
}

export function subscribeToActivity(listener: ActivityListener) {
  listeners.add(listener);
  listener(active.size);
  return () => {
    listeners.delete(listener);
  };
}
