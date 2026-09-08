/* Visibility, Telegram activity and recurring game timers. */
(() => {
  "use strict";
  function create({ window, document, getTelegramApp, setInterval, clearInterval,
    gameTick, tickInterval: GAME_TICK_INTERVAL, saveGame, autoSaveInterval: AUTO_SAVE_INTERVAL,
    recordSessionCloseTimestamp, getTelegramCloudStorage, flushCloudSave,
    checkOfflineEarnings, regenerateEnergy, renderGameplayCountdowns, onResume }) {
    let lifecycleReady = false;
    let gameSuspended = false;
    let gameTickTimer = 0;
    let gameAutoSaveTimer = 0;
    let pageIsHidden = false;
    let telegramIsInactive = getTelegramApp()?.isActive === false;
  
    function persistOnExit(reason = "exit") {
      if (gameSuspended) return reason;
      stopGameTimers();
      /*
         localStorage is synchronous and is the only persistence API safe to
         depend on during beforeunload/pagehide.
      */
      recordSessionCloseTimestamp();
      gameSuspended = true;
  
      /*
         Best effort cloud mirror. visibilitychange normally fires early enough
         for this to complete; pagehide/beforeunload still have the local copy.
      */
      if (getTelegramCloudStorage()) {
        flushCloudSave().catch(() => {});
      }
  
      return reason;
    }
  
    function isGameActive() {
      return !document.hidden && !pageIsHidden && !telegramIsInactive;
    }
  
    function stopGameTimers() {
      if (gameTickTimer) clearInterval(gameTickTimer);
      if (gameAutoSaveTimer) clearInterval(gameAutoSaveTimer);
      gameTickTimer = 0;
      gameAutoSaveTimer = 0;
    }
  
    function startGameTimers() {
      if (!lifecycleReady || gameSuspended || !isGameActive()) return;
      if (!gameTickTimer) gameTickTimer = setInterval(gameTick, GAME_TICK_INTERVAL);
      if (!gameAutoSaveTimer) {
        gameAutoSaveTimer = setInterval(() => {
          if (isGameActive() && !gameSuspended) saveGame("periodic");
        }, AUTO_SAVE_INTERVAL);
      }
    }
  
    function resumeGameClock() {
      if (!lifecycleReady || !gameSuspended || !isGameActive()) return null;
      const result = checkOfflineEarnings();
      regenerateEnergy();
      gameSuspended = false;
      startGameTimers();
      return result;
    }
  
    function synchronizeGameLifecycle(reason) {
      if (!lifecycleReady) return;
      if (!isGameActive()) {
        persistOnExit(reason);
        return;
      }
      const result = resumeGameClock();
      if (!result) return;
      onResume(result);
    }
  
    function initializeGameLifecycle() {
      if (lifecycleReady) return;
      telegramIsInactive = getTelegramApp()?.isActive === false;
      lifecycleReady = true;
      document.addEventListener("visibilitychange", () => {
        synchronizeGameLifecycle("visibility-change");
      });
      window.addEventListener("pagehide", () => {
        pageIsHidden = true;
        synchronizeGameLifecycle("pagehide");
      }, { passive: true });
      window.addEventListener("beforeunload", () => persistOnExit("beforeunload"));
      window.addEventListener("pageshow", () => {
        pageIsHidden = false;
        synchronizeGameLifecycle("pageshow");
      }, { passive: true });
      try {
        getTelegramApp()?.onEvent?.("deactivated", () => {
          telegramIsInactive = true;
          synchronizeGameLifecycle("telegram-deactivated");
        });
        getTelegramApp()?.onEvent?.("activated", () => {
          telegramIsInactive = false;
          synchronizeGameLifecycle("telegram-activated");
        });
      } catch (_) {}
      renderGameplayCountdowns();
      if (isGameActive()) startGameTimers();
      else persistOnExit("startup-inactive");
    }
  
  
    return Object.freeze({ persistOnExit, isGameActive, startGameTimers, stopGameTimers,
      resumeGameClock, synchronizeGameLifecycle, initializeGameLifecycle,
      isSuspended: () => gameSuspended,
      getStatus: () => ({ gameSuspended, lifecycleReady, gameTickTimer, gameAutoSaveTimer }) });
  }
  window.HustleGameLifecycle = Object.freeze({ create });
})();
