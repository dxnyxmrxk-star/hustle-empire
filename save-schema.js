/* Save format validation and migrations. No DOM, storage or gameplay writes. */
(() => {
  "use strict";
  const SAVE_SCHEMA_VERSION = 2;

  // Dependencies are supplied by the engine after its defaults are initialized.
  function create({ defaultState: DEFAULT_STATE, clone, readPersistedCharacterGender,
    defaultGender: DEFAULT_CHARACTER_GENDER, onUnsupportedSchema }) {
    function isSaveRecord(value) {
      return value !== null && typeof value === "object" && !Array.isArray(value);
    }
  
    function validateSaveTree(value, depth = 0) {
      if (depth > 40) throw new Error("Save nesting limit exceeded");
      if (typeof value === "number" && !Number.isFinite(value)) {
        throw new Error("Non-finite save value");
      }
      if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
          if (["__proto__", "constructor", "prototype"].includes(key)) {
            throw new Error("Invalid save property");
          }
          validateSaveTree(child, depth + 1);
        }
      }
    }
  
    function validateKnownSaveFields(template, source) {
      for (const [key, expected] of Object.entries(template)) {
        const value = source[key];
        if (value === undefined || value === null) continue;
        if (typeof expected === "number") {
          if (
            !["number", "string"].includes(typeof value)
            || (typeof value === "string" && !value.trim())
            || !Number.isFinite(Number(value))
          ) throw new Error(`Invalid numeric save field: ${key}`);
        } else if (isSaveRecord(expected)) {
          if (!isSaveRecord(value)) throw new Error(`Invalid save section: ${key}`);
          validateKnownSaveFields(expected, value);
        }
      }
    }
  
    function validateSavedState(source) {
      if (
        !isSaveRecord(source)
        || !["money", "level"].some((key) => Object.prototype.hasOwnProperty.call(source, key))
      ) throw new Error("Unrecognized game save");
      validateSaveTree(source);
      validateKnownSaveFields(DEFAULT_STATE, source);
    }
  
    const SAVE_MIGRATIONS = Object.freeze({
      0(snapshot) {
        // Plain legacy states gain the envelope timestamp without new rewards.
        snapshot.state.timestamps ||= {};
        snapshot.state.timestamps.lastSaveAt ||= snapshot.updatedAt;
        return { ...snapshot, schema: 1 };
      },
      1(snapshot) {
        const source = snapshot.state;
        const gender = readPersistedCharacterGender(source) ?? DEFAULT_CHARACTER_GENDER;
        const selected = Boolean(
          source.profile?.hasSelectedGender ?? source.hasSelectedGender
          ?? source.profile?.characterSelected ?? source.characterSelected ?? false
        );
        source.profile ||= {};
        source.profile.characterGender = gender;
        source.gender = gender;
        source.profile.hasSelectedGender = selected;
        source.profile.characterSelected = selected;
        delete source.profile.gender;
        delete source.hasSelectedGender;
        delete source.characterSelected;
        return { ...snapshot, schema: 2 };
      }
    });
  
    function migrateSavedSnapshot(snapshot) {
      const schema = snapshot.schema;
      if (!Number.isInteger(schema) || schema < 0) throw new Error("Invalid save schema");
      if (schema > SAVE_SCHEMA_VERSION) {
        onUnsupportedSchema(schema);
        throw new Error("Unsupported future save schema");
      }
      if (!Number.isFinite(snapshot.updatedAt) || snapshot.updatedAt < 0) {
        throw new Error("Invalid save timestamp");
      }
      validateSavedState(snapshot.state);
      let migrated = { ...snapshot, state: clone(snapshot.state) };
      while (migrated.schema < SAVE_SCHEMA_VERSION) {
        const migration = SAVE_MIGRATIONS[migrated.schema];
        if (!migration) throw new Error("Missing save migration");
        migrated = migration(migrated);
      }
      validateSavedState(migrated.state);
      return migrated;
    }
  
    function parseSavedState(raw) {
      if (!raw) return null;
  
      try {
        const parsed = JSON.parse(raw);
  
        if (!isSaveRecord(parsed)) return null;
        const envelope = Object.prototype.hasOwnProperty.call(parsed, "state");
        const source = envelope ? parsed.state : parsed;
        const rawSchema = envelope ? (parsed.schema ?? 1) : 0;
        if (!["number", "string"].includes(typeof rawSchema)) return null;
        if (typeof rawSchema === "string" && !rawSchema.trim()) return null;
        const rawTimestamp = (envelope ? parsed.updatedAt : undefined)
          ?? source?.timestamps?.lastSaveAt ?? 0;
        if (
          !["number", "string"].includes(typeof rawTimestamp)
          || !Number.isFinite(Number(rawTimestamp)) || Number(rawTimestamp) < 0
        ) return null;
        return migrateSavedSnapshot({
          state: source,
          updatedAt: Number(rawTimestamp),
          schema: Number(rawSchema)
        });
      } catch (error) {
        return null;
      }
    }
  
  
    return Object.freeze({ validateSavedState, migrateSavedSnapshot, parseSavedState });
  }

  window.HustleSaveSchema = Object.freeze({ schemaVersion: SAVE_SCHEMA_VERSION, create });
})();
