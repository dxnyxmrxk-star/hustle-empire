/* Local snapshots and backups; dependencies are supplied by the game engine. */
(() => {
  "use strict";
  function create({ storage: localStorage, saveKey: SAVE_KEY, backupKey: SAVE_BACKUP_KEY,
    metaKey: SAVE_META_KEY, legacyKeys: LEGACY_SAVE_KEYS, defaultState: DEFAULT_STATE,
    clone, parseSavedState, prepareLoadedState, migrateSavedSnapshot,
    isWriteBlocked, onSaved, warn }) {
    function readLocalSaveCandidate(key) {
      try {
        const raw = localStorage.getItem(key);
        const parsed = parseSavedState(raw);
        return parsed ? { key, raw, ...parsed } : null;
      } catch (_) {
        return null;
      }
    }
  
    function loadBestLocalSave() {
      const candidates = [
        readLocalSaveCandidate(SAVE_KEY),
        readLocalSaveCandidate(SAVE_BACKUP_KEY),
        ...LEGACY_SAVE_KEYS.map(readLocalSaveCandidate)
      ].filter(Boolean);
  
      if (!candidates.length) {
        return {
          state: clone(DEFAULT_STATE),
          updatedAt: 0,
          source: "default"
        };
      }
  
      candidates.sort((a, b) => b.updatedAt - a.updatedAt);
      for (const candidate of candidates) {
        try {
          return {
            state: prepareLoadedState(candidate),
            updatedAt: candidate.updatedAt,
            source: candidate.key
          };
        } catch (error) {
          warn(
            "[Hustle Empire] Local save rejected; trying the next backup:",
            candidate.key,
            error
          );
        }
      }
  
      return {
        state: clone(DEFAULT_STATE),
        updatedAt: 0,
        source: "default"
      };
    }
  
    function writeLocalSnapshot(envelope) {
      if (isWriteBlocked()) return false;
      let serialized;
      let current;
      try {
        migrateSavedSnapshot(envelope);
        serialized = JSON.stringify(envelope);
        current = localStorage.getItem(SAVE_KEY);
      } catch (error) {
        warn("[Hustle Empire] Local snapshot could not be prepared:", error);
        return false;
      }
      const validCurrent = current ? parseSavedState(current) : null;
      if (isWriteBlocked()) return false;
      if (validCurrent) {
        try {
          localStorage.setItem(
            SAVE_BACKUP_KEY,
            current
          );
        } catch (error) {
          // Backup/metadata failure must not prevent a usable primary write.
          warn("[Hustle Empire] Backup write failed:", error);
        }
      }
      try {
        localStorage.setItem(
          SAVE_KEY,
          serialized
        );
      } catch (error) {
        warn("[Hustle Empire] Local save failed:", error);
        return false;
      }
      onSaved(envelope.updatedAt);
      try {
        localStorage.setItem(
          SAVE_META_KEY,
          JSON.stringify({
            schema: envelope.schema,
            updatedAt: envelope.updatedAt,
            appVersion: envelope.appVersion
          })
        );
  
      } catch (error) {
        warn("[Hustle Empire] Save metadata write failed:", error);
      }
      return true;
    }
  
  
    return Object.freeze({ loadBestLocalSave, writeLocalSnapshot });
  }
  window.HustleLocalSave = Object.freeze({ create });
})();
