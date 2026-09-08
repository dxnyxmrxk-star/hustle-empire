/* Telegram cloud snapshots. Storage access and save validation are injected. */
(() => {
  "use strict";
  function create({ getCloudStorage, parseSavedState, migrateSavedSnapshot,
    isWriteBlocked, onSaved, warn }) {
    /*
       Keep the legacy cloud namespace readable. New writes alternate two
       bounded slots; tagged chunks and a final manifest reject partial saves.
    */
    const TELEGRAM_CLOUD_SAVE_PREFIX = "urbanTycoon_v19_1";
    const TELEGRAM_CLOUD_META_KEY = `${TELEGRAM_CLOUD_SAVE_PREFIX}_meta`;
    const CLOUD_SLOT_CHUNK_SIZE = 1500;
    const CLOUD_SLOT_MAX_CHUNKS = 128;
    let cloudSlotsReady = false;
    let lastCloudSlot = null;
    let cloudGenerationCounter = 0;
  
    function getTelegramCloudStorage() {
      const cloudStorage =
        getCloudStorage();
  
      return (
        cloudStorage
        && typeof cloudStorage.getItem === "function"
        && typeof cloudStorage.setItem === "function"
      )
        ? cloudStorage
        : null;
    }
  
    function cloudGetItem(key, strict = false) {
      const cloudStorage = getTelegramCloudStorage();
      if (!cloudStorage) return Promise.resolve("");
  
      return new Promise((resolve, reject) => {
        try {
          cloudStorage.getItem(key, (error, value) => {
            if (error) {
              if (strict) {
                reject(error);
                return;
              }
              warn(
                "[Urban Tycoon] Telegram CloudStorage getItem failed:",
                error
              );
              resolve("");
              return;
            }
  
            resolve(String(value || ""));
          });
        } catch (error) {
          if (strict) {
            reject(error);
            return;
          }
          warn(
            "[Urban Tycoon] Telegram CloudStorage getItem exception:",
            error
          );
          resolve("");
        }
      });
    }
  
    function cloudSetItem(key, value) {
      const cloudStorage = getTelegramCloudStorage();
      if (!cloudStorage) return Promise.resolve(false);
  
      return new Promise((resolve) => {
        try {
          cloudStorage.setItem(
            key,
            String(value),
            (error, success) => {
              if (error) {
                warn(
                  "[Urban Tycoon] Telegram CloudStorage setItem failed:",
                  error
                );
                resolve(false);
                return;
              }
  
              resolve(success !== false);
            }
          );
        } catch (error) {
          warn(
            "[Urban Tycoon] Telegram CloudStorage setItem exception:",
            error
          );
          resolve(false);
        }
      });
    }
  
    function cloudPayloadChecksum(value) {
      // Accidental corruption detection, not payment/anti-cheat validation.
      let hash = 2166136261;
      for (let index = 0; index < value.length; index += 1) {
        hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
      }
      return (hash >>> 0).toString(16).padStart(8, "0");
    }
  
    function cloudSlotPrefix(slot) {
      return `${TELEGRAM_CLOUD_SAVE_PREFIX}_atomic_${slot}`;
    }
  
    async function readCloudSlot(slot) {
      const prefix = cloudSlotPrefix(slot);
      const rawMeta = await cloudGetItem(`${prefix}_meta`, true);
      if (!rawMeta) return null;
      let meta;
      try { meta = JSON.parse(rawMeta); } catch (_) { return null; }
      if (
        meta?.format !== 1
        || typeof meta.generation !== "string"
        || !meta.generation || meta.generation.length > 100
        || !Number.isInteger(meta.chunks)
        || meta.chunks < 1 || meta.chunks > CLOUD_SLOT_MAX_CHUNKS
        || !Number.isInteger(meta.length) || meta.length < 1
        || meta.length > CLOUD_SLOT_MAX_CHUNKS * CLOUD_SLOT_CHUNK_SIZE
        || !Number.isFinite(meta.updatedAt) || meta.updatedAt < 0
        || typeof meta.checksum !== "string"
      ) return null;
  
      const chunks = [];
      for (let index = 0; index < meta.chunks; index += 1) {
        const raw = await cloudGetItem(`${prefix}_${index}`, true);
        let chunk;
        try { chunk = JSON.parse(raw); } catch (_) { return null; }
        if (
          chunk?.generation !== meta.generation || chunk.index !== index
          || typeof chunk.data !== "string"
          || chunk.data.length > CLOUD_SLOT_CHUNK_SIZE
        ) return null;
        chunks.push(chunk.data);
      }
      const serialized = chunks.join("");
      if (
        serialized.length !== meta.length
        || cloudPayloadChecksum(serialized) !== meta.checksum
        || await cloudGetItem(`${prefix}_meta`, true) !== rawMeta
      ) return null;
      const parsed = parseSavedState(serialized);
      if (
        !parsed || !parsed.state || typeof parsed.state !== "object"
        || Array.isArray(parsed.state) || parsed.updatedAt !== meta.updatedAt
      ) return null;
      return { ...parsed, cloudSlot: slot };
    }
  
    async function writeTelegramCloudSnapshot(envelope) {
      if (isWriteBlocked()) return false;
      try { migrateSavedSnapshot(envelope); } catch (_) { return false; }
      if (!getTelegramCloudStorage()) return false;
      if (!cloudSlotsReady) await readTelegramCloudSnapshot();
      // A failed read is not evidence that a slot is empty. Retry later rather
      // than choosing a destination that might hold the only complete save.
      if (!cloudSlotsReady || isWriteBlocked()) return false;
  
      const serialized = JSON.stringify(envelope);
      const slot = lastCloudSlot === "a" ? "b" : "a";
      const prefix = cloudSlotPrefix(slot);
      const generation = `${Date.now().toString(36)}_${(++cloudGenerationCounter).toString(36)}_${Math.random().toString(36).slice(2)}`;
      const chunks = [];
      for (let offset = 0; offset < serialized.length; offset += CLOUD_SLOT_CHUNK_SIZE) {
        chunks.push(JSON.stringify({
          generation,
          index: chunks.length,
          data: serialized.slice(offset, offset + CLOUD_SLOT_CHUNK_SIZE)
        }));
      }
      if (
        !chunks.length || chunks.length > CLOUD_SLOT_MAX_CHUNKS
        || chunks.some((chunk) => chunk.length > 4096)
      ) return false;
  
      for (let index = 0; index < chunks.length; index += 1) {
        const success = await cloudSetItem(
          `${prefix}_${index}`,
          chunks[index]
        );
  
        if (!success) return false;
      }
  
      /*
         The other slot stays intact throughout this upload. Old metadata in
         this slot cannot validate new chunks because their generation differs.
      */
      const meta = {
        format: 1,
        generation,
        updatedAt: envelope.updatedAt,
        chunks: chunks.length,
        length: serialized.length,
        checksum: cloudPayloadChecksum(serialized)
      };
  
      const metaSaved = await cloudSetItem(
        `${prefix}_meta`,
        JSON.stringify(meta)
      );
  
      if (metaSaved) {
        lastCloudSlot = slot;
        onSaved(envelope.updatedAt);
      }
  
      return metaSaved;
    }
  
    async function readLegacyTelegramCloudSnapshot() {
      if (!getTelegramCloudStorage()) return null;
  
      const rawMeta = await cloudGetItem(
        TELEGRAM_CLOUD_META_KEY
      );
  
      if (!rawMeta) return null;
  
      let meta;
  
      try {
        meta = JSON.parse(rawMeta);
      } catch (_) {
        return null;
      }
  
      const chunkCount = Math.max(
        0,
        Math.min(64, Math.floor(Number(meta?.chunks) || 0))
      );
  
      if (!chunkCount) return null;
  
      const chunks = [];
  
      for (let index = 0; index < chunkCount; index += 1) {
        const chunk = await cloudGetItem(
          `${TELEGRAM_CLOUD_SAVE_PREFIX}_${index}`
        );
  
        if (!chunk) return null;
        chunks.push(chunk);
      }
  
      const serialized = chunks.join("");
  
      if (
        Number(meta.length) > 0
        && serialized.length !== Number(meta.length)
      ) {
        warn(
          "[Urban Tycoon] Telegram cloud save length mismatch."
        );
        return null;
      }
  
      const parsed = parseSavedState(serialized);
      if (!parsed) return null;
  
      return {
        ...parsed,
        updatedAt:
          Math.max(
            parsed.updatedAt,
            Number(meta.updatedAt) || 0
          )
      };
    }
  
    async function readTelegramCloudSnapshot() {
      if (!getTelegramCloudStorage()) return null;
      cloudSlotsReady = false;
      try {
        const slots = (await Promise.all([
          readCloudSlot("a"),
          readCloudSlot("b")
        ])).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
        lastCloudSlot = slots[0]?.cloudSlot || null;
        const legacy = await readLegacyTelegramCloudSnapshot();
        cloudSlotsReady = true;
        return [...slots, legacy].filter(Boolean)
          .sort((a, b) => b.updatedAt - a.updatedAt)[0] || null;
      } catch (error) {
        warn("[Hustle Empire] Cloud restore unavailable; keeping local save:", error);
        return null;
      }
    }
  
  
    return Object.freeze({ getTelegramCloudStorage, readTelegramCloudSnapshot, writeTelegramCloudSnapshot });
  }
  window.HustleCloudSave = Object.freeze({ create });
})();
