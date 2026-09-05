/* ============================================================
   HUSTLE EMPIRE — UI CONTROLLER V9
   Navigation, Telegram shell, static i18n and generic modal
============================================================ */

(() => {
  "use strict";

  const SCREENS = ["home", "city", "cases", "collection", "wardrobe", "shop"];
  const DEFAULT_LANGUAGE = "en";
  const SUPPORTED_LANGUAGES = ["en", "ru"];

  let activeScreen = "home";
  let currentLanguage = DEFAULT_LANGUAGE;

  function syncTelegramViewport() {
    const tg = window.Telegram?.WebApp;
    const rawHeight = Number(tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight || 0);
    if (rawHeight > 0) {
      document.documentElement.style.setProperty("--tg-viewport-height", `${Math.round(rawHeight)}px`);
    }
  }

  function initTelegram() {
    const tg = window.Telegram?.WebApp;

    syncTelegramViewport();
    window.addEventListener("resize", syncTelegramViewport, { passive: true });
    window.addEventListener("orientationchange", () => setTimeout(syncTelegramViewport, 80), { passive: true });

    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      syncTelegramViewport();
      if (typeof tg.disableVerticalSwipes === "function") tg.disableVerticalSwipes();
      if (typeof tg.onEvent === "function") tg.onEvent("viewportChanged", syncTelegramViewport);
    } catch (error) {
      console.warn("[Hustle Empire] Telegram:", error);
    }
  }

  function getTelegramLanguage() {
    try {
      const code = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
      const lang = String(code || "").toLowerCase().split("-")[0];
      return SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  }

  function interpolate(text, params = {}) {
    if (typeof text !== "string") return text;
    return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) =>
      params[key] !== undefined ? String(params[key]) : match
    );
  }

  function getTranslation(key, params = {}, language = currentLanguage) {
    const locale = window.LOCALES?.[language];
    if (!locale) return key;
    const result = key.split(".").reduce((value, part) => value?.[part], locale);
    return typeof result === "string" ? interpolate(result, params) : key;
  }

  function translatePage() {
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = getTranslation(element.dataset.i18n);
    });

    const languageButton = document.getElementById("language-switch");
    if (languageButton) languageButton.textContent = currentLanguage === "ru" ? "EN" : "RU";
  }

  function setLanguage(language) {
    currentLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
    localStorage.setItem("hustleEmpireLanguage", currentLanguage);
    translatePage();

    window.dispatchEvent(new CustomEvent("hustle:languageChanged", {
      detail: { language: currentLanguage }
    }));
  }

  function initLanguage() {
    const saved = localStorage.getItem("hustleEmpireLanguage");
    currentLanguage = SUPPORTED_LANGUAGES.includes(saved) ? saved : getTelegramLanguage();

    document.getElementById("language-switch")?.addEventListener("click", () => {
      setLanguage(currentLanguage === "ru" ? "en" : "ru");
    });

    translatePage();
  }

  function setScreen(screenName, options = {}) {
    if (!SCREENS.includes(screenName)) screenName = "home";
    activeScreen = screenName;

    document.querySelectorAll("[data-screen]").forEach((screen) => {
      screen.classList.toggle("active", screen.dataset.screen === screenName);
    });

    document.querySelectorAll("[data-nav]").forEach((button) => {
      button.classList.toggle("active", button.dataset.nav === screenName);
    });

    if (options.scroll !== false) {
      const scroller = document.querySelector(".screen-content");
      scroller?.scrollTo({ top: 0, left: 0, behavior: options.instant ? "auto" : "smooth" });
    }

    window.dispatchEvent(new CustomEvent("hustle:tabChanged", { detail: { tab: screenName } }));
  }

  function initNavigation() {
    document.querySelectorAll("[data-nav]").forEach((button) => {
      button.addEventListener("click", () => setScreen(button.dataset.nav));
    });
    setScreen("home", { scroll: false, instant: true });
  }

  function showModal(title, message, icon = "◆") {
    const modal = document.getElementById("game-modal");
    if (!modal) return;
    modal.querySelector("#game-modal-title").textContent = title;
    modal.querySelector("#game-modal-message").textContent = message;
    modal.querySelector(".game-modal-icon").textContent = icon;
    modal.hidden = false;
  }

  function closeModal() {
    const modal = document.getElementById("game-modal");
    if (modal) modal.hidden = true;
  }

  function initImageFallbacks() {
    document.querySelectorAll("img").forEach((image) => {
      const fail = () => image.classList.add("is-missing");
      image.addEventListener("error", fail);
      if (image.complete && image.naturalWidth === 0) fail();
    });
  }

  function formatTimer(seconds) {
    seconds = Math.max(0, Math.floor(Number(seconds) || 0));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  }

  function initDailyTimer() {
    document.querySelectorAll("[data-countdown]").forEach((timer) => {
      let remaining = Number(timer.dataset.countdown) || 0;
      timer.textContent = formatTimer(remaining);
      setInterval(() => {
        if (remaining > 0) remaining -= 1;
        timer.textContent = formatTimer(remaining);
      }, 1000);
    });
  }

  function requestPurchase(detail) {
    window.dispatchEvent(new CustomEvent("hustle:purchaseRequested", { detail }));
  }

  function handleStaticAction(element) {
    switch (element.dataset.action) {
      case "notifications":
        showModal(getTranslation("modal.notifications"), getTranslation("modal.notificationsText"), "🔔");
        break;
      case "settings":
        showModal(getTranslation("modal.settings"), getTranslation("modal.settingsText"), "☰");
        break;
      case "daily-chest":
        showModal(getTranslation("modal.dailyChest"), getTranslation("modal.dailyChestText"), "🎁");
        break;
      case "offline-income":
        showModal(getTranslation("modal.offline"), getTranslation("modal.offlineText"), "💰");
        break;
      case "next-level":
        showModal(getTranslation("modal.levelUp"), getTranslation("modal.levelUpText"), "⬆");
        break;
      case "set-bonus":
        showModal(getTranslation("modal.setBonus"), getTranslation("modal.setBonusText"), "▣");
        break;
      case "shop-premium-case":
        setScreen("cases");
        break;
      case "shop-outfit":
        setScreen("wardrobe");
        break;
      case "buy-boost":
        requestPurchase({ type: "boost", productId: element.dataset.product, currency: "gems" });
        showModal(getTranslation("shop.boosts"), getTranslation("modal.premiumPlaceholder"), "⚡");
        break;
      case "buy-gem-pack":
        requestPurchase({ type: "gems", gems: Number(element.dataset.gems) || 0 });
        showModal(getTranslation("shop.gems"), getTranslation("modal.premiumPlaceholder"), "♦");
        break;
      case "shop-bundle":
        requestPurchase({ type: "bundle", productId: "hustleBundle" });
        showModal(getTranslation("shop.hustleBundle"), getTranslation("modal.premiumPlaceholder"), "📦");
        break;
      case "buy-empire-pass":
        requestPurchase({ type: "empire-pass", stars: window.GAME_CONFIG?.SHOP_PRICES?.HUSTLE_PASS_MONTHLY || 250 });
        showModal(getTranslation("shop.empirePass"), getTranslation("modal.premiumPlaceholder"), "♛");
        break;
    }
  }

  function initActions() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-modal-close]")) {
        closeModal();
        return;
      }

      const action = event.target.closest("[data-action]");
      if (action) handleStaticAction(action);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  window.HustleTabs = {
    setActiveTab: setScreen,
    getActiveTab: () => activeScreen
  };

  window.HustleShop = {
    setTab(tab) {
      if (tab === "cases") setScreen("cases");
      else if (tab === "skins") setScreen("wardrobe");
      else setScreen("shop");
    },
    showModal,
    closeModal
  };

  window.i18n = {
    t: getTranslation,
    setLanguage,
    getLanguage: () => currentLanguage
  };

  function init() {
    initTelegram();
    initLanguage();
    initImageFallbacks();
    initNavigation();
    initActions();
    initDailyTimer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
