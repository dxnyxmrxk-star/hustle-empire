/* Energy regeneration; state, rules and time are supplied by the engine. */
(() => {
  "use strict";
  function create({ state, config: CONFIG, computePlayerStats, recomputeDerivedState,
    baseRegenMultiplier: BASE_ENERGY_REGEN_SPEED_MULTIPLIER, getNow }) {
    function getEnergyIntervalMs() {
      const stats = computePlayerStats(state);
      const totalRegenSpeed =
        Math.max(0.01, Number(stats.energyRegenMultiplier) || 1)
        *
        BASE_ENERGY_REGEN_SPEED_MULTIPLIER;
  
      return (CONFIG.ENERGY_REGEN_INTERVAL_SECONDS * 1000) / totalRegenSpeed;
    }
  
    function regenerateEnergy() {
      const now = getNow();
      recomputeDerivedState();
  
      if (state.energy >= state.maxEnergy) {
        state.energy = state.maxEnergy;
        state.timestamps.lastEnergyAt = now;
        return;
      }
  
      const last = Number(state.timestamps.lastEnergyAt) || now;
      if (last > now) {
        state.timestamps.lastEnergyAt = now;
        return;
      }
      const interval = getEnergyIntervalMs();
      const ticks = Math.floor((now - last) / interval);
      if (ticks <= 0) return;
  
      state.energy = Math.min(state.maxEnergy, state.energy + ticks * CONFIG.ENERGY_REGEN_RATE);
      state.timestamps.lastEnergyAt = state.energy < state.maxEnergy ? last + ticks * interval : now;
    }
  
  
    return Object.freeze({ getEnergyIntervalMs, regenerateEnergy });
  }
  window.HustleGameEnergy = Object.freeze({ create });
})();
