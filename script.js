/* ============================================================
   HUSTLE EMPIRE — APPLICATION SHELL
   Version 21.0

   Responsibilities:
   - Telegram Mini App bootstrap
   - Telegram viewport / safe-area synchronization
   - Primary screen navigation
   - Generic fallback modal
   - Static shop actions
   - Image fallbacks
   - Lightweight countdowns
   - Runtime diagnostics

   IMPORTANT:
   translations.js owns window.i18n.
   game.js owns gameplay/state/persistence.
============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     CONFIGURATION
  ========================================================== */

  const APP_NAME = "Hustle Empire";
  const APP_VERSION = "21.0";

  const PRIMARY_SCREENS = Object.freeze([
    "home",
    "city",
    "cases",
    "collection",
    "wardrobe",
    "shop"
  ]);

  const DEFAULT_SCREEN = "home";

  /* ==========================================================
     INTERNAL STATE
  ========================================================== */

  let activeScreen = DEFAULT_SCREEN;

  let screenScroller = null;

  let pendingScrollFrame = 0;

  let genericModalReturnFocus = null;

  const screenElements = new Map();

  const navigationElements = new Map();

  const screenScrollPositions =
    Object.create(null);

  const countdownDeadlines =
    new WeakMap();

  const diagnostics = [];

  const MAX_DIAGNOSTICS = 50;

  /* ==========================================================
     UTILITIES
  ========================================================== */

  function pushDiagnostic(
    type,
    message,
    detail = null
  ) {
    diagnostics.push({
      time: new Date().toISOString(),
      type,
      message: String(message || ""),
      detail
    });

    if (
      diagnostics.length >
      MAX_DIAGNOSTICS
    ) {
      diagnostics.splice(
        0,
        diagnostics.length -
        MAX_DIAGNOSTICS
      );
    }
  }

  function setCssVariable(
    name,
    value
  ) {
    if (!name) {
      return;
    }

    document.documentElement
      .style
      .setProperty(
        name,
        String(value ?? "")
      );
  }

  function numberOrZero(
    value
  ) {
    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  function px(
    value
  ) {
    return `${Math.max(
      0,
      Math.round(
        numberOrZero(value)
      )
    )}px`;
  }

  function translate(
    key,
    params = {},
    fallback = ""
  ) {
    try {
      const translated =
        window.i18n?.t?.(
          key,
          params
        );

      if (
        typeof translated ===
          "string" &&
        translated.trim() &&
        translated !== key
      ) {
        return translated;
      }
    } catch (error) {
      pushDiagnostic(
        "warning",
        `Translation failed: ${key}`,
        error
      );
    }

    return fallback || key;
  }

  /* ==========================================================
     TELEGRAM
  ========================================================== */

  function getTelegramWebApp() {
    return (
      window.Telegram?.WebApp ||
      null
    );
  }

  function syncViewport() {
    const tg =
      getTelegramWebApp();

    const dynamicHeight =
      numberOrZero(
        tg?.viewportHeight
      ) ||
      numberOrZero(
        window.innerHeight
      ) ||
      numberOrZero(
        document.documentElement
          .clientHeight
      );

    const stableHeight =
      numberOrZero(
        tg?.viewportStableHeight
      ) ||
      dynamicHeight;

    if (
      dynamicHeight > 0
    ) {
      setCssVariable(
        "--he-viewport-height",
        px(dynamicHeight)
      );
    }

    if (
      stableHeight > 0
    ) {
      /*
       * Historical variable retained because
       * the current CSS still uses it.
       */
      setCssVariable(
        "--tg-viewport-height",
        px(stableHeight)
      );

      setCssVariable(
        "--he-viewport-stable-height",
        px(stableHeight)
      );
    }
  }

  function syncSafeAreas() {
    const tg =
      getTelegramWebApp();

    const safe =
      tg?.safeAreaInset || {};

    const content =
      tg?.contentSafeAreaInset ||
      {};

    setCssVariable(
      "--he-safe-area-top",
      px(safe.top)
    );

    setCssVariable(
      "--he-safe-area-right",
      px(safe.right)
    );

    setCssVariable(
      "--he-safe-area-bottom",
      px(safe.bottom)
    );

    setCssVariable(
      "--he-safe-area-left",
      px(safe.left)
    );

    setCssVariable(
      "--he-content-safe-area-top",
      px(content.top)
    );

    setCssVariable(
      "--he-content-safe-area-right",
      px(content.right)
    );

    setCssVariable(
      "--he-content-safe-area-bottom",
      px(content.bottom)
    );

    setCssVariable(
      "--he-content-safe-area-left",
      px(content.left)
    );
  }

  function syncTelegramTheme() {
    const tg =
      getTelegramWebApp();

    const root =
      document.documentElement;

    if (!tg) {
      root.dataset.telegram =
        "false";

      return;
    }

    root.dataset.telegram =
      "true";

    root.dataset.telegramPlatform =
      String(
        tg.platform ||
        "unknown"
      );

    root.dataset.telegramColorScheme =
      String(
        tg.colorScheme ||
        "dark"
      );

    const params =
      tg.themeParams || {};

    const mappings = {
      bg_color:
        "--he-tg-bg-color",

      secondary_bg_color:
        "--he-tg-secondary-bg-color",

      text_color:
        "--he-tg-text-color",

      hint_color:
        "--he-tg-hint-color",

      link_color:
        "--he-tg-link-color",

      button_color:
        "--he-tg-button-color",

      button_text_color:
        "--he-tg-button-text-color",

      header_bg_color:
        "--he-tg-header-bg-color",

      bottom_bar_bg_color:
        "--he-tg-bottom-bar-bg-color"
    };

    Object.entries(
      mappings
    ).forEach(
      ([
        telegramKey,
        cssVariable
      ]) => {
        const value =
          params[
            telegramKey
          ];

        if (value) {
          setCssVariable(
            cssVariable,
            value
          );
        }
      }
    );
  }

  function bindTelegramEvent(
    eventName,
    handler
  ) {
    const tg =
      getTelegramWebApp();

    if (
      !tg ||
      typeof tg.onEvent !==
        "function"
    ) {
      return;
    }

    try {
      tg.onEvent(
        eventName,
        handler
      );
    } catch (error) {
      pushDiagnostic(
        "warning",
        `Telegram event failed: ${eventName}`,
        error
      );
    }
  }

  function initializeTelegram() {
    const tg =
      getTelegramWebApp();

    syncViewport();
    syncSafeAreas();
    syncTelegramTheme();

    window.addEventListener(
      "resize",
      () => {
        syncViewport();
        syncSafeAreas();
      },
      {
        passive: true
      }
    );

    window.addEventListener(
      "orientationchange",
      () => {
        window.setTimeout(
          () => {
            syncViewport();
            syncSafeAreas();
          },
          100
        );
      },
      {
        passive: true
      }
    );

    if (!tg) {
      pushDiagnostic(
        "info",
        "Running outside Telegram"
      );

      return;
    }

    try {
      tg.ready();
    } catch (error) {
      pushDiagnostic(
        "warning",
        "Telegram ready() failed",
        error
      );
    }

    try {
      tg.expand();
    } catch (error) {
      pushDiagnostic(
        "warning",
        "Telegram expand() failed",
        error
      );
    }

    try {
      if (
        typeof tg
          .disableVerticalSwipes ===
        "function"
      ) {
        tg.disableVerticalSwipes();
      }
    } catch (error) {
      pushDiagnostic(
        "warning",
        "Telegram vertical swipe setup failed",
        error
      );
    }

    syncViewport();
    syncSafeAreas();
    syncTelegramTheme();

    bindTelegramEvent(
      "viewportChanged",
      syncViewport
    );

    bindTelegramEvent(
      "safeAreaChanged",
      syncSafeAreas
    );

    bindTelegramEvent(
      "contentSafeAreaChanged",
      syncSafeAreas
    );

    bindTelegramEvent(
      "themeChanged",
      syncTelegramTheme
    );

    bindTelegramEvent(
      "activated",
      () => {
        document.documentElement
          .dataset
          .telegramActive =
          "true";

        syncViewport();
        syncSafeAreas();
      }
    );

    bindTelegramEvent(
      "deactivated",
      () => {
        document.documentElement
          .dataset
          .telegramActive =
          "false";
      }
    );

    pushDiagnostic(
      "info",
      "Telegram initialized",
      {
        platform:
          tg.platform || null,

        version:
          tg.version || null,

        colorScheme:
          tg.colorScheme || null
      }
    );
  }

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  function cacheNavigationElements() {
    screenElements.clear();
    navigationElements.clear();

    document
      .querySelectorAll(
        ".screens > .screen[data-screen]"
      )
      .forEach(
        (screen) => {
          const name =
            String(
              screen.dataset.screen ||
              ""
            );

          if (name) {
            screenElements.set(
              name,
              screen
            );
          }
        }
      );

    document
      .querySelectorAll(
        ".bottom-navigation .nav-item[data-nav]"
      )
      .forEach(
        (button) => {
          const name =
            String(
              button.dataset.nav ||
              ""
            );

          if (name) {
            navigationElements.set(
              name,
              button
            );
          }
        }
      );

    screenScroller =
      document.querySelector(
        ".screen-content"
      );
  }

  function getValidScreenName(
    requested
  ) {
    const name =
      String(
        requested || ""
      );

    if (
      PRIMARY_SCREENS.includes(
        name
      ) &&
      screenElements.has(
        name
      )
    ) {
      return name;
    }

    return DEFAULT_SCREEN;
  }

  function updateNavigationShell(
    previousScreen,
    nextScreen
  ) {
    if (
      previousScreen &&
      previousScreen !==
        nextScreen
    ) {
      const previousElement =
        screenElements.get(
          previousScreen
        );

      if (previousElement) {
        previousElement
          .classList
          .remove(
            "active"
          );

        previousElement
          .setAttribute(
            "aria-hidden",
            "true"
          );
      }

      const previousButton =
        navigationElements.get(
          previousScreen
        );

      if (previousButton) {
        previousButton
          .classList
          .remove(
            "active"
          );

        previousButton
          .setAttribute(
            "aria-current",
            "false"
          );
      }
    }

    const nextElement =
      screenElements.get(
        nextScreen
      );

    if (nextElement) {
      nextElement
        .classList
        .add(
          "active"
        );

      nextElement
        .setAttribute(
          "aria-hidden",
          "false"
        );
    }

    const nextButton =
      navigationElements.get(
        nextScreen
      );

    if (nextButton) {
      nextButton
        .classList
        .add(
          "active"
        );

      nextButton
        .setAttribute(
          "aria-current",
          "page"
        );
    }
  }

  function saveCurrentScrollPosition() {
    if (
      !screenScroller ||
      !activeScreen
    ) {
      return;
    }

    screenScrollPositions[
      activeScreen
    ] =
      Math.max(
        0,
        Number(
          screenScroller.scrollTop
        ) || 0
      );
  }

  function restoreScrollPosition(
    screenName,
    options = {}
  ) {
    if (
      !screenScroller ||
      options.scroll === false
    ) {
      return;
    }

    const targetTop =
      options.resetScroll ===
      true
        ? 0
        : Math.max(
            0,
            Number(
              screenScrollPositions[
                screenName
              ]
            ) || 0
          );

    if (
      pendingScrollFrame
    ) {
      cancelAnimationFrame(
        pendingScrollFrame
      );
    }

    pendingScrollFrame =
      requestAnimationFrame(
        () => {
          pendingScrollFrame = 0;

          if (
            !screenScroller
          ) {
            return;
          }

          screenScroller.scrollTo({
            top: targetTop,
            left: 0,
            behavior: "auto"
          });
        }
      );
  }

  function setScreen(
    requestedScreen,
    options = {}
  ) {
    if (
      !screenElements.size
    ) {
      cacheNavigationElements();
    }

    const nextScreen =
      getValidScreenName(
        requestedScreen
      );

    const previousScreen =
      activeScreen;

    if (
      previousScreen ===
        nextScreen &&
      options.force !== true
    ) {
      if (
        options.resetScroll ===
        true
      ) {
        screenScrollPositions[
          nextScreen
        ] = 0;

        restoreScrollPosition(
          nextScreen,
          {
            resetScroll: true
          }
        );
      }

      return nextScreen;
    }

    saveCurrentScrollPosition();

    activeScreen =
      nextScreen;

    updateNavigationShell(
      previousScreen,
      nextScreen
    );

    restoreScrollPosition(
      nextScreen,
      options
    );

    window.dispatchEvent(
      new CustomEvent(
        "hustle:tabChanged",
        {
          detail: {
            tab:
              nextScreen,

            previousTab:
              previousScreen,

            source:
              options.source ||
              "navigation"
          }
        }
      )
    );

    return nextScreen;
  }

  function initializeNavigation() {
    cacheNavigationElements();

    navigationElements.forEach(
      (
        button,
        screenName
      ) => {
        button.addEventListener(
          "click",
          (event) => {
            event.preventDefault();

            if (
              button.disabled
            ) {
              return;
            }

            if (
              screenName ===
              activeScreen
            ) {
              setScreen(
                screenName,
                {
                  resetScroll:
                    true,

                  source:
                    "bottom-nav-reselect"
                }
              );

              return;
            }

            setScreen(
              screenName,
              {
                source:
                  "bottom-nav"
              }
            );
          }
        );
      }
    );

    setScreen(
      DEFAULT_SCREEN,
      {
        scroll: false,
        force: true,
        source: "boot"
      }
    );
  }

  /* ==========================================================
     GENERIC MODAL
  ========================================================== */

  function showModal(
    title,
    message,
    icon = "◆"
  ) {
    const modal =
      document.getElementById(
        "game-modal"
      );

    if (!modal) {
      return false;
    }

    genericModalReturnFocus =
      document.activeElement
      instanceof HTMLElement
        ? document.activeElement
        : null;

    const titleElement =
      modal.querySelector(
        "#game-modal-title"
      );

    const messageElement =
      modal.querySelector(
        "#game-modal-message"
      );

    const iconElement =
      modal.querySelector(
        ".game-modal-icon"
      );

    if (titleElement) {
      titleElement.textContent =
        String(
          title || APP_NAME
        );
    }

    if (messageElement) {
      messageElement.textContent =
        String(
          message || ""
        );
    }

    if (iconElement) {
      iconElement.textContent =
        String(
          icon || "◆"
        );
    }

    modal.hidden =
      false;

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    requestAnimationFrame(
      () => {
        modal
          .querySelector(
            ".modal-confirm, .game-modal-close"
          )
          ?.focus?.({
            preventScroll:
              true
          });
      }
    );

    return true;
  }

  function closeModal() {
    const modal =
      document.getElementById(
        "game-modal"
      );

    if (
      !modal ||
      modal.hidden
    ) {
      return false;
    }

    modal.hidden =
      true;

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    const returnFocus =
      genericModalReturnFocus;

    genericModalReturnFocus =
      null;

    requestAnimationFrame(
      () => {
        if (
          returnFocus &&
          document.contains(
            returnFocus
          )
        ) {
          returnFocus
            .focus?.({
              preventScroll:
                true
            });
        }
      }
    );

    return true;
  }

  /* ==========================================================
     SHOP / STATIC ACTIONS
  ========================================================== */

  function requestPurchase(
    detail
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "hustle:purchaseRequested",
        {
          detail: {
            ...detail,
            requestedAt:
              Date.now()
          }
        }
      )
    );
  }

  function showPremiumPlaceholder(
    icon
  ) {
    showModal(
      translate(
        "shop.title",
        {},
        "Shop"
      ),

      translate(
        "modal.premiumPlaceholder",
        {},
        "Telegram Stars payments are not enabled yet."
      ),

      icon
    );
  }

  function handleStaticAction(
    element
  ) {
    if (
      !element ||
      element.disabled
    ) {
      return false;
    }

    const action =
      String(
        element.dataset.action ||
        ""
      );

    switch (action) {
      /*
       * IMPORTANT:
       *
       * notifications
       * daily-chest
       * next-level
       * open-leaderboard
       *
       * are intentionally not handled here.
       *
       * Those gameplay flows are already
       * controlled by game.js.
       */

      case "settings":
        showModal(
          translate(
            "modal.settings",
            {},
            "Settings"
          ),

          translate(
            "modal.settingsText",
            {},
            "Audio, language, notifications and Telegram account settings."
          ),

          "☰"
        );

        return true;

      case "offline-income":
        /*
         * game.js may later replace this
         * with the real offline modal.
         *
         * This is only a safe fallback.
         */
        showModal(
          translate(
            "modal.offline",
            {},
            "Offline Earnings"
          ),

          translate(
            "modal.offlineText",
            {},
            "Your businesses continue generating income while you are away."
          ),

          "💰"
        );

        return true;

      case "set-bonus":
        showModal(
          translate(
            "modal.setBonus",
            {},
            "Set Bonus"
          ),

          translate(
            "modal.setBonusText",
            {},
            "Complete equipment and card sets to unlock permanent bonuses."
          ),

          "▣"
        );

        return true;

      case "shop-premium-case":
        setScreen(
          "cases",
          {
            source:
              "shop-premium-case"
          }
        );

        return true;

      case "shop-outfit":
        setScreen(
          "wardrobe",
          {
            source:
              "shop-outfit"
          }
        );

        return true;

      case "buy-boost":
        requestPurchase({
          type: "boost",

          productId:
            element.dataset.product ||
            null,

          currency:
            "gems"
        });

        showPremiumPlaceholder(
          "⚡"
        );

        return true;

      case "buy-gem-pack":
        requestPurchase({
          type: "gems",

          gems:
            Math.max(
              0,
              Number(
                element.dataset.gems
              ) || 0
            )
        });

        showPremiumPlaceholder(
          "♦"
        );

        return true;

      case "shop-bundle":
        requestPurchase({
          type: "bundle",

          productId:
            "hustleBundle"
        });

        showPremiumPlaceholder(
          "📦"
        );

        return true;

      case "buy-empire-pass":
        requestPurchase({
          type:
            "empire-pass",

          stars:
            Math.max(
              0,
              Number(
                window.GAME_CONFIG
                  ?.SHOP_PRICES
                  ?.HUSTLE_PASS_MONTHLY
              ) || 250
            )
        });

        showPremiumPlaceholder(
          "♛"
        );

        return true;

      default:
        return false;
    }
  }

  function initializeActions() {
    document.addEventListener(
      "click",
      (event) => {
        const modalClose =
          event.target
            .closest?.(
              "#game-modal [data-modal-close]"
            );

        if (modalClose) {
          event.preventDefault();

          closeModal();

          return;
        }

        const action =
          event.target
            .closest?.(
              "[data-action]"
            );

        if (!action) {
          return;
        }

        handleStaticAction(
          action
        );
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          closeModal();
        }
      }
    );
  }

  /* ==========================================================
     IMAGE FALLBACKS
  ========================================================== */

  function markMissingImage(
    image
  ) {
    if (
      !(
        image instanceof
        HTMLImageElement
      )
    ) {
      return;
    }

    image.classList.add(
      "is-missing"
    );

    image
      .closest(
        ".image-fallback"
      )
      ?.classList
      .add(
        "has-missing-image"
      );
  }

  function initializeImageFallbacks() {
    document.addEventListener(
      "error",
      (event) => {
        if (
          event.target
          instanceof
          HTMLImageElement
        ) {
          markMissingImage(
            event.target
          );
        }
      },
      true
    );

    document
      .querySelectorAll(
        "img"
      )
      .forEach(
        (image) => {
          if (
            image.complete &&
            image.naturalWidth ===
              0
          ) {
            markMissingImage(
              image
            );
          }
        }
      );
  }

  /* ==========================================================
     STATIC COUNTDOWNS
  ========================================================== */

  function formatTimer(
    seconds
  ) {
    const safeSeconds =
      Math.max(
        0,
        Math.floor(
          Number(seconds) || 0
        )
      );

    const hours =
      Math.floor(
        safeSeconds / 3600
      );

    const minutes =
      Math.floor(
        (
          safeSeconds % 3600
        ) / 60
      );

    const secs =
      safeSeconds % 60;

    return [
      hours,
      minutes,
      secs
    ]
      .map(
        (value) =>
          String(value)
            .padStart(
              2,
              "0"
            )
      )
      .join(":");
  }

  function initializeCountdownElement(
    element
  ) {
    if (
      !(
        element instanceof
        HTMLElement
      )
    ) {
      return;
    }

    if (
      countdownDeadlines.has(
        element
      )
    ) {
      return;
    }

    const initialSeconds =
      Math.max(
        0,
        Number(
          element.dataset
            .countdown
        ) || 0
      );

    countdownDeadlines.set(
      element,

      Date.now() +
        initialSeconds *
        1000
    );
  }

  function updateCountdownElement(
    element
  ) {
    initializeCountdownElement(
      element
    );

    const deadline =
      countdownDeadlines.get(
        element
      );

    if (!deadline) {
      return;
    }

    const remaining =
      Math.max(
        0,
        Math.ceil(
          (
            deadline -
            Date.now()
          ) / 1000
        )
      );

    element.textContent =
      formatTimer(
        remaining
      );

    element.dataset
      .countdownRemaining =
      String(
        remaining
      );

    element.classList.toggle(
      "is-ready",
      remaining <= 0
    );
  }

  function initializeCountdowns() {
    const tick =
      () => {
        document
          .querySelectorAll(
            "[data-countdown]"
          )
          .forEach(
            updateCountdownElement
          );
      };

    tick();

    window.setInterval(
      tick,
      1000
    );
  }

  /* ==========================================================
     DIAGNOSTICS
  ========================================================== */

  function initializeDiagnostics() {
    window.addEventListener(
      "error",
      (event) => {
        pushDiagnostic(
          "error",

          event.message ||
            "Runtime error",

          {
            filename:
              event.filename ||
              "",

            line:
              event.lineno ||
              0,

            column:
              event.colno ||
              0
          }
        );
      }
    );

    window.addEventListener(
      "unhandledrejection",
      (event) => {
        pushDiagnostic(
          "promise-rejection",

          event.reason?.message ||
            String(
              event.reason ||
              "Unhandled promise rejection"
            ),

          event.reason ||
            null
        );
      }
    );
  }

  /* ==========================================================
     PUBLIC APIs
  ========================================================== */

  window.HustleTabs =
    Object.freeze({
      setActiveTab:
        setScreen,

      getActiveTab:
        () =>
          activeScreen,

      getScrollPosition:
        (
          screenName =
            activeScreen
        ) =>
          Math.max(
            0,
            Number(
              screenScrollPositions[
                screenName
              ]
            ) || 0
          ),

      resetActiveScroll:
        () =>
          setScreen(
            activeScreen,
            {
              resetScroll:
                true,

              source:
                "api"
            }
          )
    });

  window.HustleShop =
    Object.freeze({
      setTab(tab) {
        if (
          tab === "cases"
        ) {
          return setScreen(
            "cases",
            {
              source:
                "shop-api"
            }
          );
        }

        if (
          tab === "skins"
        ) {
          return setScreen(
            "wardrobe",
            {
              source:
                "shop-api"
            }
          );
        }

        return setScreen(
          "shop",
          {
            source:
              "shop-api"
          }
        );
      },

      showModal,

      closeModal
    });

  window.HustleShell =
    Object.freeze({
      name:
        APP_NAME,

      version:
        APP_VERSION,

      getTelegram:
        getTelegramWebApp,

      syncViewport,

      syncSafeAreas,

      setScreen,

      getActiveScreen:
        () =>
          activeScreen,

      getDiagnostics:
        () =>
          diagnostics.map(
            (entry) => ({
              ...entry
            })
          )
    });

  /* ==========================================================
     BOOT
  ========================================================== */

  function initialize() {
    initializeDiagnostics();

    initializeTelegram();

    initializeNavigation();

    initializeImageFallbacks();

    initializeActions();

    initializeCountdowns();

    /*
     * translations.js is the only
     * translation controller.
     */
    try {
      window.i18n
        ?.apply?.(
          document
        );
    } catch (error) {
      pushDiagnostic(
        "warning",
        "Initial translation apply failed",
        error
      );
    }

    document.documentElement
      .dataset
      .appName =
      "hustle-empire";

    document.documentElement
      .dataset
      .shellVersion =
      APP_VERSION;

    pushDiagnostic(
      "info",
      `${APP_NAME} shell ready`,
      {
        version:
          APP_VERSION
      }
    );

    window.dispatchEvent(
      new CustomEvent(
        "hustle:shellReady",
        {
          detail: {
            version:
              APP_VERSION,

            screen:
              activeScreen
          }
        }
      )
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      {
        once: true
      }
    );
  } else {
    initialize();
  }
})();
