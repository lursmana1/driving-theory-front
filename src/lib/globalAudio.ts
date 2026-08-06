let currentAudio: HTMLAudioElement | null = null;
let currentId: string | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function stopGlobalAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  currentId = null;
  notifyListeners();
}

export function playGlobalAudio(id: string, audio: HTMLAudioElement) {
  stopGlobalAudio();
  currentAudio = audio;
  currentId = id;
  notifyListeners();
}

export function isGlobalAudioPlaying(id: string) {
  return currentId === id;
}

export function subscribeGlobalAudio(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
