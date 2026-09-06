/* ============================================================
   HUSTLE EMPIRE TYCOON
   GAME ENGINE V12.5 — Mission Progression
   - Level 1 formula economy
   - Quick Jobs
   - District business progression
   - Persistent timed cases + reward overlay
   - 10 fragment cards + Exclusive cards
   - Wardrobe items + Style Sets
   - EN/RU dynamic rendering
============================================================ */

(() => {
  "use strict";

  const CONFIG = window.GAME_CONFIG;
  if (!CONFIG) throw new Error("[Hustle Empire] config.js must load before game.js");

  /*
     script.js is loaded before game.js and older builds overwrite window.i18n.
     Restore the canonical V18 flat i18n API while leaving window.LOCALES
     available in the nested legacy format for script.js itself.
  */
  if (window.I18N?.t && window.I18N?.setLanguage) {
    window.i18n = window.I18N;
  }

  const SAVE_KEY = "urbanTycoonSave_v19_1";
  const SAVE_BACKUP_KEY = "urbanTycoonSave_v19_1_backup";
  const SAVE_META_KEY = "urbanTycoonSave_v19_1_meta";

  const LEGACY_SAVE_KEYS = [
    "hustleEmpireSave_v12_5",
    "hustleEmpireSave_v11",
    "hustleEmpireSave_v10",
    "hustleEmpireSave_v9",
    "hustleEmpireSave_v8",
    "hustleEmpireSave_v7",
    "hustleEmpireSave_v6"
  ];

  /*
     Telegram CloudStorage values are intentionally chunked below the
     per-item size limit. Meta is written LAST, so an interrupted upload
     never points to a half-written snapshot.
  */
  const TELEGRAM_CLOUD_SAVE_PREFIX = "urbanTycoon_v19_1";
  const TELEGRAM_CLOUD_META_KEY = `${TELEGRAM_CLOUD_SAVE_PREFIX}_meta`;
  const TELEGRAM_CLOUD_CHUNK_SIZE = 3200;

  const LOCAL_SAVE_DEBOUNCE_MS = 120;
  const CLOUD_SAVE_DEBOUNCE_MS = 1400;

  const BUSINESS_CONFIGS = CONFIG.BUSINESSES || {};
  const BUSINESS_IDS = Object.keys(BUSINESS_CONFIGS);
  const DISTRICT_CONFIGS = CONFIG.DISTRICTS || {};
  const DISTRICT_IDS = Object.keys(DISTRICT_CONFIGS);
  const HUSTLE_CONFIGS = CONFIG.HUSTLES || {};
  const HUSTLE_IDS = Object.keys(HUSTLE_CONFIGS);
  const CARD_CONFIGS = CONFIG.CARDS || {};
  const CARD_IDS = Object.keys(CARD_CONFIGS);
  const EQUIPMENT_CONFIGS = CONFIG.EQUIPMENT || {};
  const EQUIPMENT_IDS = Object.keys(EQUIPMENT_CONFIGS);
  const STYLE_SET_CONFIGS = CONFIG.STYLE_SETS || {};
  const STYLE_SET_IDS = Object.keys(STYLE_SET_CONFIGS);
  const TIMED_CASE_CONFIGS = CONFIG.TIMED_CASES || {};
  const TIMED_CASE_IDS = Object.keys(TIMED_CASE_CONFIGS);
  const EXCLUSIVE_CARD_CONFIGS = CONFIG.EXCLUSIVE_CARDS || {};
  const EXCLUSIVE_CARD_IDS = Object.keys(EXCLUSIVE_CARD_CONFIGS);

  const ACCESSORY_CASE_CONFIGS = CONFIG.ACCESSORY_CASES || {};
  const ACCESSORY_CASE_IDS = Object.keys(ACCESSORY_CASE_CONFIGS);
  const WARDROBE_CATALOG_CONFIGS = CONFIG.WARDROBE_CATALOG || {};
  const WARDROBE_CATALOG_IDS = Object.keys(WARDROBE_CATALOG_CONFIGS);

  const RANDOM_EVENT_CONFIG = CONFIG.RANDOM_EVENTS || {};
  const RANDOM_EVENT_DEFINITIONS = RANDOM_EVENT_CONFIG.EVENTS || {};
  const RANDOM_EVENT_IDS = Object.keys(RANDOM_EVENT_DEFINITIONS);

  /* ==========================================================
     V16.0 — OFFICIAL FLAT ASSET REGISTRY
     Every image lives directly in assets/ (NO asset subfolders).
     Cards use full rectangular art as a background layer with a
     CSS/UI frame overlay rendered above it.
  ========================================================== */

  const SPRITE_BUILD_VERSION = "19.7";

  const REAL_GAME_ASSET_PATHS = Object.freeze([
    "assets/acc_epic.png",
    "assets/acc_free.png",
    "assets/acc_legendary.png",
    "assets/acc_rare.png",
    "assets/autodealer.png",
    "assets/avatar_face.png",
    "assets/female_ui_icon.png",
    "assets/female_level_1.png",
    "assets/female_level_10.png",
    "assets/female_level_30.png",
    "assets/bank.png",
    "assets/barber.png",
    "assets/card_autodealer.png",
    "assets/card_back.png",
    "assets/card_bank.png",
    "assets/card_barber.png",
    "assets/card_booster.png",
    "assets/card_club.png",
    "assets/card_gym.png",
    "assets/card_hotel.png",
    "assets/card_kiosk.png",
    "assets/card_laundry.png",
    "assets/card_pizza.png",
    "assets/case_24h.png",
    "assets/case_2h.png",
    "assets/case_4h.png",
    "assets/case_8h.png",
    "assets/case_daily.png",
    "assets/city_map.png",
    "assets/club.png",
    "assets/glasses.png",
    "assets/gym.png",
    "assets/hat.png",
    "assets/hero_lvl1.png",
    "assets/hero_lvl2.png",
    "assets/hero_lvl3.png",
    "assets/hotel.png",
    "assets/icon_energy.png",
    "assets/icon_gems.png",
    "assets/icon_money.png",
    "assets/icon_xp.png",
    "assets/jacket.png",
    "assets/kiosk.png",
    "assets/laundry.png",
    "assets/pants.png",
    "assets/pizza.png",
    "assets/shoes.png",
    "assets/watch.png"
]);
  const REAL_GAME_ASSET_PATH_SET = new Set(REAL_GAME_ASSET_PATHS);

  const ASSET_PATHS = Object.freeze({
    avatar: "assets/avatar_face.png",
    avatarFallback: "",
    characterMain: "assets/hero_lvl1.png",

    /*
       Male assets are the existing production character.
       Female paths are intentionally separate. If those PNGs are not yet
       present in /assets, rendering falls back to the matching male stage
       without touching the saved gender choice or player progress.
    */
    avatarsByGender: Object.freeze({
      male: Object.freeze({
        primary: "assets/avatar_face.png",
        fallback: ""
      }),
      female: Object.freeze({
        primary: "assets/female_ui_icon.png",
        fallback: "assets/avatar_face.png"
      })
    }),

    characters: Object.freeze({
      1: Object.freeze({ primary: "assets/hero_lvl1.png", fallback: "" }),
      2: Object.freeze({ primary: "assets/hero_lvl2.png", fallback: "" }),
      3: Object.freeze({ primary: "assets/hero_lvl3.png", fallback: "" }),
      4: Object.freeze({ primary: "assets/hero_lvl3.png", fallback: "" })
    }),

    charactersByGender: Object.freeze({
      male: Object.freeze({
        1: Object.freeze({ primary: "assets/hero_lvl1.png", fallback: "" }),
        2: Object.freeze({ primary: "assets/hero_lvl2.png", fallback: "" }),
        3: Object.freeze({ primary: "assets/hero_lvl3.png", fallback: "" }),
        4: Object.freeze({ primary: "assets/hero_lvl3.png", fallback: "" })
      }),

      female: Object.freeze({
        1: Object.freeze({
          primary: "assets/female_level_1.png",
          fallback: "assets/hero_lvl1.png"
        }),
        2: Object.freeze({
          primary: "assets/female_level_10.png",
          fallback: "assets/hero_lvl2.png"
        }),
        3: Object.freeze({
          primary: "assets/female_level_30.png",
          fallback: "assets/hero_lvl3.png"
        }),
        4: Object.freeze({
          primary: "assets/female_level_30.png",
          fallback: "assets/hero_lvl3.png"
        })
      })
    }),

    cityMap: "assets/city_map.png",
    cityMapFallback: "",

    cases: Object.freeze({
      case_2h: "assets/case_2h.png",
      case_4h: "assets/case_4h.png",
      case_8h: "assets/case_8h.png",
      case_24h: "assets/case_24h.png",
      daily: "assets/case_daily.png",
      accessoryFree: "assets/acc_free.png",
      accessoryRare: "assets/acc_rare.png",
      accessoryEpic: "assets/acc_epic.png",
      accessoryLegendary: "assets/acc_legendary.png"
    }),

    wardrobe: Object.freeze({
      hat: "assets/hat.png",
      glasses: "assets/glasses.png",
      jacket: "assets/jacket.png",
      pants: "assets/pants.png",
      shoes: "assets/shoes.png",
      watch: "assets/watch.png"
    }),

    hud: Object.freeze({
      money: "assets/icon_money.png",
      energy: "assets/icon_energy.png",
      gems: "assets/icon_gems.png",
      xp: "assets/icon_xp.png"
    }),

    businesses: Object.freeze({
      kiosk: "assets/kiosk.png",
      gym: "assets/gym.png",
      laundry: "assets/laundry.png",
      pizza: "assets/pizza.png",
      barber: "assets/barber.png",
      autodealer: "assets/autodealer.png",
      club: "assets/club.png",
      hotel: "assets/hotel.png",
      bank: "assets/bank.png"
    }),

    cards: Object.freeze({
      kiosk: "assets/card_kiosk.png",
      gym: "assets/card_gym.png",
      laundry: "assets/card_laundry.png",
      pizza: "assets/card_pizza.png",
      barber: "assets/card_barber.png",
      autodealer: "assets/card_autodealer.png",
      club: "assets/card_club.png",
      hotel: "assets/card_hotel.png",
      bank: "assets/card_bank.png",
      booster: "assets/card_booster.png",
      back: "assets/card_back.png"
    })
  });

  /* Logical business IDs -> one of the nine official building PNGs. */
  const BUSINESS_SPRITE_CLASS = Object.freeze({
    kiosk: "business-kiosk",
    laundry: "business-laundry",
    gym: "business-gym",
    pizza: "business-pizza",
    barber: "business-barber",
    autodealer: "business-autodealer",
    club: "business-club",
    hotel: "business-hotel",
    bank: "business-bank",
    cafe: "business-kiosk",
    bar: "business-club",
    restaurant: "business-pizza",
    office: "business-bank",
    car_dealer: "business-autodealer",
    agency: "business-bank",
    nightclub: "business-club",
    luxury_hotel: "business-hotel",
    empire_tower: "business-bank"
  });

  /* Existing 10-card gameplay IDs -> the new complete rectangular card art. */
  const CARD_ART_BY_ID = Object.freeze({
    gym_income: ASSET_PATHS.cards.gym,
    coffee_income: ASSET_PATHS.cards.kiosk,
    delivery_income: ASSET_PATHS.cards.pizza,
    garage_income: ASSET_PATHS.cards.autodealer,
    nightclub_income: ASSET_PATHS.cards.club,
    tap_power: ASSET_PATHS.cards.barber,
    critical_rate: ASSET_PATHS.cards.bank,
    critical_damage: ASSET_PATHS.cards.booster,
    energy_max: ASSET_PATHS.cards.laundry,
    energy_regen: ASSET_PATHS.cards.hotel
  });

  const CARD_BACK_ASSET = ASSET_PATHS.cards.back;

  const EXCLUSIVE_CARD_ART_BY_ID = Object.freeze({
    founder: ASSET_PATHS.cards.bank,
    golden_tycoon: ASSET_PATHS.cards.booster,
    neon_king: ASSET_PATHS.cards.club
  });

  /* Kept for compatibility with reward code that still asks for a logical key. */
  const CARD_WORKER_SPRITE_CLASS = Object.freeze({
    gym_income: "card-gym",
    coffee_income: "card-kiosk",
    delivery_income: "card-pizza",
    garage_income: "card-autodealer",
    nightclub_income: "card-club",
    tap_power: "card-barber",
    critical_rate: "card-bank",
    critical_damage: "card-booster",
    energy_max: "card-laundry",
    energy_regen: "card-hotel"
  });

  const EXCLUSIVE_WORKER_SPRITE_CLASS = Object.freeze({
    founder: "card-bank",
    golden_tycoon: "card-booster",
    neon_king: "card-club"
  });

  const EQUIPMENT_SPRITE_CLASS = Object.freeze({
    cap: "wardrobe-hat",
    glasses: "wardrobe-glasses",
    jacket: "wardrobe-jacket",
    pants: "wardrobe-pants",
    shoes: "wardrobe-shoes",
    accessory: "wardrobe-watch"
  });

  const WARDROBE_CATALOG_SPRITE_CLASS = Object.freeze({
    designer_cap: "wardrobe-hat",
    urban_shades: "wardrobe-glasses",
    street_jacket: "wardrobe-jacket",
    limited_sneakers: "wardrobe-shoes",
    neon_jacket: "wardrobe-jacket",
    tech_pants: "wardrobe-pants",
    chrono_watch: "wardrobe-watch",
    elite_shades: "wardrobe-glasses",
    crown_cap: "wardrobe-hat",
    royal_coat: "wardrobe-jacket",
    diamond_watch: "wardrobe-watch",
    imperial_shoes: "wardrobe-shoes"
  });

  const TIMED_CASE_SPRITE_CLASS = Object.freeze({
    case_2h: "case-2h",
    case_4h: "case-4h",
    case_8h: "case-8h",
    case_24h: "case-24h"
  });

  const ACCESSORY_CASE_SPRITE_CLASS = Object.freeze({
    free_accessory: "case-acc-free",
    premium_rare: "case-acc-rare",
    premium_epic: "case-acc-epic",
    premium_legendary: "case-acc-legendary"
  });

  const DIRECT_ASSET_BY_CELL = Object.freeze({
    "business-kiosk": ASSET_PATHS.businesses.kiosk,
    "business-laundry": ASSET_PATHS.businesses.laundry,
    "business-gym": ASSET_PATHS.businesses.gym,
    "business-pizza": ASSET_PATHS.businesses.pizza,
    "business-barber": ASSET_PATHS.businesses.barber,
    "business-autodealer": ASSET_PATHS.businesses.autodealer,
    "business-club": ASSET_PATHS.businesses.club,
    "business-hotel": ASSET_PATHS.businesses.hotel,
    "business-bank": ASSET_PATHS.businesses.bank,

    "wardrobe-hat": ASSET_PATHS.wardrobe.hat,
    "wardrobe-glasses": ASSET_PATHS.wardrobe.glasses,
    "wardrobe-jacket": ASSET_PATHS.wardrobe.jacket,
    "wardrobe-pants": ASSET_PATHS.wardrobe.pants,
    "wardrobe-shoes": ASSET_PATHS.wardrobe.shoes,
    "wardrobe-watch": ASSET_PATHS.wardrobe.watch,

    "case-2h": ASSET_PATHS.cases.case_2h,
    "case-4h": ASSET_PATHS.cases.case_4h,
    "case-8h": ASSET_PATHS.cases.case_8h,
    "case-24h": ASSET_PATHS.cases.case_24h,
    "case-daily": ASSET_PATHS.cases.daily,
    "case-acc-free": ASSET_PATHS.cases.accessoryFree,
    "case-acc-rare": ASSET_PATHS.cases.accessoryRare,
    "case-acc-epic": ASSET_PATHS.cases.accessoryEpic,
    "case-acc-legendary": ASSET_PATHS.cases.accessoryLegendary,

    "card-kiosk": ASSET_PATHS.cards.kiosk,
    "card-gym": ASSET_PATHS.cards.gym,
    "card-laundry": ASSET_PATHS.cards.laundry,
    "card-pizza": ASSET_PATHS.cards.pizza,
    "card-barber": ASSET_PATHS.cards.barber,
    "card-autodealer": ASSET_PATHS.cards.autodealer,
    "card-club": ASSET_PATHS.cards.club,
    "card-hotel": ASSET_PATHS.cards.hotel,
    "card-bank": ASSET_PATHS.cards.bank,
    "card-booster": ASSET_PATHS.cards.booster,
    "card-back": ASSET_PATHS.cards.back
  });

  /* Old sprite-sheet renderer remains a no-op compatibility layer. */
  const OFFICIAL_SPRITE_ASSETS = Object.freeze({});
  const SPRITE_ASSET_FALLBACKS = Object.freeze({});
  const SPRITE_CELLS = Object.freeze({});
  const SPRITE_SHEET_CLASS_TO_KEY = Object.freeze({});

  const SPRITE_IMAGES = Object.create(null);
  let spriteAssetsReady = false;
  let spriteMutationObserver = null;
  let spriteResizeObserver = null;

  /*
     Universal zero-network fallback.
     This prevents broken-image icons and keeps renderers alive even when
     GitHub Pages returns 404 for every real candidate.
  */
  const TRANSPARENT_ASSET_PLACEHOLDER =
    "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1'%20height='1'%20viewBox='0%200%201%201'%3E%3C/svg%3E";

  function createTransparentPlaceholderImage() {
    return new Promise((resolve) => {
      const placeholder = new Image();
      placeholder.decoding = "async";

      const finish = () => resolve(placeholder);

      placeholder.onload = finish;
      placeholder.onerror = finish;
      placeholder.src = TRANSPARENT_ASSET_PLACEHOLDER;

      /*
         Most browsers mark data-URI images complete immediately.
         Queue a safe completion fallback for WebKit.
      */
      if (placeholder.complete) {
        queueMicrotask(finish);
      }
    });
  }

  function normalizeRelativeAssetPath(relativePath) {
    /*
       Never allow repository-local media to accidentally resolve from the
       GitHub Pages domain root.
    */
    return String(relativePath || "")
      .trim()
      .replace(/^\/+/, "")
      .replace(/^\.\//, "");
  }

  /*
     Converts any combination of strings / arrays into ONE clean array.

     It also repairs legacy whitespace-concatenated fallback values by
     splitting them into separate candidate paths before loading.

     Each candidate is then attempted separately and sequentially.
  */
  function normalizeAssetCandidates(...sources) {
    const candidates = [];

    const pushSource = (source) => {
      if (!source) return;

      if (Array.isArray(source)) {
        source.forEach(pushSource);
        return;
      }

      if (typeof source !== "string") return;

      /*
         Legacy safety: if an old save/build hands us a whitespace-joined
         string, split it into independent paths. Each candidate is always
         loaded separately afterward.
      */
      source
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .forEach((rawPath) => {
          const cleanPath = normalizeRelativeAssetPath(rawPath);

          if (!cleanPath) return;

          if (!REAL_GAME_ASSET_PATH_SET.has(cleanPath)) {
            console.warn(
              `[Hustle Empire] Skipping non-existent asset path: ${cleanPath}`
            );
            return;
          }

          if (!candidates.includes(cleanPath)) {
            candidates.push(cleanPath);
          }
        });
    };

    sources.forEach(pushSource);
    return candidates;
  }

  function resolveAssetUrl(relativePath) {
    const safePath = normalizeRelativeAssetPath(relativePath);
    const url = new URL(safePath, document.baseURI);

    /* Query cache-busting is safe on HTTP(S), but not on every file:// preview. */
    if (url.protocol === "http:" || url.protocol === "https:") {
      url.searchParams.set("v", SPRITE_BUILD_VERSION);
    }
    return url.href;
  }

  /*
     Generic sequential image loader:
     candidate[0] -> onerror -> candidate[1] -> onerror -> ...
     At no point are two paths assigned to image.src together.
  */
  function loadImageFromCandidates(candidateSources, options = {}) {
    const fallbackArray = normalizeAssetCandidates(candidateSources);

    return new Promise((resolve) => {
      let index = 0;
      let settled = false;

      const resolveWithPlaceholder = async () => {
        if (settled) return;
        settled = true;

        const placeholder = await createTransparentPlaceholderImage();

        options.onAllFailed?.(
          fallbackArray,
          placeholder
        );

        resolve({
          ok: false,
          image: placeholder,
          path: TRANSPARENT_ASSET_PLACEHOLDER,
          candidates: fallbackArray,
          placeholder: true
        });
      };

      const loadNext = () => {
        if (settled) return;

        /*
           Never access an array element outside its valid range.
        */
        if (index >= fallbackArray.length) {
          resolveWithPlaceholder();
          return;
        }

        const currentIndex = index;
        const currentPath = fallbackArray[currentIndex];
        index = currentIndex + 1;

        const element = new Image();
        element.decoding = "async";

        element.onload = async () => {
          if (settled) return;

          try {
            if (typeof element.decode === "function") {
              await element.decode();
            }
          } catch (_) {
            /* Safari/WKWebView may reject decode() after onload. */
          }

          if (settled) return;
          settled = true;

          options.onSuccess?.(
            element,
            currentPath,
            fallbackArray
          );

          resolve({
            ok: true,
            image: element,
            path: currentPath,
            candidates: fallbackArray,
            placeholder: false
          });
        };

        element.onerror = () => {
          if (settled) return;

          if (index < fallbackArray.length) {
            console.warn(
              `[Hustle Empire] 404: ${currentPath}. Trying ${index + 1}/${fallbackArray.length}: ${fallbackArray[index]}`
            );
            loadNext();
            return;
          }

          console.warn(
            `[Hustle Empire] 404: ${currentPath}. No real asset candidates left; using transparent placeholder.`
          );

          resolveWithPlaceholder();
        };

        /*
           Exactly one URL is assigned per attempt.
        */
        element.src = resolveAssetUrl(currentPath);
      };

      if (!fallbackArray.length) {
        resolveWithPlaceholder();
        return;
      }

      loadNext();
    });
  }

  function loadSpriteImage(key, primaryPath) {
    const fallbackArray = normalizeAssetCandidates(
      primaryPath,
      SPRITE_ASSET_FALLBACKS[key]
    );

    return loadImageFromCandidates(fallbackArray, {
      onSuccess(element) {
        SPRITE_IMAGES[key] = element;

        document.documentElement.dataset[
          `sprite${key[0].toUpperCase()}${key.slice(1)}`
        ] = "ready";
      },

      onAllFailed(failedCandidates, placeholder) {
        /*
           Do not leave the renderer without a CanvasImageSource.
           A transparent 1x1 data-URI image keeps the DOM/canvas path alive.
        */
        SPRITE_IMAGES[key] = placeholder;

        console.warn(
          `[Hustle Empire] Sprite unavailable: ${key}. Transparent placeholder active.`,
          failedCandidates
        );

        document.documentElement.dataset[
          `sprite${key[0].toUpperCase()}${key.slice(1)}`
        ] = "placeholder";
      }
    }).then((result) => ({
      key,
      ...result
    }));
  }

  async function preloadOfficialSpriteSheets() {
    const results = await Promise.all(
      Object.entries(OFFICIAL_SPRITE_ASSETS)
        .map(([key, src]) => loadSpriteImage(key, src))
    );

    spriteAssetsReady = results.some((result) => Boolean(result.image));
    document.documentElement.classList.toggle("sprites-ready", spriteAssetsReady);
    return results;
  }

  function preloadDirectAsset(primaryPath, fallbackPaths = []) {
    const candidates = normalizeAssetCandidates(
      primaryPath,
      fallbackPaths
    );

    return loadImageFromCandidates(candidates)
      .then((result) => result.ok);
  }

  async function preloadCriticalDirectAssets() {
    const stageOne = getRealCharacterAsset(1);
    const selectedAvatar = getSelectedAvatarAsset();

    return Promise.all([
      preloadDirectAsset(
        selectedAvatar.primary,
        [selectedAvatar.fallback]
      ),
      preloadDirectAsset(
        stageOne.primary,
        [stageOne.fallback]
      ),
      preloadDirectAsset(
        ASSET_PATHS.cityMap,
        [ASSET_PATHS.cityMapFallback]
      )
    ]);
  }

  /*
     Direct <img> fallback loader.
     Accepts strings OR arrays and switches src only after onerror.
  */
  function applyTransparentAssetImageDefaults(imageElement, fit = "contain", position = "center") {
    if (!(imageElement instanceof HTMLImageElement)) return;

    imageElement.decoding = imageElement.decoding || "async";
    imageElement.draggable = false;
    imageElement.style.setProperty("background", "transparent", "important");
    imageElement.style.setProperty("background-color", "transparent", "important");
    imageElement.style.setProperty("image-rendering", "auto", "important");
    imageElement.style.setProperty("display", "block", "important");
    imageElement.style.setProperty("object-fit", fit, "important");
    imageElement.style.setProperty("object-position", position, "important");
  }

  function setDirectImageAsset(imageElement, primaryPath, fallbackPaths = []) {
    if (!(imageElement instanceof HTMLImageElement)) return false;

    const fitMode = imageElement.classList.contains("player-avatar-image") ? "cover" : (imageElement.classList.contains("city-map-image") ? "cover" : "contain");
    const fitPosition = imageElement.classList.contains("player-avatar-image") ? "center" : (imageElement.classList.contains("home-character") || imageElement.classList.contains("wardrobe-character-image") ? "center bottom" : "center");
    applyTransparentAssetImageDefaults(imageElement, fitMode, fitPosition);

    const fallbackArray = normalizeAssetCandidates(
      primaryPath,
      fallbackPaths
    );

    let index = 0;

    imageElement.dataset.assetCandidates =
      JSON.stringify(fallbackArray);

    imageElement.classList.remove(
      "asset-load-error",
      "asset-placeholder"
    );

    const useTransparentPlaceholder = () => {
      imageElement.onerror = null;
      imageElement.onload = null;
      imageElement.classList.remove("asset-load-error");
      imageElement.classList.add("asset-placeholder");
      imageElement.dataset.assetPlaceholder = "true";

      /*
         Data URI: no additional server request, therefore no new 404.
      */
      imageElement.src = TRANSPARENT_ASSET_PLACEHOLDER;
    };

    const loadNext = () => {
      if (index >= fallbackArray.length) {
        useTransparentPlaceholder();
        return;
      }

      const currentIndex = index;
      const currentPath = fallbackArray[currentIndex];
      index = currentIndex + 1;

      imageElement.dataset.assetCandidateIndex =
        String(currentIndex);

      imageElement.onload = () => {
        imageElement.classList.remove(
          "asset-load-error",
          "asset-placeholder"
        );
        imageElement.dataset.assetPlaceholder = "false";
      };

      imageElement.onerror = () => {
        if (index < fallbackArray.length) {
          console.warn(
            `[Hustle Empire] Direct asset 404: ${currentPath}. Trying ${index + 1}/${fallbackArray.length}: ${fallbackArray[index]}`
          );
          loadNext();
          return;
        }

        console.warn(
          `[Hustle Empire] Direct asset 404: ${currentPath}. Transparent placeholder active.`
        );
        useTransparentPlaceholder();
      };

      imageElement.src = resolveAssetUrl(currentPath);
    };

    if (!fallbackArray.length) {
      useTransparentPlaceholder();
      return true;
    }

    loadNext();
    return true;
  }

  function installStaticImageFallbacks(root = document) {
    root.querySelectorAll?.("img[data-fallback-src]").forEach((image) => {
      if (image.dataset.assetFallbackBound === "true") return;
      image.dataset.assetFallbackBound = "true";

      const primary =
        image.dataset.primarySrc
        ||
        image.getAttribute("src")?.split("?")[0]
        ||
        "";

      /*
         data-fallback-src may be either one path or a legacy whitespace
         separated value. normalizeAssetCandidates() converts it to an array.
      */
      const fallbackCandidates = normalizeAssetCandidates(
        image.dataset.fallbackSrc || ""
      );

      setDirectImageAsset(
        image,
        primary,
        fallbackCandidates
      );
    });
  }


  /*
     V15.5 — ASSET AUDIT (PHYSICAL FILES ONLY)
     Exact case-sensitive paths expected by the current build.
     Run HustleAssetAudit() in DevTools to print the full list and resolved URL.
  */
  /*
     V15.5 — runtime audit uses the same verified real-asset allowlist.
  */

  function getAssetAuditList() {
    return REAL_GAME_ASSET_PATHS.map((path, index) => ({
      index: index + 1,
      path,
      fileName: path.split("/").pop(),
      resolvedUrl: resolveAssetUrl(path),
      verifiedInProjectAssets: true
    }));
  }

  function logAssetAudit() {
    const rows = getAssetAuditList();

    console.groupCollapsed(
      `[Hustle Empire] Asset audit v${SPRITE_BUILD_VERSION} — ${rows.length} paths`
    );
    console.table(rows);
    console.info(
      "GitHub Pages is case-sensitive: every filename above must exist exactly inside assets/."
    );
    console.groupEnd();

    return rows;
  }

  window.HustleAssetAudit = logAssetAudit;
  window.HustleAssetPathsExact = REAL_GAME_ASSET_PATHS;
  window.HustleImagePaths = REAL_GAME_ASSET_PATHS;

  window.HustleAssetPaths = ASSET_PATHS;
  window.HustleSpriteAssets = OFFICIAL_SPRITE_ASSETS;

  function findSpriteCellClass(node) {
    if (!node?.classList) return null;
    for (const className of node.classList) {
      if (SPRITE_CELLS[className]) return className;
    }
    return node.dataset?.spriteCell || null;
  }

  function findSpriteSheetKey(node, cellClass = findSpriteCellClass(node)) {
    if (node?.dataset?.spriteSheet) return node.dataset.spriteSheet;
    if (cellClass && SPRITE_CELLS[cellClass]) return SPRITE_CELLS[cellClass].sheet;
    if (node?.classList) {
      for (const [sheetClass, key] of Object.entries(SPRITE_SHEET_CLASS_TO_KEY)) {
        if (node.classList.contains(sheetClass)) return key;
      }
    }
    return null;
  }

  function directAssetMarkup(assetPath, extraClass = "") {
    const safePath = normalizeRelativeAssetPath(assetPath);
    if (!safePath || !REAL_GAME_ASSET_PATH_SET.has(safePath)) {
      return `<img class="asset-direct-image media-object-contain ${extraClass}" src="${TRANSPARENT_ASSET_PLACEHOLDER}" alt="" aria-hidden="true" draggable="false">`;
    }

    return `<img class="asset-direct-image media-object-contain ${extraClass}" src="${resolveAssetUrl(safePath)}" alt="" aria-hidden="true" draggable="false" decoding="async">`;
  }

  function spriteMarkup(_sheetClass, cellClass, extraClass = "") {
    const assetPath = DIRECT_ASSET_BY_CELL[cellClass];
    return directAssetMarkup(assetPath, extraClass);
  }


  function setCardArtBackground(element, assetPath) {
    if (!element) return false;
    const safePath = normalizeRelativeAssetPath(assetPath);
    if (!safePath || !REAL_GAME_ASSET_PATH_SET.has(safePath)) {
      element.style.backgroundImage = "none";
      element.dataset.cardArt = "placeholder";
      return false;
    }
    element.style.backgroundImage = `url("${resolveAssetUrl(safePath)}")`;
    element.dataset.cardArt = safePath;
    return true;
  }

  function cardArtMarkup(assetPath, extraClass = "") {
    const safePath = normalizeRelativeAssetPath(assetPath);
    const url = safePath && REAL_GAME_ASSET_PATH_SET.has(safePath)
      ? resolveAssetUrl(safePath)
      : TRANSPARENT_ASSET_PLACEHOLDER;
    return `
      <div class="card-art-background ${extraClass}" style="background-image:url(&quot;${url}&quot;)"></div>
      <div class="card-ui-frame" aria-hidden="true"></div>`;
  }

  function ensureSpriteCanvas(node) {
    let canvas = null;
    for (const child of Array.from(node.children || [])) {
      if (child.tagName === "CANVAS" && child.classList.contains("sprite-canvas")) {
        canvas = child;
        break;
      }
    }
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "sprite-canvas";
      canvas.setAttribute("aria-hidden", "true");
      while (node.firstChild) node.removeChild(node.firstChild);
      node.appendChild(canvas);
    }
    return canvas;
  }

  function getAvatarFaceCrop(cellClass, sx, sy, sw, sh) {
    const tune = {
      "char-level-1": { x: .26, y: .01, w: .48, h: .48 },
      "char-level-2": { x: .24, y: .01, w: .50, h: .50 },
      "char-level-3": { x: .25, y: .01, w: .49, h: .49 },
      "char-level-4": { x: .23, y: 0,   w: .52, h: .52 }
    }[cellClass] || { x: .24, y: 0, w: .52, h: .52 };

    return {
      sx: sx + sw * tune.x,
      sy: sy + sh * tune.y,
      sw: sw * tune.w,
      sh: sh * tune.h
    };
  }

  function drawSpriteNode(node) {
    if (!node || !node.isConnected) return false;

    const cellClass = findSpriteCellClass(node);
    const layout = SPRITE_CELLS[cellClass];
    const sheetKey = findSpriteSheetKey(node, cellClass);
    const image = SPRITE_IMAGES[sheetKey];
    if (!layout || !image || !image.naturalWidth || !image.naturalHeight) return false;

    const rect = node.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.round(node.clientWidth || rect.width || 64));
    const cssHeight = Math.max(1, Math.round(node.clientHeight || rect.height || 64));
    const dpr = Math.min(2, Math.max(1, Number(window.devicePixelRatio) || 1));

    const canvas = ensureSpriteCanvas(node);
    const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
    const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.imageSmoothingEnabled = true;
    if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";

    const cellWidth = image.naturalWidth / layout.cols;
    const cellHeight = image.naturalHeight / layout.rows;
    let sx = cellWidth * layout.col;
    let sy = cellHeight * layout.row;
    let sw = cellWidth;
    let sh = cellHeight;

    const isAvatar = node.classList.contains("player-avatar-sprite");
    if (isAvatar && sheetKey === "character") {
      ({ sx, sy, sw, sh } = getAvatarFaceCrop(cellClass, sx, sy, sw, sh));
    }

    const srcAspect = sw / sh;
    const dstAspect = cssWidth / cssHeight;
    let dx = 0;
    let dy = 0;
    let dw = cssWidth;
    let dh = cssHeight;

    if (isAvatar) {
      /* Cover crop for a circular portrait. */
      if (srcAspect > dstAspect) {
        const wantedSw = sh * dstAspect;
        sx += (sw - wantedSw) / 2;
        sw = wantedSw;
      } else if (srcAspect < dstAspect) {
        const wantedSh = sw / dstAspect;
        sy += (sh - wantedSh) / 2;
        sh = wantedSh;
      }
    } else if (srcAspect > dstAspect) {
      dh = cssWidth / srcAspect;
      dy = (cssHeight - dh) / 2;
    } else {
      dw = cssHeight * srcAspect;
      dx = (cssWidth - dw) / 2;
    }

    ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    node.dataset.spriteRendered = "true";
    return true;
  }

  function renderSpriteTree(root = document) {
    if (!spriteAssetsReady) return;
    const nodes = [];
    if (root?.matches?.(".sprite-icon")) nodes.push(root);
    root?.querySelectorAll?.(".sprite-icon").forEach((node) => nodes.push(node));
    nodes.forEach((node) => drawSpriteNode(node));
  }

  function scheduleSpriteRender(root = document) {
    requestAnimationFrame(() => renderSpriteTree(root));
  }

  function normalizeSpriteFrames() {
    document.querySelectorAll(".sprite-icon").forEach((node) => {
      node.classList.add("sprite-frame");
      const cellClass = findSpriteCellClass(node);
      const sheetKey = findSpriteSheetKey(node, cellClass);
      if (cellClass) node.dataset.spriteCell = cellClass;
      if (sheetKey) node.dataset.spriteSheet = sheetKey;
    });

    document.querySelectorAll('img[src*="sprite_"]').forEach((image) => {
      if (!image.classList.contains("city-map-image")) {
        image.hidden = true;
        image.setAttribute("aria-hidden", "true");
      }
    });
  }

  function installSpriteRendererObservers() {
    if (typeof ResizeObserver === "function") {
      spriteResizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => drawSpriteNode(entry.target));
      });
      document.querySelectorAll(".sprite-icon").forEach((node) => spriteResizeObserver.observe(node));
    }

    spriteMutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((added) => {
          if (!(added instanceof Element)) return;
          installStaticImageFallbacks(added);
          normalizeSpriteFrames();
          if (spriteResizeObserver) {
            if (added.matches(".sprite-icon")) spriteResizeObserver.observe(added);
            added.querySelectorAll?.(".sprite-icon").forEach((node) => spriteResizeObserver.observe(node));
          }
          scheduleSpriteRender(added);
        });
      }
    });
    spriteMutationObserver.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("resize", () => scheduleSpriteRender(document), { passive: true });
    window.addEventListener("orientationchange", () => setTimeout(() => scheduleSpriteRender(document), 80), { passive: true });
  }

  window.HustleCharacterDiagnostics = () =>
    Array.from(
      document.querySelectorAll(
        ".home-character-sprite, .wardrobe-character-sprite"
      )
    ).map((element) => ({
      tag: element.tagName,
      className: element.className,
      src: element instanceof HTMLImageElement ? element.currentSrc || element.src : "",
      expectedAsset: element.dataset.characterAsset || "",
      loaded: element instanceof HTMLImageElement
        ? Boolean(element.complete && element.naturalWidth > 0)
        : false,
      naturalWidth: element instanceof HTMLImageElement
        ? element.naturalWidth
        : 0,
      naturalHeight: element instanceof HTMLImageElement
        ? element.naturalHeight
        : 0
    }));

  window.HustleSpriteDiagnostics = () => ({
    version: SPRITE_BUILD_VERSION,
    assets: Object.fromEntries(Object.entries(OFFICIAL_SPRITE_ASSETS).map(([key, src]) => [key, {
      src: resolveAssetUrl(src),
      loaded: Boolean(SPRITE_IMAGES[key]?.naturalWidth),
      width: SPRITE_IMAGES[key]?.naturalWidth || 0,
      height: SPRITE_IMAGES[key]?.naturalHeight || 0
    }])),
    renderedNodes: document.querySelectorAll('[data-sprite-rendered="true"]').length,
    totalNodes: document.querySelectorAll(".sprite-icon").length
  });

  const CHARACTER_GENDERS = Object.freeze(["male", "female"]);
  const DEFAULT_CHARACTER_GENDER = "male";

  function normalizeCharacterGender(value) {
    const gender = String(value || "").toLowerCase();
    return CHARACTER_GENDERS.includes(gender)
      ? gender
      : DEFAULT_CHARACTER_GENDER;
  }

  function getSelectedCharacterGender(targetState = state) {
    return normalizeCharacterGender(
      targetState?.profile?.characterGender
      ?? targetState?.profile?.gender
      ?? targetState?.gender
    );
  }

  function getCharacterStage(level = state?.level || 1) {
    const safeLevel = Math.max(1, Math.floor(Number(level) || 1));

    // Character art upgrades at the same milestones used by the asset set.
    if (safeLevel < 10) return 1;
    if (safeLevel < 30) return 2;
    return 3;
  }

  function getSelectedAvatarAsset(
    gender = getSelectedCharacterGender()
  ) {
    const normalized = normalizeCharacterGender(gender);

    return (
      ASSET_PATHS.avatarsByGender?.[normalized]
      ||
      ASSET_PATHS.avatarsByGender?.[DEFAULT_CHARACTER_GENDER]
      ||
      {
        primary: ASSET_PATHS.avatar,
        fallback: ASSET_PATHS.avatarFallback
      }
    );
  }

  function getRealCharacterAsset(
    stage = 1,
    gender = getSelectedCharacterGender()
  ) {
    const normalizedGender = normalizeCharacterGender(gender);
    const genderSet =
      ASSET_PATHS.charactersByGender?.[normalizedGender];

    return (
      genderSet?.[stage]
      ||
      genderSet?.[1]
      ||
      ASSET_PATHS.characters[stage]
      ||
      ASSET_PATHS.characters[1]
      ||
      { primary: "assets/hero_lvl1.png", fallback: "" }
    );
  }

  function forceDirectCharacterImage(element, stage = 1) {
    if (!(element instanceof HTMLImageElement)) return false;

    const gender = getSelectedCharacterGender();
    const asset = getRealCharacterAsset(stage, gender);
    const cleanPath = normalizeRelativeAssetPath(asset.primary);
    const fallbackPath = normalizeRelativeAssetPath(asset.fallback);

    element.dataset.characterGender = gender;

    /*
       The Home and Wardrobe character are NOT sprite nodes.
       Remove every sprite class / dataset that can make old CSS or the
       canvas renderer paint a placeholder/silhouette over the real PNG.
    */
    element.classList.remove(
      "sprite-icon",
      "sprite-frame",
      "sprite-character",
      "char-level-1",
      "char-level-2",
      "char-level-3",
      "char-level-4",
      "asset-load-error",
      "asset-placeholder"
    );

    element.classList.add(
      "direct-character-image",
      "character-real-image"
    );

    delete element.dataset.spriteSheet;
    delete element.dataset.spriteCell;
    delete element.dataset.spriteRendered;

    element.dataset.characterStage = String(stage);
    element.dataset.characterAsset = cleanPath;

    /*
       Neutralize legacy sprite-sheet CSS with !important inline properties.
       This is necessary because older style.css builds contain
       .sprite-character { background-image: ... !important; }.
    */
    element.style.setProperty("background-image", "none", "important");
    element.style.setProperty("background", "transparent", "important");
    element.style.setProperty("background-size", "auto", "important");
    element.style.setProperty("background-position", "center", "important");
    element.style.setProperty("display", "block", "important");
    element.style.setProperty("visibility", "visible", "important");
    element.style.setProperty("opacity", "1", "important");
    element.style.setProperty("object-fit", "contain", "important");
    element.style.setProperty("object-position", "center bottom", "important");

    element.hidden = false;
    element.removeAttribute("aria-hidden");

    const expectedSrc = resolveAssetUrl(cleanPath);

    element.onload = () => {
      element.classList.remove(
        "asset-load-error",
        "asset-placeholder"
      );
      element.dataset.characterLoaded = "true";
    };

    element.onerror = () => {
      /*
         A gender-specific asset may not exist yet in an older deployment.
         Keep the saved choice, but fall back to the equivalent production
         male stage instead of blanking the character or corrupting state.
      */
      if (
        fallbackPath
        && element.dataset.characterFallbackTried !== "true"
      ) {
        element.dataset.characterFallbackTried = "true";
        element.dataset.characterFallbackUsed = "true";
        element.src = resolveAssetUrl(fallbackPath);
        return;
      }

      element.onerror = null;
      element.dataset.characterLoaded = "false";
      element.classList.add("asset-placeholder");
      element.src = TRANSPARENT_ASSET_PLACEHOLDER;
    };

    /*
       FORCE the exact relative asset URL used by the real assets package.
       Assign one URL only — no character-01.svg / character-main.svg.
    */
    if (element.src !== expectedSrc) {
      delete element.dataset.characterFallbackTried;
      delete element.dataset.characterFallbackUsed;
      element.src = expectedSrc;
    }

    return true;
  }

  function applyCharacterSpriteStage(element, level = state?.level || 1) {
    if (!element) return;

    const stage = getCharacterStage(level);

    if (element instanceof HTMLImageElement) {
      forceDirectCharacterImage(element, stage);
      return;
    }

    /*
       Legacy support only for true canvas/sprite nodes elsewhere.
       Home and Wardrobe never enter this branch anymore.
    */
    const cellClass = `char-level-${stage}`;

    element.classList.remove(
      "char-level-1",
      "char-level-2",
      "char-level-3",
      "char-level-4"
    );
    element.classList.add(cellClass);
    element.dataset.characterStage = String(stage);
    element.dataset.spriteSheet = "character";
    element.dataset.spriteCell = cellClass;

    if (spriteAssetsReady) {
      scheduleSpriteRender(element);
    }
  }

  const COLLECTION_CONFIG = CONFIG.COLLECTION || {};
  const WARDROBE_CONFIG = CONFIG.WARDROBE || {};

  /* ==========================================================
     V12.5 — LEVEL MISSIONS
     Level 1-3 use the exact requested balance.
     From LV4 onward, LV3 values scale by +50% per level.
  ========================================================== */

  /*
     Early-game quality-of-life:
     base automatic energy regeneration is 30% faster.
     Existing Card / Wardrobe regen multipliers still stack normally.
  */
  const BASE_ENERGY_REGEN_SPEED_MULTIPLIER = 1.30;

  const MISSION_ICONS = {
    taps: "☝",
    jobs: "📦",
    earn: "💵",
    upgrades: "🛠",
    bonuses: "🎁",
    events: "⚡"
  };

  const MISSION_LEVELS = {
    1: [
      { id: "taps", type: "taps", target: 50, reward: 50 },
      { id: "jobs", type: "jobs", target: 1, reward: 100 },
      { id: "earn", type: "earn", target: 200, reward: 150 },
      { id: "upgrades", type: "upgrades", target: 1, reward: 100 }
    ],
    2: [
      { id: "taps", type: "taps", target: 150, reward: 150 },
      { id: "jobs", type: "jobs", target: 3, reward: 300 },
      { id: "earn", type: "earn", target: 1000, reward: 500 },
      { id: "upgrades", type: "upgrades", target: 2, reward: 400 },
      { id: "bonuses", type: "bonuses", target: 1, reward: 200 }
    ],
    3: [
      { id: "taps", type: "taps", target: 300, reward: 300 },
      { id: "jobs", type: "jobs", target: 5, reward: 600 },
      { id: "earn", type: "earn", target: 5000, reward: 1200 },
      { id: "events", type: "events", target: 1, reward: 500 },
      { id: "upgrades", type: "upgrades", target: 3, reward: 800 },
      { id: "bonuses", type: "bonuses", target: 2, reward: 400 }
    ]
  };

  function getMissionDefinitions(level) {
    const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
    if (MISSION_LEVELS[safeLevel]) {
      return MISSION_LEVELS[safeLevel].map((mission) => ({ ...mission }));
    }

    const factor = Math.pow(1.5, safeLevel - 3);
    return MISSION_LEVELS[3].map((mission) => ({
      ...mission,
      target: Math.max(1, Math.ceil(mission.target * factor)),
      reward: Math.max(1, Math.ceil(mission.reward * factor))
    }));
  }

  function createMissionState(level = 1) {
    const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
    const definitions = getMissionDefinitions(safeLevel);
    return {
      level: safeLevel,
      progress: Object.fromEntries(definitions.map((mission) => [mission.id, 0])),
      completed: Object.fromEntries(definitions.map((mission) => [mission.id, false])),
      rewarded: Object.fromEntries(definitions.map((mission) => [mission.id, false]))
    };
  }

  /* ==========================================================
     V14.1 — LEVEL UP REWARDS + TEMPORARY EARNINGS BOOST
     Rewards are granted once when the Missions-gated Next Level
     action successfully advances the player.
  ========================================================== */

  const LEVEL_UP_CASE_REWARDS = Object.freeze({
    street: Object.freeze({
      key: "street",
      label: "Street Case",
      asset: ASSET_PATHS.cases.daily
    }),
    boss: Object.freeze({
      key: "boss",
      label: "Boss Case",
      asset: ASSET_PATHS.cases.accessoryEpic
    }),
    tycoon: Object.freeze({
      key: "tycoon",
      label: "Tycoon Case",
      asset: ASSET_PATHS.cases.accessoryLegendary
    })
  });

  const LEVEL_UP_BOOST_TIERS = Object.freeze([
    Object.freeze({ minLevel: 2, maxLevel: 5, multiplier: 1.5, durationSeconds: 180 }),
    Object.freeze({ minLevel: 6, maxLevel: 10, multiplier: 2, durationSeconds: 300 }),
    Object.freeze({ minLevel: 11, maxLevel: Infinity, multiplier: 3, durationSeconds: 600 })
  ]);

  function createDefaultLevelRewardsState() {
    return {
      lastRewardedLevel: 1,
      caseInventory: {
        street: 0,
        boss: 0,
        tycoon: 0
      },
      activeBoost: {
        multiplier: 1,
        startedAt: 0,
        endsAt: 0,
        sourceLevel: 0
      }
    };
  }

  function getLevelUpCaseReward(level) {
    const safeLevel = Math.max(2, Math.floor(Number(level) || 2));
    if (safeLevel <= 5) return LEVEL_UP_CASE_REWARDS.street;
    if (safeLevel <= 10) return LEVEL_UP_CASE_REWARDS.boss;
    return LEVEL_UP_CASE_REWARDS.tycoon;
  }

  function getLevelUpBoostConfig(level) {
    const safeLevel = Math.max(2, Math.floor(Number(level) || 2));
    return LEVEL_UP_BOOST_TIERS.find((tier) =>
      safeLevel >= tier.minLevel && safeLevel <= tier.maxLevel
    ) || LEVEL_UP_BOOST_TIERS[LEVEL_UP_BOOST_TIERS.length - 1];
  }

  function getLevelUpEarningsMultiplier(targetState = state, now = Date.now()) {
    const boost = targetState?.levelRewards?.activeBoost;
    if (!boost || Number(boost.endsAt) <= now) return 1;
    return Math.max(1, Number(boost.multiplier) || 1);
  }

  function getLevelUpBoostRemainingMs(targetState = state, now = Date.now()) {
    return Math.max(0, (Number(targetState?.levelRewards?.activeBoost?.endsAt) || 0) - now);
  }

  function formatBoostMultiplier(multiplier) {
    const value = Math.max(1, Number(multiplier) || 1);
    return Number.isInteger(value) ? `${value}x` : `${value.toFixed(1).replace(/\.0$/, "")}x`;
  }

  function formatBoostTimer(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil((Number(milliseconds) || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function grantLevelUpRewards(level) {
    const safeLevel = Math.max(2, Math.floor(Number(level) || 2));
    state.levelRewards ||= createDefaultLevelRewardsState();

    /*
       Idempotency guard: one reward package per reached level.
       Prevents double rewards from accidental double taps / restored events.
    */
    if (safeLevel <= (Number(state.levelRewards.lastRewardedLevel) || 1)) {
      return null;
    }

    const caseReward = getLevelUpCaseReward(safeLevel);
    const boostConfig = getLevelUpBoostConfig(safeLevel);
    const gemReward = 5 * safeLevel;
    const now = Date.now();

    state.levelRewards.caseInventory[caseReward.key] =
      Math.max(0, Number(state.levelRewards.caseInventory[caseReward.key]) || 0) + 1;

    state.gems += gemReward;

    state.levelRewards.activeBoost = {
      multiplier: boostConfig.multiplier,
      startedAt: now,
      endsAt: now + boostConfig.durationSeconds * 1000,
      sourceLevel: safeLevel
    };

    state.levelRewards.lastRewardedLevel = safeLevel;

    const reward = {
      level: safeLevel,
      gems: gemReward,
      caseKey: caseReward.key,
      caseLabel: caseReward.label,
      caseAsset: caseReward.asset,
      caseInventoryCount: state.levelRewards.caseInventory[caseReward.key],
      boostMultiplier: boostConfig.multiplier,
      boostDurationSeconds: boostConfig.durationSeconds,
      boostEndsAt: state.levelRewards.activeBoost.endsAt
    };

    emitGameEvent("levelUpRewardGranted", reward);
    return reward;
  }

  const GAME_TICK_INTERVAL = 1000;
  const AUTO_SAVE_INTERVAL = 10000;

  /* ==========================================================
     V14.3 — OFFLINE EARNINGS
     Max accumulation: exactly 3 hours.
  ========================================================== */
  const OFFLINE_EARNINGS_CAP_SECONDS = 3 * 60 * 60;
  const OFFLINE_LAST_CLAIM_STORAGE_KEY = "lastClaimTime";

  /* ==========================================================
     V15.5 — DAILY RETENTION
     Daily Combo + Morse Cipher + 7-Day Check-in.
  ========================================================== */
  const DAILY_RETENTION_STORAGE_KEY = "hustleEmpireDailyRetentionV1";

  const DAILY_CHECKIN_REWARDS = Object.freeze([
    Object.freeze({ day: 1, money: 1000, gems: 0, label: "$1K" }),
    Object.freeze({ day: 2, money: 2500, gems: 0, label: "$2.5K" }),
    Object.freeze({ day: 3, money: 0, gems: 10, label: "♦ 10" }),
    Object.freeze({ day: 4, money: 5000, gems: 0, label: "$5K" }),
    Object.freeze({ day: 5, money: 0, gems: 25, label: "♦ 25" }),
    Object.freeze({ day: 6, money: 10000, gems: 50, label: "$10K + ♦50" }),
    Object.freeze({ day: 7, money: 0, gems: 500, caseType: "boss", label: Object.freeze({ en: "♦ 500 + Rare Case", ru: "♦ 500 + Редкий кейс" }) })
  ]);

  const MORSE_DIGITS = Object.freeze({
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----."
  });

  let selectedWardrobeSlot = EQUIPMENT_IDS[0] || "cap";
  let wardrobeView = "items";
  let selectedStyleSetId = STYLE_SET_IDS[0] || null;

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const CRITICAL_POPUP_TRANSLATIONS = Object.freeze({
    en: Object.freeze({
      "offline.cappedAway": "Maximum: 3 hours",
      "offline.claimAmount": "Claim ${amount}",
      "modal.dailyChest": "Daily Chest",
      "modal.dailyChestText": "Come back when the timer reaches zero to claim your Daily Chest.",
      "modal.dailyChestRemaining": "Time remaining: {time}",
      "common.ok": "OK",
      "modal.premiumPlaceholder": "Telegram Stars payment will open here when payments are enabled."
    }),
    ru: Object.freeze({
      "offline.cappedAway": "Максимум: 3 часа",
      "offline.claimAmount": "Забрать ${amount}",
      "modal.dailyChest": "Ежедневный сундук",
      "modal.dailyChestText": "Вернись, когда таймер дойдёт до нуля, чтобы забрать ежедневный сундук.",
      "modal.dailyChestRemaining": "Осталось: {time}",
      "common.ok": "OK",
      "modal.premiumPlaceholder": "Оплата через Telegram Stars откроется здесь после подключения платежей."
    })
  });

  function currentLanguage() {
    return window.i18n?.getLanguage?.() || document.documentElement.lang || "en";
  }

  function interpolateCriticalTranslation(template, params = {}) {
    return String(template ?? "").replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(params, key)
        ? String(params[key])
        : `{${key}}`;
    });
  }

  function tr(key, params = {}) {
    const translated = window.i18n?.t?.(key, params);

    if (translated && translated !== key) {
      return translated;
    }

    const lang = currentLanguage() === "ru" ? "ru" : "en";
    const fallback =
      CRITICAL_POPUP_TRANSLATIONS[lang]?.[key]
      ?? CRITICAL_POPUP_TRANSLATIONS.en?.[key];

    if (fallback) {
      return interpolateCriticalTranslation(fallback, params);
    }

    return currentLanguage() === "ru"
      ? "Текст недоступен"
      : "Text unavailable";
  }

  function looksLikeTechnicalTranslationValue(value) {
    const text = String(value || "").trim();
    if (!text) return false;

    return (
      /^[a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)+$/i.test(text)
      || /^[a-z0-9]+(?:_[a-z0-9]+)+$/i.test(text)
    );
  }

  function getLocalizedValue(value, fallbackKey = "") {
    const lang = currentLanguage();

    const resolveKnownKey = (candidate) => {
      const key = String(candidate || "").trim();
      if (!key) return "";

      /*
         Important: i18n.t() intentionally returns a safe phrase for a
         missing key. We therefore check i18n.has() FIRST, otherwise an old
         config key such as "business.cafe.name" could become
         "Text unavailable" / "Текст недоступен" instead of using fallbackKey.
      */
      if (window.i18n?.has?.(key, lang)) {
        return window.i18n.t(key);
      }

      return "";
    };

    if (typeof value === "string") {
      const direct = value.trim();

      if (direct) {
        const translated = resolveKnownKey(direct);
        if (translated) return translated;

        if (!looksLikeTechnicalTranslationValue(direct)) {
          return direct;
        }
      }

      if (fallbackKey && window.i18n?.has?.(fallbackKey, lang)) {
        return tr(fallbackKey);
      }

      return looksLikeTechnicalTranslationValue(direct)
        ? tr("common.textUnavailable")
        : direct;
    }

    const localized =
      value?.[lang]
      || value?.en
      || value?.ru
      || "";

    if (typeof localized === "string" && localized) {
      const translated = resolveKnownKey(localized);
      if (translated) return translated;

      if (!looksLikeTechnicalTranslationValue(localized)) {
        /*
           A localized object value is already language-specific, so a
           normal sentence/name can be displayed directly.
        */
        return localized;
      }
    }

    if (fallbackKey && window.i18n?.has?.(fallbackKey, lang)) {
      return tr(fallbackKey);
    }

    return localized && !looksLikeTechnicalTranslationValue(localized)
      ? localized
      : tr("common.textUnavailable");
  }

  function getBusinessDisplayName(
    businessId,
    cfg = BUSINESS_CONFIGS[businessId]
  ) {
    const key = `businesses.${businessId}.name`;

    if (window.i18n?.has?.(key, currentLanguage())) {
      return tr(key);
    }

    return getLocalizedValue(cfg?.name, key);
  }

  function getDistrictDisplayName(
    districtId,
    cfg = DISTRICT_CONFIGS[districtId]
  ) {
    const key = `districts.${districtId}.name`;

    if (window.i18n?.has?.(key, currentLanguage())) {
      return tr(key);
    }

    return getLocalizedValue(cfg?.name, key);
  }

  function getDistrictTagline(
    districtId,
    cfg = DISTRICT_CONFIGS[districtId]
  ) {
    const key = `districts.${districtId}.tagline`;

    if (window.i18n?.has?.(key, currentLanguage())) {
      return tr(key);
    }

    return getLocalizedValue(cfg?.tagline, key);
  }

  function getDistrictRangeLabel(districtId, cfg = DISTRICT_CONFIGS[districtId]) {
    const key = `districts.${districtId}.range`;

    if (window.i18n?.has?.(key, currentLanguage())) {
      return tr(key);
    }

    return getLocalizedValue(cfg?.range, key);
  }

  function getTimedCaseDisplayName(caseId, cfg) {
    const canonicalKey = `caseNames.${caseId}`;
    const legacyKey = `cases.${caseId}`;

    if (window.i18n?.has?.(canonicalKey, currentLanguage())) {
      return tr(canonicalKey);
    }

    if (window.i18n?.has?.(legacyKey, currentLanguage())) {
      return tr(legacyKey);
    }

    return getLocalizedValue(cfg?.name, canonicalKey);
  }

  function getAccessoryCaseDisplayName(caseId, cfg) {
    const canonicalKey = `accessoryCaseNames.${caseId}`;
    const legacyKey = `accessoryCases.${caseId}`;

    if (window.i18n?.has?.(canonicalKey, currentLanguage())) {
      return tr(canonicalKey);
    }

    if (window.i18n?.has?.(legacyKey, currentLanguage())) {
      return tr(legacyKey);
    }

    return getLocalizedValue(cfg?.name, canonicalKey);
  }

  function getCardDisplayName(cardId, cfg = CARD_CONFIGS[cardId]) {
    return getLocalizedValue(cfg?.name, `cards.${cardId}.name`);
  }

  function getExclusiveCardDescription(
    cardId,
    cfg = EXCLUSIVE_CARD_CONFIGS[cardId]
  ) {
    const key = `cards.${cardId}.description`;

    if (window.i18n?.has?.(key, currentLanguage())) {
      return tr(key);
    }

    return getLocalizedValue(cfg?.description, key);
  }

  function getWardrobeCatalogDisplayName(
    itemId,
    cfg = WARDROBE_CATALOG_CONFIGS[itemId]
  ) {
    return getLocalizedValue(cfg?.name, `wardrobeItems.${itemId}.name`);
  }

  function collectRuntimeTranslationKeys() {
    const keys = new Set();

    CARD_IDS.forEach((id) => keys.add(`cards.${id}.name`));
    EXCLUSIVE_CARD_IDS.forEach((id) => keys.add(`cards.${id}.name`));
    TIMED_CASE_IDS.forEach((id) => keys.add(`caseNames.${id}`));
    ACCESSORY_CASE_IDS.forEach((id) => keys.add(`accessoryCaseNames.${id}`));
    ACCESSORY_CASE_IDS.forEach((id) => keys.add(`accessoryCases.${id}`));
    TIMED_CASE_IDS.forEach((id) => keys.add(`cases.${id}`));
    WARDROBE_CATALOG_IDS.forEach((id) => keys.add(`wardrobeItems.${id}.name`));
    EQUIPMENT_IDS.forEach((id) => {
      keys.add(`wardrobeSlots.${id}`);

      const stages = EQUIPMENT_CONFIGS[id]?.stages || [];
      stages.forEach((stage) => {
        const minLevel = Math.max(1, Number(stage?.minLevel) || 1);
        keys.add(`equipment.${id}.stage${minLevel}.name`);
      });
    });

    STYLE_SET_IDS.forEach((id) => {
      keys.add(`styleSets.${id}.name`);
      keys.add(`styleSets.${id}.description`);
    });
    BUSINESS_IDS.forEach((id) => keys.add(`businesses.${id}.name`));
    DISTRICT_IDS.forEach((id) => {
      keys.add(`districts.${id}.name`);
      keys.add(`districts.${id}.tagline`);
      keys.add(`districts.${id}.range`);
    });

    Object.values(WARDROBE_CATALOG_CONFIGS).forEach((cfg) => {
      if (cfg?.slot) keys.add(`wardrobeSlots.${cfg.slot}`);
      if (cfg?.rarity) keys.add(`rarity.${cfg.rarity}`);
    });

    [
      ...Object.values(CARD_CONFIGS),
      ...Object.values(EXCLUSIVE_CARD_CONFIGS)
    ].forEach((cfg) => {
      if (cfg?.rarity) keys.add(`rarity.${cfg.rarity}`);
    });

    Object.values(ACCESSORY_CASE_CONFIGS).forEach((cfg) => {
      Object.keys(cfg?.rates || {}).forEach((rarity) => {
        keys.add(`rarity.${rarity}`);
      });
    });

    ["street", "boss", "tycoon"].forEach((key) => {
      keys.add(`levelUp.case.${key}`);
    });

    [
      "offline.hicker",
      "offline.kicker",
      "offline.welcome",
      "offline.accumulated",
      "offline.maxCap",
      "offline.claimAmount",
      "home.missions",
      "home.nextLevel",
      "home.quickJobs",
      "home.quickActivity",
      "missions.taps",
      "missions.jobs",
      "missions.earn",
      "missions.upgrades",
      "missions.bonuses",
      "missions.events",
      "hustles.jobFallback",
      "hustles.completed",
      "hustles.notEnoughEnergy",
      "hustles.run",
      "home.activeBusinesses",
      "home.totalIncome",
      "home.noActiveBusinesses",
      "business.available",
      "business.owned",
      "business.locked",
      "business.active",
      "business.incomePerSecond",
      "business.incomePerHour",
      "business.unlockAtLevel",
      "city.districtActivity",
      "city.unlocked",
      "cases.title",
      "cases.helper",
      "cases.open",
      "cases.ready",
      "cases.waiting",
      "cases.caseUnlockNow",
      "cases.fragments",
      "cases.durationHours",
      "accessoryCases",
      "accessory.uses.true",
      "accessory.uses.false",
      "accessoryCases.title",
      "accessoryCases.openFree",
      "accessoryCases.ready",
      "accessoryCases.waiting",
      "accessoryCases.collectionComplete",
      "collection.book",
      "collection.levelUp",
      "collection.unlock",
      "collection.summaryCount",
      "collection.fragmentsProgress",
      "collection.bonus",
      "cards.bonus.businessIncomePercent",
      "cards.bonus.tapPowerFlat",
      "cards.bonus.criticalRatePercent",
      "cards.bonus.criticalDamagePercent",
      "cards.bonus.energyMaxFlat",
      "cards.bonus.energyRegenSpeedPercent",
      "wardrobe.title",
      "wardrobe.tabs.items",
      "wardrobe.tabs.sets",
      "wardrobe.catalog",
      "wardrobe.outfitProgress",
      "wardrobe.totalStats",
      "wardrobe.buyLevelOne",
      "wardrobe.upgradeByLevel",
      "wardrobe.maxLevel",
      "wardrobe.requiredEquipmentLevel",
      "wardrobe.setComplete",
      "wardrobe.completeSet",
      "wardrobe.itemLevelName",
      "wardrobe.styleSetFallback",
      "wardrobe.styleSetDescriptionFallback",
      "shop.title",
      "shop.boosts",
      "shop.gems",
      "shop.premiumCase",
      "shop.premiumCaseDesc",
      "shop.outfitSkin",
      "shop.outfitSkinDesc",
      "shop.hustleBundle",
      "shop.hustleBundleDesc",
      "shop.empirePass",
      "shop.empirePassDesc",
      "shop.perMonth",
      "modal.premiumPlaceholder"
    ].forEach((key) => keys.add(key));


    /*
       Detect technical translation keys inside older config.js revisions.
       Asset filenames/URLs are ignored.
    */
    const visited = new WeakSet();

    const scan = (value) => {
      if (!value) return;

      if (typeof value === "string") {
        if (
          looksLikeTechnicalTranslationValue(value)
          && !/\.(?:png|jpe?g|webp|svg|css|js)$/i.test(value)
        ) {
          keys.add(value);
        }
        return;
      }

      if (typeof value !== "object" || visited.has(value)) return;
      visited.add(value);
      Object.values(value).forEach(scan);
    };

    scan(CONFIG);

    return [...keys].sort();
  }

  function auditGameTranslations() {
    const requiredKeys = collectRuntimeTranslationKeys();
    const report = window.i18n?.audit?.(requiredKeys) || {
      ok: false,
      requiredMissing: requiredKeys
    };

    window.__URBAN_TYCOON_GAME_I18N_AUDIT__ = report;

    if (!report.ok) {
      console.error(
        "[Urban Tycoon i18n] Runtime translation audit failed:",
        report
      );
    }

    return report;
  }

  function formatNumber(value) {
    const locale = currentLanguage() === "ru" ? "ru-RU" : "en-US";
    return Math.floor(Number(value) || 0).toLocaleString(locale);
  }

  function formatCompactCount(value) {
    const amount = Math.max(0, Math.floor(Number(value) || 0));
    if (amount >= 1e12) return `${(amount / 1e12).toFixed(1).replace(".0", "")}T`;
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1).replace(".0", "")}B`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1).replace(".0", "")}M`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(1).replace(".0", "")}K`;
    return formatNumber(amount);
  }

  function formatCompactMoney(value) {
    const amount = Math.max(0, Number(value) || 0);
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1).replace(".0", "")}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1).replace(".0", "")}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1).replace(".0", "")}K`;
    if (amount >= 100) return `$${Math.floor(amount)}`;
    return `$${amount.toFixed(amount < 10 ? 2 : 0).replace(/\.00$/, "")}`;
  }

  function formatIncomePerSecond(value) {
    const amount = Number(value) || 0;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1).replace(".0", "")}K/s`;
    if (amount >= 100) return `$${amount.toFixed(0)}/s`;
    return `$${amount.toFixed(2)}/s`;
  }

  function emitGameEvent(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(`hustle:${name}`, { detail }));
  }


  /* ==========================================================
     V17.3 — SOCIAL TASKS SYSTEM
     Local/mock interaction layer. External social verification must
     eventually move server-side before real rewards are trusted.
  ========================================================== */

  const SOCIAL_TASK_STATUS = Object.freeze({
    PENDING: "pending",
    VERIFYING: "verifying",
    CLAIMABLE: "claimable",
    CLAIMED: "claimed"
  });

  const SOCIAL_TASK_CONFIGS = Object.freeze({
    daily_reward: Object.freeze({
      id: "daily_reward",
      kind: "daily",
      reward: Object.freeze({ gems: 50, money: 0 }),
      target: 1,
      verifyDelayMs: 0
    }),

    telegram_channel: Object.freeze({
      id: "telegram_channel",
      kind: "external",
      reward: Object.freeze({ gems: 0, money: 1000 }),
      target: 1,
      verifyDelayMs: 2200
    }),

    x_follow: Object.freeze({
      id: "x_follow",
      kind: "external",
      reward: Object.freeze({ gems: 75, money: 0 }),
      target: 1,
      verifyDelayMs: 2200
    }),

    invite_3_friends: Object.freeze({
      id: "invite_3_friends",
      kind: "invite",
      reward: Object.freeze({ gems: 150, money: 0 }),
      target: 3,
      verifyDelayMs: 0
    }),

    open_community: Object.freeze({
      id: "open_community",
      kind: "external",
      reward: Object.freeze({ gems: 0, money: 500 }),
      target: 1,
      verifyDelayMs: 1800
    }),

    invite_10_friends: Object.freeze({
      id: "invite_10_friends",
      kind: "invite",
      reward: Object.freeze({ gems: 400, money: 0 }),
      target: 10,
      verifyDelayMs: 0
    })
  });

  const SOCIAL_TASK_IDS = Object.freeze(Object.keys(SOCIAL_TASK_CONFIGS));

  /*
     Keep blank until the real public URLs are known.
     The task still works in local simulation mode.
     They can also be changed at runtime with:
     HustleGame.socialTasks.setActionLink(taskId, url)
  */
  const socialTaskActionLinks = {
    telegram_channel: "",
    x_follow: "",
    open_community: ""
  };

  function createDefaultSocialTasksState(timestamp = Date.now()) {
    return {
      dayKey: getUtcDayKey(timestamp),
      tasks: Object.fromEntries(
        SOCIAL_TASK_IDS.map((taskId) => {
          const cfg = SOCIAL_TASK_CONFIGS[taskId];

          return [
            taskId,
            {
              status:
                cfg.kind === "daily"
                  ? SOCIAL_TASK_STATUS.CLAIMABLE
                  : SOCIAL_TASK_STATUS.PENDING,
              progress: 0,
              verifyAt: 0,
              claimedAt: 0
            }
          ];
        })
      )
    };
  }

  function sanitizeSocialTasks(socialTasks, timestamp = Date.now()) {
    const now = Number(timestamp) || Date.now();
    const fresh = createDefaultSocialTasksState(now);
    const validStatuses = new Set(Object.values(SOCIAL_TASK_STATUS));

    const out = {
      dayKey: String(socialTasks?.dayKey || fresh.dayKey),
      tasks: {}
    };

    SOCIAL_TASK_IDS.forEach((taskId) => {
      const cfg = SOCIAL_TASK_CONFIGS[taskId];
      const src = socialTasks?.tasks?.[taskId] || {};
      const target = Math.max(1, Number(cfg.target) || 1);

      let progress = Math.max(
        0,
        Math.min(target, Math.floor(Number(src.progress) || 0))
      );

      let status = validStatuses.has(src.status)
        ? src.status
        : fresh.tasks[taskId].status;

      let verifyAt = Math.max(0, Number(src.verifyAt) || 0);
      const claimedAt = Math.max(0, Number(src.claimedAt) || 0);

      if (
        status === SOCIAL_TASK_STATUS.VERIFYING
        && verifyAt > 0
        && verifyAt <= now
      ) {
        status = SOCIAL_TASK_STATUS.CLAIMABLE;
        progress = target;
        verifyAt = 0;
      }

      if (
        cfg.kind === "invite"
        && progress >= target
        && status !== SOCIAL_TASK_STATUS.CLAIMED
      ) {
        status = SOCIAL_TASK_STATUS.CLAIMABLE;
      }

      out.tasks[taskId] = {
        status,
        progress,
        verifyAt,
        claimedAt
      };
    });

    const currentDayKey = getUtcDayKey(now);

    if (out.dayKey !== currentDayKey) {
      out.dayKey = currentDayKey;
      out.tasks.daily_reward = {
        status: SOCIAL_TASK_STATUS.CLAIMABLE,
        progress: 0,
        verifyAt: 0,
        claimedAt: 0
      };
    }

    return out;
  }

  /* ==========================================================
     DEFAULT STATE
  ========================================================== */

  function createDefaultCardsState() {
    return Object.fromEntries(CARD_IDS.map((cardId) => {
      const initial = CARD_CONFIGS[cardId].initial || {};
      return [cardId, {
        unlocked: Boolean(initial.unlocked),
        level: Math.max(0, Math.floor(Number(initial.level) || 0)),
        fragments: Math.max(0, Math.floor(Number(initial.fragments) || 0))
      }];
    }));
  }

  function createDefaultEquipmentState() {
    return Object.fromEntries(EQUIPMENT_IDS.map((equipmentId) => [
      equipmentId,
      { unlocked: false, level: 0, equipped: false }
    ]));
  }

  function createDefaultBusinessesState() {
    return Object.fromEntries(BUSINESS_IDS.map((businessId) => {
      const cfg = BUSINESS_CONFIGS[businessId];
      const owned = Boolean(cfg.initialOwned);
      return [businessId, {
        owned,
        level: owned ? (Number(cfg.startingLevel) || 1) : 0
      }];
    }));
  }

  function createDefaultHustlesState() {
    return Object.fromEntries(HUSTLE_IDS.map((hustleId) => [hustleId, { runs: 0 }]));
  }

  function createDefaultTimedCasesState() {
    const now = Date.now();
    return Object.fromEntries(TIMED_CASE_IDS.map((caseId) => {
      const cfg = TIMED_CASE_CONFIGS[caseId];
      return [caseId, {
        unlockAt: now + (Number(cfg.durationSeconds) || 0) * 1000,
        opens: 0
      }];
    }));
  }

  function createDefaultWardrobeCatalogState() {
    return Object.fromEntries(WARDROBE_CATALOG_IDS.map((itemId) => [
      itemId,
      { unlocked: false, unlockedAt: null, source: null }
    ]));
  }

  function createDefaultAccessoryCasesState() {
    return {
      freeUnlockAt: Date.now(),
      freeOpens: 0,
      premiumOpens: {
        premium_rare: 0,
        premium_epic: 0,
        premium_legendary: 0
      }
    };
  }

  function createDefaultRandomEventsState() {
    return {
      nextSpawnAt: 0,
      activeEvent: null,
      tapBoostUntil: 0
    };
  }

  const DEFAULT_STATE = {
    /*
       Existing saves without profile data are deep-merged with this block.
       They keep all money/XP/missions/businesses and simply receive the safe
       default male character until the player confirms a choice.
    */
    profile: {
      characterGender: DEFAULT_CHARACTER_GENDER,
      characterSelected: false
    },

    money: 0,
    gems: 0,
    energy: CONFIG.ENERGY_MAX,
    maxEnergy: CONFIG.ENERGY_MAX,
    xp: 0,
    level: 1,
    clickPower: CONFIG.BASE_TAP_REWARD,

    streak: { days: 0, bonusPercent: 0 },

    missions: createMissionState(1),

    hustles: createDefaultHustlesState(),
    businesses: createDefaultBusinessesState(),
    city: { selectedDistrictId: "poor_block" },
    cards: createDefaultCardsState(),
    equipment: createDefaultEquipmentState(),
    timedCases: createDefaultTimedCasesState(),
    wardrobeCatalog: createDefaultWardrobeCatalogState(),
    accessoryCases: createDefaultAccessoryCasesState(),
    randomEvents: createDefaultRandomEventsState(),
    levelRewards: createDefaultLevelRewardsState(),
    socialTasks: createDefaultSocialTasksState(),

    /*
       Pending reward is persisted so closing Telegram before pressing
       "Claim" never deletes an already-calculated offline reward.
    */
    offlineEarnings: {
      pendingAmount: 0,
      elapsedSeconds: 0,
      cappedSeconds: 0,
      wasCapped: false,
      calculatedAt: 0
    },

    timestamps: {
      lastEnergyAt: Date.now(),
      lastIncomeAt: Date.now(),
      lastSaveAt: Date.now(),
      lastClaimTime: 0
    }
  };

  function deepMerge(base, saved) {
    if (typeof base !== "object" || base === null || Array.isArray(base)) return saved ?? base;
    const out = { ...base };
    if (!saved || typeof saved !== "object") return out;

    Object.keys(base).forEach((key) => {
      if (typeof base[key] === "object" && base[key] !== null && !Array.isArray(base[key])) {
        out[key] = deepMerge(base[key], saved[key]);
      } else if (saved[key] !== undefined) {
        out[key] = saved[key];
      }
    });
    return out;
  }

  function sanitizeCards(cards) {
    const maxLevel = Number(COLLECTION_CONFIG.MAX_CARD_LEVEL || 5);
    const out = {};
    CARD_IDS.forEach((cardId) => {
      const fallback = DEFAULT_STATE.cards[cardId];
      const src = cards?.[cardId] || fallback;
      let level = Math.max(0, Math.min(maxLevel, Math.floor(Number(src.level) || 0)));
      let unlocked = Boolean(src.unlocked);
      if (level > 0) unlocked = true;
      if (unlocked && level === 0) level = 1;
      out[cardId] = {
        unlocked,
        level,
        fragments: Math.max(0, Math.floor(Number(src.fragments) || 0))
      };
    });
    return out;
  }

  function sanitizeEquipment(equipment) {
    const maxLevel = Number(WARDROBE_CONFIG.MAX_LEVEL || 10);
    const out = {};
    EQUIPMENT_IDS.forEach((equipmentId) => {
      const src = equipment?.[equipmentId] || {};
      let level = Math.max(0, Math.min(maxLevel, Math.floor(Number(src.level) || 0)));
      let unlocked = Boolean(src.unlocked);
      if (level > 0) unlocked = true;
      if (!unlocked) level = 0;
      out[equipmentId] = {
        unlocked,
        level,
        equipped: unlocked ? src.equipped !== false : false
      };
    });
    return out;
  }

  function sanitizeBusinesses(businesses) {
    const out = {};
    BUSINESS_IDS.forEach((businessId) => {
      const cfg = BUSINESS_CONFIGS[businessId];
      const src = businesses?.[businessId] || {};
      let level = Math.max(0, Math.floor(Number(src.level) || 0));
      let owned = src.owned !== undefined ? Boolean(src.owned) : Boolean(cfg.initialOwned);

      /* V6 compatibility: kiosk was the starter business. */
      if (businessId === "kiosk" && (cfg.initialOwned || level > 0)) owned = true;
      if (owned && level <= 0) level = Number(cfg.startingLevel) || 1;
      if (!owned) level = 0;
      out[businessId] = { owned, level };
    });
    return out;
  }

  function sanitizeHustles(hustles) {
    const out = {};
    HUSTLE_IDS.forEach((hustleId) => {
      out[hustleId] = { runs: Math.max(0, Math.floor(Number(hustles?.[hustleId]?.runs) || 0)) };
    });
    return out;
  }

  function sanitizeTimedCases(cases) {
    const now = Date.now();
    const out = {};
    TIMED_CASE_IDS.forEach((caseId) => {
      const cfg = TIMED_CASE_CONFIGS[caseId];
      const src = cases?.[caseId];
      out[caseId] = {
        unlockAt: Number(src?.unlockAt) || (now + (Number(cfg.durationSeconds) || 0) * 1000),
        opens: Math.max(0, Math.floor(Number(src?.opens) || 0))
      };
    });
    return out;
  }

  function sanitizeWardrobeCatalog(catalog) {
    const out = {};
    WARDROBE_CATALOG_IDS.forEach((itemId) => {
      const src = catalog?.[itemId];
      out[itemId] = {
        unlocked: Boolean(src?.unlocked),
        unlockedAt: src?.unlockedAt || null,
        source: src?.source || null
      };
    });
    return out;
  }

  function sanitizeAccessoryCases(accessoryCases) {
    return {
      freeUnlockAt: Number(accessoryCases?.freeUnlockAt) || Date.now(),
      freeOpens: Math.max(0, Math.floor(Number(accessoryCases?.freeOpens) || 0)),
      premiumOpens: {
        premium_rare: Math.max(0, Math.floor(Number(accessoryCases?.premiumOpens?.premium_rare) || 0)),
        premium_epic: Math.max(0, Math.floor(Number(accessoryCases?.premiumOpens?.premium_epic) || 0)),
        premium_legendary: Math.max(0, Math.floor(Number(accessoryCases?.premiumOpens?.premium_legendary) || 0))
      }
    };
  }

  function sanitizeRandomEvents(randomEvents) {
    const active = randomEvents?.activeEvent;
    return {
      nextSpawnAt: Math.max(0, Number(randomEvents?.nextSpawnAt) || 0),
      activeEvent: active && Number(active.expiresAt) > Date.now() ? active : null,
      tapBoostUntil: Math.max(0, Number(randomEvents?.tapBoostUntil) || 0)
    };
  }

  function sanitizeLevelRewards(levelRewards, playerLevel) {
    const fallback = createDefaultLevelRewardsState();
    const safePlayerLevel = Math.max(1, Math.floor(Number(playerLevel) || 1));
    const sourceBoost = levelRewards?.activeBoost || {};

    return {
      /*
         Existing saves upgrading to V14.1 should still receive the reward for
         their next real level-up, but never retroactively duplicate old levels.
      */
      lastRewardedLevel: Math.min(
        safePlayerLevel,
        Math.max(1, Math.floor(Number(levelRewards?.lastRewardedLevel) || safePlayerLevel))
      ),
      caseInventory: {
        street: Math.max(0, Math.floor(Number(levelRewards?.caseInventory?.street) || 0)),
        boss: Math.max(0, Math.floor(Number(levelRewards?.caseInventory?.boss) || 0)),
        tycoon: Math.max(0, Math.floor(Number(levelRewards?.caseInventory?.tycoon) || 0))
      },
      activeBoost: {
        multiplier: Math.max(1, Number(sourceBoost.multiplier) || fallback.activeBoost.multiplier),
        startedAt: Math.max(0, Number(sourceBoost.startedAt) || 0),
        endsAt: Math.max(0, Number(sourceBoost.endsAt) || 0),
        sourceLevel: Math.max(0, Math.floor(Number(sourceBoost.sourceLevel) || 0))
      }
    };
  }

  function sanitizeMissions(missions, playerLevel) {
    const safeLevel = Math.max(1, Math.floor(Number(playerLevel) || 1));
    const fresh = createMissionState(safeLevel);

    if (!missions || Number(missions.level) !== safeLevel) return fresh;

    const definitions = getMissionDefinitions(safeLevel);
    definitions.forEach((mission) => {
      const rawProgress = Number(missions.progress?.[mission.id]) || 0;
      const progress = Math.min(mission.target, Math.max(0, rawProgress));
      const completed = Boolean(missions.completed?.[mission.id] || progress >= mission.target);

      fresh.progress[mission.id] = completed ? mission.target : progress;
      fresh.completed[mission.id] = completed;
      fresh.rewarded[mission.id] = completed
        ? Boolean(missions.rewarded?.[mission.id] ?? true)
        : false;
    });

    return fresh;
  }

  function sanitizeOfflineEarnings(offlineEarnings) {
    return {
      pendingAmount: Math.max(0, Number(offlineEarnings?.pendingAmount) || 0),
      elapsedSeconds: Math.max(0, Math.floor(Number(offlineEarnings?.elapsedSeconds) || 0)),
      cappedSeconds: Math.max(0, Math.min(
        OFFLINE_EARNINGS_CAP_SECONDS,
        Math.floor(Number(offlineEarnings?.cappedSeconds) || 0)
      )),
      wasCapped: Boolean(offlineEarnings?.wasCapped),
      calculatedAt: Math.max(0, Number(offlineEarnings?.calculatedAt) || 0)
    };
  }

  function sanitizeState(s) {
    s.profile ||= {};

    const persistedGender =
      s.profile.characterGender
      ?? s.profile.gender
      ?? s.gender;

    s.profile.characterGender =
      normalizeCharacterGender(persistedGender);

    s.profile.characterSelected =
      Boolean(s.profile.characterSelected);

    // Remove obsolete aliases after migration so future saves stay clean.
    delete s.profile.gender;
    delete s.gender;

    s.money = Math.max(0, Number(s.money) || 0);
    s.gems = Math.max(0, Number(s.gems) || 0);
    s.level = Math.max(1, Math.floor(Number(s.level) || 1));
    s.xp = Math.max(0, Number(s.xp) || 0);

    s.cards = sanitizeCards(s.cards);
    s.equipment = sanitizeEquipment(s.equipment);
    s.businesses = sanitizeBusinesses(s.businesses);
    s.hustles = sanitizeHustles(s.hustles);
    s.timedCases = sanitizeTimedCases(s.timedCases);
    s.wardrobeCatalog = sanitizeWardrobeCatalog(s.wardrobeCatalog);
    s.accessoryCases = sanitizeAccessoryCases(s.accessoryCases);
    s.randomEvents = sanitizeRandomEvents(s.randomEvents);
    s.levelRewards = sanitizeLevelRewards(s.levelRewards, s.level);
    s.offlineEarnings = sanitizeOfflineEarnings(s.offlineEarnings);
    s.socialTasks = sanitizeSocialTasks(s.socialTasks);

    s.missions = sanitizeMissions(s.missions, s.level);

    s.city ||= { selectedDistrictId: "poor_block" };
    if (!DISTRICT_CONFIGS[s.city.selectedDistrictId]) s.city.selectedDistrictId = "poor_block";

    s.streak ||= { days: 0, bonusPercent: 0 };
    s.timestamps ||= {};
    s.timestamps.lastEnergyAt = Number(s.timestamps.lastEnergyAt) || Date.now();
    s.timestamps.lastIncomeAt = Number(s.timestamps.lastIncomeAt) || Date.now();
    s.timestamps.lastSaveAt = Number(s.timestamps.lastSaveAt) || Date.now();

    /*
       V14.3 migration path:
       prefer the dedicated localStorage timestamp, otherwise reuse the most
       recent save timestamp from older builds.
    */
    let storedLastClaimTime = 0;
    try {
      storedLastClaimTime = Number(localStorage.getItem(OFFLINE_LAST_CLAIM_STORAGE_KEY)) || 0;
    } catch (_) {}

    s.timestamps.lastClaimTime =
      storedLastClaimTime
      ||
      Number(s.timestamps.lastClaimTime)
      ||
      Number(s.timestamps.lastSaveAt)
      ||
      Date.now();

    const stats = computePlayerStats(s);
    s.maxEnergy = stats.maxEnergy;
    s.clickPower = stats.tapPower;
    s.energy = Math.min(s.maxEnergy, Math.max(0, Number(s.energy) || 0));
    return s;
  }

  let persistenceMuted = false;
  let localSaveTimer = 0;
  let cloudSaveTimer = 0;
  let cloudSaveInFlight = false;
  let cloudSaveQueued = false;
  let lastLocalSaveAt = 0;
  let lastCloudSaveAt = 0;

  const persistenceProxyCache = new WeakMap();

  function parseSavedState(raw) {
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);

      /*
         V19.1 supports both the new envelope and all older plain-state
         snapshots so existing players never lose their progress on update.
      */
      if (
        parsed
        && typeof parsed === "object"
        && parsed.state
        && typeof parsed.state === "object"
      ) {
        return {
          state: parsed.state,
          updatedAt:
            Math.max(
              0,
              Number(parsed.updatedAt)
              || Number(parsed.state?.timestamps?.lastSaveAt)
              || 0
            ),
          schema: Number(parsed.schema) || 1
        };
      }

      return {
        state: parsed,
        updatedAt:
          Math.max(0, Number(parsed?.timestamps?.lastSaveAt) || 0),
        schema: 0
      };
    } catch (error) {
      return null;
    }
  }

  function buildSaveEnvelope(timestamp = Date.now()) {
    const updatedAt = Math.max(0, Number(timestamp) || Date.now());

    return {
      schema: 2,
      appVersion: "19.7",
      updatedAt,
      state: JSON.parse(JSON.stringify(state))
    };
  }

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
    const best = candidates[0];

    try {
      return {
        state: sanitizeState(
          deepMerge(clone(DEFAULT_STATE), best.state)
        ),
        updatedAt: best.updatedAt,
        source: best.key
      };
    } catch (error) {
      console.warn(
        "[Urban Tycoon] Local save sanitize failed:",
        error
      );

      return {
        state: clone(DEFAULT_STATE),
        updatedAt: 0,
        source: "default"
      };
    }
  }

  const initialLocalSave = loadBestLocalSave();

  function createPersistentProxy(target) {
    if (
      !target
      || typeof target !== "object"
    ) {
      return target;
    }

    if (persistenceProxyCache.has(target)) {
      return persistenceProxyCache.get(target);
    }

    const proxy = new Proxy(target, {
      get(object, property, receiver) {
        const value = Reflect.get(object, property, receiver);

        return (
          value
          && typeof value === "object"
        )
          ? createPersistentProxy(value)
          : value;
      },

      set(object, property, value, receiver) {
        const previous = Reflect.get(object, property, receiver);
        const changed = !Object.is(previous, value);
        const result = Reflect.set(object, property, value, receiver);

        if (changed && !persistenceMuted) {
          queueStateSave("state-change");
        }

        return result;
      },

      deleteProperty(object, property) {
        const existed = Reflect.has(object, property);
        const result = Reflect.deleteProperty(object, property);

        if (existed && !persistenceMuted) {
          queueStateSave("state-delete");
        }

        return result;
      }
    });

    persistenceProxyCache.set(target, proxy);
    return proxy;
  }

  const state = createPersistentProxy(initialLocalSave.state);

  function getTelegramCloudStorage() {
    const cloudStorage =
      window.Telegram?.WebApp?.CloudStorage;

    return (
      cloudStorage
      && typeof cloudStorage.getItem === "function"
      && typeof cloudStorage.setItem === "function"
    )
      ? cloudStorage
      : null;
  }

  function cloudGetItem(key) {
    const cloudStorage = getTelegramCloudStorage();
    if (!cloudStorage) return Promise.resolve("");

    return new Promise((resolve) => {
      try {
        cloudStorage.getItem(key, (error, value) => {
          if (error) {
            console.warn(
              "[Urban Tycoon] Telegram CloudStorage getItem failed:",
              error
            );
            resolve("");
            return;
          }

          resolve(String(value || ""));
        });
      } catch (error) {
        console.warn(
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
              console.warn(
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
        console.warn(
          "[Urban Tycoon] Telegram CloudStorage setItem exception:",
          error
        );
        resolve(false);
      }
    });
  }

  function splitCloudPayload(serialized) {
    const chunks = [];

    for (
      let index = 0;
      index < serialized.length;
      index += TELEGRAM_CLOUD_CHUNK_SIZE
    ) {
      chunks.push(
        serialized.slice(
          index,
          index + TELEGRAM_CLOUD_CHUNK_SIZE
        )
      );
    }

    return chunks;
  }

  async function writeTelegramCloudSnapshot(envelope) {
    if (!getTelegramCloudStorage()) return false;

    const serialized = JSON.stringify(envelope);
    const chunks = splitCloudPayload(serialized);

    for (let index = 0; index < chunks.length; index += 1) {
      const success = await cloudSetItem(
        `${TELEGRAM_CLOUD_SAVE_PREFIX}_${index}`,
        chunks[index]
      );

      if (!success) return false;
    }

    /*
       Commit marker LAST. Readers only trust chunks referenced by this
       metadata, so a killed WebView cannot create a partial valid save.
    */
    const meta = {
      schema: 2,
      updatedAt: envelope.updatedAt,
      chunks: chunks.length,
      length: serialized.length
    };

    const metaSaved = await cloudSetItem(
      TELEGRAM_CLOUD_META_KEY,
      JSON.stringify(meta)
    );

    if (metaSaved) {
      lastCloudSaveAt = envelope.updatedAt;
    }

    return metaSaved;
  }

  async function readTelegramCloudSnapshot() {
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
      console.warn(
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

  function applyLoadedSnapshot(snapshot) {
    if (!snapshot?.state) return false;

    let sanitized;

    try {
      sanitized = sanitizeState(
        deepMerge(clone(DEFAULT_STATE), snapshot.state)
      );
    } catch (error) {
      console.warn(
        "[Urban Tycoon] Snapshot sanitize failed:",
        error
      );
      return false;
    }

    persistenceMuted = true;

    try {
      Object.keys(state).forEach((key) => {
        delete state[key];
      });

      Object.entries(sanitized).forEach(([key, value]) => {
        state[key] = value;
      });
    } finally {
      persistenceMuted = false;
    }

    return true;
  }

  function writeLocalSnapshot(envelope) {
    const serialized = JSON.stringify(envelope);

    try {
      const current = localStorage.getItem(SAVE_KEY);

      if (current) {
        localStorage.setItem(
          SAVE_BACKUP_KEY,
          current
        );
      }

      localStorage.setItem(
        SAVE_KEY,
        serialized
      );

      localStorage.setItem(
        SAVE_META_KEY,
        JSON.stringify({
          schema: envelope.schema,
          updatedAt: envelope.updatedAt,
          appVersion: envelope.appVersion
        })
      );

      lastLocalSaveAt = envelope.updatedAt;
      return true;
    } catch (error) {
      console.warn(
        "[Urban Tycoon] Local save failed:",
        error
      );
      return false;
    }
  }

  async function flushCloudSave() {
    if (cloudSaveInFlight) {
      cloudSaveQueued = true;
      return false;
    }

    cloudSaveInFlight = true;

    try {
      persistenceMuted = true;
      state.timestamps ||= {};
      state.timestamps.lastSaveAt = Date.now();
      const envelope = buildSaveEnvelope(
        state.timestamps.lastSaveAt
      );
      persistenceMuted = false;

      return await writeTelegramCloudSnapshot(
        envelope
      );
    } finally {
      persistenceMuted = false;
      cloudSaveInFlight = false;

      if (cloudSaveQueued) {
        cloudSaveQueued = false;
        queueCloudSave("queued-cloud-save");
      }
    }
  }

  function queueCloudSave(reason = "state-change") {
    if (!getTelegramCloudStorage()) return;

    if (cloudSaveTimer) {
      clearTimeout(cloudSaveTimer);
    }

    cloudSaveTimer = window.setTimeout(() => {
      cloudSaveTimer = 0;
      flushCloudSave().catch((error) => {
        console.warn(
          "[Urban Tycoon] Cloud save flush failed:",
          error,
          reason
        );
      });
    }, CLOUD_SAVE_DEBOUNCE_MS);
  }

  function flushLocalSave(reason = "manual") {
    if (localSaveTimer) {
      clearTimeout(localSaveTimer);
      localSaveTimer = 0;
    }

    const now = Date.now();

    persistenceMuted = true;
    state.timestamps ||= {};
    state.timestamps.lastSaveAt = now;
    const envelope = buildSaveEnvelope(now);
    persistenceMuted = false;

    const saved = writeLocalSnapshot(envelope);

    if (!saved) {
      console.warn(
        "[Urban Tycoon] Save was not persisted:",
        reason
      );
    }

    return saved;
  }

  function queueStateSave(reason = "state-change") {
    if (persistenceMuted) return;

    if (localSaveTimer) {
      clearTimeout(localSaveTimer);
    }

    localSaveTimer = window.setTimeout(() => {
      localSaveTimer = 0;
      flushLocalSave(reason);
    }, LOCAL_SAVE_DEBOUNCE_MS);

    queueCloudSave(reason);
  }

  /*
     Existing gameplay code already calls saveGame() in important actions.
     Keep that API, but V19.1 now performs an immediate LOCAL durable write
     and a coalesced Telegram CloudStorage mirror.
  */
  function saveGame(reason = "game-action") {
    const saved = flushLocalSave(reason);
    queueCloudSave(reason);
    return saved;
  }

  async function hydratePersistence() {
    const localUpdatedAt =
      Math.max(
        initialLocalSave.updatedAt,
        Number(state.timestamps?.lastSaveAt) || 0
      );

    const cloudSnapshot =
      await readTelegramCloudSnapshot();

    if (
      cloudSnapshot
      && cloudSnapshot.updatedAt > localUpdatedAt
    ) {
      const restored =
        applyLoadedSnapshot(cloudSnapshot);

      if (restored) {
        /*
           Immediately mirror the winning Cloud snapshot locally so future
           launches do not depend on a second network call.
        */
        flushLocalSave("cloud-restore");
        return {
          source: "telegram-cloud",
          updatedAt: cloudSnapshot.updatedAt
        };
      }
    }

    /*
       Local is newer (or CloudStorage unavailable). Mirror it asynchronously
       so Telegram can restore the same player on the next WebView session.
    */
    if (getTelegramCloudStorage()) {
      queueCloudSave("startup-local-newer");
    }

    return {
      source: initialLocalSave.source,
      updatedAt: localUpdatedAt
    };
  }

  function persistOnExit(reason = "exit") {
    /*
       localStorage is synchronous and is the only persistence API safe to
       depend on during beforeunload/pagehide.
    */
    recordSessionCloseTimestamp();

    /*
       Best effort cloud mirror. visibilitychange normally fires early enough
       for this to complete; pagehide/beforeunload still have the local copy.
    */
    if (getTelegramCloudStorage()) {
      flushCloudSave().catch(() => {});
    }

    return reason;
  }

  /* ==========================================================
     V15.5 — DAILY RETENTION SYSTEM
  ========================================================== */

  function getUtcDayKey(timestamp = Date.now()) {
    const date = new Date(timestamp);
    return [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0")
    ].join("-");
  }

  function getUtcDayOrdinal(timestamp = Date.now()) {
    const date = new Date(timestamp);
    return Math.floor(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      ) / 86400000
    );
  }

  function getSecondsUntilDailyReset(timestamp = Date.now()) {
    const date = new Date(timestamp);
    const nextReset = Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + 1
    );
    return Math.max(0, Math.ceil((nextReset - timestamp) / 1000));
  }

  function formatDailyResetTimer(totalSeconds) {
    const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  }

  function hashDailyString(value) {
    let hash = 2166136261;
    const input = String(value || "");

    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  function createSeededRandom(seed) {
    let value = Number(seed) >>> 0;

    return () => {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function createEmptyDailyRetentionState() {
    return {
      version: 1,
      lastAccessDay: "",
      combo: {
        dayKey: "",
        targets: [],
        completedSlots: [false, false, false],
        rewardGranted: false,
        rewardType: "",
        rewardAmount: 0,
        rewardText: ""
      },
      morse: {
        dayKey: "",
        digit: "",
        code: "",
        claimed: false,
        attempts: 0,
        rewardText: ""
      },
      checkIn: {
        lastClaimDay: "",
        streakDays: 0
      }
    };
  }

  function sanitizeDailyRetention(raw) {
    const fresh = createEmptyDailyRetentionState();
    const source = raw && typeof raw === "object" ? raw : {};

    fresh.lastAccessDay =
      typeof source.lastAccessDay === "string"
        ? source.lastAccessDay
        : "";

    fresh.combo = {
      dayKey:
        typeof source.combo?.dayKey === "string"
          ? source.combo.dayKey
          : "",
      targets:
        Array.isArray(source.combo?.targets)
          ? source.combo.targets
              .slice(0, 3)
              .map((target) => ({
                type: target?.type === "card" ? "card" : "business",
                id: String(target?.id || "")
              }))
              .filter((target) => target.id)
          : [],
      completedSlots: [0, 1, 2].map(
        (index) => Boolean(source.combo?.completedSlots?.[index])
      ),
      rewardGranted: Boolean(source.combo?.rewardGranted),
      rewardType:
        source.combo?.rewardType === "gems"
          ? "gems"
          : source.combo?.rewardType === "money"
            ? "money"
            : "",
      rewardAmount: Math.max(0, Number(source.combo?.rewardAmount) || 0),
      rewardText: String(source.combo?.rewardText || "")
    };

    fresh.morse = {
      dayKey:
        typeof source.morse?.dayKey === "string"
          ? source.morse.dayKey
          : "",
      digit: /^[0-9]$/.test(String(source.morse?.digit || ""))
        ? String(source.morse.digit)
        : "",
      code: String(source.morse?.code || ""),
      claimed: Boolean(source.morse?.claimed),
      attempts: Math.max(0, Math.floor(Number(source.morse?.attempts) || 0)),
      rewardText: String(source.morse?.rewardText || "")
    };

    fresh.checkIn = {
      lastClaimDay:
        typeof source.checkIn?.lastClaimDay === "string"
          ? source.checkIn.lastClaimDay
          : "",
      streakDays: Math.max(
        0,
        Math.floor(Number(source.checkIn?.streakDays) || 0)
      )
    };

    return fresh;
  }

  function loadDailyRetentionState() {
    try {
      const raw = localStorage.getItem(DAILY_RETENTION_STORAGE_KEY);
      if (!raw) return createEmptyDailyRetentionState();
      return sanitizeDailyRetention(JSON.parse(raw));
    } catch (error) {
      console.warn("[Hustle Empire] Daily retention load failed:", error);
      return createEmptyDailyRetentionState();
    }
  }

  let dailyRetention = loadDailyRetentionState();

  function saveDailyRetentionState() {
    try {
      localStorage.setItem(
        DAILY_RETENTION_STORAGE_KEY,
        JSON.stringify(dailyRetention)
      );
    } catch (error) {
      console.warn("[Hustle Empire] Daily retention save failed:", error);
    }
  }

  function getDailyComboPool() {
    const businessTargets = BUSINESS_IDS
      .filter((businessId) => {
        const cfg = BUSINESS_CONFIGS[businessId];
        return cfg && Number(cfg.unlockLevel || 1) <= state.level;
      })
      .map((businessId) => ({
        type: "business",
        id: businessId
      }));

    const cardTargets = CARD_IDS
      .filter((cardId) => Boolean(state.cards?.[cardId]?.unlocked))
      .map((cardId) => ({
        type: "card",
        id: cardId
      }));

    const pool = [...businessTargets, ...cardTargets];

    /*
       Level 1 only has the starter kiosk. Cycling the same valid target keeps
       the Daily Combo achievable instead of assigning locked content.
    */
    if (!pool.length) {
      pool.push({ type: "business", id: "kiosk" });
    }

    return pool;
  }

  function buildDailyComboTargets(dayKey) {
    const pool = getDailyComboPool();
    const random = createSeededRandom(
      hashDailyString(`${dayKey}|${state.level}|daily-combo`)
    );

    const shuffled = [...pool];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const targetIndex = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[targetIndex]] = [
        shuffled[targetIndex],
        shuffled[index]
      ];
    }

    const targets = [];

    while (targets.length < 3) {
      const source = shuffled[targets.length % shuffled.length];
      targets.push({
        type: source.type,
        id: source.id
      });
    }

    return targets;
  }

  function buildDailyComboReward(dayKey) {
    const rewardSeed = hashDailyString(`${dayKey}|combo-reward`);
    const useGems = rewardSeed % 4 === 0;

    if (useGems) {
      const amount = Math.max(18, 15 + state.level * 3);
      return {
        type: "gems",
        amount,
        text: `♦ ${formatNumber(amount)} Gems`
      };
    }

    const amount = Math.max(1500, 750 + state.level * 750);
    return {
      type: "money",
      amount,
      text: formatCompactMoney(amount)
    };
  }

  function buildDailyMorse(dayKey) {
    const digit = String(hashDailyString(`${dayKey}|morse`) % 10);

    return {
      digit,
      code: MORSE_DIGITS[digit]
    };
  }

  function parseDayKeyOrdinal(dayKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dayKey || ""))) {
      return null;
    }

    const [year, month, day] = dayKey.split("-").map(Number);
    return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  }

  function ensureDailyRetentionState() {
    const now = Date.now();
    const today = getUtcDayKey(now);
    const todayOrdinal = getUtcDayOrdinal(now);
    let changed = false;

    if (dailyRetention.combo.dayKey !== today) {
      const reward = buildDailyComboReward(today);

      dailyRetention.combo = {
        dayKey: today,
        targets: buildDailyComboTargets(today),
        completedSlots: [false, false, false],
        rewardGranted: false,
        rewardType: reward.type,
        rewardAmount: reward.amount,
        rewardText: reward.text
      };
      changed = true;
    }

    if (dailyRetention.morse.dayKey !== today) {
      const morse = buildDailyMorse(today);

      dailyRetention.morse = {
        dayKey: today,
        digit: morse.digit,
        code: morse.code,
        claimed: false,
        attempts: 0,
        rewardText: ""
      };
      changed = true;
    }

    const lastAccessOrdinal = parseDayKeyOrdinal(
      dailyRetention.lastAccessDay
    );

    if (
      lastAccessOrdinal !== null
      &&
      todayOrdinal - lastAccessOrdinal > 1
      &&
      dailyRetention.checkIn.streakDays > 0
    ) {
      dailyRetention.checkIn.streakDays = 0;
      state.streak.days = 0;
      changed = true;
    }

    if (dailyRetention.lastAccessDay !== today) {
      dailyRetention.lastAccessDay = today;
      changed = true;
    }

    if (changed) {
      saveDailyRetentionState();
      saveGame();
    }

    return changed;
  }

  function getDailyTargetName(target) {
    if (!target) return tr("common.unknown");

    if (target.type === "card") {
      const config = CARD_CONFIGS[target.id];
      return config ? getLocalizedValue(config.name) : target.id;
    }

    const config = BUSINESS_CONFIGS[target.id];
    return config ? getLocalizedValue(config.name) : target.id;
  }

  function grantDailyComboReward() {
    ensureDailyRetentionState();

    const combo = dailyRetention.combo;

    if (
      combo.rewardGranted
      ||
      combo.completedSlots.length !== 3
      ||
      !combo.completedSlots.every(Boolean)
    ) {
      return false;
    }

    if (combo.rewardType === "gems") {
      state.gems += combo.rewardAmount;
    } else {
      state.money += combo.rewardAmount;
    }

    combo.rewardGranted = true;

    saveDailyRetentionState();
    saveGame();
    updateUI();

    emitGameEvent("dailyComboCompleted", {
      targets: combo.targets,
      rewardType: combo.rewardType,
      rewardAmount: combo.rewardAmount
    });

    return true;
  }

  function trackDailyComboAction(type, id) {
    ensureDailyRetentionState();

    const combo = dailyRetention.combo;
    const slotIndex = combo.targets.findIndex(
      (target, index) =>
        !combo.completedSlots[index]
        &&
        target.type === type
        &&
        target.id === id
    );

    if (slotIndex < 0) return false;

    combo.completedSlots[slotIndex] = true;
    saveDailyRetentionState();

    const completedNow = combo.completedSlots.every(Boolean);

    if (completedNow) {
      grantDailyComboReward();
    }

    renderDailyRetentionUI();

    emitGameEvent("dailyComboProgress", {
      slotIndex,
      target: combo.targets[slotIndex],
      completedSlots: [...combo.completedSlots],
      completed: completedNow
    });

    return true;
  }

  function getDailyMorseReward() {
    return {
      money: Math.max(750, state.level * 500),
      gems: Math.max(5, 5 + Math.floor(state.level / 5) * 2)
    };
  }

  function submitDailyMorseAnswer(answer) {
    ensureDailyRetentionState();

    const morse = dailyRetention.morse;

    if (morse.claimed) {
      renderDailyRetentionUI("morseAlreadyClaimed");
      return false;
    }

    const normalized = String(answer || "")
      .trim()
      .replace(/\D/g, "")
      .slice(0, 1);

    morse.attempts += 1;

    if (normalized !== morse.digit) {
      saveDailyRetentionState();
      renderDailyRetentionUI("morseWrong");
      return false;
    }

    const reward = getDailyMorseReward();

    state.money += reward.money;
    state.gems += reward.gems;

    morse.claimed = true;
    morse.rewardText =
      `${formatCompactMoney(reward.money)} + ♦ ${formatNumber(reward.gems)}`;

    saveDailyRetentionState();
    saveGame();
    updateUI();
    renderDailyRetentionUI("morseSuccess");

    emitGameEvent("dailyMorseSolved", {
      digit: morse.digit,
      reward
    });

    return true;
  }

  function getNextCheckInRewardDay() {
    const today = getUtcDayKey();
    const checkIn = dailyRetention.checkIn;

    if (checkIn.lastClaimDay === today && checkIn.streakDays > 0) {
      return ((checkIn.streakDays - 1) % 7) + 1;
    }

    return (checkIn.streakDays % 7) + 1;
  }

  function claimDailyCheckIn() {
    ensureDailyRetentionState();

    const today = getUtcDayKey();
    const todayOrdinal = getUtcDayOrdinal();
    const checkIn = dailyRetention.checkIn;

    if (checkIn.lastClaimDay === today) {
      renderDailyRetentionUI("checkInAlreadyClaimed");
      return false;
    }

    const previousClaimOrdinal = parseDayKeyOrdinal(
      checkIn.lastClaimDay
    );

    if (
      previousClaimOrdinal !== null
      &&
      todayOrdinal - previousClaimOrdinal === 1
    ) {
      checkIn.streakDays += 1;
    } else {
      checkIn.streakDays = 1;
    }

    checkIn.lastClaimDay = today;

    const rewardDay = ((checkIn.streakDays - 1) % 7) + 1;
    const reward = DAILY_CHECKIN_REWARDS[rewardDay - 1];

    if (reward.money) {
      state.money += reward.money;
    }

    if (reward.gems) {
      state.gems += reward.gems;
    }

    if (reward.caseType) {
      state.levelRewards.caseInventory[reward.caseType] =
        Math.max(
          0,
          Number(state.levelRewards.caseInventory[reward.caseType]) || 0
        )
        + 1;
    }

    state.streak.days = checkIn.streakDays;

    saveDailyRetentionState();
    saveGame();
    updateUI();
    renderDailyRetentionUI("checkInSuccess");

    emitGameEvent("dailyCheckInClaimed", {
      streakDays: checkIn.streakDays,
      rewardDay,
      reward
    });

    return true;
  }

  function renderDailyComboUI() {
    const comboSlots = document.getElementById("daily-combo-slots");
    const comboProgress = document.getElementById("daily-combo-progress");
    const comboReward = document.getElementById("daily-combo-reward");

    if (!comboSlots || !comboProgress || !comboReward) return;

    const combo = dailyRetention.combo;
    const completedCount = combo.completedSlots.filter(Boolean).length;

    comboSlots.innerHTML = combo.targets.map((target, index) => {
      const completed = Boolean(combo.completedSlots[index]);
      const icon = target.type === "card" ? "🃏" : "🏢";
      const actionLabel =
        target.type === "card"
          ? "Upgrade card"
          : "Buy / upgrade";

      return `
        <div class="daily-combo-slot ${completed ? "completed" : ""}">
          <span class="daily-combo-slot-icon">${completed ? "✓" : icon}</span>
          <div>
            <small>${actionLabel}</small>
            <strong>${getDailyTargetName(target)}</strong>
          </div>
        </div>
      `;
    }).join("");

    comboProgress.textContent = `${completedCount}/3`;

    comboReward.textContent = combo.rewardGranted
      ? tr("daily.comboRewardClaimed", { reward: combo.rewardText })
      : tr("daily.comboMaxReward", { reward: combo.rewardText });
  }

  function renderDailyMorseUI(status = "") {
    const code = document.getElementById("daily-morse-code");
    const input = document.getElementById("daily-morse-input");
    const button = document.getElementById("daily-morse-submit");
    const statusNode = document.getElementById("daily-morse-status");

    if (!code || !input || !button || !statusNode) return;

    const morse = dailyRetention.morse;

    code.textContent = morse.code;

    if (morse.claimed) {
      input.value = morse.digit;
      input.disabled = true;
      button.disabled = true;
      button.textContent = tr("daily.solved");
      statusNode.textContent =
        tr("daily.reward", { reward: morse.rewardText });
      statusNode.className = "daily-retention-status success";
      return;
    }

    input.disabled = false;
    button.disabled = false;
    button.textContent = tr("daily.decipherCode");

    if (status === "morseWrong") {
      statusNode.textContent = tr("daily.wrong");
      statusNode.className = "daily-retention-status error";
    } else if (status === "morseSuccess") {
      statusNode.textContent = tr("daily.success");
      statusNode.className = "daily-retention-status success";
    } else {
      statusNode.textContent =
        tr("daily.cipherDefault");
      statusNode.className = "daily-retention-status";
    }
  }

  function renderDailyCheckInUI(status = "") {
    const grid = document.getElementById("daily-checkin-grid");
    const button = document.getElementById("daily-checkin-claim");
    const streakNode = document.getElementById("daily-checkin-streak");
    const statusNode = document.getElementById("daily-checkin-status");

    if (!grid || !button || !streakNode || !statusNode) return;

    const today = getUtcDayKey();
    const checkIn = dailyRetention.checkIn;
    const claimedToday = checkIn.lastClaimDay === today;
    const rewardDay = getNextCheckInRewardDay();

    grid.innerHTML = DAILY_CHECKIN_REWARDS.map((reward) => {
      const isCurrent = reward.day === rewardDay;
      const isClaimed = claimedToday && isCurrent;

      return `
        <div class="daily-checkin-day ${isCurrent ? "current" : ""} ${isClaimed ? "claimed" : ""}">
          <small>${tr("daily.day", { day: reward.day })}</small>
          <strong>${getLocalizedValue(reward.label)}</strong>
          <span>${isClaimed ? "✓" : ""}</span>
        </div>
      `;
    }).join("");

    streakNode.textContent = tr("daily.days", { count: checkIn.streakDays });

    button.disabled = claimedToday;
    button.textContent = claimedToday
      ? tr("daily.claimedToday")
      : tr("daily.claimDay", { day: rewardDay });

    if (status === "checkInSuccess") {
      statusNode.textContent = tr("daily.checkinSuccess");
      statusNode.className = "daily-retention-status success";
    } else if (status === "checkInAlreadyClaimed") {
      statusNode.textContent = tr("daily.alreadyClaimed");
      statusNode.className = "daily-retention-status";
    } else {
      statusNode.textContent =
        tr("daily.streakResetHint");
      statusNode.className = "daily-retention-status";
    }
  }

  function getDailyChallengesCompletionCount() {
    const today = getUtcDayKey();
    const comboDone = Boolean(dailyRetention.combo?.rewardGranted);
    const morseDone = Boolean(dailyRetention.morse?.claimed);
    const checkInDone = dailyRetention.checkIn?.lastClaimDay === today;

    return [comboDone, morseDone, checkInDone].filter(Boolean).length;
  }

  function renderDailyRetentionLauncher() {
    const completed = getDailyChallengesCompletionCount();
    const timerValue = formatDailyResetTimer(
      getSecondsUntilDailyReset()
    );

    const badge = document.getElementById("daily-challenges-button-badge");
    const status = document.getElementById("daily-challenges-button-status");
    const timer = document.getElementById("daily-challenges-button-timer");

    if (badge) badge.textContent = `${completed}/3`;
    if (status) {
      status.textContent =
        completed >= 3
          ? tr("home.dailyChallengesComplete")
          : tr("home.dailyChallengesProgress", { completed });
    }
    if (timer) timer.textContent = timerValue;
  }

  function openDailyChallengesModal() {
    ensureDailyRetentionState();
    renderDailyRetentionUI();

    const modal = document.getElementById("daily-challenges-modal");
    if (!modal) return false;

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("daily-challenges-modal-open");

    const firstInteractive =
      modal.querySelector("#daily-morse-input:not(:disabled)")
      ||
      modal.querySelector("[data-daily-checkin-claim]:not(:disabled)")
      ||
      modal.querySelector("[data-daily-challenges-close]");

    requestAnimationFrame(() => firstInteractive?.focus?.());
    return true;
  }

  function closeDailyChallengesModal() {
    const modal = document.getElementById("daily-challenges-modal");
    if (!modal) return;

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("daily-challenges-modal-open");
  }

  function renderDailyRetentionUI(status = "") {
    ensureDailyRetentionState();

    renderDailyComboUI();
    renderDailyMorseUI(status);
    renderDailyCheckInUI(status);

    const resetValue = formatDailyResetTimer(
      getSecondsUntilDailyReset()
    );

    const resetTimer = document.getElementById("daily-reset-timer");
    if (resetTimer) resetTimer.textContent = resetValue;

    const comboFill = document.getElementById("daily-combo-progress-fill");
    const morseFill = document.getElementById("daily-morse-progress-fill");
    const morseProgress = document.getElementById("daily-morse-progress");
    const checkInFill = document.getElementById("daily-checkin-progress-fill");

    const comboCompleted =
      dailyRetention.combo?.completedSlots?.filter(Boolean).length || 0;
    const morseCompleted = dailyRetention.morse?.claimed ? 1 : 0;
    const checkInDay = Math.min(
      7,
      Math.max(0, Number(dailyRetention.checkIn?.streakDays) || 0)
    );

    if (comboFill) comboFill.style.width = `${(comboCompleted / 3) * 100}%`;
    if (morseFill) morseFill.style.width = morseCompleted ? "100%" : "0%";
    if (morseProgress) morseProgress.textContent = `${morseCompleted}/1`;
    if (checkInFill) checkInFill.style.width = `${(checkInDay / 7) * 100}%`;

    renderDailyRetentionLauncher();
  }

  function tickDailyRetentionSystem() {
    const changed = ensureDailyRetentionState();

    if (changed) {
      renderDailyRetentionUI();
      return;
    }

    const resetValue = formatDailyResetTimer(
      getSecondsUntilDailyReset()
    );

    const resetTimer = document.getElementById("daily-reset-timer");
    const launcherTimer = document.getElementById("daily-challenges-button-timer");

    if (resetTimer) resetTimer.textContent = resetValue;
    if (launcherTimer) launcherTimer.textContent = resetValue;
  }

  function initializeDailyRetention() {
    ensureDailyRetentionState();
    renderDailyRetentionUI();
  }

  /* ==========================================================
     PLAYER STATS
  ========================================================== */

  function getTemporaryTapMultiplier(targetState = state) {
    if (Number(targetState.randomEvents?.tapBoostUntil) > Date.now()) {
      const config = RANDOM_EVENT_DEFINITIONS.tap_boost;
      return Number(config?.multiplier) || 2;
    }
    return 1;
  }

  function computePlayerStats(targetState = state, options = {}) {
    const stats = {
      tapPower: Number(CONFIG.BASE_TAP_REWARD) || 1,
      tapPowerMultiplier: 1,
      critRate: Number(CONFIG.PLAYER_STATS?.BASE_CRIT_RATE) || 0,
      critDamageMultiplier: Number(CONFIG.PLAYER_STATS?.BASE_CRIT_DAMAGE_MULTIPLIER) || 2,
      maxEnergy: Number(CONFIG.ENERGY_MAX) || 120,
      energyRegenMultiplier: 1,
      globalIncomeMultiplier: 1,
      businessIncomeMultipliers: {}
    };

    CARD_IDS.forEach((cardId) => {
      const cfg = CARD_CONFIGS[cardId];
      const cs = targetState.cards?.[cardId];
      if (!cs?.unlocked || cs.level <= 0) return;
      const level = cs.level;
      const effect = cfg.effect || {};

      switch (effect.type) {
        case "businessIncomePercent": {
          const id = effect.businessId;
          const bonus = (Number(effect.percentPerLevel) || 0) * level / 100;
          stats.businessIncomeMultipliers[id] = (stats.businessIncomeMultipliers[id] || 1) * (1 + bonus);
          break;
        }
        case "tapPowerFlat":
          stats.tapPower += (Number(effect.valuePerLevel) || 0) * level;
          break;
        case "criticalRatePercent":
          stats.critRate += (Number(effect.percentPerLevel) || 0) * level / 100;
          break;
        case "criticalDamagePercent":
          stats.critDamageMultiplier += (Number(effect.percentPerLevel) || 0) * level / 100;
          break;
        case "energyMaxFlat":
          stats.maxEnergy += (Number(effect.valuePerLevel) || 0) * level;
          break;
        case "energyRegenSpeedPercent":
          stats.energyRegenMultiplier *= 1 + ((Number(effect.percentPerLevel) || 0) * level / 100);
          break;
      }
    });

    EQUIPMENT_IDS.forEach((equipmentId) => {
      const cfg = EQUIPMENT_CONFIGS[equipmentId];
      const es = targetState.equipment?.[equipmentId];
      if (!es?.unlocked || !es.equipped || es.level <= 0) return;
      const value = (Number(cfg.effect?.valuePerLevel) || 0) * es.level;

      switch (cfg.effect?.type) {
        case "globalIncomePercent": stats.globalIncomeMultiplier *= 1 + value / 100; break;
        case "tapPowerPercent": stats.tapPowerMultiplier *= 1 + value / 100; break;
        case "criticalRatePercent": stats.critRate += value / 100; break;
        case "criticalDamagePercent": stats.critDamageMultiplier += value / 100; break;
        case "energyMaxFlat": stats.maxEnergy += value; break;
        case "energyRegenSpeedPercent": stats.energyRegenMultiplier *= 1 + value / 100; break;
      }
    });

    const includeLevelUpBoost = options.includeLevelUpBoost !== false;
    const levelUpBoostMultiplier = includeLevelUpBoost
      ? getLevelUpEarningsMultiplier(targetState)
      : 1;

    /*
       Level-up boost stacks with cards/outfits and with the random-event tap
       multiplier. globalIncomeMultiplier feeds all Business income.
    */
    const includeLeaderboardBoost = options.includeLeaderboardBoost !== false;
    const leaderboardBoostMultiplier = includeLeaderboardBoost
      ? getLeaderboardFlashBoostMultiplier()
      : 1;

    stats.globalIncomeMultiplier *=
      levelUpBoostMultiplier * leaderboardBoostMultiplier;
    stats.levelUpBoostMultiplier = levelUpBoostMultiplier;
    stats.leaderboardBoostMultiplier = leaderboardBoostMultiplier;

    stats.tapPower = Math.max(
      1,
      Math.round(
        stats.tapPower
        *
        stats.tapPowerMultiplier
        *
        getTemporaryTapMultiplier(targetState)
        *
        levelUpBoostMultiplier
      )
    );
    stats.maxEnergy = Math.max(1, Math.round(stats.maxEnergy));
    stats.energyRegenMultiplier = Math.max(.01, stats.energyRegenMultiplier);

    const cap = Number(CONFIG.PLAYER_STATS?.CRIT_RATE_CAP);
    if (Number.isFinite(cap)) stats.critRate = Math.min(cap, stats.critRate);
    return stats;
  }

  function recomputeDerivedState() {
    const stats = computePlayerStats(state);
    state.clickPower = stats.tapPower;
    state.maxEnergy = stats.maxEnergy;
    state.energy = Math.min(state.energy, state.maxEnergy);
    return stats;
  }

  /* ==========================================================
     XP / TAP / ENERGY
  ========================================================== */

  function getXpRequired(level) {
    const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
    const base = Number(CONFIG.ECONOMY?.PLAYER_XP_BASE) || 100;
    const growth = Number(CONFIG.ECONOMY?.PLAYER_XP_GROWTH) || 1.25;
    return Math.ceil(base * Math.pow(growth, safeLevel - 1));
  }

  function addXp(amount) {
    /*
       XP remains a progress meter, but it NO LONGER changes player level.
       Level advancement is exclusively gated by the Missions / Next Level button.
    */
    const needed = getXpRequired(state.level);
    state.xp = Math.min(needed, Math.max(0, state.xp + Math.max(0, Number(amount) || 0)));
  }

  function missionTitle(mission) {
    const key = `missions.${mission.type}`;

    const target =
      mission.type === "earn"
        ? formatCompactMoney(mission.target)
        : formatNumber(mission.target);

    const translated = tr(key, { target });

    return translated === key
      ? tr("home.missions")
      : translated;
  }

  function missionProgressText(mission, progress) {
    if (mission.type === "earn") {
      return `${formatCompactMoney(progress)} / ${formatCompactMoney(mission.target)}`;
    }
    return `${formatNumber(progress)} / ${formatNumber(mission.target)}`;
  }

  function getCurrentMissionDefinitions() {
    return getMissionDefinitions(state.level);
  }

  function ensureCurrentMissionState() {
    if (!state.missions || Number(state.missions.level) !== Number(state.level)) {
      state.missions = createMissionState(state.level);
    }
    return state.missions;
  }

  function checkLevelUpEligibility() {
    const missionState = ensureCurrentMissionState();
    const definitions = getCurrentMissionDefinitions();
    return definitions.length > 0 && definitions.every((mission) => Boolean(missionState.completed[mission.id]));
  }

  function updateMissionProgress(type, amount = 1, source = "manual", options = {}) {
    const missionState = ensureCurrentMissionState();
    const mission = getCurrentMissionDefinitions().find((item) => item.type === type);
    if (!mission || missionState.completed[mission.id]) return false;

    const delta = Math.max(0, Number(amount) || 0);
    if (delta <= 0) return false;

    const oldProgress = Number(missionState.progress[mission.id]) || 0;
    const newProgress = Math.min(mission.target, oldProgress + delta);
    missionState.progress[mission.id] = newProgress;

    let completedNow = false;

    if (newProgress >= mission.target) {
      missionState.completed[mission.id] = true;
      completedNow = true;

      if (!missionState.rewarded[mission.id]) {
        /*
           Mission rewards do NOT count toward the "earn money" mission.
           This prevents chain-completing missions from their own rewards.
        */
        state.money += mission.reward;
        missionState.rewarded[mission.id] = true;
        emitGameEvent("missionRewardGranted", {
          missionId: mission.id,
          type: mission.type,
          reward: mission.reward,
          level: state.level
        });
      }

      emitGameEvent("missionCompleted", {
        missionId: mission.id,
        type: mission.type,
        level: state.level,
        reward: mission.reward,
        source
      });
    }

    emitGameEvent("missionProgress", {
      missionId: mission.id,
      type: mission.type,
      level: state.level,
      progress: newProgress,
      target: mission.target,
      completed: Boolean(missionState.completed[mission.id]),
      source
    });

    if (options.save !== false) saveGame();

    if (options.render !== false) {
      updatePlayerResources();
      renderMissions();
    }

    return completedNow || newProgress !== oldProgress;
  }

  function registerMoneyEarned(amount, source = "gameplay", options = {}) {
    const earned = Math.max(0, Number(amount) || 0);
    if (!earned) return false;
    return updateMissionProgress("earn", earned, source, options);
  }

  /*
     Central bonus tracker for the "Collect bonuses" mission.

     Counts any actual bonus collected by the player:
     - timed cases
     - free accessory case
     - premium accessory cases bought with Gems
     - random flying bonuses / butterflies / energy drops

     It intentionally does NOT count merely seeing or missing an event.
  */
  function registerBonusCollected(source = "gameplayBonus", options = {}) {
    const updated = updateMissionProgress("bonuses", 1, source, options);

    emitGameEvent("bonusCollected", {
      level: state.level,
      source,
      missionUpdated: Boolean(updated)
    });

    return updated;
  }

  function completeCurrentMissionsForTesting() {
    const missionState = ensureCurrentMissionState();
    getCurrentMissionDefinitions().forEach((mission) => {
      missionState.progress[mission.id] = mission.target;
      if (!missionState.completed[mission.id]) {
        missionState.completed[mission.id] = true;
        if (!missionState.rewarded[mission.id]) {
          state.money += mission.reward;
          missionState.rewarded[mission.id] = true;
        }
      }
    });
    saveGame();
    updateUI();
    return checkLevelUpEligibility();
  }

  function advanceToNextLevel() {
    if (!checkLevelUpEligibility()) {
      emitGameEvent("levelLockedByMissions", {
        level: state.level,
        completed: getCurrentMissionDefinitions().filter((mission) => state.missions.completed[mission.id]).length,
        total: getCurrentMissionDefinitions().length
      });
      renderMissions();
      return false;
    }

    const previousLevel = state.level;
    state.level += 1;
    state.xp = 0;
    state.missions = createMissionState(state.level);

    const levelUpReward = grantLevelUpRewards(state.level);

    recomputeDerivedState();
    state.energy = Math.min(state.energy, state.maxEnergy);

    saveGame();
    updateUI();
    renderAllDynamic();
    refreshBusinessPanels();

    emitGameEvent("levelUp", {
      previousLevel,
      level: state.level,
      via: "missions",
      reward: levelUpReward
    });

    showLevelUpCelebration(levelUpReward);
    return true;
  }

  function spawnTapFloatingNumber(amount, isCritical = false) {
    const layer = document.getElementById("tap-float-layer");
    const button = document.querySelector(".home-main-tap");

    if (!layer) return;

    const number = document.createElement("span");
    number.className = `tap-float-number${isCritical ? " critical" : ""}`;
    number.textContent = `+$${formatNumber(amount)}`;

    /*
       Piccolo offset casuale per evitare che tutti i numeri
       si sovrappongano perfettamente durante i tap rapidi.
    */
    const horizontalOffset = Math.round((Math.random() - 0.5) * 54);
    number.style.setProperty("--float-x", `${horizontalOffset}px`);

    layer.appendChild(number);

    number.addEventListener(
      "animationend",
      () => number.remove(),
      { once: true }
    );

    /*
       Feedback di pressione anche su touch/browser Telegram.
       :active rimane comunque attivo via CSS.
    */
    if (button) {
      button.classList.add("is-pressed");
      window.setTimeout(() => {
        button.classList.remove("is-pressed");
      }, 90);
    }
  }

  function tap() {
    if (state.energy <= 0) {
      emitGameEvent("outOfEnergy");
      updateUI();
      return false;
    }

    const stats = recomputeDerivedState();
    const isCritical = Math.random() < stats.critRate;
    const multiplier = isCritical ? stats.critDamageMultiplier : 1;
    const moneyEarned = Math.max(1, Math.round(stats.tapPower * multiplier));

    if (state.energy >= state.maxEnergy) state.timestamps.lastEnergyAt = Date.now();
    state.energy -= 1;
    state.money += moneyEarned;
    addXp(CONFIG.XP_PER_TAP);

    updateMissionProgress("taps", 1, "tap", { save: false, render: false });
    registerMoneyEarned(moneyEarned, "tap", { save: false, render: false });

    saveGame();
    updateUI();
    spawnTapFloatingNumber(moneyEarned, isCritical);
    emitGameEvent("tap", { moneyEarned, isCritical, multiplier });
    return true;
  }

  function getEnergyIntervalMs() {
    const stats = computePlayerStats(state);
    const totalRegenSpeed =
      Math.max(0.01, Number(stats.energyRegenMultiplier) || 1)
      *
      BASE_ENERGY_REGEN_SPEED_MULTIPLIER;

    return (CONFIG.ENERGY_REGEN_INTERVAL_SECONDS * 1000) / totalRegenSpeed;
  }

  function regenerateEnergy() {
    const now = Date.now();
    recomputeDerivedState();

    if (state.energy >= state.maxEnergy) {
      state.energy = state.maxEnergy;
      state.timestamps.lastEnergyAt = now;
      return;
    }

    const last = Number(state.timestamps.lastEnergyAt) || now;
    const interval = getEnergyIntervalMs();
    const ticks = Math.floor((now - last) / interval);
    if (ticks <= 0) return;

    state.energy = Math.min(state.maxEnergy, state.energy + ticks * CONFIG.ENERGY_REGEN_RATE);
    state.timestamps.lastEnergyAt = state.energy < state.maxEnergy ? last + ticks * interval : now;
  }

  /* ==========================================================
     QUICK JOBS
  ========================================================== */

  function performHustle(hustleId) {
    const cfg = HUSTLE_CONFIGS[hustleId];
    const hs = state.hustles[hustleId];
    if (!cfg || !hs) return false;

    if (state.level < cfg.unlockLevel) {
      emitGameEvent("hustleLocked", { hustleId, requiredLevel: cfg.unlockLevel });
      return false;
    }

    if (state.energy < cfg.energyCost) {
      emitGameEvent("notEnoughEnergy", { hustleId, required: cfg.energyCost, current: state.energy });
      return false;
    }

    processPassiveIncome();
    state.energy -= cfg.energyCost;
    state.timestamps.lastEnergyAt = Date.now();
    state.money += cfg.rewardMoney;
    addXp(cfg.rewardXp);
    hs.runs += 1;

    updateMissionProgress("jobs", 1, "hustle", { save: false, render: false });
    registerMoneyEarned(cfg.rewardMoney, "hustle", { save: false, render: false });

    saveGame();
    updateUI();
    refreshBusinessPanels();
    renderQuickJobs();
    emitGameEvent("hustleCompleted", { hustleId, money: cfg.rewardMoney, xp: cfg.rewardXp, energySpent: cfg.energyCost });
    return true;
  }

  function getHustleDisplayName(hustleId, cfg) {
    const value = cfg?.name;
    const lang = currentLanguage();

    if (value && typeof value === "object") {
      const localized = getLocalizedValue(value);
      if (localized) return localized;
    }

    if (typeof value === "string") {
      const direct = value.trim();

      if (direct) {
        const translated = window.i18n?.t?.(direct);

        if (translated && translated !== direct) {
          return translated;
        }

        /*
           A plain English config label is safe in EN, but under RU it would
           create a mixed-language Home. Use a clean generic RU fallback
           until that specific hustle gets its own dictionary key.
        */
        if (lang === "en" && !looksLikeTechnicalTranslationValue(direct)) {
          return direct;
        }
      }
    }

    const specificKey = `hustles.${hustleId}.name`;
    const specific = window.i18n?.t?.(specificKey);

    if (specific && specific !== specificKey && !/Text unavailable|Текст недоступен/.test(specific)) {
      return specific;
    }

    return tr("hustles.jobFallback");
  }

  function renderQuickJobs() {
    const container = document.getElementById("quick-jobs-list");
    if (!container) return;

    container.innerHTML = HUSTLE_IDS.map((hustleId) => {
      const cfg = HUSTLE_CONFIGS[hustleId];
      const hs = state.hustles[hustleId];
      const unlocked = state.level >= cfg.unlockLevel;
      const enoughEnergy = state.energy >= cfg.energyCost;
      const label = !unlocked
        ? tr("common.requiresLevel", { level: cfg.unlockLevel })
        : enoughEnergy ? tr("hustles.run") : tr("hustles.notEnoughEnergy");

      return `
        <article class="quick-job-card ${unlocked ? "" : "locked"}">
          <div class="quick-job-media" aria-hidden="true">
            <div class="quick-job-icon">${cfg.icon}</div>
          </div>

          <div class="quick-job-content">
            <strong>${getHustleDisplayName(hustleId, cfg)}</strong>

            <div class="quick-job-rewards">
              <span class="quick-job-energy">⚡ ${cfg.energyCost}</span>
              <span class="quick-job-money">+$${formatNumber(cfg.rewardMoney)}</span>
              <span class="quick-job-xp">+${cfg.rewardXp} XP</span>
            </div>

            <button class="quick-job-button" type="button" data-hustle-run="${hustleId}" ${unlocked && enoughEnergy ? "" : "disabled"}>${label}</button>

            <small>${tr("hustles.completed")}: ${hs.runs}</small>
          </div>
        </article>`;
    }).join("");

    const total = document.getElementById("quick-jobs-total");
    if (total) total.textContent = HUSTLE_IDS.reduce((sum, id) => sum + (state.hustles[id]?.runs || 0), 0);
  }

  /* ==========================================================
     BUSINESSES / CITY
  ========================================================== */

  function isDistrictUnlocked(districtId) {
    const district = DISTRICT_CONFIGS[districtId];
    return Boolean(district && state.level >= district.unlockLevel);
  }

  function isBusinessLevelUnlocked(businessId) {
    const cfg = BUSINESS_CONFIGS[businessId];
    return Boolean(cfg && isDistrictUnlocked(cfg.districtId) && state.level >= cfg.unlockLevel);
  }

  function getBusinessBaseRevenuePerHour(businessId, level) {
    const cfg = BUSINESS_CONFIGS[businessId];
    const safeLevel = Math.max(0, Math.floor(Number(level) || 0));
    if (!cfg || safeLevel <= 0) return 0;
    return (Number(cfg.baseIncomePerSecond) || 0) * safeLevel * 3600;
  }

  function getBusinessIncomeMultiplier(businessId, options = {}) {
    const stats = computePlayerStats(state, options);
    return (stats.globalIncomeMultiplier || 1) * (stats.businessIncomeMultipliers[businessId] || 1);
  }

  function getBusinessRevenuePerHour(businessId, options = {}) {
    const bs = state.businesses[businessId];
    if (!bs?.owned) return 0;
    return getBusinessBaseRevenuePerHour(businessId, bs.level) * getBusinessIncomeMultiplier(businessId, options);
  }

  function getBusinessRevenuePerSecond(businessId, options = {}) {
    return getBusinessRevenuePerHour(businessId, options) / 3600;
  }

  function getBusinessUpgradeCost(businessId) {
    const cfg = BUSINESS_CONFIGS[businessId];
    const bs = state.businesses[businessId];
    if (!cfg || !bs?.owned) return 0;
    const growth = Number(CONFIG.ECONOMY?.BUSINESS_UPGRADE_GROWTH) || 1.15;
    return Math.ceil((Number(cfg.baseCost) || 0) * Math.pow(growth, Math.max(0, bs.level)));
  }

  function getTotalPassiveIncomePerHour(options = {}) {
    return BUSINESS_IDS.reduce((sum, id) => sum + getBusinessRevenuePerHour(id, options), 0);
  }

  function getTotalPassiveIncomePerSecond(options = {}) {
    return getTotalPassiveIncomePerHour(options) / 3600;
  }

  function processPassiveIncome() {
    const now = Date.now();
    const last = Number(state.timestamps.lastIncomeAt) || now;
    const elapsed = Math.max(0, now - last);
    state.timestamps.lastIncomeAt = now;
    if (!elapsed) return 0;

    /*
       Integrate the temporary Level-Up boost only over the exact portion of
       elapsed time where it was active. This prevents backgrounding Telegram
       from extending a 3/5/10-minute boost over an entire offline interval.
    */
    const baseIncomePerMs =
      getTotalPassiveIncomePerHour({
        includeLevelUpBoost: false,
        includeLeaderboardBoost: false
      }) / 3600000;

    const levelBoost = state.levelRewards?.activeBoost || {};
    const flashBoost = getLeaderboardFlashBoostState(now);

    const temporaryBoosts = [
      {
        multiplier: Math.max(1, Number(levelBoost.multiplier) || 1),
        startedAt: Math.max(0, Number(levelBoost.startedAt) || 0),
        endsAt: Math.max(0, Number(levelBoost.endsAt) || 0)
      },
      {
        multiplier: flashBoost.multiplier,
        startedAt: flashBoost.startedAt,
        endsAt: flashBoost.endsAt
      }
    ];

    const boundaries = new Set([last, now]);
    temporaryBoosts.forEach((boost) => {
      if (boost.startedAt > last && boost.startedAt < now) {
        boundaries.add(boost.startedAt);
      }
      if (boost.endsAt > last && boost.endsAt < now) {
        boundaries.add(boost.endsAt);
      }
    });

    const points = [...boundaries].sort((a, b) => a - b);
    let earned = 0;

    for (let index = 0; index < points.length - 1; index += 1) {
      const segmentStart = points[index];
      const segmentEnd = points[index + 1];
      const segmentMs = Math.max(0, segmentEnd - segmentStart);
      if (!segmentMs) continue;

      const sampleTime = segmentStart + segmentMs / 2;
      const segmentMultiplier = temporaryBoosts.reduce((multiplier, boost) => {
        const active =
          boost.multiplier > 1
          && boost.startedAt <= sampleTime
          && boost.endsAt > sampleTime;
        return active ? multiplier * boost.multiplier : multiplier;
      }, 1);

      earned += baseIncomePerMs * segmentMs * segmentMultiplier;
    }

    state.money += earned;
    registerMoneyEarned(earned, "passiveIncome", { save: false, render: false });
    return earned;
  }

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
      Date.now()
    );
  }

  function persistLastClaimTime(timestamp = Date.now()) {
    const safeTimestamp = Math.max(0, Number(timestamp) || Date.now());
    state.timestamps ||= {};
    state.timestamps.lastClaimTime = safeTimestamp;

    try {
      localStorage.setItem(
        OFFLINE_LAST_CLAIM_STORAGE_KEY,
        String(safeTimestamp)
      );
    } catch (error) {
      console.warn("[Hustle Empire] lastClaimTime save failed:", error);
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

  function formatOfflineDuration(elapsedSeconds, wasCapped = false) {
    const safeSeconds = Math.max(0, Math.floor(Number(elapsedSeconds) || 0));

    if (wasCapped || safeSeconds > OFFLINE_EARNINGS_CAP_SECONDS) {
      return tr("offline.cappedAway");
    }

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    if (hours > 0) {
      return tr("offline.awayHoursMinutes", { hours, minutes });
    }

    if (minutes > 0) {
      return tr("offline.awayMinutes", { minutes });
    }

    return tr("offline.awayLessMinute");
  }

  /*
     Calculates the reward ONCE and stores it as pending.
     Temporary Level-Up boosts are deliberately excluded from the offline
     formula so a 3/5/10 minute boost cannot be stretched to three hours.
     Permanent Card/Wardrobe/Business multipliers still apply.
  */
  function checkOfflineEarnings() {
    const now = Date.now();
    const existingPending = getPendingOfflineEarnings();

    /*
       If the player closed Telegram before claiming, keep the exact reward
       previously calculated instead of recalculating it with newer upgrades.
    */
    if (existingPending.pendingAmount > 0) {
      state.timestamps.lastIncomeAt = now;
      return { ...existingPending };
    }

    const lastClaimTime = readLastClaimTime();
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

  function showOfflineEarningsModal(offlineResult = getPendingOfflineEarnings()) {
    const modal = document.getElementById("offline-earnings-modal");
    if (!modal || !(Number(offlineResult?.pendingAmount) > 0)) return false;

    const amount = Math.max(0, Number(offlineResult.pendingAmount) || 0);
    const timeText = document.getElementById("offline-earnings-time");
    const amountText = document.getElementById("offline-earnings-amount");
    const claimButton = document.getElementById("offline-earnings-claim");

    if (timeText) {
      timeText.textContent = formatOfflineDuration(
        offlineResult.elapsedSeconds,
        offlineResult.wasCapped
      );
    }

    if (amountText) {
      amountText.textContent = formatCompactMoney(amount);
    }

    if (claimButton) {
      const claimAmountLabel =
        amount < 10
          ? amount.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")
          : formatNumber(amount);

      claimButton.textContent = tr("offline.claimAmount", { amount: claimAmountLabel });
    }

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("offline-earnings-modal-open");
    return true;
  }

  function hideOfflineEarningsModal() {
    const modal = document.getElementById("offline-earnings-modal");
    if (!modal) return;

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("offline-earnings-modal-open");
  }

  function claimOfflineEarnings() {
    const pending = getPendingOfflineEarnings();
    const amount = Math.max(0, Number(pending.pendingAmount) || 0);

    if (amount <= 0) {
      hideOfflineEarningsModal();
      persistLastClaimTime(Date.now());
      saveGame();
      return 0;
    }

    const now = Date.now();

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
    updateUI();
    renderMissions();
    updateHomeMetaUI(amount);

    emitGameEvent("offlineEarningsClaimed", {
      amount,
      claimedAt: now
    });

    return amount;
  }

  /*
     Called when Telegram/iOS backgrounds or closes the WebView.
     It first pays the active-session passive income, then writes the exact
     timestamp required for the next offline calculation.
  */
  function recordSessionCloseTimestamp() {
    const now = Date.now();

    processPassiveIncome();
    persistLastClaimTime(now);
    state.timestamps.lastIncomeAt = now;
    saveGame();

    return now;
  }

  /*
     Backwards-compatible alias retained for integrations/debug helpers.
     It now returns the PENDING capped reward instead of instantly paying an
     uncapped offline interval.
  */
  function processOfflineIncome() {
    return checkOfflineEarnings().pendingAmount || 0;
  }

  function purchaseBusiness(businessId) {
    const cfg = BUSINESS_CONFIGS[businessId];
    const bs = state.businesses[businessId];
    if (!cfg || !bs || bs.owned || !isBusinessLevelUnlocked(businessId)) return false;

    const cost = Number(cfg.purchaseCost) || 0;
    if (state.money < cost) {
      emitGameEvent("notEnoughMoney", { current: state.money, required: cost });
      return false;
    }

    processPassiveIncome();
    state.money -= cost;
    bs.owned = true;
    bs.level = Number(cfg.startingLevel) || 1;
    trackDailyComboAction("business", businessId);
    saveGame();
    updateUI();
    refreshBusinessPanels();
    return true;
  }

  function upgradeBusiness(businessId) {
    const bs = state.businesses[businessId];
    if (!bs?.owned) return false;
    const cost = getBusinessUpgradeCost(businessId);
    if (state.money < cost) {
      emitGameEvent("notEnoughMoney", { current: state.money, required: cost });
      return false;
    }

    processPassiveIncome();
    state.money -= cost;
    bs.level += 1;
    updateMissionProgress("upgrades", 1, "businessUpgrade", { save: false, render: false });
    trackDailyComboAction("business", businessId);
    saveGame();
    updateUI();
    refreshBusinessPanels();
    return true;
  }

  function selectDistrict(districtId) {
    if (!DISTRICT_CONFIGS[districtId]) return false;
    /* Locked districts are selectable for preview. */
    state.city.selectedDistrictId = districtId;
    saveGame();
    renderCityUI();
    emitGameEvent("districtSelected", {
      districtId,
      unlocked: isDistrictUnlocked(districtId),
      requiredLevel: DISTRICT_CONFIGS[districtId].unlockLevel
    });
    return true;
  }

  function renderHomeBusinesses() {
    const container = document.getElementById("home-business-list");
    if (!container) return;
    const owned = BUSINESS_IDS.filter((id) => state.businesses[id]?.owned);

    if (!owned.length) {
      container.innerHTML = `
        <div class="home-business-empty">
          ${tr("home.noActiveBusinesses")}
        </div>`;
    } else {
      container.innerHTML = owned.map((businessId) => {
      const cfg = BUSINESS_CONFIGS[businessId];
      const bs = state.businesses[businessId];
      const cost = getBusinessUpgradeCost(businessId);
      const spriteClass = BUSINESS_SPRITE_CLASS[businessId] || "business-kiosk";
      return `
        <article class="business-live-card" data-business-card="${businessId}">
          <div class="business-live-media" aria-hidden="true">
            <div class="business-live-image image-fallback">
              ${spriteMarkup("sprite-business", spriteClass)}
            </div>
          </div>

          <div class="business-live-content">
            <div class="business-live-top">
              <strong>${getBusinessDisplayName(businessId, cfg)}</strong>
              <span class="business-level-badge">${tr("common.levelShort")} ${bs.level}</span>
            </div>

            <div class="business-live-stats">
              <span class="business-income-label">${tr("business.incomePerSecond")}</span>
              <span class="business-income-second">${formatIncomePerSecond(getBusinessRevenuePerSecond(businessId))}</span>
            </div>

            <div class="business-income-progress"><span></span></div>

            <button class="business-upgrade-button" type="button" data-business-upgrade="${businessId}" ${state.money >= cost ? "" : "disabled"}>${tr("common.upgrade")} · ${formatCompactMoney(cost)}</button>
          </div>
        </article>`;
      }).join("");
    }

    const total = document.getElementById("home-total-income");
    if (total) total.textContent = formatIncomePerSecond(getTotalPassiveIncomePerSecond());
  }

  function renderCityUI() {
    const selectedDistrictId = state.city.selectedDistrictId;

    document.querySelectorAll(".city-node[data-district]").forEach((node) => {
      const id = node.dataset.district;
      const cfg = DISTRICT_CONFIGS[id];
      const unlocked = isDistrictUnlocked(id);
      node.disabled = false;
      node.setAttribute("aria-disabled", unlocked ? "false" : "true");
      node.classList.toggle("unlocked", unlocked);
      node.classList.toggle("locked", !unlocked);
      node.classList.toggle("selected", id === selectedDistrictId);
      const strong = node.querySelector("strong");
      const range = node.querySelector("span");
      const small = node.querySelector("small");
      const icon = node.querySelector("i");
      if (strong) strong.textContent = getDistrictDisplayName(id, cfg);
      if (range) range.textContent = getDistrictRangeLabel(id, cfg);
      if (small) small.textContent = getDistrictTagline(id, cfg);
      if (icon) icon.textContent = unlocked ? "✓" : "🔒";
    });

    const district = DISTRICT_CONFIGS[selectedDistrictId];
    if (!district) return;

    const title = document.getElementById("selected-district-name");
    const status = document.getElementById("selected-district-status");
    const container = document.getElementById("district-business-list");
    const districtUnlocked = isDistrictUnlocked(selectedDistrictId);

    if (title) title.textContent = getDistrictDisplayName(selectedDistrictId, district);
    if (status) {
      status.textContent = districtUnlocked
        ? tr("city.unlocked")
        : tr("common.requiresLevel", { level: district.unlockLevel });
      status.classList.toggle("locked", !districtUnlocked);
    }

    if (!container) return;
    container.innerHTML = district.businessIds.map((businessId) => {
      const cfg = BUSINESS_CONFIGS[businessId];
      const bs = state.businesses[businessId];
      const available = isBusinessLevelUnlocked(businessId);

      let stateClass = "locked";
      let statusText = tr("business.unlockAtLevel", { level: cfg.unlockLevel });
      let button = `<button class="city-business-button" type="button" disabled>🔒 ${tr("business.unlockAtLevel", { level: cfg.unlockLevel })}</button>`;

      if (bs.owned) {
        stateClass = "owned";
        statusText = tr("business.owned");
        button = `<button class="city-business-button" type="button" data-city-business-upgrade="${businessId}">${tr("common.upgrade")} · ${formatCompactMoney(getBusinessUpgradeCost(businessId))}</button>`;
      } else if (available) {
        stateClass = "available";
        statusText = tr("business.available");
        button = `<button class="city-business-button buy" type="button" data-city-business-buy="${businessId}">${tr("common.buy")} · ${formatCompactMoney(cfg.purchaseCost)}</button>`;
      }

      const previewLevel = bs.owned ? bs.level : Number(cfg.startingLevel) || 1;
      const previewIncome = bs.owned
        ? getBusinessRevenuePerSecond(businessId)
        : getBusinessBaseRevenuePerHour(businessId, previewLevel) / 3600;
      const spriteClass = BUSINESS_SPRITE_CLASS[businessId] || "business-kiosk";

      return `
        <article class="district-business-card ${stateClass}">
          <div class="district-business-media" aria-hidden="true">
            <div class="district-business-image media-frame media-frame-square">
              ${spriteMarkup("sprite-business", spriteClass)}
            </div>
          </div>

          <div class="district-business-content">
            <div class="district-business-copy">
              <strong class="district-business-name">
                ${getBusinessDisplayName(businessId, cfg)}
              </strong>

              <span class="business-status ${stateClass}">
                ${statusText}
              </span>
            </div>

            <div class="district-business-stats">
              <small class="district-business-income-label">
                ${tr("business.incomePerSecond")}
              </small>

              <span class="district-business-income">
                ${formatIncomePerSecond(previewIncome)}
              </span>
            </div>

            <div class="district-business-actions">
              ${button}
            </div>
          </div>
        </article>`;
    }).join("");
  }

  function refreshBusinessPanels() {
    renderHomeBusinesses();
    renderCityUI();
  }

  /* ==========================================================
     CARDS
  ========================================================== */

  function getCardFragmentsRequired(cardId) {
    const cs = state.cards[cardId];
    if (!cs) return 0;
    const maxLevel = Number(COLLECTION_CONFIG.MAX_CARD_LEVEL || 5);
    if (!cs.unlocked || cs.level <= 0) return Number(COLLECTION_CONFIG.UNLOCK_FRAGMENTS || 10);
    if (cs.level >= maxLevel) return 0;
    return Number(COLLECTION_CONFIG.FRAGMENTS_TO_LEVEL?.[cs.level + 1] || 0);
  }

  function canLevelUpCard(cardId) {
    const cs = state.cards[cardId];
    const required = getCardFragmentsRequired(cardId);
    return Boolean(cs && required && cs.fragments >= required);
  }

  function addCardFragments(cardId, amount, source = "manual") {
    const cs = state.cards[cardId];
    if (!cs || !CARD_CONFIGS[cardId]) return false;

    const qty = Math.max(0, Math.floor(Number(amount) || 0));
    if (!qty) return false;

    /* Fragment-only: no random auto-unlock. */
    cs.fragments += qty;

    saveGame();
    renderCollectionUI();
    emitGameEvent("cardFragmentsAdded", { cardId, amount: qty, source });

    return true;
  }

  function levelUpCard(cardId) {
    const cs = state.cards[cardId];
    if (!cs) return false;
    const maxLevel = Number(COLLECTION_CONFIG.MAX_CARD_LEVEL || 5);
    if (cs.level >= maxLevel) return false;

    const required = getCardFragmentsRequired(cardId);
    if (!required || cs.fragments < required) return false;

    processPassiveIncome();
    cs.fragments -= required;
    if (!cs.unlocked || cs.level <= 0) {
      cs.unlocked = true;
      cs.level = 1;
    } else {
      cs.level += 1;
    }

    recomputeDerivedState();
    updateMissionProgress("upgrades", 1, "cardUpgrade", { save: false, render: false });
    trackDailyComboAction("card", cardId);
    saveGame();
    updateUI();
    renderCollectionUI();
    refreshBusinessPanels();
    return true;
  }

  function getCollectionSummary() {
    const total = CARD_IDS.length;
    const unlocked = CARD_IDS.filter((id) => state.cards[id]?.unlocked).length;
    const rarity = {};

    CARD_IDS.forEach((id) => {
      const key = CARD_CONFIGS[id].rarity;
      rarity[key] ||= { unlocked: 0, total: 0 };
      rarity[key].total += 1;
      if (state.cards[id]?.unlocked) rarity[key].unlocked += 1;
    });

    return { total, unlocked, completionPercent: total ? Math.round(unlocked / total * 100) : 0, rarity };
  }

  function getRarityStars(rarity) {
    return "★".repeat({ common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 }[rarity] || 1);
  }

  function getCardBonusLabel(cardId) {
    const cfg = CARD_CONFIGS[cardId];
    const cs = state.cards[cardId];
    const level = cs?.unlocked ? Math.max(1, cs.level) : 1;
    const e = cfg.effect || {};

    const percentValue =
      (Number(e.percentPerLevel) || 0) * level;

    const flatValue =
      (Number(e.valuePerLevel) || 0) * level;

    switch (e.type) {
      case "businessIncomePercent":
        return tr("cards.bonus.businessIncomePercent", {
          value: percentValue
        });

      case "tapPowerFlat":
        return tr("cards.bonus.tapPowerFlat", {
          value: flatValue
        });

      case "criticalRatePercent":
        return tr("cards.bonus.criticalRatePercent", {
          value: percentValue
        });

      case "criticalDamagePercent":
        return tr("cards.bonus.criticalDamagePercent", {
          value: percentValue
        });

      case "energyMaxFlat":
        return tr("cards.bonus.energyMaxFlat", {
          value: flatValue
        });

      case "energyRegenSpeedPercent":
        return tr("cards.bonus.energyRegenSpeedPercent", {
          value: percentValue
        });

      default:
        return tr("collection.bonus");
    }
  }

  function renderCollectionUI() {
    const container = document.getElementById("collection-cards-list") || document.querySelector(".collection-cards");
    if (!container) return;

    const maxLevel = Number(COLLECTION_CONFIG.MAX_CARD_LEVEL || 5);

    container.innerHTML = CARD_IDS.map((cardId) => {
      const cfg = CARD_CONFIGS[cardId];
      const card = state.cards[cardId];
      const required = getCardFragmentsRequired(cardId);
      const maxed = card.level >= maxLevel;
      const canUpgrade = canLevelUpCard(cardId);
      const progress = required > 0 ? Math.min(100, card.fragments / required * 100) : 100;
      const actionLabel = maxed
        ? tr("common.max")
        : card.unlocked
          ? tr("collection.levelUp")
          : tr("collection.unlock");
      const cardArtPath = card.unlocked
        ? (CARD_ART_BY_ID[cardId] || ASSET_PATHS.cards.booster)
        : CARD_BACK_ASSET;

      return `
        <article class="collection-card-item compact-card-item ${cfg.rarity}-card ${card.unlocked ? "" : "locked-card"}" data-card-id="${cardId}">
          <div class="compact-card-image card-art-shell ${card.unlocked ? "" : "card-back-shell"}">
            ${cardArtMarkup(cardArtPath)}
            ${card.unlocked ? "" : '<span class="compact-card-lock">🔒</span>'}
          </div>
          <div class="compact-card-meta">
            <span class="compact-card-stars">${getRarityStars(cfg.rarity)}</span>
            <span class="compact-card-type">${cfg.type === "business" ? tr("collection.businessCard") : tr("collection.rpgCard")}</span>
          </div>
          <strong class="compact-card-name">${getCardDisplayName(cardId, cfg)}</strong>
          <span class="compact-card-level">${card.unlocked ? `${tr("common.levelShort")} ${card.level}` : tr("common.locked")}</span>
          <small class="compact-card-bonus">${getCardBonusLabel(cardId)}</small>
          <div class="compact-fragment-row">
            <div class="compact-fragment-bar"><span style="width:${progress}%"></span></div>
            <span class="compact-fragment-count">${maxed ? tr("common.max") : tr("collection.fragmentsProgress", { current: card.fragments, required })}</span>
          </div>
          <button class="compact-card-button" type="button" data-card-upgrade="${cardId}" ${canUpgrade && !maxed ? "" : "disabled"}>${actionLabel}</button>
        </article>`;
    }).join("");

    updateCollectionSummaryUI();
  }

  function updateCollectionSummaryUI() {
    const summary = getCollectionSummary();
    const ring = document.querySelector(".collection-ring strong");
    const sub = document.querySelector(".collection-ring small");
    if (ring) ring.textContent = `${summary.completionPercent}%`;
    if (sub) sub.textContent = tr("collection.summaryCount", { unlocked: summary.unlocked, total: summary.total });

    const compactCount = document.getElementById("collection-summary-count");
    const compactPercent = document.getElementById("collection-summary-percent");
    if (compactCount) compactCount.textContent = tr("collection.summaryCount", { unlocked: summary.unlocked, total: summary.total });
    if (compactPercent) compactPercent.textContent = `${summary.completionPercent}%`;

    const order = ["common", "rare", "epic", "legendary", "mythic"];
    document.querySelectorAll(".collection-summary .rarity-list > div").forEach((row, index) => {
      const stats = summary.rarity[order[index]] || { unlocked: 0, total: 0 };
      const strong = row.querySelector("strong");
      if (strong) strong.textContent = `${stats.unlocked} / ${stats.total}`;
    });
  }

  function renderExclusiveCards() {
    const container = document.getElementById("exclusive-cards-list");
    if (!container) return;
    container.innerHTML = EXCLUSIVE_CARD_IDS.map((cardId) => {
      const card = EXCLUSIVE_CARD_CONFIGS[cardId];
      const artPath = EXCLUSIVE_CARD_ART_BY_ID[cardId] || ASSET_PATHS.cards.booster;
      return `
        <article class="exclusive-card">
          <div class="exclusive-card-image card-art-shell">${cardArtMarkup(artPath)}</div>
          <strong>${getCardDisplayName(cardId, card)}</strong>
          <small>${getExclusiveCardDescription(cardId, card)}</small>
          <button type="button" data-exclusive-card-buy="${cardId}">${tr("collection.specialPurchase")}</button>
        </article>`;
    }).join("");
  }

  /* ==========================================================
     TIMED CASES
  ========================================================== */

  function getTimedCaseRemainingSeconds(caseId) {
    const cs = state.timedCases[caseId];
    if (!cs) return 0;
    return Math.max(0, Math.ceil((cs.unlockAt - Date.now()) / 1000));
  }

  function isTimedCaseReady(caseId) {
    return getTimedCaseRemainingSeconds(caseId) <= 0;
  }

  function formatCaseCountdown(seconds) {
    const safe = Math.max(0, Math.floor(Number(seconds) || 0));
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  }

  function rollWeightedRarity(rates) {
    const entries = Object.entries(rates || {});
    const total = entries.reduce((sum, [, weight]) => sum + Number(weight || 0), 0);
    let roll = Math.random() * total;
    for (const [rarity, weight] of entries) {
      roll -= Number(weight || 0);
      if (roll <= 0) return rarity;
    }
    return (entries.length ? entries[entries.length - 1][0] : "common");
  }

  function randomInt(min, max) {
    const a = Math.ceil(Number(min) || 0);
    const b = Math.floor(Number(max) || a);
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function rollCaseCardReward(caseId) {
    const cfg = TIMED_CASE_CONFIGS[caseId];
    if (!cfg) return null;
    const rarity = rollWeightedRarity(cfg.rates);
    let pool = CARD_IDS.filter((id) => CARD_CONFIGS[id].rarity === rarity);
    if (!pool.length) pool = CARD_IDS.filter((id) => CARD_CONFIGS[id].rarity !== "mythic");
    const cardId = pool[Math.floor(Math.random() * pool.length)];
    return {
      cardId,
      rarity,
      fragments: randomInt(cfg.fragments.min, cfg.fragments.max),
      card: CARD_CONFIGS[cardId]
    };
  }

  function openTimedCase(caseId) {
    const cfg = TIMED_CASE_CONFIGS[caseId];
    const cs = state.timedCases[caseId];
    if (!cfg || !cs || !isTimedCaseReady(caseId)) return false;

    processPassiveIncome();
    const moneyReward = Math.round(state.level * cfg.moneyMultiplier);
    const cardReward = rollCaseCardReward(caseId);

    state.money += moneyReward;
    state.gems += cfg.gemReward;
    if (cardReward) state.cards[cardReward.cardId].fragments += cardReward.fragments;

    registerMoneyEarned(moneyReward, "timedCase", { save: false, render: false });
    registerBonusCollected("timedCase", { save: false, render: false });

    cs.unlockAt = Date.now() + cfg.durationSeconds * 1000;
    cs.opens += 1;

    saveGame();
    updateUI();
    renderTimedCases();
    renderCollectionUI();
    showCaseRewardOverlay({ caseId, money: moneyReward, gems: cfg.gemReward, cardReward });
    emitGameEvent("timedCaseOpened", { caseId, money: moneyReward, gems: cfg.gemReward, cardReward });
    return true;
  }

  function skipTimedCase(caseId) {
    const cfg = TIMED_CASE_CONFIGS[caseId];
    const cs = state.timedCases[caseId];
    if (!cfg || !cs) return false;
    if (isTimedCaseReady(caseId)) return true;
    if (state.gems < cfg.skipGemCost) {
      emitGameEvent("notEnoughGems", { current: state.gems, required: cfg.skipGemCost });
      return false;
    }

    state.gems -= cfg.skipGemCost;
    cs.unlockAt = Date.now();
    saveGame();
    updateUI();
    renderTimedCases();
    return true;
  }

  function renderTimedCases() {
    const container = document.getElementById("timed-cases-list");
    if (!container) return;

    container.innerHTML = TIMED_CASE_IDS.map((caseId) => {
      const cfg = TIMED_CASE_CONFIGS[caseId];
      const ready = isTimedCaseReady(caseId);
      const remaining = getTimedCaseRemainingSeconds(caseId);
      const hours = cfg.durationSeconds / 3600;
      const caseClass = TIMED_CASE_SPRITE_CLASS[caseId] || "case-2h";

      return `
        <article class="real-case-card ${ready ? "ready" : ""} ${caseId === "case_24h" ? "case-24h" : ""}">
          <div class="real-case-art media-frame media-frame-square">${spriteMarkup("sprite-case", caseClass)}</div>
          <strong class="real-case-name">${getTimedCaseDisplayName(caseId, cfg)}</strong>
          <span class="real-case-duration">${tr("cases.durationHours", { hours })}</span>
          <div class="case-live-timer">${ready ? tr("cases.ready") : formatCaseCountdown(remaining)}</div>
          <div class="real-case-reward-preview"><span>💵 ${tr("common.levelShort")} × ${cfg.moneyMultiplier}</span><span>♦ ${cfg.gemReward}</span><span>🃏 ${cfg.fragments.min}-${cfg.fragments.max}</span></div>
          <div class="real-case-actions">
            <button class="case-open-real-button" type="button" data-timed-case-open="${caseId}" ${ready ? "" : "disabled"}>${ready ? tr("cases.open") : tr("cases.waiting")}</button>
            ${ready ? "" : `<button class="case-skip-button" type="button" data-timed-case-skip="${caseId}" ${state.gems >= cfg.skipGemCost ? "" : "disabled"}>♦ ${cfg.skipGemCost} · ${tr("cases.caseUnlockNow")}</button>`}
          </div>
        </article>`;
    }).join("");
  }

  let lastCaseRewardOverlayPayload = null;

  function showCaseRewardOverlay(reward) {
    const overlay = document.getElementById("case-reward-overlay");
    if (!overlay || !reward.cardReward) return;
    const cfg = TIMED_CASE_CONFIGS[reward.caseId];
    const card = reward.cardReward;
    lastCaseRewardOverlayPayload = reward;

    overlay.querySelector("#case-reward-title").textContent = getTimedCaseDisplayName(reward.caseId, cfg);
    overlay.querySelector("#case-reward-money").textContent = `+${formatCompactMoney(reward.money)}`;
    overlay.querySelector("#case-reward-gems").textContent = `+${reward.gems}`;

    const box = overlay.querySelector("#case-reward-card");
    box.className = `reward-card-preview ${card.rarity}`;
    const rewardArt = overlay.querySelector("#case-reward-card-art");
    if (rewardArt) {
      setCardArtBackground(
        rewardArt,
        CARD_ART_BY_ID[card.cardId] || ASSET_PATHS.cards.booster
      );
    }
    overlay.querySelector("#case-reward-rarity").textContent = tr(`rarity.${card.rarity}`).toUpperCase();
    overlay.querySelector("#case-reward-card-name").textContent = getCardDisplayName(card.cardId, card.card);
    overlay.querySelector("#case-reward-fragments").textContent = `+${card.fragments} ${tr("cases.fragments").toUpperCase()}`;
    overlay.hidden = false;
  }

  function closeCaseRewardOverlay() {
    const overlay = document.getElementById("case-reward-overlay");
    if (overlay) overlay.hidden = true;
  }

  /* ==========================================================
     PREMIUM ACCESSORY CASES / CATALOG
  ========================================================== */

  function getFreeAccessoryCaseRemaining() {
    return Math.max(0, Math.ceil((state.accessoryCases.freeUnlockAt - Date.now()) / 1000));
  }

  function isFreeAccessoryCaseReady() {
    return getFreeAccessoryCaseRemaining() <= 0;
  }

  function rollAccessoryCaseItem(caseId) {
    const caseConfig = ACCESSORY_CASE_CONFIGS[caseId];
    if (!caseConfig) return null;

    const rarity = rollWeightedRarity(caseConfig.rates);

    let pool = WARDROBE_CATALOG_IDS.filter((itemId) => {
      const cfg = WARDROBE_CATALOG_CONFIGS[itemId];
      const itemState = state.wardrobeCatalog[itemId];
      return !itemState.unlocked && cfg.rarity === rarity && cfg.sources.includes(caseId);
    });

    if (!pool.length) {
      pool = WARDROBE_CATALOG_IDS.filter((itemId) => {
        const cfg = WARDROBE_CATALOG_CONFIGS[itemId];
        const itemState = state.wardrobeCatalog[itemId];
        return !itemState.unlocked && cfg.sources.includes(caseId);
      });
    }

    if (!pool.length) return { complete: true };

    const itemId = pool[Math.floor(Math.random() * pool.length)];
    return {
      complete: false,
      itemId,
      item: WARDROBE_CATALOG_CONFIGS[itemId]
    };
  }

  function unlockWardrobeCatalogItem(itemId, source) {
    const itemState = state.wardrobeCatalog[itemId];
    if (!itemState || itemState.unlocked) return false;
    itemState.unlocked = true;
    itemState.unlockedAt = Date.now();
    itemState.source = source;
    return true;
  }

  function openFreeAccessoryCase() {
    if (!isFreeAccessoryCaseReady()) return false;

    const caseId = "free_accessory";
    const cfg = ACCESSORY_CASE_CONFIGS[caseId];
    const reward = rollAccessoryCaseItem(caseId);
    if (!cfg || !reward) return false;

    if (reward.complete) {
      state.gems += 5;
      state.accessoryCases.freeUnlockAt = Date.now() + cfg.durationSeconds * 1000;
      state.accessoryCases.freeOpens += 1;
      registerBonusCollected("freeAccessoryCase", { save: false, render: false });
      saveGame();
      updateUI();
      renderAccessoryCases();
      emitGameEvent("accessoryCaseCompleted", { caseId, compensationGems: 5 });
      return true;
    }

    unlockWardrobeCatalogItem(reward.itemId, caseId);
    state.accessoryCases.freeUnlockAt = Date.now() + cfg.durationSeconds * 1000;
    state.accessoryCases.freeOpens += 1;
    registerBonusCollected("freeAccessoryCase", { save: false, render: false });

    saveGame();
    updateUI();
    renderAccessoryCases();
    renderAccessoryCatalog();
    showAccessoryReward(reward.itemId);

    emitGameEvent("accessoryUnlocked", { itemId: reward.itemId, source: caseId });
    return true;
  }

  function openPremiumAccessoryCase(caseId) {
    const cfg = ACCESSORY_CASE_CONFIGS[caseId];
    if (!cfg || cfg.type !== "premium") return false;

    if (state.gems < cfg.gemCost) {
      emitGameEvent("notEnoughGems", { required: cfg.gemCost, current: state.gems });
      return false;
    }

    const reward = rollAccessoryCaseItem(caseId);
    if (!reward || reward.complete) {
      emitGameEvent("accessoryCaseCompleted", { caseId });
      return false;
    }

    state.gems -= cfg.gemCost;
    unlockWardrobeCatalogItem(reward.itemId, caseId);
    state.accessoryCases.premiumOpens[caseId] =
      (state.accessoryCases.premiumOpens[caseId] || 0) + 1;

    registerBonusCollected("premiumAccessoryCase", {
      save: false,
      render: false
    });

    saveGame();
    updateUI();
    renderAccessoryCases();
    renderAccessoryCatalog();
    showAccessoryReward(reward.itemId);

    emitGameEvent("accessoryUnlocked", {
      itemId: reward.itemId,
      source: caseId,
      gemsSpent: cfg.gemCost
    });
    return true;
  }

  function renderFreeAccessoryCase() {
    const container = document.getElementById("free-accessory-case");
    const cfg = ACCESSORY_CASE_CONFIGS.free_accessory;
    if (!container || !cfg) return;

    const ready = isFreeAccessoryCaseReady();
    const remaining = getFreeAccessoryCaseRemaining();
    const caseClass = ACCESSORY_CASE_SPRITE_CLASS.free_accessory || "case-acc-free";

    container.innerHTML = `
      <article class="free-accessory-card">
        <div class="free-accessory-icon media-frame media-frame-square">${spriteMarkup("sprite-case", caseClass)}</div>
        <div class="free-accessory-content">
          <strong>${getAccessoryCaseDisplayName("free_accessory", cfg)}</strong>
          <span class="free-accessory-timer">${ready ? tr("accessoryCases.ready") : formatCaseCountdown(remaining)}</span>
          <button class="free-accessory-button" type="button" data-free-accessory-open ${ready ? "" : "disabled"}>
            ${ready ? tr("accessoryCases.openFree") : tr("accessoryCases.waiting")}
          </button>
        </div>
      </article>`;
  }

  function renderPremiumAccessoryCases() {
    const container = document.getElementById("premium-accessory-cases-list");
    if (!container) return;

    const ids = ["premium_rare", "premium_epic", "premium_legendary"];

    container.innerHTML = ids.map((caseId) => {
      const cfg = ACCESSORY_CASE_CONFIGS[caseId];
      if (!cfg) return "";

      const rarity = caseId === "premium_rare" ? "rare" : caseId === "premium_epic" ? "epic" : "legendary";
      const availableItems = WARDROBE_CATALOG_IDS.some((itemId) => {
        const itemCfg = WARDROBE_CATALOG_CONFIGS[itemId];
        return !state.wardrobeCatalog[itemId]?.unlocked && itemCfg.sources.includes(caseId);
      });
      const canAfford = state.gems >= cfg.gemCost;
      const caseClass = ACCESSORY_CASE_SPRITE_CLASS[caseId] || "case-acc-rare";

      return `
        <article class="premium-accessory-case ${rarity}">
          <div class="premium-accessory-case-icon media-frame media-frame-square">${spriteMarkup("sprite-case", caseClass)}</div>
          <strong>${getAccessoryCaseDisplayName(caseId, cfg)}</strong>
          <small>${tr(`rarity.${rarity}`)}</small>
          <button class="buy-accessory-case" type="button" data-premium-accessory-open="${caseId}" ${canAfford && availableItems ? "" : "disabled"}>
            ${availableItems ? `♦ ${cfg.gemCost}` : tr("accessoryCases.collectionComplete")}
          </button>
        </article>`;
    }).join("");
  }

  function renderAccessoryCases() {
    renderFreeAccessoryCase();
    renderPremiumAccessoryCases();
  }

  let lastAccessoryRewardItemId = null;

  function showAccessoryReward(itemId) {
    const overlay = document.getElementById("accessory-reward-overlay");
    const cfg = WARDROBE_CATALOG_CONFIGS[itemId];
    if (!overlay || !cfg) return;
    lastAccessoryRewardItemId = itemId;

    const item = overlay.querySelector("#accessory-reward-item");
    if (item) item.className = `accessory-reward-item ${cfg.rarity}`;

    const sprite = overlay.querySelector("#accessory-reward-sprite");
    if (sprite) {
      const wardrobeKey = WARDROBE_CATALOG_SPRITE_CLASS[itemId] || "wardrobe-watch";
      setDirectImageAsset(sprite, DIRECT_ASSET_BY_CELL[wardrobeKey] || ASSET_PATHS.wardrobe.watch);
    }

    const rarity = overlay.querySelector("#accessory-reward-rarity");
    if (rarity) rarity.textContent = tr(`rarity.${cfg.rarity}`).toUpperCase();

    const name = overlay.querySelector("#accessory-reward-name");
    if (name) name.textContent = getWardrobeCatalogDisplayName(itemId, cfg);

    const slot = overlay.querySelector("#accessory-reward-slot");
    if (slot) slot.textContent = tr(`wardrobeSlots.${cfg.slot}`);

    overlay.hidden = false;
  }

  function closeAccessoryReward() {
    const overlay = document.getElementById("accessory-reward-overlay");
    if (overlay) overlay.hidden = true;
  }

  function getAccessorySourceLabel(itemConfig) {
    return itemConfig.sources.map((sourceId) => {
      switch (sourceId) {
        case "free_accessory": return tr("accessorySources.free");
        case "premium_rare": return tr("accessorySources.rare");
        case "premium_epic": return tr("accessorySources.epic");
        case "premium_legendary": return tr("accessorySources.legendary");
        default: return tr("accessorySources.unknown");
      }
    }).join(" · ");
  }

  function renderAccessoryCatalog() {
    const container = document.getElementById("accessory-catalog-grid");
    if (!container) return;

    const unlocked = WARDROBE_CATALOG_IDS.filter((itemId) => state.wardrobeCatalog[itemId]?.unlocked).length;
    const total = WARDROBE_CATALOG_IDS.length;
    const percent = total ? (unlocked / total * 100) : 0;

    const count = document.getElementById("catalog-progress-count");
    const bar = document.getElementById("catalog-progress-bar");
    if (count) count.textContent = `${unlocked} / ${total}`;
    if (bar) bar.style.width = `${percent}%`;

    container.innerHTML = WARDROBE_CATALOG_IDS.map((itemId) => {
      const cfg = WARDROBE_CATALOG_CONFIGS[itemId];
      const itemState = state.wardrobeCatalog[itemId];
      const spriteClass = WARDROBE_CATALOG_SPRITE_CLASS[itemId] || "wardrobe-watch";

      return `
        <article class="catalog-item ${cfg.rarity} ${itemState.unlocked ? "unlocked" : "locked"}">
          <div class="catalog-item-image media-frame media-frame-square">
            ${spriteMarkup("sprite-wardrobe", spriteClass)}
            ${itemState.unlocked ? "" : '<span class="catalog-lock-icon">🔒</span>'}
          </div>
          <strong>${getWardrobeCatalogDisplayName(itemId, cfg)}</strong>
          <span class="catalog-item-rarity">${tr(`rarity.${cfg.rarity}`)}</span>
          <small class="catalog-source">
            ${itemState.unlocked ? `✓ ${tr("wardrobe.unlocked")}` : `${tr("wardrobe.unlockSource")}: ${getAccessorySourceLabel(cfg)}`}
          </small>
        </article>`;
    }).join("");
  }

  function openAccessoryCatalog() {
    const modal = document.getElementById("accessory-catalog-modal");
    if (!modal) return;
    renderAccessoryCatalog();
    modal.hidden = false;
  }

  function closeAccessoryCatalog() {
    const modal = document.getElementById("accessory-catalog-modal");
    if (modal) modal.hidden = true;
  }

  /* ==========================================================
     RANDOM FLYING EVENTS
  ========================================================== */

  let randomEventToastTimer = null;

  function getRandomEventIntervalMs() {
    const min = Number(RANDOM_EVENT_CONFIG.MIN_INTERVAL_SECONDS) || 120;
    const max = Number(RANDOM_EVENT_CONFIG.MAX_INTERVAL_SECONDS) || 300;
    return randomInt(min, max) * 1000;
  }

  function scheduleNextRandomEvent() {
    state.randomEvents.nextSpawnAt = Date.now() + getRandomEventIntervalMs();
    saveGame();
  }

  function rollRandomEventType() {
    const entries = RANDOM_EVENT_IDS.map((eventId) => [
      eventId,
      Number(RANDOM_EVENT_DEFINITIONS[eventId]?.weight) || 1
    ]);

    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    if (!total) return null;

    let roll = Math.random() * total;
    for (const [eventId, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return eventId;
    }
    return entries[0]?.[0] || null;
  }

  function spawnRandomEvent(forcedEventId = null) {
    if (state.randomEvents.activeEvent) return false;

    const eventId = forcedEventId || rollRandomEventType();
    const cfg = RANDOM_EVENT_DEFINITIONS[eventId];
    if (!cfg) return false;

    const now = Date.now();
    const duration = (Number(RANDOM_EVENT_CONFIG.VISIBLE_SECONDS) || 5) * 1000;

    state.randomEvents.activeEvent = {
      instanceId: `${eventId}_${now}`,
      eventId,
      spawnedAt: now,
      expiresAt: now + duration,
      reverse: Math.random() > .5,
      startY: randomInt(15, 58),
      endY: randomInt(20, 65)
    };
    state.randomEvents.nextSpawnAt = 0;

    saveGame();
    renderRandomEvent();
    emitGameEvent("randomEventSpawned", { eventId });
    return true;
  }

  function renderRandomEvent() {
    const layer = document.getElementById("random-event-layer");
    const button = document.getElementById("random-flying-event");
    const icon = document.getElementById("random-event-icon");
    if (!layer || !button || !icon) return;

    const active = state.randomEvents.activeEvent;
    if (!active || active.expiresAt <= Date.now()) {
      layer.hidden = true;
      return;
    }

    const cfg = RANDOM_EVENT_DEFINITIONS[active.eventId];
    if (!cfg) {
      layer.hidden = true;
      return;
    }

    icon.textContent = cfg.icon;
    button.classList.toggle("reverse", Boolean(active.reverse));
    button.style.setProperty("--start-y", `${active.startY}vh`);
    button.style.setProperty("--end-y", `${active.endY}vh`);
    button.style.animationDuration = `${Math.max(100, active.expiresAt - Date.now())}ms`;
    button.dataset.randomEventInstance = active.instanceId;

    button.style.animationName = "none";
    void button.offsetWidth;
    button.style.animationName = active.reverse ? "randomEventFlyReverse" : "randomEventFly";

    layer.hidden = false;
  }

  function expireRandomEvent() {
    const active = state.randomEvents.activeEvent;
    if (!active || active.expiresAt > Date.now()) return;

    state.randomEvents.activeEvent = null;
    const layer = document.getElementById("random-event-layer");
    if (layer) layer.hidden = true;

    scheduleNextRandomEvent();
    emitGameEvent("randomEventMissed");
  }

  function showRandomEventToast(title, text) {
    const toast = document.getElementById("random-event-toast");
    if (!toast) return;

    const titleEl = toast.querySelector("#random-event-toast-title");
    const textEl = toast.querySelector("#random-event-toast-text");
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;

    toast.hidden = false;
    clearTimeout(randomEventToastTimer);
    randomEventToastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  }

  function claimRandomEvent() {
    const active = state.randomEvents.activeEvent;
    if (!active) return false;

    if (active.expiresAt <= Date.now()) {
      expireRandomEvent();
      return false;
    }

    const cfg = RANDOM_EVENT_DEFINITIONS[active.eventId];
    if (!cfg) return false;

    let rewardText = "";

    if (cfg.type === "tapMultiplier") {
      state.randomEvents.tapBoostUntil = Date.now() + (Number(cfg.durationSeconds) || 180) * 1000;
      rewardText = tr("randomEvents.tapBoostReward");
    } else if (cfg.type === "energy") {
      const stats = recomputeDerivedState();
      const before = state.energy;
      state.energy = Math.min(stats.maxEnergy, state.energy + (Number(cfg.amount) || 0));
      rewardText = tr("randomEvents.energyReward", { amount: state.energy - before });
    }

    const eventId = active.eventId;
    state.randomEvents.activeEvent = null;

    updateMissionProgress("events", 1, "randomEvent", { save: false, render: false });
    registerBonusCollected("randomEvent", { save: false, render: false });

    scheduleNextRandomEvent();
    saveGame();
    updateUI();

    const layer = document.getElementById("random-event-layer");
    if (layer) layer.hidden = true;

    showRandomEventToast(getLocalizedValue(cfg.name), rewardText);
    emitGameEvent("randomEventClaimed", { eventId, rewardText });
    return true;
  }

  function tickRandomEventSystem() {
    const now = Date.now();
    const active = state.randomEvents.activeEvent;

    if (active && active.expiresAt <= now) {
      expireRandomEvent();
      return;
    }

    if (active) return;

    if (!state.randomEvents.nextSpawnAt) {
      scheduleNextRandomEvent();
      return;
    }

    if (now >= state.randomEvents.nextSpawnAt) {
      spawnRandomEvent();
    }
  }

  /* ==========================================================
     WARDROBE / STYLE SETS
  ========================================================== */

  function getEquipmentStage(equipmentId, level) {
    const cfg = EQUIPMENT_CONFIGS[equipmentId];
    if (!cfg) return null;
    const stages = [...(cfg.stages || [])].sort((a, b) => a.minLevel - b.minLevel);
    let selected = stages[0] || null;
    stages.forEach((stage) => { if (level >= stage.minLevel) selected = stage; });
    return selected;
  }

  function getEquipmentUpgradeCost(equipmentId) {
    const cfg = EQUIPMENT_CONFIGS[equipmentId];
    const es = state.equipment[equipmentId];
    if (!cfg || !es) return 0;
    if (es.level >= Number(WARDROBE_CONFIG.MAX_LEVEL || 10)) return 0;
    const growth = Number(CONFIG.ECONOMY?.EQUIPMENT_UPGRADE_GROWTH) || 1.5;
    return Math.ceil((Number(cfg.baseCost) || 0) * Math.pow(growth, Math.max(0, es.level)));
  }

  function buyEquipmentLevelOne(equipmentId) {
    const es = state.equipment[equipmentId];
    if (!es || es.unlocked) return false;
    const cost = getEquipmentUpgradeCost(equipmentId);
    if (state.money < cost) return false;

    processPassiveIncome();
    state.money -= cost;
    es.unlocked = true;
    es.level = 1;
    es.equipped = true;
    recomputeDerivedState();
    updateMissionProgress("upgrades", 1, "equipmentUpgrade", { save: false, render: false });
    saveGame();
    updateUI();
    renderWardrobeUI();
    refreshBusinessPanels();
    return true;
  }

  function upgradeEquipment(equipmentId) {
    const es = state.equipment[equipmentId];
    if (!es) return false;
    if (!es.unlocked) return buyEquipmentLevelOne(equipmentId);
    if (es.level >= Number(WARDROBE_CONFIG.MAX_LEVEL || 10)) return false;

    const cost = getEquipmentUpgradeCost(equipmentId);
    if (state.money < cost) return false;
    processPassiveIncome();
    state.money -= cost;
    es.level += 1;
    recomputeDerivedState();
    updateMissionProgress("upgrades", 1, "equipmentUpgrade", { save: false, render: false });
    saveGame();
    updateUI();
    renderWardrobeUI();
    refreshBusinessPanels();
    return true;
  }

  function getEquipmentStageLocalizedName(
    equipmentId,
    stage,
    displayLevel = 1
  ) {
    const minLevel = Math.max(
      1,
      Number(stage?.minLevel) || Number(displayLevel) || 1
    );

    const key = `equipment.${equipmentId}.stage${minLevel}.name`;

    if (window.i18n?.has?.(key, currentLanguage())) {
      return tr(key);
    }

    const localized = getLocalizedValue(stage?.name);

    if (
      localized
      && localized !== tr("common.textUnavailable")
    ) {
      return localized;
    }

    return tr("wardrobe.itemLevelName", {
      slot: tr(`wardrobeSlots.${equipmentId}`),
      level: minLevel
    });
  }

  function getEquipmentLocalizedName(equipmentId) {
    const es = state.equipment[equipmentId];
    const level = es?.unlocked ? Math.max(1, es.level) : 1;
    const stage =
      getEquipmentStage(equipmentId, level)
      || EQUIPMENT_CONFIGS[equipmentId]?.stages?.[0];

    return getEquipmentStageLocalizedName(
      equipmentId,
      stage,
      level
    );
  }

  function getStyleSetLocalizedName(setId, cfg = STYLE_SET_CONFIGS[setId]) {
    const key = `styleSets.${setId}.name`;

    if (window.i18n?.has?.(key, currentLanguage())) {
      return tr(key);
    }

    const localized = getLocalizedValue(cfg?.name);
    return localized && localized !== tr("common.textUnavailable")
      ? localized
      : tr("wardrobe.styleSetFallback");
  }

  function getStyleSetLocalizedDescription(
    setId,
    cfg = STYLE_SET_CONFIGS[setId]
  ) {
    const key = `styleSets.${setId}.description`;

    if (window.i18n?.has?.(key, currentLanguage())) {
      return tr(key);
    }

    const localized = getLocalizedValue(cfg?.description);
    return localized && localized !== tr("common.textUnavailable")
      ? localized
      : tr("wardrobe.styleSetDescriptionFallback");
  }

  function getEquipmentEffectLabel(equipmentId) {
    const cfg = EQUIPMENT_CONFIGS[equipmentId];
    const es = state.equipment[equipmentId];
    if (!cfg || !es) return "";
    const level = Math.max(es.level, 1);
    const value = (Number(cfg.effect?.valuePerLevel) || 0) * level;

    switch (cfg.effect?.type) {
      case "globalIncomePercent": return `+${value}% ${tr("stats.income")}`;
      case "tapPowerPercent": return `+${value}% ${tr("stats.tapPower")}`;
      case "criticalRatePercent": return `+${value}% ${tr("stats.criticalRate")}`;
      case "criticalDamagePercent": return `+${value}% ${tr("stats.criticalDamage")}`;
      case "energyMaxFlat": return `+${value} ${tr("stats.maxEnergy")}`;
      case "energyRegenSpeedPercent": return `+${value}% ${tr("stats.energyRegen")}`;
      default: return "";
    }
  }

  function getWardrobeBonusTotals() {
    const totals = { incomePercent: 0, tapPowerPercent: 0, critRatePercent: 0, critDamagePercent: 0, energyMax: 0, energyRegenPercent: 0 };
    EQUIPMENT_IDS.forEach((id) => {
      const cfg = EQUIPMENT_CONFIGS[id];
      const es = state.equipment[id];
      if (!es?.unlocked || !es.equipped) return;
      const value = (Number(cfg.effect?.valuePerLevel) || 0) * es.level;
      switch (cfg.effect?.type) {
        case "globalIncomePercent": totals.incomePercent += value; break;
        case "tapPowerPercent": totals.tapPowerPercent += value; break;
        case "criticalRatePercent": totals.critRatePercent += value; break;
        case "criticalDamagePercent": totals.critDamagePercent += value; break;
        case "energyMaxFlat": totals.energyMax += value; break;
        case "energyRegenSpeedPercent": totals.energyRegenPercent += value; break;
      }
    });
    return totals;
  }

  function getStyleSetProgress(setId) {
    const cfg = STYLE_SET_CONFIGS[setId];
    if (!cfg) return { completed: 0, total: 0, percent: 0, complete: false };
    const required = Number(cfg.requiredEquipmentLevel) || 1;
    const completed = EQUIPMENT_IDS.filter((id) => state.equipment[id]?.unlocked && state.equipment[id].level >= required).length;
    const total = EQUIPMENT_IDS.length;
    return { completed, total, percent: total ? Math.round(completed / total * 100) : 0, complete: total > 0 && completed === total };
  }

  function renderEquipmentItems() {
    const container = document.getElementById("wardrobe-dynamic-list");
    if (!container) return;
    container.innerHTML = "";

    EQUIPMENT_IDS.forEach((equipmentId) => {
      const es = state.equipment[equipmentId];
      const row = document.createElement("button");
      row.type = "button";
      row.className = `equipment-row${selectedWardrobeSlot === equipmentId ? " selected" : ""}`;
      row.dataset.wardrobeSlot = equipmentId;
      const spriteClass = EQUIPMENT_SPRITE_CLASS[equipmentId] || "wardrobe-watch";
      const displayLevel = es.unlocked ? es.level : 0;
      row.innerHTML = `
        <div class="wardrobe-item-icon media-frame media-frame-square">${spriteMarkup("sprite-wardrobe", spriteClass)}</div>
        <span class="equipment-row-copy">
          <strong>${getEquipmentLocalizedName(equipmentId)}</strong>
          <small>${tr("common.levelShort")} ${displayLevel}</small>
        </span>`;
      row.classList.toggle("locked", !es.unlocked);
      container.appendChild(row);
    });
  }

  function renderStyleSets() {
    const container = document.getElementById("wardrobe-dynamic-list");
    if (!container) return;
    container.innerHTML = STYLE_SET_IDS.map((setId) => {
      const cfg = STYLE_SET_CONFIGS[setId];
      const progress = getStyleSetProgress(setId);
      return `
        <button class="style-set-card ${selectedStyleSetId === setId ? "selected" : ""} ${progress.complete ? "complete" : ""}" type="button" data-style-set="${setId}">
          <div class="style-set-icon">${cfg.icon}</div>
          <div class="style-set-info">
            <strong>${getStyleSetLocalizedName(setId, cfg)}</strong>
            <small>${getStyleSetLocalizedDescription(setId, cfg)}</small>
            <div class="style-set-progress-row"><div class="mini-progress"><span style="width:${progress.percent}%"></span></div><span>${progress.complete ? tr("wardrobe.setComplete") : `${progress.completed}/${progress.total}`}</span></div>
          </div>
        </button>`;
    }).join("");
  }

  function renderWardrobeTotalStats() {
    const sections = document.querySelectorAll(".outfit-panel section");
    if (!sections[1]) return;
    const totals = getWardrobeBonusTotals();
    sections[1].innerHTML = `
      <h3>${tr("wardrobe.totalStats")}</h3>
      <p>★ +${totals.incomePercent.toFixed(1)}% ${tr("stats.income")}</p>
      <p>★ +${totals.tapPowerPercent.toFixed(1)}% ${tr("stats.tapPower")}</p>
      <p>★ +${totals.critRatePercent.toFixed(1)}% ${tr("stats.criticalRate")}</p>
      <p>★ +${totals.critDamagePercent.toFixed(1)}% ${tr("stats.criticalDamage")}</p>
      <p>★ +${totals.energyMax} ${tr("stats.maxEnergy")}</p>
      <p>★ +${totals.energyRegenPercent.toFixed(1)}% ${tr("stats.energyRegen")}</p>`;
  }

  function renderStyleSetRightPanel() {
    const panel = document.querySelector(".outfit-panel");
    const cfg = STYLE_SET_CONFIGS[selectedStyleSetId];
    if (!panel || !cfg) return;
    const progress = getStyleSetProgress(selectedStyleSetId);
    const sections = panel.querySelectorAll("section");

    if (sections[0]) {
      sections[0].innerHTML = `
        <h3>${tr("wardrobe.styleSetProgress")}</h3>
        <strong>${cfg.icon} ${getStyleSetLocalizedName(selectedStyleSetId, cfg)}</strong>
        <div class="progress-bar"><div class="progress-fill" style="width:${progress.percent}%"></div></div>
        <small>${progress.completed}/${progress.total} · ${tr("wardrobe.requiredEquipmentLevel", { level: cfg.requiredEquipmentLevel })}</small>`;
    }

    renderWardrobeTotalStats();
    const button = panel.querySelector(".upgrade-outfit");
    if (button) {
      button.removeAttribute("data-wardrobe-upgrade");
      button.disabled = true;
      button.innerHTML = progress.complete ? tr("wardrobe.setComplete") : tr("wardrobe.completeSet");
    }
  }

  function renderWardrobeRightPanel() {
    if (wardrobeView === "sets") {
      renderStyleSetRightPanel();
      return;
    }

    const panel = document.querySelector(".outfit-panel");
    const es = state.equipment[selectedWardrobeSlot];
    if (!panel || !es) return;
    const maxLevel = Number(WARDROBE_CONFIG.MAX_LEVEL || 10);
    const progress = es.unlocked ? es.level / maxLevel * 100 : 0;
    const stage = es.unlocked ? getEquipmentStage(selectedWardrobeSlot, es.level) : null;
    const sections = panel.querySelectorAll("section");

    if (sections[0]) {
      sections[0].innerHTML = `
        <h3>${tr("wardrobe.outfitProgress")}</h3>
        <strong>${es.unlocked ? `${stage?.icon || ""} ${getEquipmentLocalizedName(selectedWardrobeSlot)}` : `🔒 ${tr("wardrobe.slotLocked")}`}</strong>
        <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
        <small>${es.unlocked ? `${tr("common.levelShort")} ${es.level} / ${maxLevel}` : tr("wardrobe.unlockSlot")}</small>`;
    }

    renderWardrobeTotalStats();
    const button = panel.querySelector(".upgrade-outfit");
    if (!button) return;
    button.dataset.wardrobeUpgrade = selectedWardrobeSlot;

    if (!es.unlocked) {
      button.disabled = false;
      button.innerHTML = `${tr("wardrobe.buyLevelOne")} <strong>${formatCompactMoney(getEquipmentUpgradeCost(selectedWardrobeSlot))}</strong>`;
    } else if (es.level >= maxLevel) {
      button.disabled = true;
      button.innerHTML = `${tr("wardrobe.maxLevel")} <strong>${tr("common.levelShort")} ${maxLevel}</strong>`;
    } else {
      button.disabled = false;
      button.innerHTML = `${tr("wardrobe.upgradeByLevel", { level: es.level + 1 })} <strong>${formatCompactMoney(getEquipmentUpgradeCost(selectedWardrobeSlot))}</strong>`;
    }
  }

  function forceSelectedAvatarImage(element) {
    if (!(element instanceof HTMLImageElement)) return false;

    const gender = getSelectedCharacterGender();
    const asset = getSelectedAvatarAsset(gender);
    const primaryPath = normalizeRelativeAssetPath(asset.primary);
    const fallbackPath = normalizeRelativeAssetPath(asset.fallback);
    const primarySrc = resolveAssetUrl(primaryPath);

    element.dataset.characterGender = gender;
    element.dataset.avatarAsset = primaryPath;

    element.onload = () => {
      element.dataset.avatarLoaded = "true";
      element.classList.remove("asset-placeholder");
    };

    element.onerror = () => {
      if (
        fallbackPath
        && element.dataset.avatarFallbackTried !== "true"
      ) {
        element.dataset.avatarFallbackTried = "true";
        element.dataset.avatarFallbackUsed = "true";
        element.src = resolveAssetUrl(fallbackPath);
        return;
      }

      element.onerror = null;
      element.dataset.avatarLoaded = "false";
      element.classList.add("asset-placeholder");
      element.src = TRANSPARENT_ASSET_PLACEHOLDER;
    };

    if (element.src !== primarySrc) {
      delete element.dataset.avatarFallbackTried;
      delete element.dataset.avatarFallbackUsed;
      element.src = primarySrc;
    }

    return true;
  }

  function updateSelectedAvatarUI(root = document) {
    root
      .querySelectorAll(".player-avatar-image[data-game-avatar]")
      .forEach((element) => {
        forceSelectedAvatarImage(element);
      });
  }

  function applySelectedCharacterToUI() {
    const gender = getSelectedCharacterGender();

    document.body.dataset.characterGender = gender;
    document.documentElement.dataset.characterGender = gender;

    updateSelectedAvatarUI(document);

    document.querySelectorAll(
      ".home-character-sprite[data-character-sprite], .wardrobe-character-sprite[data-character-sprite]"
    ).forEach((element) => {
      applyCharacterSpriteStage(element, state.level);
    });

    document
      .querySelectorAll("[data-character-choice]")
      .forEach((button) => {
        const selected =
          button.dataset.characterChoice === gender;

        button.classList.toggle("selected", selected);
        button.setAttribute(
          "aria-pressed",
          selected ? "true" : "false"
        );
      });

    return gender;
  }

  let pendingCharacterSelectionOfflineResult = null;

  function isCharacterSelectionRequired() {
    return state.profile?.characterSelected !== true;
  }

  function openCharacterSelection(options = {}) {
    const modal =
      document.getElementById("character-selection-modal");

    if (!modal) return false;

    applySelectedCharacterToUI();

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("character-selection-open");

    const appShell = document.querySelector(".app-shell");
    if (appShell) {
      appShell.setAttribute("aria-hidden", "true");
      if ("inert" in appShell) appShell.inert = true;
    }

    if (options.focus !== false) {
      requestAnimationFrame(() => {
        const selected =
          modal.querySelector(
            `[data-character-choice="${getSelectedCharacterGender()}"]`
          )
          || modal.querySelector("[data-character-choice]");

        selected?.focus?.({ preventScroll: true });
      });
    }

    return true;
  }

  function closeCharacterSelection() {
    const modal =
      document.getElementById("character-selection-modal");

    if (!modal) return false;

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("character-selection-open");

    const appShell = document.querySelector(".app-shell");
    if (appShell) {
      appShell.removeAttribute("aria-hidden");
      if ("inert" in appShell) appShell.inert = false;
    }

    return true;
  }

  function selectCharacterGender(gender, options = {}) {
    const normalized =
      normalizeCharacterGender(gender);

    state.profile ||= {};
    state.profile.characterGender = normalized;
    state.profile.characterSelected = true;

    /*
       Persist immediately. The deep Proxy also observes these assignments,
       but saveGame() makes the choice durable before the player can close
       Telegram again.
    */
    saveGame("character-selection");

    applySelectedCharacterToUI();
    closeCharacterSelection();

    if (
      pendingCharacterSelectionOfflineResult
      && Number(
        pendingCharacterSelectionOfflineResult.pendingAmount
      ) > 0
    ) {
      const pending =
        pendingCharacterSelectionOfflineResult;

      pendingCharacterSelectionOfflineResult = null;

      requestAnimationFrame(() => {
        showOfflineEarningsModal(pending);
      });
    }

    emitGameEvent("characterSelected", {
      gender: normalized,
      source: options.source || "character-selection"
    });

    return normalized;
  }

  function bindCharacterSelection() {
    const modal =
      document.getElementById("character-selection-modal");

    if (!modal || modal.dataset.bound === "true") return;

    modal.dataset.bound = "true";

    modal.addEventListener("click", (event) => {
      const choice =
        event.target?.closest?.("[data-character-choice]");

      if (!choice) return;

      event.preventDefault();

      selectCharacterGender(
        choice.dataset.characterChoice,
        { source: "startup-selector" }
      );
    });

    /*
       This is a blocking first-run decision: Escape does not dismiss it.
       A valid default (male) still exists internally, so legacy/fallback
       rendering stays safe until the player chooses.
    */
    applySelectedCharacterToUI();
  }

  function updateWardrobeCharacter() {
    document.querySelectorAll(".wardrobe-character-sprite[data-character-sprite]").forEach((element) => {
      applyCharacterSpriteStage(element, state.level);
    });
  }

  function renderWardrobeUI() {
    document.querySelectorAll("[data-wardrobe-view]").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.wardrobeView === wardrobeView);
    });

    if (wardrobeView === "sets") renderStyleSets();
    else renderEquipmentItems();

    renderWardrobeRightPanel();
    updateWardrobeCharacter();
  }

  /* ==========================================================
     UI
  ========================================================== */

  function updateHomeCharacter() {
    applySelectedCharacterToUI();
  }

  function updateHomeMetaUI(offlineIncome = null) {
    const streakValue = document.querySelector(".feature-value");
    const streakBonus = streakValue?.parentElement?.querySelector("small");
    const offlineValue = document.querySelector(".offline-value");
    if (streakValue) streakValue.textContent = String(Math.max(0, Number(state.streak?.days) || 0));
    if (streakBonus) streakBonus.textContent = `+${Math.max(0, Number(state.streak?.bonusPercent) || 0)}%`;
    if (offlineValue && offlineIncome !== null) offlineValue.textContent = formatCompactMoney(offlineIncome);
  }

  function syncHudIconAssets(root = document) {
    const iconTargets = {
      money: ASSET_PATHS.hud.money,
      energy: ASSET_PATHS.hud.energy,
      gems: ASSET_PATHS.hud.gems,
      xp: ASSET_PATHS.hud.xp
    };

    root.querySelectorAll("[data-hud-icon]").forEach((icon) => {
      const key = icon.dataset.hudIcon;
      const path = iconTargets[key];
      if (!path) return;

      const versionedPath = `${path}?v=${SPRITE_BUILD_VERSION}`;
      if (icon.getAttribute("src") !== versionedPath) {
        icon.setAttribute("src", versionedPath);
      }

      icon.removeAttribute("onerror");
      icon.classList.remove("image-placeholder", "asset-placeholder", "fallback-icon");
    });
  }

  function updatePlayerResources() {
    const money = document.querySelector(".money-card strong");
    const energy = document.querySelector(".energy-card strong");
    const gems = document.querySelector(".gem-card strong");

    if (money) {
      money.textContent = formatCompactMoney(state.money);
      money.title = `$${formatNumber(state.money)}`;
    }

    if (energy) {
      const currentEnergy = Math.max(0, Math.floor(Number(state.energy) || 0));
      const maxEnergy = Math.max(0, Math.floor(Number(state.maxEnergy) || 0));
      energy.textContent = maxEnergy >= 10000
        ? `${formatCompactCount(currentEnergy)}/${formatCompactCount(maxEnergy)}`
        : `${formatNumber(currentEnergy)}/${formatNumber(maxEnergy)}`;
      energy.title = `${formatNumber(currentEnergy)} / ${formatNumber(maxEnergy)}`;
    }

    if (gems) {
      gems.textContent = formatCompactCount(state.gems);
      gems.title = formatNumber(state.gems);
    }
  }

  function updateLevelUpBoostUI() {
    const indicator = document.getElementById("level-boost-indicator");
    const label = document.getElementById("level-boost-indicator-text");
    if (!indicator || !label) return;

    const remaining = getLevelUpBoostRemainingMs(state);
    const multiplier = getLevelUpEarningsMultiplier(state);

    if (remaining <= 0 || multiplier <= 1) {
      indicator.hidden = true;
      indicator.setAttribute("aria-hidden", "true");
      return;
    }

    indicator.hidden = false;
    indicator.setAttribute("aria-hidden", "false");
    label.textContent = tr("hud.boost", {
      multiplier: formatBoostMultiplier(multiplier),
      time: formatBoostTimer(remaining)
    });
  }

  function showLevelUpCelebration(reward) {
    if (!reward) return;

    const modal = document.getElementById("level-up-modal");
    if (!modal) return;

    const title = document.getElementById("level-up-modal-title");
    const image = document.getElementById("level-up-case-image");
    const caseName = document.getElementById("level-up-case-name");
    const gems = document.getElementById("level-up-gems");
    const boost = document.getElementById("level-up-boost-badge");
    const inventory = document.getElementById("level-up-inventory-count");

    if (title) title.textContent = tr("levelUp.title", { level: reward.level });
    const localizedCaseName = tr(`levelUp.case.${reward.caseKey}`);
    if (caseName) caseName.textContent = localizedCaseName;
    if (gems) gems.textContent = tr("levelUp.gems", { amount: formatNumber(reward.gems) });
    if (boost) {
      boost.textContent =
        tr("levelUp.earningsBoost", {
          multiplier: formatBoostMultiplier(reward.boostMultiplier),
          time: formatBoostTimer(reward.boostDurationSeconds * 1000)
        });
    }
    if (inventory) {
      inventory.textContent = tr("levelUp.inventory", {
        caseName: localizedCaseName,
        count: formatNumber(reward.caseInventoryCount)
      });
    }

    if (image) {
      image.src = resolveAssetUrl(reward.caseAsset);
      image.alt = localizedCaseName;
    }

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("level-up-modal-open");

    updateLevelUpBoostUI();

    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success");
    } catch (_) {}
  }

  function closeLevelUpCelebration() {
    const modal = document.getElementById("level-up-modal");
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("level-up-modal-open");
  }

  function updateXpUI() {
    const needed = getXpRequired(state.level);
    const pct = Math.min(100, state.xp / needed * 100);
    const level = document.querySelector(".level-row strong");
    const xp = document.querySelector(".xp-row > span");
    const xpBar = document.querySelector(".player-level .progress-fill");
    if (level) level.textContent = `${tr("common.levelShort")} ${state.level}`;
    if (xp) {
      xp.textContent = `${formatCompactCount(state.xp)} / ${formatCompactCount(needed)} XP`;
      xp.title = `${formatNumber(state.xp)} / ${formatNumber(needed)} XP`;
    }
    if (xpBar) xpBar.style.width = `${pct}%`;

    document.querySelectorAll(".missions-title-row span").forEach((el) => { el.textContent = `${tr("common.levelShort")} ${state.level}`; });
    const hiddenLevel = document.querySelector(".quest-level-top strong:first-child");
    if (hiddenLevel) hiddenLevel.textContent = `${tr("common.levelShort")} ${state.level}`;
    const next = document.querySelector(".next-level-button small");
    if (next) next.textContent = `${tr("common.levelShort")} ${state.level + 1}`;
  }

  function updateTapButton() {
    const button = document.querySelector(".tap-button");
    const value =
      document.querySelector(".home-main-tap-value")
      ||
      document.querySelector(".tap-button small");

    if (!button) return;

    const stats = recomputeDerivedState();
    button.disabled = state.energy <= 0;

    if (value) {
      value.textContent =
        `+$${formatNumber(stats.tapPower)} ${tr("home.perTap")}`;
    }
  }

  function renderMissions() {
    const list = document.getElementById("mission-list") || document.querySelector(".quest-list");
    const missionState = ensureCurrentMissionState();
    const definitions = getCurrentMissionDefinitions();

    if (list) {
      list.innerHTML = definitions.map((mission) => {
        const progress = Math.min(mission.target, Math.max(0, Number(missionState.progress[mission.id]) || 0));
        const completed = Boolean(missionState.completed[mission.id]);
        const percent = mission.target > 0 ? Math.min(100, progress / mission.target * 100) : 100;

        return `
          <div class="quest-card ${completed ? "completed" : ""}" data-mission="${mission.id}">
            <div class="quest-card-main">
              <span class="quest-icon">${completed ? "✓" : (MISSION_ICONS[mission.type] || "•")}</span>
              <div class="quest-info">
                <strong>${missionTitle(mission)}</strong>
                <div class="mini-progress">
                  <span style="width:${percent}%"></span>
                </div>
                <small>${missionProgressText(mission, progress)}</small>
              </div>
            </div>
            <span class="quest-reward">${completed ? "✓ " : "+"}${formatCompactMoney(mission.reward)}</span>
          </div>`;
      }).join("");
    }

    const completedCount = definitions.filter((mission) => Boolean(missionState.completed[mission.id])).length;
    const total = definitions.length;

    document.querySelectorAll(".missions-title-row > strong, .quest-level-top strong:last-child").forEach((element) => {
      element.textContent = `${completedCount}/${total}`;
    });

    document.querySelectorAll(".missions-title-row span").forEach((element) => {
      element.textContent = `${tr("common.levelShort")} ${state.level}`;
    });

    const hiddenLevel = document.querySelector(".quest-level-top strong:first-child");
    if (hiddenLevel) hiddenLevel.textContent = `${tr("common.levelShort")} ${state.level}`;

    const button = document.querySelector(".next-level-button");
    const eligible = checkLevelUpEligibility();

    if (button) {
      button.disabled = !eligible;
      button.classList.toggle("ready-state", eligible);
      button.setAttribute("aria-disabled", eligible ? "false" : "true");
      button.title = eligible
        ? ""
        : tr("home.missionsCompletedCount", {
            completed: completedCount,
            total
          });

      const next = button.querySelector("small");
      if (next) next.textContent = `${tr("common.levelShort")} ${state.level + 1}`;
    }
  }

  function updateShopUI() {
    const price = CONFIG.SHOP_PRICES?.HUSTLE_PASS_MONTHLY || 250;
    const pass = document.querySelector('[data-config-price="HUSTLE_PASS_MONTHLY"]');
    if (pass) pass.textContent = tr("shop.perMonth", { price });

    const unlocks = CONFIG.SHOP_UNLOCK_LEVELS || {};
    document.querySelectorAll('[data-action="buy-boost"][data-product]').forEach((button) => {
      const required = Number(unlocks[button.dataset.product]) || 2;
      const locked = state.level < required;
      button.disabled = locked;
      button.title = locked ? tr("common.requiresLevel", { level: required }) : "";
      button.classList.toggle("shop-level-locked", locked);
    });

    document.querySelectorAll('[data-action="buy-gem-pack"]').forEach((button) => {
      const required = Number(unlocks.gemPacks) || 2;
      const locked = state.level < required;
      button.disabled = locked;
      button.title = locked ? tr("common.requiresLevel", { level: required }) : "";
      button.classList.toggle("shop-level-locked", locked);
    });

    const map = {
      "shop-premium-case": Number(unlocks.premiumCase) || 5,
      "shop-outfit": Number(unlocks.outfitSkin) || 5,
      "shop-bundle": Number(unlocks.hustleBundle) || 10,
      "buy-empire-pass": Number(unlocks.empirePass) || 5
    };
    Object.entries(map).forEach(([action, required]) => {
      document.querySelectorAll(`[data-action="${action}"]`).forEach((button) => {
        const locked = state.level < required;
        button.disabled = locked;
        button.title = locked ? tr("common.requiresLevel", { level: required }) : "";
        button.classList.toggle("shop-level-locked", locked);
      });
    });
  }


  /* ==========================================================
     V16.9 — LEADERBOARD DATA / RANKING
     Local mock ranking for UI testing.
     Default metric: effective passive Income / s.
     Can also rank by a deterministic local Prestige score.
  ========================================================== */

  const LEADERBOARD_CURRENT_PLAYER_ID = "current-player";
  const LEADERBOARD_SEASON_STORAGE_KEY = "urbanTycoonLeaderboardSeasonEndV1";
  const LEADERBOARD_DEFAULT_SEASON_MS = 7 * 24 * 60 * 60 * 1000;
  const LEADERBOARD_ALLOWED_SORT_MODES = Object.freeze(["income", "prestige"]);

  const LEADERBOARD_FLASH_OFFER = Object.freeze({
    gemCost: 120,
    multiplier: 2,
    boostDurationMs: 30 * 60 * 1000,
    offerDurationMs: 6 * 60 * 60 * 1000
  });
  const LEADERBOARD_OFFER_END_STORAGE_KEY = "urbanTycoonLeaderboardOfferEndV1";
  const LEADERBOARD_OFFER_SEASON_STORAGE_KEY = "urbanTycoonLeaderboardOfferSeasonV1";
  const LEADERBOARD_BOOST_START_STORAGE_KEY = "urbanTycoonLeaderboardBoostStartV1";
  const LEADERBOARD_BOOST_END_STORAGE_KEY = "urbanTycoonLeaderboardBoostEndV1";

  let leaderboardSortMode = "income";
  let leaderboardLastRenderSignature = "";

  /*
     Mock players deliberately span a wide income range so that upgrades to
     the local player visibly change their rank while testing the UI.
     The real Telegram/backend leaderboard can later replace this array
     without changing renderLeaderboard().
  */
  const LEADERBOARD_MOCK_PLAYERS = Object.freeze([
    Object.freeze({ id: "p01", username: "NeonX",        level: 42, incomePerSecond: 128400, prestige: 96500, avatarInitials: "NX", avatarClass: "leaderboard-avatar-gold" }),
    Object.freeze({ id: "p02", username: "ArcticKing",   level: 39, incomePerSecond: 104800, prestige: 88100, avatarInitials: "AK", avatarClass: "leaderboard-avatar-blue" }),
    Object.freeze({ id: "p03", username: "VoidRunner",   level: 36, incomePerSecond: 89200,  prestige: 81600, avatarInitials: "VR", avatarClass: "leaderboard-avatar-purple" }),
    Object.freeze({ id: "p04", username: "CashBoss",     level: 34, incomePerSecond: 74700,  prestige: 75400, avatarInitials: "CB", avatarClass: "leaderboard-avatar-green" }),
    Object.freeze({ id: "p05", username: "StreetTycoon", level: 31, incomePerSecond: 61300,  prestige: 69800, avatarInitials: "ST", avatarClass: "leaderboard-avatar-orange" }),
    Object.freeze({ id: "p06", username: "MetroGhost",   level: 29, incomePerSecond: 55900,  prestige: 64100, avatarInitials: "MG", avatarClass: "leaderboard-avatar-cyan" }),
    Object.freeze({ id: "p07", username: "RichKid",      level: 27, incomePerSecond: 48500,  prestige: 59200, avatarInitials: "RK", avatarClass: "leaderboard-avatar-red" }),
    Object.freeze({ id: "p08", username: "NightDealer",  level: 24, incomePerSecond: 22750,  prestige: 51100, avatarInitials: "ND", avatarClass: "leaderboard-avatar-purple" }),
    Object.freeze({ id: "p09", username: "UrbanWolf",    level: 21, incomePerSecond: 10300,  prestige: 43200, avatarInitials: "UW", avatarClass: "leaderboard-avatar-blue" }),
    Object.freeze({ id: "p10", username: "PixelMogul",   level: 18, incomePerSecond: 4180,   prestige: 35100, avatarInitials: "PM", avatarClass: "leaderboard-avatar-green" }),
    Object.freeze({ id: "p11", username: "NovaHustle",   level: 15, incomePerSecond: 1860,   prestige: 28600, avatarInitials: "NH", avatarClass: "leaderboard-avatar-cyan" }),
    Object.freeze({ id: "p12", username: "GoldRush",     level: 12, incomePerSecond: 735,    prestige: 21800, avatarInitials: "GR", avatarClass: "leaderboard-avatar-gold" }),
    Object.freeze({ id: "p13", username: "BlockBaron",   level: 9,  incomePerSecond: 122,    prestige: 14300, avatarInitials: "BB", avatarClass: "leaderboard-avatar-orange" }),
    Object.freeze({ id: "p14", username: "MiniMogul",    level: 6,  incomePerSecond: 3.20,   prestige: 7200,  avatarInitials: "MM", avatarClass: "leaderboard-avatar-blue" }),
    Object.freeze({ id: "p15", username: "RookieEmpire", level: 2,  incomePerSecond: 0.08,   prestige: 1250,  avatarInitials: "RE", avatarClass: "leaderboard-avatar-green" })
  ]);

  function readLeaderboardStorageNumber(key) {
    try {
      const value = Number(localStorage.getItem(key));
      return Number.isFinite(value) ? value : 0;
    } catch (_) {
      return 0;
    }
  }

  function writeLeaderboardStorageNumber(key, value) {
    try {
      localStorage.setItem(key, String(Math.max(0, Number(value) || 0)));
    } catch (_) {}
  }

  function getLeaderboardFlashOfferEnd(now = Date.now()) {
    const seasonEnd = getLeaderboardSeasonEnd();
    const savedSeason = readLeaderboardStorageNumber(
      LEADERBOARD_OFFER_SEASON_STORAGE_KEY
    );
    const savedEnd = readLeaderboardStorageNumber(
      LEADERBOARD_OFFER_END_STORAGE_KEY
    );

    if (savedSeason === seasonEnd && savedEnd > 0) {
      return savedEnd;
    }

    const offerEnd = Math.min(
      seasonEnd,
      now + LEADERBOARD_FLASH_OFFER.offerDurationMs
    );

    writeLeaderboardStorageNumber(
      LEADERBOARD_OFFER_SEASON_STORAGE_KEY,
      seasonEnd
    );
    writeLeaderboardStorageNumber(
      LEADERBOARD_OFFER_END_STORAGE_KEY,
      offerEnd
    );

    return offerEnd;
  }

  function getLeaderboardFlashBoostState(now = Date.now()) {
    const startedAt = readLeaderboardStorageNumber(
      LEADERBOARD_BOOST_START_STORAGE_KEY
    );
    const endsAt = readLeaderboardStorageNumber(
      LEADERBOARD_BOOST_END_STORAGE_KEY
    );

    return {
      multiplier: LEADERBOARD_FLASH_OFFER.multiplier,
      startedAt,
      endsAt,
      active: startedAt > 0 && endsAt > now
    };
  }

  function getLeaderboardFlashBoostMultiplier(now = Date.now()) {
    const boost = getLeaderboardFlashBoostState(now);
    return boost.active ? boost.multiplier : 1;
  }

  function formatLeaderboardClock(milliseconds) {
    const totalSeconds = Math.max(
      0,
      Math.ceil((Number(milliseconds) || 0) / 1000)
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function getLeaderboardRewardTier(rank) {
    const safeRank = Math.max(1, Math.floor(Number(rank) || 999999));
    if (safeRank === 1) {
      return { key: "top1", label: tr("leaderboard.rewardMax") };
    }
    if (safeRank <= 3) {
      return { key: "top3", label: tr("leaderboard.rewardTop3", { rank: safeRank }) };
    }
    if (safeRank <= 10) {
      return { key: "top10", label: tr("leaderboard.rewardTop10", { rank: safeRank }) };
    }
    return { key: "none", label: tr("leaderboard.rewardOutside", { rank: safeRank }) };
  }

  function getLeaderboardGapToNextPlayer(snapshot) {
    const current = snapshot?.current;
    if (!current) return null;
    if (current.rank <= 1) {
      return {
        targetRank: 1,
        gap: 0,
        label: tr("leaderboard.defendFirst")
      };
    }

    const next = snapshot.players[current.rank - 2];
    if (!next) return null;

    const gap = Math.max(
      0,
      getLeaderboardMetricValue(next, snapshot.mode)
        - getLeaderboardMetricValue(current, snapshot.mode)
    );

    return {
      targetRank: next.rank,
      gap,
      label: snapshot.mode === "prestige"
        ? tr("leaderboard.gapPrestige", {
            gap: formatCompactCount(Math.ceil(gap)),
            rank: next.rank
          })
        : tr("leaderboard.gapIncome", {
            gap: formatIncomePerSecond(gap),
            rank: next.rank
          })
    };
  }

  function renderLeaderboardRewardsAndOffer(snapshot = null) {
    const safeSnapshot = snapshot || getLeaderboardSnapshot();
    const now = Date.now();
    const current = safeSnapshot.current;

    const rewardStatus = document.getElementById(
      "leaderboard-reward-status"
    );
    if (rewardStatus && current) {
      const tier = getLeaderboardRewardTier(current.rank);
      rewardStatus.textContent = tier.label;
      rewardStatus.classList.remove(
        "is-top1",
        "is-top3",
        "is-top10"
      );
      if (tier.key !== "none") {
        rewardStatus.classList.add(`is-${tier.key}`);
      }
    }

    const offerCard = document.getElementById("leaderboard-flash-offer");
    const offerTimer = document.getElementById("leaderboard-offer-timer");
    const offerStatus = document.getElementById("leaderboard-offer-status");
    const offerGap = document.getElementById("leaderboard-offer-gap");
    const offerButton = document.querySelector(
      "[data-leaderboard-offer-buy]"
    );

    if (!offerCard || !offerButton) return;

    const offerEnd = getLeaderboardFlashOfferEnd(now);
    const offerRemaining = Math.max(0, offerEnd - now);
    const boost = getLeaderboardFlashBoostState(now);
    const available = offerRemaining > 0;
    const gap = getLeaderboardGapToNextPlayer(safeSnapshot);

    offerCard.classList.toggle("is-active", boost.active);
    offerCard.classList.toggle("is-expired", !available);

    if (offerTimer) {
      offerTimer.textContent = boost.active
        ? formatLeaderboardClock(boost.endsAt - now)
        : formatLeaderboardClock(offerRemaining);
      offerTimer.title = boost.active
        ? tr("leaderboard.boostTimeRemaining")
        : tr("leaderboard.offerTimeRemaining");
    }

    if (offerGap && gap) {
      offerGap.textContent = gap.label;
    }

    const gemImg = `<img src="${resolveAssetUrl(ASSET_PATHS.hud.gems)}" alt="" aria-hidden="true" draggable="false">`;

    if (boost.active) {
      offerButton.disabled = true;
      offerButton.innerHTML = `${gemImg}<span>x${boost.multiplier}</span><strong>${tr("leaderboard.boostActiveButton")}</strong>`;
      if (offerStatus) {
        offerStatus.textContent = tr("leaderboard.boostActiveStatus", {
          multiplier: boost.multiplier,
          time: formatLeaderboardClock(boost.endsAt - now)
        });
      }
      return;
    }

    if (!available) {
      offerButton.disabled = true;
      offerButton.innerHTML = `${gemImg}<span>—</span><strong>${tr("leaderboard.expiredButton")}</strong>`;
      if (offerStatus) {
        offerStatus.textContent = tr("leaderboard.offerExpiredStatus");
      }
      return;
    }

    offerButton.disabled = false;
    offerButton.innerHTML = `${gemImg}<span>${LEADERBOARD_FLASH_OFFER.gemCost}</span><strong>${tr("leaderboard.activateButton")}</strong>`;

    if (offerStatus) {
      offerStatus.textContent = state.gems >= LEADERBOARD_FLASH_OFFER.gemCost
        ? tr("leaderboard.offerAffordableStatus")
        : tr("leaderboard.offerNeedGemsStatus", {
            gems: LEADERBOARD_FLASH_OFFER.gemCost
          });
    }
  }

  function purchaseLeaderboardFlashOffer() {
    const now = Date.now();
    const offerEnd = getLeaderboardFlashOfferEnd(now);
    const currentBoost = getLeaderboardFlashBoostState(now);

    if (currentBoost.active) {
      renderLeaderboardRewardsAndOffer();
      return false;
    }

    if (offerEnd <= now) {
      emitGameEvent("leaderboardFlashOfferExpired", {
        offerEnd
      });
      renderLeaderboardRewardsAndOffer();
      return false;
    }

    if (state.gems < LEADERBOARD_FLASH_OFFER.gemCost) {
      emitGameEvent("notEnoughGems", {
        current: state.gems,
        required: LEADERBOARD_FLASH_OFFER.gemCost,
        source: "leaderboardFlashOffer"
      });

      const shopButton = document.querySelector(
        '.nav-item[data-nav="shop"]'
      );
      shopButton?.click();
      return false;
    }

    processPassiveIncome();

    state.gems -= LEADERBOARD_FLASH_OFFER.gemCost;
    const endsAt = Math.min(
      getLeaderboardSeasonEnd(),
      now + LEADERBOARD_FLASH_OFFER.boostDurationMs
    );

    writeLeaderboardStorageNumber(
      LEADERBOARD_BOOST_START_STORAGE_KEY,
      now
    );
    writeLeaderboardStorageNumber(
      LEADERBOARD_BOOST_END_STORAGE_KEY,
      endsAt
    );

    saveGame();
    updatePlayerResources();
    renderLeaderboard({ force: true });

    emitGameEvent("leaderboardFlashOfferPurchased", {
      costGems: LEADERBOARD_FLASH_OFFER.gemCost,
      multiplier: LEADERBOARD_FLASH_OFFER.multiplier,
      startedAt: now,
      endsAt
    });

    return true;
  }

  function getTelegramLeaderboardIdentity() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const selectedAvatar = getSelectedAvatarAsset();

    if (!user) {
      return {
        username: tr("leaderboard.you"),
        avatarUrl: selectedAvatar.primary,
        avatarFallbackUrl: selectedAvatar.fallback
      };
    }

    const displayName =
      user.username
        ? `@${user.username}`
        : [user.first_name, user.last_name].filter(Boolean).join(" ").trim();

    return {
      username: displayName || tr("leaderboard.you"),
      avatarUrl: user.photo_url || selectedAvatar.primary,
      avatarFallbackUrl:
        user.photo_url
          ? ""
          : selectedAvatar.fallback
    };
  }

  function calculateLocalPrestigeScore(targetState = state) {
    const levelScore = Math.max(1, Number(targetState.level) || 1) * 1000;

    const businessScore = BUSINESS_IDS.reduce((sum, id) => {
      const business = targetState.businesses?.[id];
      if (!business?.owned) return sum;
      return sum + Math.max(1, Number(business.level) || 1) * 180;
    }, 0);

    const cardScore = CARD_IDS.reduce((sum, id) => {
      const card = targetState.cards?.[id];
      if (!card?.unlocked) return sum;
      return sum + Math.max(1, Number(card.level) || 1) * 120;
    }, 0);

    const wardrobeScore = EQUIPMENT_IDS.reduce((sum, id) => {
      const item = targetState.equipment?.[id];
      if (!item?.unlocked) return sum;
      return sum + Math.max(1, Number(item.level) || 1) * 90;
    }, 0);

    return Math.max(
      0,
      Math.floor(levelScore + businessScore + cardScore + wardrobeScore)
    );
  }

  function getCurrentLeaderboardPlayer() {
    const identity = getTelegramLeaderboardIdentity();

    return {
      id: LEADERBOARD_CURRENT_PLAYER_ID,
      username: identity.username,
      level: Math.max(1, Math.floor(Number(state.level) || 1)),
      /*
         This is the actual current effective passive rate. Active level-up
         income boosts are included, so the ranking reacts immediately.
      */
      incomePerSecond: Math.max(0, getTotalPassiveIncomePerSecond()),
      prestige: calculateLocalPrestigeScore(state),
      avatarUrl: identity.avatarUrl,
      avatarFallbackUrl: identity.avatarFallbackUrl,
      isCurrent: true
    };
  }

  function getLeaderboardMetricValue(player, mode = leaderboardSortMode) {
    if (mode === "prestige") {
      return Math.max(0, Number(player?.prestige) || 0);
    }
    return Math.max(0, Number(player?.incomePerSecond) || 0);
  }

  function sortLeaderboardPlayers(players, mode = leaderboardSortMode) {
    const safeMode = LEADERBOARD_ALLOWED_SORT_MODES.includes(mode)
      ? mode
      : "income";

    return [...players].sort((a, b) => {
      const primary =
        getLeaderboardMetricValue(b, safeMode)
        - getLeaderboardMetricValue(a, safeMode);

      if (primary !== 0) return primary;

      /*
         Stable deterministic tie-breakers:
         1. Income / s
         2. Prestige
         3. Username
      */
      const incomeTie =
        (Number(b.incomePerSecond) || 0)
        - (Number(a.incomePerSecond) || 0);
      if (incomeTie !== 0) return incomeTie;

      const prestigeTie =
        (Number(b.prestige) || 0)
        - (Number(a.prestige) || 0);
      if (prestigeTie !== 0) return prestigeTie;

      return String(a.username || "").localeCompare(String(b.username || ""));
    });
  }

  function getLeaderboardSnapshot(mode = leaderboardSortMode) {
    const safeMode = LEADERBOARD_ALLOWED_SORT_MODES.includes(mode)
      ? mode
      : "income";

    const players = [
      ...LEADERBOARD_MOCK_PLAYERS.map((player) => ({ ...player })),
      getCurrentLeaderboardPlayer()
    ];

    const ranked = sortLeaderboardPlayers(players, safeMode)
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));

    const current =
      ranked.find((player) => player.id === LEADERBOARD_CURRENT_PLAYER_ID)
      || null;

    return {
      mode: safeMode,
      players: ranked,
      current,
      totalPlayers: ranked.length
    };
  }

  function getLeaderboardSeasonEnd() {
    const now = Date.now();
    const saved = Number(localStorage.getItem(LEADERBOARD_SEASON_STORAGE_KEY));

    if (Number.isFinite(saved) && saved > now) {
      return saved;
    }

    const nextEnd = now + LEADERBOARD_DEFAULT_SEASON_MS;
    localStorage.setItem(
      LEADERBOARD_SEASON_STORAGE_KEY,
      String(nextEnd)
    );
    return nextEnd;
  }

  function formatLeaderboardSeasonCountdown(milliseconds) {
    const totalMinutes = Math.max(
      0,
      Math.floor((Number(milliseconds) || 0) / 60000)
    );

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    return `${String(days).padStart(2, "0")}${tr("time.dayShort")} ${String(hours).padStart(2, "0")}${tr("time.hourShort")} ${String(minutes).padStart(2, "0")}${tr("time.minuteShort")}`;
  }

  function updateLeaderboardSeasonCountdown() {
    const timer = document.getElementById("leaderboard-season-time");
    if (!timer) return;

    const seasonEnd = getLeaderboardSeasonEnd();
    timer.textContent = formatLeaderboardSeasonCountdown(
      seasonEnd - Date.now()
    );
    timer.title = new Date(seasonEnd).toLocaleString();
  }

  function createLeaderboardAvatar(player) {
    const avatar = document.createElement("div");
    avatar.className = [
      "leaderboard-avatar",
      player.isCurrent
        ? "leaderboard-current-avatar"
        : (player.avatarClass || "leaderboard-avatar-blue")
    ].join(" ");

    if (player.avatarUrl) {
      const image = document.createElement("img");
      image.src = resolveAssetUrl(player.avatarUrl);
      image.alt = player.isCurrent
        ? "Il tuo avatar"
        : `Avatar di ${player.username}`;
      image.draggable = false;
      image.decoding = "async";

      if (player.avatarFallbackUrl) {
        image.onerror = () => {
          image.onerror = null;
          image.src = resolveAssetUrl(
            player.avatarFallbackUrl
          );
        };
      }

      avatar.appendChild(image);
    } else {
      avatar.textContent =
        player.avatarInitials
        || String(player.username || "?")
          .split(/\s+/)
          .map((part) => part[0] || "")
          .join("")
          .slice(0, 2)
          .toUpperCase();
    }

    return avatar;
  }

  function createLeaderboardRow(player, mode) {
    const row = document.createElement("article");
    row.className = "leaderboard-row";
    row.setAttribute("role", "listitem");
    row.dataset.playerId = player.id;

    if (player.rank <= 3) {
      row.classList.add(`top-${player.rank}`);
    }

    if (player.isCurrent) {
      row.classList.add("is-current");
      row.setAttribute("aria-current", "true");
    }

    const rank = document.createElement("span");
    rank.className = "leaderboard-rank";
    rank.textContent = String(player.rank);

    const playerWrap = document.createElement("div");
    playerWrap.className = "leaderboard-player";
    playerWrap.appendChild(createLeaderboardAvatar(player));

    const copy = document.createElement("div");
    copy.className = "leaderboard-player-copy";

    const name = document.createElement("strong");
    const nameText = document.createElement("span");
    nameText.textContent = player.username || tr("leaderboard.player");
    name.appendChild(nameText);

    if (player.isCurrent) {
      const you = document.createElement("span");
      you.className = "leaderboard-you-badge";
      you.textContent = tr("leaderboard.youBadge");
      name.appendChild(you);
    }

    const level = document.createElement("small");
    level.textContent = `${tr("common.levelShort")} ${Math.max(1, Math.floor(Number(player.level) || 1))}`;

    copy.append(name, level);
    playerWrap.appendChild(copy);

    const metric = document.createElement("strong");
    metric.className = "leaderboard-income";
    metric.textContent = mode === "prestige"
      ? formatCompactCount(player.prestige)
      : formatIncomePerSecond(player.incomePerSecond);

    row.append(rank, playerWrap, metric);
    return row;
  }

  function getLeaderboardRenderSignature(snapshot) {
    const current = snapshot.current;
    return [
      snapshot.mode,
      current?.rank || 0,
      Number(current?.incomePerSecond || 0).toFixed(4),
      current?.prestige || 0,
      current?.level || 1,
      current?.username || "",
      snapshot.players.length
    ].join("|");
  }

  function renderLeaderboard(options = {}) {
    updateLeaderboardSeasonCountdown();

    const list = document.querySelector(".leaderboard-list");
    if (!list) return null;

    const snapshot = getLeaderboardSnapshot(
      options.mode || leaderboardSortMode
    );

    const signature = getLeaderboardRenderSignature(snapshot);
    const force = Boolean(options.force);

    if (force || signature !== leaderboardLastRenderSignature) {
      const fragment = document.createDocumentFragment();

      snapshot.players.forEach((player) => {
        fragment.appendChild(
          createLeaderboardRow(player, snapshot.mode)
        );
      });

      list.replaceChildren(fragment);
      leaderboardLastRenderSignature = signature;
    }

    const currentRank =
      document.querySelector(
        ".leaderboard-current-card > div:first-child > strong"
      );

    const currentStatLabel =
      document.querySelector(".leaderboard-current-stat small");

    const currentStatValue =
      document.querySelector(".leaderboard-current-stat strong");

    const metricHeader =
      document.querySelector(".leaderboard-columns span:last-child");

    if (snapshot.current) {
      if (currentRank) {
        currentRank.textContent =
          `#${snapshot.current.rank}`;
        currentRank.title =
          `${snapshot.current.rank} / ${snapshot.totalPlayers}`;
      }

      if (currentStatLabel) {
        currentStatLabel.textContent =
          snapshot.mode === "prestige"
            ? tr("leaderboard.prestige")
            : tr("leaderboard.incomePerSecond");
      }

      if (currentStatValue) {
        currentStatValue.textContent =
          snapshot.mode === "prestige"
            ? formatCompactCount(snapshot.current.prestige)
            : formatIncomePerSecond(snapshot.current.incomePerSecond);
      }
    }

    if (metricHeader) {
      metricHeader.textContent =
        snapshot.mode === "prestige"
          ? tr("leaderboard.prestige")
          : tr("leaderboard.incomePerSecond");
    }

    renderLeaderboardRewardsAndOffer(snapshot);
    return snapshot;
  }

  function setLeaderboardSortMode(mode) {
    if (!LEADERBOARD_ALLOWED_SORT_MODES.includes(mode)) {
      return false;
    }

    leaderboardSortMode = mode;
    leaderboardLastRenderSignature = "";
    renderLeaderboard({ force: true });
    return true;
  }


  /* ==========================================================
     V17.3 — SOCIAL TASKS RUNTIME
  ========================================================== */

  let socialTasksReturnFocus = null;

  function ensureSocialTasksState(timestamp = Date.now()) {
    const next = sanitizeSocialTasks(state.socialTasks, timestamp);

    const previousDayKey = state.socialTasks?.dayKey || "";
    const changedDay = previousDayKey !== next.dayKey;

    state.socialTasks = next;

    if (changedDay) {
      saveGame();
    }

    return state.socialTasks;
  }

  function getSocialTaskState(taskId) {
    ensureSocialTasksState();
    return state.socialTasks?.tasks?.[taskId] || null;
  }

  function setSocialTaskActionLink(taskId, url) {
    if (!(taskId in socialTaskActionLinks)) return false;

    const value = String(url || "").trim();

    if (!value) {
      socialTaskActionLinks[taskId] = "";
      return true;
    }

    try {
      const parsed = new URL(value, window.location.href);
      if (!["https:", "http:", "tg:"].includes(parsed.protocol)) {
        return false;
      }
      socialTaskActionLinks[taskId] = parsed.href;
      return true;
    } catch (_) {
      return false;
    }
  }

  function openSocialTaskExternalLink(taskId) {
    const rawUrl = String(socialTaskActionLinks[taskId] || "").trim();
    if (!rawUrl) return false;

    try {
      const url = new URL(rawUrl, window.location.href).href;
      const parsed = new URL(url);

      if (!["https:", "http:", "tg:"].includes(parsed.protocol)) {
        return false;
      }

      const telegram = window.Telegram?.WebApp;

      if (
        telegram?.openTelegramLink
        && (
          parsed.protocol === "tg:"
          || parsed.hostname === "t.me"
          || parsed.hostname.endsWith(".t.me")
        )
      ) {
        telegram.openTelegramLink(url);
        return true;
      }

      if (telegram?.openLink && parsed.protocol !== "tg:") {
        telegram.openLink(url);
        return true;
      }

      window.open(url, "_blank", "noopener,noreferrer");
      return true;
    } catch (error) {
      console.warn("[Hustle Empire] Social task URL failed:", error);
      return false;
    }
  }

  function openSocialTaskInviteShare() {
    const inviteUrl = window.location.href.split("#")[0];
    const shareText = tr("social.shareText");
    const shareUrl =
      `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shareText)}`;

    try {
      if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(shareUrl);
        return true;
      }

      window.open(shareUrl, "_blank", "noopener,noreferrer");
      return true;
    } catch (_) {
      return false;
    }
  }

  function getSocialTaskSubtitle(taskId, taskState) {
    const cfg = SOCIAL_TASK_CONFIGS[taskId];

    if (taskState.status === SOCIAL_TASK_STATUS.CLAIMED) {
      return tr("social.claimed");
    }

    if (taskState.status === SOCIAL_TASK_STATUS.CLAIMABLE) {
      return tr("social.claimReady");
    }

    if (taskState.status === SOCIAL_TASK_STATUS.VERIFYING) {
      return tr("social.verifying");
    }

    if (cfg.kind === "invite") {
      return tr("social.inviteProgress", {
        progress: taskState.progress,
        target: cfg.target
      });
    }

    if (taskId === "telegram_channel") {
      return tr("social.officialChannel");
    }

    if (taskId === "x_follow") {
      return tr("social.followOfficialProfile");
    }

    if (taskId === "open_community") {
      return tr("social.openOfficialCommunity");
    }

    return tr("social.completeTask");
  }

  function renderSocialTasksUI() {
    const socialState = ensureSocialTasksState();

    let claimed = 0;
    let claimable = 0;

    SOCIAL_TASK_IDS.forEach((taskId) => {
      const cfg = SOCIAL_TASK_CONFIGS[taskId];
      const taskState = socialState.tasks[taskId];
      const row = document.querySelector(`[data-social-task="${taskId}"]`);

      if (!row || !taskState) return;

      const status = row.querySelector(".social-task-status");
      const subtitle = row.querySelector(".social-task-copy small");

      row.classList.toggle(
        "is-completed",
        taskState.status === SOCIAL_TASK_STATUS.CLAIMED
      );
      row.classList.toggle(
        "is-verifying",
        taskState.status === SOCIAL_TASK_STATUS.VERIFYING
      );
      row.classList.toggle(
        "is-claimable",
        taskState.status === SOCIAL_TASK_STATUS.CLAIMABLE
      );

      row.disabled = taskState.status === SOCIAL_TASK_STATUS.CLAIMED;
      row.setAttribute(
        "aria-busy",
        taskState.status === SOCIAL_TASK_STATUS.VERIFYING ? "true" : "false"
      );

      if (subtitle) {
        subtitle.textContent = getSocialTaskSubtitle(taskId, taskState);
      }

      if (status) {
        status.classList.remove(
          "social-task-status-complete",
          "social-task-status-claim",
          "social-task-status-verifying"
        );

        if (taskState.status === SOCIAL_TASK_STATUS.CLAIMED) {
          status.textContent = "✓";
          status.setAttribute("aria-label", tr("social.statusCompleted"));
          status.classList.add("social-task-status-complete");
        } else if (taskState.status === SOCIAL_TASK_STATUS.CLAIMABLE) {
          status.textContent = tr("common.claim").toUpperCase();
          status.setAttribute("aria-label", tr("social.statusRewardAvailable"));
          status.classList.add("social-task-status-claim");
        } else if (taskState.status === SOCIAL_TASK_STATUS.VERIFYING) {
          status.textContent = "…";
          status.setAttribute("aria-label", tr("social.statusVerifying"));
          status.classList.add("social-task-status-verifying");
        } else {
          status.textContent = "›";
          status.setAttribute("aria-label", tr("social.statusPending"));
        }
      }

      if (taskState.status === SOCIAL_TASK_STATUS.CLAIMED) claimed += 1;
      if (taskState.status === SOCIAL_TASK_STATUS.CLAIMABLE) claimable += 1;

      /*
         Keep invite progress consistent even if test/admin code modifies
         the saved state directly.
      */
      if (
        cfg.kind === "invite"
        && taskState.progress >= cfg.target
        && taskState.status === SOCIAL_TASK_STATUS.PENDING
      ) {
        taskState.status = SOCIAL_TASK_STATUS.CLAIMABLE;
      }
    });

    const summary = document.querySelector(".social-tasks-summary strong");
    if (summary) {
      summary.textContent = `${claimed} / ${SOCIAL_TASK_IDS.length}`;
    }

    const progress = document.querySelector(".social-tasks-progress span");
    if (progress) {
      progress.style.width =
        `${Math.round((claimed / SOCIAL_TASK_IDS.length) * 100)}%`;
    }

    const reset = document.querySelector(".social-tasks-reset");
    if (reset) {
      const seconds = getSecondsUntilDailyReset();
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      reset.textContent = tr("social.resetCountdown", {
        hours,
        minutes: String(minutes).padStart(2, "0")
      });
    }

    const launcherBadge = document.querySelector(".social-tasks-launcher-badge");
    if (launcherBadge) {
      launcherBadge.classList.toggle("has-claim", claimable > 0);
      launcherBadge.textContent = claimable > 0
        ? String(claimable)
        : (
            claimed === SOCIAL_TASK_IDS.length
              ? tr("common.done").toUpperCase()
              : tr("common.new").toUpperCase()
          );
    }

    return {
      claimed,
      claimable,
      total: SOCIAL_TASK_IDS.length
    };
  }

  function openSocialTasksModal(trigger = null) {
    const modal = document.getElementById("social-tasks-modal");
    if (!modal) return false;

    socialTasksReturnFocus = trigger || document.activeElement;

    renderSocialTasksUI();

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("social-tasks-modal-open");

    const launcher = document.querySelector("[data-social-tasks-open]");
    launcher?.setAttribute("aria-expanded", "true");

    requestAnimationFrame(() => {
      modal.classList.add("is-open");
      modal.querySelector(".social-tasks-dialog")?.focus?.({
        preventScroll: true
      });
    });

    return true;
  }

  function closeSocialTasksModal() {
    const modal = document.getElementById("social-tasks-modal");
    if (!modal || modal.hidden) return false;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("social-tasks-modal-open");

    const launcher = document.querySelector("[data-social-tasks-open]");
    launcher?.setAttribute("aria-expanded", "false");

    window.setTimeout(() => {
      modal.hidden = true;
    }, 180);

    const focusTarget = socialTasksReturnFocus;
    socialTasksReturnFocus = null;

    requestAnimationFrame(() => {
      focusTarget?.focus?.({ preventScroll: true });
    });

    return true;
  }

  function beginSocialTaskVerification(taskId) {
    const cfg = SOCIAL_TASK_CONFIGS[taskId];
    const taskState = getSocialTaskState(taskId);

    if (!cfg || !taskState) return false;
    if (taskState.status !== SOCIAL_TASK_STATUS.PENDING) return false;

    openSocialTaskExternalLink(taskId);

    taskState.status = SOCIAL_TASK_STATUS.VERIFYING;
    taskState.verifyAt = Date.now() + Math.max(700, cfg.verifyDelayMs || 1800);

    saveGame();
    renderSocialTasksUI();

    emitGameEvent("socialTaskVerificationStarted", {
      taskId,
      verifyAt: taskState.verifyAt
    });

    return true;
  }

  function simulateSocialInvite(taskId, amount = 1) {
    const cfg = SOCIAL_TASK_CONFIGS[taskId];
    const taskState = getSocialTaskState(taskId);

    if (!cfg || cfg.kind !== "invite" || !taskState) return false;
    if (
      taskState.status === SOCIAL_TASK_STATUS.CLAIMED
      || taskState.status === SOCIAL_TASK_STATUS.CLAIMABLE
    ) {
      return false;
    }

    openSocialTaskInviteShare();

    taskState.progress = Math.min(
      cfg.target,
      Math.max(0, Number(taskState.progress) || 0)
        + Math.max(1, Math.floor(Number(amount) || 1))
    );

    if (taskState.progress >= cfg.target) {
      taskState.status = SOCIAL_TASK_STATUS.CLAIMABLE;
    }

    saveGame();
    renderSocialTasksUI();

    emitGameEvent("socialInviteSimulated", {
      taskId,
      progress: taskState.progress,
      target: cfg.target
    });

    return true;
  }

  function claimSocialTaskReward(taskId) {
    const cfg = SOCIAL_TASK_CONFIGS[taskId];
    const taskState = getSocialTaskState(taskId);

    if (!cfg || !taskState) return false;
    if (taskState.status !== SOCIAL_TASK_STATUS.CLAIMABLE) return false;

    processPassiveIncome();

    const money = Math.max(0, Number(cfg.reward?.money) || 0);
    const gems = Math.max(0, Number(cfg.reward?.gems) || 0);

    state.money += money;
    state.gems += gems;

    taskState.status = SOCIAL_TASK_STATUS.CLAIMED;
    taskState.progress = Math.max(taskState.progress, cfg.target);
    taskState.verifyAt = 0;
    taskState.claimedAt = Date.now();

    saveGame();
    updatePlayerResources();
    renderSocialTasksUI();
    renderNotificationsUI();

    try {
      window.Telegram?.WebApp?.HapticFeedback
        ?.notificationOccurred?.("success");
    } catch (_) {}

    emitGameEvent("socialTaskClaimed", {
      taskId,
      reward: { money, gems },
      balances: {
        money: state.money,
        gems: state.gems
      }
    });

    return true;
  }

  function handleSocialTaskInteraction(taskId) {
    const cfg = SOCIAL_TASK_CONFIGS[taskId];
    const taskState = getSocialTaskState(taskId);

    if (!cfg || !taskState) return false;

    if (taskState.status === SOCIAL_TASK_STATUS.CLAIMED) {
      return false;
    }

    if (taskState.status === SOCIAL_TASK_STATUS.CLAIMABLE) {
      return claimSocialTaskReward(taskId);
    }

    if (taskState.status === SOCIAL_TASK_STATUS.VERIFYING) {
      tickSocialTasksSystem();
      return false;
    }

    if (cfg.kind === "daily") {
      taskState.status = SOCIAL_TASK_STATUS.CLAIMABLE;
      saveGame();
      renderSocialTasksUI();
      return claimSocialTaskReward(taskId);
    }

    if (cfg.kind === "invite") {
      return simulateSocialInvite(taskId, 1);
    }

    return beginSocialTaskVerification(taskId);
  }

  function tickSocialTasksSystem(timestamp = Date.now()) {
    const socialState = ensureSocialTasksState(timestamp);
    let changed = false;

    SOCIAL_TASK_IDS.forEach((taskId) => {
      const taskState = socialState.tasks[taskId];
      const cfg = SOCIAL_TASK_CONFIGS[taskId];

      if (
        taskState.status === SOCIAL_TASK_STATUS.VERIFYING
        && taskState.verifyAt > 0
        && taskState.verifyAt <= timestamp
      ) {
        taskState.status = SOCIAL_TASK_STATUS.CLAIMABLE;
        taskState.progress = Math.max(taskState.progress, cfg.target);
        taskState.verifyAt = 0;
        changed = true;
      }
    });

    if (changed) {
      saveGame();
      renderSocialTasksUI();

      try {
        window.Telegram?.WebApp?.HapticFeedback
          ?.notificationOccurred?.("success");
      } catch (_) {}
    }

    return changed;
  }


  /* ==========================================================
     V17.7 — GENERIC TRANSLATED MODAL / DAILY CHEST
     Prevents raw i18n keys such as modal.dailyChest from leaking.
  ========================================================== */

  let activeGameModalTranslation = null;

  function renderTranslatedGameModal() {
    const modal = document.getElementById("game-modal");
    if (!modal || !activeGameModalTranslation) return false;

    const title = document.getElementById("game-modal-title");
    const message = document.getElementById("game-modal-message");
    const confirm = modal.querySelector(".modal-confirm");
    const close = modal.querySelector(".game-modal-close");

    const {
      titleKey,
      messageKey,
      titleParams = {},
      messageParams = {}
    } = activeGameModalTranslation;

    if (title) {
      title.textContent = tr(titleKey, titleParams);
    }

    if (message) {
      message.textContent = tr(messageKey, messageParams);
    }

    if (confirm) {
      confirm.textContent = tr("common.ok");
    }

    if (close) {
      close.setAttribute("aria-label", tr("common.close"));
    }

    return true;
  }

  function openTranslatedGameModal(
    titleKey,
    messageKey,
    {
      titleParams = {},
      messageParams = {}
    } = {}
  ) {
    const modal = document.getElementById("game-modal");
    if (!modal) return false;

    activeGameModalTranslation = {
      titleKey,
      messageKey,
      titleParams,
      messageParams
    };

    renderTranslatedGameModal();

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");

    requestAnimationFrame(() => {
      modal.querySelector(".modal-confirm")?.focus?.({
        preventScroll: true
      });
    });

    return true;
  }

  function closeTranslatedGameModal() {
    const modal = document.getElementById("game-modal");
    if (!modal) return false;

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    activeGameModalTranslation = null;
    return true;
  }

  function getDailyChestCountdownLabel() {
    const countdown = document.querySelector(
      '.daily-chest [data-countdown], .daily-chest .countdown'
    );

    return String(countdown?.textContent || "").trim();
  }

  function openDailyChestInfoModal() {
    const remaining = getDailyChestCountdownLabel();

    /*
       Keep the main sentence compatible with old code that calls
       t("modal.dailyChestText") without interpolation.
       The timer is appended as a separately translated sentence.
    */
    const baseText = tr("modal.dailyChestText");
    const remainingText = remaining
      ? tr("modal.dailyChestRemaining", { time: remaining })
      : "";

    const modal = document.getElementById("game-modal");
    if (!modal) return false;

    activeGameModalTranslation = {
      titleKey: "modal.dailyChest",
      messageKey: "modal.dailyChestText"
    };

    const title = document.getElementById("game-modal-title");
    const message = document.getElementById("game-modal-message");
    const confirm = modal.querySelector(".modal-confirm");

    if (title) title.textContent = tr("modal.dailyChest");
    if (message) {
      message.textContent = [baseText, remainingText]
        .filter(Boolean)
        .join(" ");
    }
    if (confirm) confirm.textContent = tr("common.ok");

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    return true;
  }

  /* ==========================================================
     V16.3 — NOTIFICATIONS POPUP
     Dedicated modal with safe backdrop/focus cleanup.
  ========================================================== */

  let notificationsReturnFocus = null;

  function getNotificationItems() {
    const items = [];

    const dailyCompleted = getDailyChallengesCompletionCount();
    if (dailyCompleted < 3) {
      items.push({
        icon: "🎯",
        tone: "green",
        title: tr("notifications.dailyTitle"),
        message: tr("notifications.dailyMessage", {
          completed: dailyCompleted
        })
      });
    }

    const missionState = ensureCurrentMissionState();
    const missionDefinitions = getCurrentMissionDefinitions();
    const completedMissions = missionDefinitions.filter(
      (mission) => Boolean(missionState.completed[mission.id])
    ).length;

    if (missionDefinitions.length && completedMissions === missionDefinitions.length) {
      items.push({
        icon: "⬆",
        tone: "gold",
        title: tr("notifications.nextLevelTitle"),
        message: tr("notifications.nextLevelMessage", {
          count: missionDefinitions.length,
          level: state.level
        })
      });
    }

    const boostRemaining = getLevelUpBoostRemainingMs(state);
    const boostMultiplier = getLevelUpEarningsMultiplier(state);
    if (boostRemaining > 0 && boostMultiplier > 1) {
      items.push({
        icon: "⚡",
        tone: "blue",
        title: tr("notifications.boostTitle"),
        message: tr("notifications.boostMessage", {
          multiplier: formatBoostMultiplier(boostMultiplier),
          time: formatBoostTimer(boostRemaining)
        })
      });
    }

    return items;
  }

  function renderNotificationsUI() {
    const button = document.querySelector('[data-action="notifications"]');
    const badge = button?.querySelector(".badge");
    const count = getNotificationItems().length;

    if (badge) {
      badge.textContent = count > 9 ? "9+" : String(count);
      badge.hidden = count === 0;
      badge.setAttribute("aria-hidden", count === 0 ? "true" : "false");
    }

    if (button) {
      const modal = document.getElementById("notifications-modal");
      button.setAttribute("aria-expanded", modal && !modal.hidden ? "true" : "false");
      button.title = count
        ? tr("notifications.count", { count })
        : tr("notifications.none");
    }
  }

  function renderNotificationsModalContent() {
    const list = document.getElementById("notifications-list");
    if (!list) return;

    const items = getNotificationItems();
    if (!items.length) {
      list.innerHTML = `
        <div class="notification-empty-state">
          <span aria-hidden="true">✓</span>
          <strong>${tr("notifications.allClear")}</strong>
          <small>${tr("notifications.noUrgent")}</small>
        </div>`;
      return;
    }

    list.innerHTML = items.map((item) => `
      <article class="notification-item ${item.tone || ""}">
        <span class="notification-item-icon" aria-hidden="true">${item.icon}</span>
        <div class="notification-item-copy">
          <strong>${item.title}</strong>
          <small>${item.message}</small>
        </div>
      </article>`).join("");
  }

  function openNotificationsModal(trigger = null) {
    const modal = document.getElementById("notifications-modal");
    if (!modal) return false;

    notificationsReturnFocus = trigger || document.activeElement;
    renderNotificationsModalContent();

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("notifications-modal-open");

    const button = document.querySelector('[data-action="notifications"]');
    if (button) button.setAttribute("aria-expanded", "true");

    requestAnimationFrame(() => {
      modal.querySelector(".notifications-close")?.focus?.({ preventScroll: true });
    });

    return true;
  }

  function closeNotificationsModal() {
    const modal = document.getElementById("notifications-modal");
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("notifications-modal-open");

    const button = document.querySelector('[data-action="notifications"]');
    if (button) button.setAttribute("aria-expanded", "false");

    const focusTarget = notificationsReturnFocus;
    notificationsReturnFocus = null;
    requestAnimationFrame(() => focusTarget?.focus?.({ preventScroll: true }));

    renderNotificationsUI();
  }

  function updateUI() {
    recomputeDerivedState();
    updateHomeCharacter();
    updateHomeMetaUI();
    updatePlayerResources();
    updateXpUI();
    updateTapButton();
    renderMissions();
    updateLevelUpBoostUI();
    updateShopUI();
    renderNotificationsUI();
    updateCollectionSummaryUI();
    renderQuickJobs();
  }

  /* ==========================================================
     EVENTS / LOOP / ADMIN
  ========================================================== */

  function bindTapControl() {
    const button = document.querySelector(".tap-button");
    if (!button) return;

    let lastActivationAt = 0;
    let touchFallbackAt = 0;

    const activate = (event) => {
      if (event.type === "pointerdown" && event.pointerType === "mouse" && event.button !== 0) return;
      if (event.cancelable) event.preventDefault();

      const now = performance.now();
      if (now - lastActivationAt < 70) return;
      lastActivationAt = now;
      tap();
    };

    if ("PointerEvent" in window) {
      button.addEventListener("pointerdown", activate, { passive: false });
    } else {
      button.addEventListener("touchstart", (event) => {
        touchFallbackAt = Date.now();
        activate(event);
      }, { passive: false });

      button.addEventListener("click", (event) => {
        if (Date.now() - touchFallbackAt < 650) return;
        activate(event);
      });
    }
  }

  let leaderboardReturnScreen = "home";
  let leaderboardPreviouslyFocusedElement = null;

  function isLeaderboardOpen() {
    return Boolean(
      document
        .getElementById("leaderboard-screen")
        ?.classList.contains("active")
    );
  }

  function syncLeaderboardHudButtonState() {
    const button = document.querySelector(".leaderboard-hud-button");
    const isOpen = isLeaderboardOpen();

    if (button) {
      button.classList.toggle("is-active", isOpen);
      button.setAttribute("aria-pressed", isOpen ? "true" : "false");
    }

    return isOpen;
  }

  function getLeaderboardReturnScreen() {
    const navigationScreen =
      window.HustleTabs?.getActiveTab?.();

    if (navigationScreen && navigationScreen !== "leaderboard") {
      return navigationScreen;
    }

    const activeBaseScreen = document.querySelector(
      '.screens > .screen.active[data-screen]:not(#leaderboard-screen)'
    );

    return activeBaseScreen?.dataset?.screen || "home";
  }

  function openLeaderboardScreen(options = {}) {
    const screen = document.getElementById("leaderboard-screen");
    const closeButton = screen?.querySelector(
      '[data-action="close-leaderboard"]'
    );

    if (!screen) {
      console.error(
        "[Urban Tycoon] Cannot open leaderboard: #leaderboard-screen is missing."
      );
      return false;
    }

    if (isLeaderboardOpen()) {
      closeButton?.focus?.({ preventScroll: true });
      return true;
    }

    leaderboardReturnScreen = getLeaderboardReturnScreen();
    leaderboardPreviouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    /*
       Remove every underlying game screen from the active visual stack.
       The Leaderboard is now a dedicated modal surface, not a seventh page
       sharing the main screen canvas.
    */
    document
      .querySelectorAll(".screens > .screen")
      .forEach((candidate) => {
        if (candidate === screen) {
          candidate.classList.add("active");
          candidate.setAttribute("aria-hidden", "false");
        } else {
          candidate.classList.remove("active");
          candidate.setAttribute("aria-hidden", "true");
        }
      });

    document.body.classList.add("leaderboard-modal-open");

    syncLeaderboardHudButtonState();

    leaderboardLastRenderSignature = "";
    renderLeaderboard({ force: true });
    updateLeaderboardSeasonCountdown();

    /*
       The modal owns its own scrolling; the underlying .screens scroller is
       intentionally left untouched so closing returns exactly where the user
       was before opening the trophy.
    */
    screen.scrollTop = 0;

    requestAnimationFrame(() => {
      closeButton?.focus?.({ preventScroll: true });
    });

    emitGameEvent("screenChanged", {
      screen: "leaderboard",
      source: options.source || "hud-trophy",
      modal: true
    });

    return true;
  }

  function closeLeaderboardScreen(options = {}) {
    const screen = document.getElementById("leaderboard-screen");

    if (!screen || !isLeaderboardOpen()) {
      return false;
    }

    screen.classList.remove("active");
    screen.setAttribute("aria-hidden", "true");
    document.body.classList.remove("leaderboard-modal-open");

    /*
       script.js still owns the six primary tabs. Force the previous tab back
       into the visual shell without resetting its saved scroll position.
    */
    if (window.HustleTabs?.setActiveTab) {
      window.HustleTabs.setActiveTab(
        leaderboardReturnScreen || "home",
        {
          scroll: false,
          force: true,
          source: options.source || "leaderboard-close"
        }
      );
    } else {
      const fallback =
        document.querySelector(
          `.screens > .screen[data-screen="${leaderboardReturnScreen}"]`
        )
        || document.querySelector(
          '.screens > .screen[data-screen="home"]'
        );

      fallback?.classList.add("active");
      fallback?.setAttribute("aria-hidden", "false");

      document
        .querySelectorAll(".bottom-navigation .nav-item[data-nav]")
        .forEach((button) => {
          button.classList.toggle(
            "active",
            button.dataset.nav === (fallback?.dataset?.screen || "home")
          );
        });
    }

    syncLeaderboardHudButtonState();

    requestAnimationFrame(() => {
      if (
        leaderboardPreviouslyFocusedElement
        && document.contains(leaderboardPreviouslyFocusedElement)
      ) {
        leaderboardPreviouslyFocusedElement.focus?.({
          preventScroll: true
        });
      } else {
        document
          .querySelector(".leaderboard-hud-button")
          ?.focus?.({ preventScroll: true });
      }

      leaderboardPreviouslyFocusedElement = null;
    });

    emitGameEvent("screenChanged", {
      screen: leaderboardReturnScreen || "home",
      source: options.source || "leaderboard-close",
      modal: false
    });

    return true;
  }

  function bindLeaderboardHudButton() {
    const button = document.querySelector(".leaderboard-hud-button");
    const screen = document.getElementById("leaderboard-screen");

    if (
      !button
      || !screen
      || button.dataset.leaderboardBound === "true"
    ) {
      syncLeaderboardHudButtonState();
      return;
    }

    button.dataset.leaderboardBound = "true";

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      openLeaderboardScreen({
        source: "hud-trophy"
      });
    });

    screen
      .querySelector('[data-action="close-leaderboard"]')
      ?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        closeLeaderboardScreen({
          source: "close-button"
        });
      });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape"
        && isLeaderboardOpen()
      ) {
        event.preventDefault();

        closeLeaderboardScreen({
          source: "escape"
        });
      }
    });

    syncLeaderboardHudButtonState();
  }

  function bindUIEvents() {
    bindTapControl();
    bindLeaderboardHudButton();
    bindOptimizedTabRendering();
    bindCharacterSelection();

    /*
       Capture these two legacy generic-modal actions before script.js bubble
       handlers. This guarantees the translated V17.7 popup wins.
    */
    document.addEventListener("click", (event) => {
      const dailyChestButton = event.target?.closest?.(
        '.daily-chest[data-action="daily-chest"]'
      );

      if (dailyChestButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openDailyChestInfoModal();
        return;
      }

      if (event.target?.closest?.("#game-modal [data-modal-close]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeTranslatedGameModal();
      }
    }, true);

    document.addEventListener("click", (event) => {
      const socialTasksOpen = event.target.closest("[data-social-tasks-open]");
      if (socialTasksOpen) {
        event.preventDefault();
        openSocialTasksModal(socialTasksOpen);
        return;
      }

      if (event.target.closest("[data-social-tasks-close]")) {
        event.preventDefault();
        closeSocialTasksModal();
        return;
      }

      const socialTaskButton = event.target.closest("[data-social-task]");
      if (socialTaskButton) {
        event.preventDefault();
        handleSocialTaskInteraction(socialTaskButton.dataset.socialTask);
        return;
      }

      const notificationsButton = event.target.closest('[data-action="notifications"]');
      if (notificationsButton) {
        event.preventDefault();
        openNotificationsModal(notificationsButton);
        return;
      }

      if (event.target.closest("[data-notifications-close]")) {
        event.preventDefault();
        closeNotificationsModal();
        return;
      }

      if (event.target.closest("[data-leaderboard-offer-buy]")) {
        event.preventDefault();
        purchaseLeaderboardFlashOffer();
        return;
      }

      if (event.target.closest("[data-daily-challenges-open]")) {
        event.preventDefault();
        openDailyChallengesModal();
        return;
      }

      if (event.target.closest("[data-daily-challenges-close]")) {
        event.preventDefault();
        closeDailyChallengesModal();
        return;
      }

      const dailyMorseSubmit = event.target.closest("[data-daily-morse-submit]");
      if (dailyMorseSubmit) {
        event.preventDefault();
        const input = document.getElementById("daily-morse-input");
        submitDailyMorseAnswer(input?.value || "");
        return;
      }

      const dailyCheckInClaim = event.target.closest("[data-daily-checkin-claim]");
      if (dailyCheckInClaim) {
        event.preventDefault();
        claimDailyCheckIn();
        return;
      }

      const offlineClaimButton = event.target.closest("[data-offline-earnings-claim]");
      if (offlineClaimButton) {
        event.preventDefault();
        claimOfflineEarnings();
        return;
      }

      const levelUpClaimButton = event.target.closest("[data-level-up-claim]");
      if (levelUpClaimButton) {
        event.preventDefault();
        closeLevelUpCelebration();
        return;
      }

      const nextLevelButton = event.target.closest('[data-action="next-level"]');
      if (nextLevelButton) {
        event.preventDefault();
        if (!nextLevelButton.disabled) advanceToNextLevel();
        else renderMissions();
        return;
      }

      const hustleButton = event.target.closest("[data-hustle-run]");
      if (hustleButton) { event.preventDefault(); performHustle(hustleButton.dataset.hustleRun); return; }

      const districtButton = event.target.closest(".city-node[data-district]");
      if (districtButton) { event.preventDefault(); selectDistrict(districtButton.dataset.district); return; }

      const homeBusinessUpgrade = event.target.closest("[data-business-upgrade]");
      if (homeBusinessUpgrade) { event.preventDefault(); upgradeBusiness(homeBusinessUpgrade.dataset.businessUpgrade); return; }

      const cityBusinessBuy = event.target.closest("[data-city-business-buy]");
      if (cityBusinessBuy) { event.preventDefault(); purchaseBusiness(cityBusinessBuy.dataset.cityBusinessBuy); return; }

      const cityBusinessUpgrade = event.target.closest("[data-city-business-upgrade]");
      if (cityBusinessUpgrade) { event.preventDefault(); upgradeBusiness(cityBusinessUpgrade.dataset.cityBusinessUpgrade); return; }

      const timedCaseOpen = event.target.closest("[data-timed-case-open]");
      if (timedCaseOpen) { event.preventDefault(); openTimedCase(timedCaseOpen.dataset.timedCaseOpen); return; }

      const timedCaseSkip = event.target.closest("[data-timed-case-skip]");
      if (timedCaseSkip) { event.preventDefault(); skipTimedCase(timedCaseSkip.dataset.timedCaseSkip); return; }

      if (event.target.closest("#case-reward-close")) { closeCaseRewardOverlay(); return; }

      if (event.target.closest("[data-free-accessory-open]")) {
        event.preventDefault();
        openFreeAccessoryCase();
        return;
      }

      const premiumAccessory = event.target.closest("[data-premium-accessory-open]");
      if (premiumAccessory) {
        event.preventDefault();
        openPremiumAccessoryCase(premiumAccessory.dataset.premiumAccessoryOpen);
        return;
      }

      if (event.target.closest("#accessory-reward-close")) {
        event.preventDefault();
        closeAccessoryReward();
        return;
      }

      if (event.target.closest("#open-accessory-catalog")) {
        event.preventDefault();
        openAccessoryCatalog();
        return;
      }

      if (event.target.closest("[data-accessory-catalog-close]")) {
        event.preventDefault();
        closeAccessoryCatalog();
        return;
      }

      if (event.target.closest("#random-flying-event")) {
        event.preventDefault();
        claimRandomEvent();
        return;
      }

      const exclusive = event.target.closest("[data-exclusive-card-buy]");
      if (exclusive) {
        event.preventDefault();
        emitGameEvent("exclusiveCardPurchaseRequested", { cardId: exclusive.dataset.exclusiveCardBuy });
        return;
      }

      const wardrobeViewButton = event.target.closest("[data-wardrobe-view]");
      if (wardrobeViewButton) {
        event.preventDefault();
        wardrobeView = wardrobeViewButton.dataset.wardrobeView;
        renderWardrobeUI();
        return;
      }

      const styleSetButton = event.target.closest("[data-style-set]");
      if (styleSetButton) {
        event.preventDefault();
        selectedStyleSetId = styleSetButton.dataset.styleSet;
        renderWardrobeUI();
        return;
      }

      const wardrobeSlot = event.target.closest("[data-wardrobe-slot]");
      if (wardrobeSlot) {
        event.preventDefault();
        selectedWardrobeSlot = wardrobeSlot.dataset.wardrobeSlot;
        wardrobeView = "items";
        renderWardrobeUI();
        return;
      }

      const wardrobeUpgrade = event.target.closest("[data-wardrobe-upgrade]");
      if (wardrobeUpgrade) { event.preventDefault(); upgradeEquipment(wardrobeUpgrade.dataset.wardrobeUpgrade); return; }

      const cardUpgrade = event.target.closest("[data-card-upgrade]");
      if (cardUpgrade) { event.preventDefault(); levelUpCard(cardUpgrade.dataset.cardUpgrade); return; }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const gameModal = document.getElementById("game-modal");
        if (gameModal && !gameModal.hidden) {
          event.preventDefault();
          closeTranslatedGameModal();
          return;
        }

        const socialTasksModal = document.getElementById("social-tasks-modal");
        if (socialTasksModal && !socialTasksModal.hidden) {
          event.preventDefault();
          closeSocialTasksModal();
          return;
        }

        const notificationsModal = document.getElementById("notifications-modal");
        if (notificationsModal && !notificationsModal.hidden) {
          event.preventDefault();
          closeNotificationsModal();
          return;
        }

        const modal = document.getElementById("daily-challenges-modal");
        if (modal && !modal.hidden) {
          event.preventDefault();
          closeDailyChallengesModal();
          return;
        }
      }

      if (
        event.key === "Enter"
        &&
        event.target?.matches?.("#daily-morse-input")
      ) {
        event.preventDefault();
        submitDailyMorseAnswer(event.target.value);
      }
    });
  }


  function gameTick() {
    regenerateEnergy();
    const earned = processPassiveIncome();
    if (earned > 0) {
      updatePlayerResources();
      renderMissions();
    }

    /* Keeps temporary boosts, their timer and energy UI visually in sync. */
    updateTapButton();
    updateLevelUpBoostUI();
    if (document.querySelector('.screen[data-screen="leaderboard"].active')) {
      renderLeaderboardRewardsAndOffer();
    }
    tickDailyRetentionSystem();
    tickSocialTasksSystem();
    renderSocialTasksUI();
    renderNotificationsUI();

    const notificationsModal = document.getElementById("notifications-modal");
    if (notificationsModal && !notificationsModal.hidden) {
      renderNotificationsModalContent();
    }

    tickRandomEventSystem();

    const active = window.HustleTabs?.getActiveTab?.() || "home";
    if (active === "home") {
      renderQuickJobs();
      renderHomeBusinesses();
    } else if (active === "city") {
      renderCityUI();
    } else if (active === "cases") {
      renderTimedCases();
      renderAccessoryCases();
    } else if (active === "leaderboard") {
      renderLeaderboard();
    }

    /*
       Some tab routers only report the six bottom-nav tabs.
       This fallback keeps the leaderboard live even when it was opened
       from the HUD button instead of the bottom navigation.
    */
    const leaderboardScreen = document.querySelector(
      '.screen[data-screen="leaderboard"].active'
    );
    if (leaderboardScreen) {
      renderLeaderboard();
    } else {
      updateLeaderboardSeasonCountdown();
    }
  }

  function resetGame() {
    try {
      [
        SAVE_KEY,
        SAVE_BACKUP_KEY,
        SAVE_META_KEY,
        OFFLINE_LAST_CLAIM_STORAGE_KEY,
        DAILY_RETENTION_STORAGE_KEY,
        LEADERBOARD_SEASON_STORAGE_KEY,
        ...LEGACY_SAVE_KEYS
      ].forEach((key) => localStorage.removeItem(key));
    } catch (_) {}

    location.reload();
  }

  function setMaxLevel() {
    processPassiveIncome();
    state.level = 100;
    state.money = 999000000;
    state.gems = 99999;
    state.xp = 0;
    state.missions = createMissionState(state.level);
    recomputeDerivedState();
    state.energy = state.maxEnergy;
    if (DISTRICT_IDS.length) state.city.selectedDistrictId = DISTRICT_IDS[DISTRICT_IDS.length - 1];
    TIMED_CASE_IDS.forEach((caseId) => { state.timedCases[caseId].unlockAt = Date.now(); });
    state.accessoryCases.freeUnlockAt = Date.now();
    saveGame();
    renderAllDynamic();
    updateUI();
    return state;
  }

  function renderAllDynamic() {
    renderQuickJobs();
    refreshBusinessPanels();
    renderTimedCases();
    renderAccessoryCases();
    renderCollectionUI();
    renderExclusiveCards();
    renderWardrobeUI();
    renderAccessoryCatalog();
    renderRandomEvent();
    renderDailyRetentionUI();
    renderLeaderboard();
    renderSocialTasksUI();
  }


  const PERFORMANCE_SCREEN_NAMES = Object.freeze([
    "home",
    "city",
    "cases",
    "collection",
    "wardrobe",
    "shop"
  ]);

  const warmedPerformanceScreens = new Set();
  let pendingScreenRenderName = "";
  let pendingScreenRenderFrame = 0;

  function renderDynamicScreen(screenName, options = {}) {
    switch (screenName) {
      case "home":
        updateHomeCharacter();
        updateHomeMetaUI();
        updateTapButton();
        updateLevelUpBoostUI();
        renderMissions();
        renderQuickJobs();
        renderHomeBusinesses();
        break;

      case "city":
        renderCityUI();
        break;

      case "cases":
        renderTimedCases();
        renderAccessoryCases();
        break;

      case "collection":
        renderCollectionUI();
        renderExclusiveCards();
        updateCollectionSummaryUI();
        break;

      case "wardrobe":
        renderWardrobeUI();
        break;

      case "shop":
        updateShopUI();
        break;

      case "leaderboard":
        renderLeaderboard({ force: Boolean(options.force) });
        updateLeaderboardSeasonCountdown();
        break;

      default:
        return false;
    }

    const screen = document.querySelector(
      `.screen[data-screen="${screenName}"]`
    );

    if (screen) {
      warmedPerformanceScreens.add(screenName);
      screen.dataset.renderReady = "true";

      /*
         Sprite work is deferred after the DOM update so the heavy child
         render and sprite paint do not compete in the same frame.
      */
      requestAnimationFrame(() => {
        scheduleSpriteRender(screen);
      });
    }

    return true;
  }

  function scheduleDynamicScreenRender(screenName, options = {}) {
    if (
      screenName !== "leaderboard"
      && !PERFORMANCE_SCREEN_NAMES.includes(screenName)
    ) {
      return;
    }

    pendingScreenRenderName = screenName;

    /*
       Rapid taps are coalesced into ONE render on the next animation frame.
       Only the most recently selected screen gets rebuilt.
    */
    if (pendingScreenRenderFrame) return;

    pendingScreenRenderFrame = requestAnimationFrame(() => {
      pendingScreenRenderFrame = 0;

      const targetName = pendingScreenRenderName;
      pendingScreenRenderName = "";

      const targetScreen = document.querySelector(
        `.screen[data-screen="${targetName}"]`
      );

      if (!targetScreen?.classList.contains("active")) return;

      renderDynamicScreen(targetName, options);
    });
  }

  function scheduleIdleScreenWarmup() {
    const queue = PERFORMANCE_SCREEN_NAMES.filter(
      (name) => name !== "home" && !warmedPerformanceScreens.has(name)
    );

    if (!queue.length) return;

    const scheduleIdle =
      typeof window.requestIdleCallback === "function"
        ? (callback) => window.requestIdleCallback(callback, { timeout: 700 })
        : (callback) => window.setTimeout(
            () => callback({
              didTimeout: true,
              timeRemaining: () => 0
            }),
            140
          );

    const warmNext = () => {
      const screenName = queue.shift();
      if (!screenName) return;

      if (!document.hidden) {
        renderDynamicScreen(screenName, { warmup: true });
      }

      if (queue.length) {
        scheduleIdle(warmNext);
      }
    };

    scheduleIdle(warmNext);
  }

  function bindOptimizedTabRendering() {
    window.addEventListener("hustle:tabChanged", (event) => {
      const tab = String(event.detail?.tab || "");
      if (!PERFORMANCE_SCREEN_NAMES.includes(tab)) return;

      /*
         script.js has already switched the visible shell synchronously.
         Child DOM rendering is then coalesced for the next frame.
      */
      scheduleDynamicScreenRender(tab, {
        reason: event.detail?.source || "tab-change"
      });

      syncLeaderboardHudButtonState();
    });
  }

  async function initGame() {
    document.documentElement.classList.add("sprites-loading");

    /*
       Restore the newest durable snapshot BEFORE any energy/offline-income
       calculation mutates state. Local loads synchronously; Telegram cloud
       wins only when its updatedAt timestamp is newer.
    */
    const persistenceRestore = await hydratePersistence();

    /*
       Bind <img> fallbacks before first paint. This is important on Telegram
       iOS where an SVG request can fail before the rest of the app is ready.
    */
    syncHudIconAssets(document);
    installStaticImageFallbacks(document);
    normalizeSpriteFrames();
    logAssetAudit();
    auditGameTranslations();

    const spritePreloadPromise = preloadOfficialSpriteSheets();
    const directAssetPreloadPromise = preloadCriticalDirectAssets();

    recomputeDerivedState();
    regenerateEnergy();
    ensureDailyRetentionState();
    ensureSocialTasksState();

    const offlineResult = checkOfflineEarnings();
    const offlineIncome = Math.max(
      0,
      Number(offlineResult?.pendingAmount) || 0
    );

    if (!state.randomEvents.nextSpawnAt && !state.randomEvents.activeEvent) {
      scheduleNextRandomEvent();
    }

    bindUIEvents();

    /*
       Existing saves are deep-merged, so this never resets progress.
       First-run / pre-V19.7 saves without a confirmed choice receive the
       safe male fallback internally and see the selector before Home.
    */
    const characterSelectionOpen =
      isCharacterSelectionRequired()
        ? openCharacterSelection({ focus: true })
        : false;

    if (!characterSelectionOpen) {
      applySelectedCharacterToUI();
    }

    /*
       First paint only renders the active Home screen and lightweight global
       systems. Hidden tabs are prepared later during idle time.
    */
    renderDynamicScreen("home", { force: true });
    renderRandomEvent();
    renderDailyRetentionUI();
    renderSocialTasksUI();
    renderNotificationsUI();

    updateUI();
    updateHomeMetaUI(offlineIncome);

    if (offlineIncome > 0) {
      if (characterSelectionOpen) {
        pendingCharacterSelectionOfflineResult =
          offlineResult;
      } else {
        showOfflineEarningsModal(offlineResult);
      }
    }

    /*
       Do not paint any CSS sprite sheet before its bitmap is decoded.
       This is especially important in Telegram's WKWebView on iOS.
    */
    await Promise.all([spritePreloadPromise, directAssetPreloadPromise]);
    normalizeSpriteFrames();
    installSpriteRendererObservers();
    renderSpriteTree(document);
    document.documentElement.classList.remove("sprites-loading");

    /*
       Warm hidden screens one-at-a-time only after first paint/assets are
       ready. This removes first-visit stutter without slowing Home startup.
    */
    scheduleIdleScreenWarmup();

    setInterval(gameTick, GAME_TICK_INTERVAL);
    setInterval(saveGame, AUTO_SAVE_INTERVAL);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        persistOnExit("visibility-hidden");
      } else {
        const resumedOfflineResult = checkOfflineEarnings();

        regenerateEnergy();
        renderAllDynamic();
        updateUI();
        updateHomeMetaUI(resumedOfflineResult.pendingAmount || 0);

        if (Number(resumedOfflineResult.pendingAmount) > 0) {
          if (isCharacterSelectionRequired()) {
            pendingCharacterSelectionOfflineResult =
              resumedOfflineResult;
            openCharacterSelection({ focus: false });
          } else {
            showOfflineEarningsModal(resumedOfflineResult);
          }
        }

        scheduleSpriteRender(document);
      }
    });

    window.addEventListener("pageshow", (event) => {
      /* WKWebView can restore a frozen page from the back/foreground cache. */
      if (event.persisted) {
        const restoredOfflineResult = checkOfflineEarnings();
        if (Number(restoredOfflineResult.pendingAmount) > 0) {
          showOfflineEarningsModal(restoredOfflineResult);
        }
      }
      setTimeout(() => scheduleSpriteRender(document), 0);
    }, { passive: true });

    window.addEventListener("pagehide", () => {
      persistOnExit("pagehide");
    }, { passive: true });

    window.addEventListener("beforeunload", () => {
      persistOnExit("beforeunload");
    });

    /*
       Telegram Mini Apps may background/close without a conventional browser
       unload path. Telegram's viewportChanged is another chance to flush when
       the app is no longer stable/fully visible.
    */
    try {
      window.Telegram?.WebApp?.onEvent?.(
        "viewportChanged",
        (event) => {
          if (event?.isStateStable === false) {
            saveGame("telegram-viewport-change");
          }
        }
      );
    } catch (_) {}

    window.addEventListener("hustle:languageChanged", () => {
      renderAllDynamic();
      updateUI();

      const offlineModal = document.getElementById("offline-earnings-modal");
      if (offlineModal && !offlineModal.hidden) {
        showOfflineEarningsModal(getPendingOfflineEarnings());
      }

      const genericModal = document.getElementById("game-modal");
      if (
        genericModal
        && !genericModal.hidden
        && activeGameModalTranslation
      ) {
        if (activeGameModalTranslation.titleKey === "modal.dailyChest") {
          openDailyChestInfoModal();
        } else {
          renderTranslatedGameModal();
        }
      }

      const notificationsModal = document.getElementById("notifications-modal");
      if (notificationsModal && !notificationsModal.hidden) {
        renderNotificationsModalContent();
      }

      renderSocialTasksUI();
      renderDailyRetentionUI();
      renderLeaderboard({ force: true });

      const caseRewardOverlay = document.getElementById("case-reward-overlay");
      if (
        caseRewardOverlay
        && !caseRewardOverlay.hidden
        && lastCaseRewardOverlayPayload
      ) {
        showCaseRewardOverlay(lastCaseRewardOverlayPayload);
      }

      const accessoryRewardOverlay = document.getElementById("accessory-reward-overlay");
      if (
        accessoryRewardOverlay
        && !accessoryRewardOverlay.hidden
        && lastAccessoryRewardItemId
      ) {
        showAccessoryReward(lastAccessoryRewardItemId);
      }

      window.i18n?.apply?.(document);
      auditGameTranslations();
      scheduleSpriteRender(document);
    });

    emitGameEvent("ready", {
      state,
      config: CONFIG,
      offlineIncome,
      playerStats: computePlayerStats(state),
      collection: getCollectionSummary(),
      sprites: window.HustleSpriteDiagnostics?.()
    });
  }

  window.resetGame = resetGame;
  window.setMaxLevel = setMaxLevel;

  window.dailyRetentionSystem = {
    ensure: ensureDailyRetentionState,
    render: renderDailyRetentionUI,
    open: openDailyChallengesModal,
    close: closeDailyChallengesModal,
    combo: {
      getState: () => ({ ...dailyRetention.combo }),
      track: trackDailyComboAction
    },
    morse: {
      getState: () => ({ ...dailyRetention.morse }),
      submit: submitDailyMorseAnswer
    },
    checkIn: {
      getState: () => ({ ...dailyRetention.checkIn }),
      claim: claimDailyCheckIn
    },
    resetInSeconds: getSecondsUntilDailyReset
  };

  window.socialTasksSystem = {
    ids: SOCIAL_TASK_IDS,
    open: openSocialTasksModal,
    close: closeSocialTasksModal,
    interact: handleSocialTaskInteraction,
    claim: claimSocialTaskReward,
    simulateInvite: simulateSocialInvite,
    setActionLink: setSocialTaskActionLink,
    getState: () => state.socialTasks,
    render: renderSocialTasksUI
  };

  window.offlineEarningsSystem = {
    check: checkOfflineEarnings,
    claim: claimOfflineEarnings,
    show: showOfflineEarningsModal,
    hide: hideOfflineEarningsModal,
    getPending: () => ({ ...getPendingOfflineEarnings() }),
    capSeconds: OFFLINE_EARNINGS_CAP_SECONDS
  };

  window.randomEventSystem = {
    spawnNow(eventId = null) {
      state.randomEvents.activeEvent = null;
      return spawnRandomEvent(eventId);
    },
    claim: claimRandomEvent,
    scheduleNext: scheduleNextRandomEvent,
    getState() {
      return state.randomEvents;
    }
  };

  window.HustleGame = {
    state,
    config: CONFIG,
    tap,
    save: saveGame,
    updateUI,
    reset: resetGame,
    setMaxLevel,
    getXpRequired,
    getPlayerStats: () => computePlayerStats(state),

    performance: {
      renderScreen: (screenName, options = {}) =>
        renderDynamicScreen(screenName, options),
      scheduleScreenRender: (screenName, options = {}) =>
        scheduleDynamicScreenRender(screenName, options),
      warmScreens: scheduleIdleScreenWarmup,
      getWarmedScreens: () => [...warmedPerformanceScreens]
    },

    character: {
      getGender: () => getSelectedCharacterGender(),
      isSelected: () => Boolean(state.profile?.characterSelected),
      select: (gender) =>
        selectCharacterGender(gender, { source: "api" }),
      openSelector: () =>
        openCharacterSelection({ focus: true }),
      refresh: applySelectedCharacterToUI,
      getAsset: (stage = getCharacterStage(state.level)) =>
        getRealCharacterAsset(stage)
    },

    persistence: {
      saveNow: (reason = "api") => saveGame(reason),
      saveCloudNow: () => flushCloudSave(),
      hydrate: () => hydratePersistence(),
      hasTelegramCloud: () => Boolean(getTelegramCloudStorage()),
      getStatus: () => ({
        localUpdatedAt: lastLocalSaveAt,
        cloudUpdatedAt: lastCloudSaveAt,
        cloudAvailable: Boolean(getTelegramCloudStorage()),
        localSaveQueued: Boolean(localSaveTimer),
        cloudSaveQueued: Boolean(cloudSaveTimer || cloudSaveQueued),
        cloudSaveInFlight
      })
    },

    i18n: {
      getLanguage: () => window.i18n?.getLanguage?.() || "en",
      setLanguage: (language) => window.i18n?.setLanguage?.(language),
      switchLanguage: () => window.i18n?.switchLanguage?.(),
      audit: auditGameTranslations,
      requiredKeys: collectRuntimeTranslationKeys
    },

    missions: {
      getDefinitions: (level = state.level) => getMissionDefinitions(level),
      getState: () => state.missions,
      update: updateMissionProgress,
      canLevelUp: checkLevelUpEligibility,
      nextLevel: advanceToNextLevel,
      grantLevelUpRewards,
      getLevelUpEarningsMultiplier,
      getLevelUpCaseReward,
      getLevelUpBoostConfig,
      completeForTesting: completeCurrentMissionsForTesting,
      render: renderMissions
    },

    hustles: {
      ids: HUSTLE_IDS,
      getConfig: (id) => HUSTLE_CONFIGS[id],
      getState: (id) => state.hustles[id],
      run: performHustle,
      render: renderQuickJobs
    },

    businesses: {
      ids: BUSINESS_IDS,
      getState: (id) => state.businesses[id],
      getConfig: (id) => BUSINESS_CONFIGS[id],
      buy: purchaseBusiness,
      upgrade: upgradeBusiness,
      getRevenuePerHour: getBusinessRevenuePerHour,
      getRevenuePerSecond: getBusinessRevenuePerSecond,
      getUpgradeCost: getBusinessUpgradeCost,
      getTotalPerSecond: getTotalPassiveIncomePerSecond,
      render: refreshBusinessPanels
    },

    city: {
      districts: DISTRICT_IDS,
      selectDistrict,
      isUnlocked: isDistrictUnlocked,
      render: renderCityUI
    },

    cards: {
      ids: CARD_IDS,
      getConfig: (id) => CARD_CONFIGS[id],
      getState: (id) => state.cards[id],
      getFragmentsRequired: getCardFragmentsRequired,
      canLevelUp: canLevelUpCard,
      addFragments: addCardFragments,
      levelUp: levelUpCard,
      getSummary: getCollectionSummary,
      render: renderCollectionUI
    },

    cases: {
      ids: TIMED_CASE_IDS,
      isReady: isTimedCaseReady,
      getRemaining: getTimedCaseRemainingSeconds,
      open: openTimedCase,
      skip: skipTimedCase,
      render: renderTimedCases
    },

    accessoryCases: {
      ids: ACCESSORY_CASE_IDS,
      isFreeReady: isFreeAccessoryCaseReady,
      getFreeRemaining: getFreeAccessoryCaseRemaining,
      openFree: openFreeAccessoryCase,
      openPremium: openPremiumAccessoryCase,
      render: renderAccessoryCases
    },

    accessoryCatalog: {
      ids: WARDROBE_CATALOG_IDS,
      getConfig: (id) => WARDROBE_CATALOG_CONFIGS[id],
      getState: (id) => state.wardrobeCatalog[id],
      open: openAccessoryCatalog,
      close: closeAccessoryCatalog,
      render: renderAccessoryCatalog
    },

    randomEvents: {
      spawn: spawnRandomEvent,
      claim: claimRandomEvent,
      scheduleNext: scheduleNextRandomEvent,
      getState: () => state.randomEvents
    },

    wardrobe: {
      ids: EQUIPMENT_IDS,
      getState: (id) => state.equipment[id],
      getConfig: (id) => EQUIPMENT_CONFIGS[id],
      getStage: getEquipmentStage,
      getUpgradeCost: getEquipmentUpgradeCost,
      buy: buyEquipmentLevelOne,
      upgrade: upgradeEquipment,
      getBonuses: getWardrobeBonusTotals,
      getStyleSetProgress,
      render: renderWardrobeUI
    },

    leaderboard: {
      getMockPlayers: () => LEADERBOARD_MOCK_PLAYERS.map((player) => ({ ...player })),
      getCurrentPlayer: getCurrentLeaderboardPlayer,
      getSnapshot: getLeaderboardSnapshot,
      getCurrentRank: () => getLeaderboardSnapshot().current?.rank || null,
      sortPlayers: sortLeaderboardPlayers,
      getPrestigeScore: () => calculateLocalPrestigeScore(state),
      getSortMode: () => leaderboardSortMode,
      setSortMode: setLeaderboardSortMode,
      getRewardTier: (rank) => getLeaderboardRewardTier(rank),
      getFlashOffer: () => ({
        ...LEADERBOARD_FLASH_OFFER,
        offerEndsAt: getLeaderboardFlashOfferEnd(),
        boost: getLeaderboardFlashBoostState()
      }),
      purchaseFlashOffer: purchaseLeaderboardFlashOffer,
      open: (options = {}) => openLeaderboardScreen(options),
      close: (options = {}) => closeLeaderboardScreen(options),
      isOpen: isLeaderboardOpen,
      render: (options = {}) => renderLeaderboard({ force: true, ...options })
    },

    socialTasks: {
      ids: SOCIAL_TASK_IDS,
      getConfig: (taskId) => SOCIAL_TASK_CONFIGS[taskId] || null,
      getState: (taskId = null) => taskId
        ? getSocialTaskState(taskId)
        : state.socialTasks,
      open: openSocialTasksModal,
      close: closeSocialTasksModal,
      interact: handleSocialTaskInteraction,
      claim: claimSocialTaskReward,
      simulateInvite: simulateSocialInvite,
      setActionLink: setSocialTaskActionLink,
      tick: tickSocialTasksSystem,
      render: renderSocialTasksUI
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGame, { once: true });
  } else {
    initGame();
  }
})();


/* V16.6: Wardrobe avatar scale + fixed accessory rows + simplified row copy. */

/* V16.9: Dynamic leaderboard ranking, current-player rank, 15-player mock dataset. */

/* V17.0: Leaderboard season rewards + limited Gem-based x2 income boost offer. */

/* V17.3: Interactive Social Tasks modal, verification states, claims and live HUD rewards. */

/* V17.4: Central EN/RU i18n via translations.js; no Italian UI copy in localized flows. */

/* V17.5: Home/HUD/main navigation EN-RU language polish. */

/* V17.6: Final EN/RU secondary-screen translation audit. */

/* V17.7: Offline Earnings + Daily Chest raw translation-key popup fix. */

/* V17.8: Cases/Cards/Wardrobe raw translation-key compatibility + centralized names. */

/* V17.9: Hardened centralized EN/RU translation engine + runtime coverage audit. */

/* V18.0: Step 1 — Home/Missions/Quick Jobs + Offline popup EN/RU localization fix. */

/* V18.1: Step 2 — City Map / Business names, unlock labels and Active Businesses EN/RU fix. */

/* V18.2: Step 3 — Cases + Collection/Cards EN/RU localization fix. */

/* V18.3: Step 4 — Wardrobe/Shop localization + definitive legacy-safe RU/EN toggle. */

/* V18.5: proportional image/media frames for Cases, Shop and Wardrobe. */

/* V18.6: HUD trophy now directly opens and renders the Leaderboard screen. */

/* V18.9: coalesced tab rendering, idle screen warmup and instant nav shell switching. */

/* V19.1: real-time local persistence + backup + Telegram CloudStorage mirror. */

/* V19.2: City business cards split into dedicated media/copy/stats/actions regions. */

/* V19.4: Leaderboard is an isolated fullscreen modal with explicit close/restore flow. */

/* V19.5: Home widgets/cards use explicit non-overlapping media/content/stat regions. */

/* V19.7: production female assets integrated (LV 1 / 10 / 30 + HUD icon) with persistent gender selection. */
