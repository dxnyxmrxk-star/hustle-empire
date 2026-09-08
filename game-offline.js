/* Pending offline rewards, claim timestamps and one-time collection. */
(() => {
  "use strict";
  function create({ state, storage: localStorage, claimStorageKey: OFFLINE_LAST_CLAIM_STORAGE_KEY,
    capSeconds: OFFLINE_EARNINGS_CAP_SECONDS, sanitizeOfflineEarnings,
    getTotalPassiveIncomePerSecond, processPassiveIncome, registerMoneyEarned,
    saveGame, hideOfflineEarningsModal, onClaimed, emitGameEvent, getNow, warn }) {
    function readLastClaimTime() {
      let stored = 0;
      try {
        stored = Number(localStorage.getItem(OFFLINE_LAST_CLAIM_STORAGE_KEY)) || 0;
      } catch (_) {}
  
      return (
        stored
        ||
        Number(state.timestamps?.lastClaimTime)
        ||
        Number(state.timestamps?.lastSaveAt)
        ||
        getNow()
      );
    }
  
    function persistLastClaimTime(timestamp = getNow()) {
      const safeTimestamp = Math.max(0, Number(timestamp) || getNow());
      state.timestamps ||= {};
      state.timestamps.lastClaimTime = safeTimestamp;
  
      try {
        localStorage.setItem(
          OFFLINE_LAST_CLAIM_STORAGE_KEY,
          String(safeTimestamp)
        );
      } catch (error) {
        warn("[Hustle Empire] lastClaimTime save failed:", error);
      }
  
      return safeTimestamp;
    }
  
    function getPendingOfflineEarnings() {
      state.offlineEarnings = sanitizeOfflineEarnings(state.offlineEarnings);
      return state.offlineEarnings;
    }
  
    function clearPendingOfflineEarnings() {
      state.offlineEarnings = {
        pendingAmount: 0,
        elapsedSeconds: 0,
        cappedSeconds: 0,
        wasCapped: false,
        calculatedAt: 0
      };
    }
  
    /*
       Calculates the reward ONCE and stores it as pending.
       Temporary Level-Up boosts are deliberately excluded from the offline
       formula so a 3/5/10 minute boost cannot be stretched to three hours.
       Permanent Card/Wardrobe/Business multipliers still apply.
    */
    function checkOfflineEarnings() {
      const now = getNow();
      const existingPending = getPendingOfflineEarnings();
  
      /*
         If the player closed Telegram before claiming, keep the exact reward
         previously calculated instead of recalculating it with newer upgrades.
      */
      if (existingPending.pendingAmount > 0) {
        state.timestamps.lastIncomeAt = now;
        return { ...existingPending };
      }
  
      // lastIncomeAt is the boundary already paid by active ticks. It also
      // survives an abrupt close where no exit event was delivered.
      const lastClaimTime = Math.max(
        readLastClaimTime(),
        Number(state.timestamps.lastIncomeAt) || 0
      );
      const elapsedSeconds = Math.max(
        0,
        Math.floor((now - lastClaimTime) / 1000)
      );
      const cappedSeconds = Math.min(
        OFFLINE_EARNINGS_CAP_SECONDS,
        elapsedSeconds
      );
      const wasCapped = elapsedSeconds > OFFLINE_EARNINGS_CAP_SECONDS;
  
      const incomePerSecond = Math.max(
        0,
        getTotalPassiveIncomePerSecond({ includeLevelUpBoost: false, includeLeaderboardBoost: false })
      );
  
      const pendingAmount = Math.max(
        0,
        incomePerSecond * cappedSeconds
      );
  
      /*
         Prevent processPassiveIncome() from paying the same offline interval a
         second time when the normal 1-second game tick starts.
      */
      state.timestamps.lastIncomeAt = now;
  
      if (pendingAmount <= 0) {
        clearPendingOfflineEarnings();
  
        /*
           Important anti-exploit rule:
           if income is currently zero, start a fresh accumulation window now.
           Otherwise a player could wait 3h with no Business, buy one, reload
           and receive 3h at the new income rate.
        */
        persistLastClaimTime(now);
        saveGame();
        return {
          pendingAmount: 0,
          elapsedSeconds,
          cappedSeconds,
          wasCapped,
          calculatedAt: now
        };
      }
  
      state.offlineEarnings = {
        pendingAmount,
        elapsedSeconds,
        cappedSeconds,
        wasCapped,
        calculatedAt: now
      };
  
      saveGame();
      return { ...state.offlineEarnings };
    }
  
    function claimOfflineEarnings() {
      const pending = getPendingOfflineEarnings();
      const amount = Math.max(0, Number(pending.pendingAmount) || 0);
  
      if (amount <= 0) {
        hideOfflineEarningsModal();
        persistLastClaimTime(getNow());
        saveGame();
        return 0;
      }
  
      const now = getNow();
  
      processPassiveIncome();
      state.money += amount;
      registerMoneyEarned(
        amount,
        "offlineIncome",
        { save: false, render: false }
      );
  
      clearPendingOfflineEarnings();
      persistLastClaimTime(now);
      state.timestamps.lastIncomeAt = now;
  
      saveGame();
      hideOfflineEarningsModal();
      onClaimed(amount);
  
      emitGameEvent("offlineEarningsClaimed", {
        amount,
        claimedAt: now
      });
  
      return amount;
    }
  
  
    return Object.freeze({ readLastClaimTime, persistLastClaimTime, getPendingOfflineEarnings,
      clearPendingOfflineEarnings, checkOfflineEarnings, claimOfflineEarnings });
  }
  window.HustleGameOffline = Object.freeze({ create });
})();
