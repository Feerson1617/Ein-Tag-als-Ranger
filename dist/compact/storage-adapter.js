// Application-owned storage only. Select before accessing any browser storage.
export const CLASSROOM_NOTICE = 'Deine Beobachtungen und Antworten bleiben erhalten, solange dieses Spiel geöffnet ist. Beim Schließen oder Neuladen beginnt eine neue Sitzung. Halte wichtige Ergebnisse auf deinem Arbeitsblatt fest.';
export function createJournalStorage(host) {
  const classroomMode = host.SCORM_CONTEXT?.classroomMode === true;
  if (classroomMode) {
    const memory = new Map();
    return { classroomMode, storage: {
      getItem: key => memory.get(String(key)) ?? null,
      setItem: (key, value) => memory.set(String(key), String(value))
    } };
  }
  let storage = null;
  try { storage = host.localStorage; } catch { /* Existing journal recovery message. */ }
  return { classroomMode, storage };
}
