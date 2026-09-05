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

  const SAVE_KEY = "hustleEmpireSave_v12_5";
  const LEGACY_SAVE_KEYS = ["hustleEmpireSave_v11", "hustleEmpireSave_v10", "hustleEmpireSave_v9", "hustleEmpireSave_v8", "hustleEmpireSave_v7", "hustleEmpireSave_v6"];

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
     V12 OFFICIAL SPRITE REGISTRY
  ========================================================== */

  const BUSINESS_SPRITE_CLASS = {
    kiosk: "business-hotdog",
    laundry: "business-laundry",
    gym: "business-gym",
    cafe: "business-hotdog",
    bar: "business-bar",
    restaurant: "business-bar",
    office: "business-crypto",
    car_dealer: "business-dealership",
    agency: "business-crypto",
    nightclub: "business-nightclub",
    luxury_hotel: "business-empire",
    empire_tower: "business-empire"
  };

  const CARD_WORKER_SPRITE_CLASS = {
    gym_income: "worker-trainer",
    coffee_income: "worker-bartender",
    delivery_income: "worker-rider",
    garage_income: "worker-mechanic",
    nightclub_income: "worker-influencer",
    tap_power: "worker-barber",
    critical_rate: "worker-realtor",
    critical_damage: "worker-mechanic",
    energy_max: "worker-pizza",
    energy_regen: "worker-cfo"
  };

  const EXCLUSIVE_WORKER_SPRITE_CLASS = {
    founder: "worker-cfo",
    golden_tycoon: "worker-realtor",
    neon_king: "worker-influencer"
  };

  const EQUIPMENT_SPRITE_CLASS = {
    cap: "wardrobe-rookie-cap",
    glasses: "wardrobe-urban-sunglasses",
    jacket: "wardrobe-leather-jacket",
    pants: "wardrobe-ripped-jeans",
    shoes: "wardrobe-red-sneakers",
    accessory: "wardrobe-gold-watch"
  };

  const WARDROBE_CATALOG_SPRITE_CLASS = {
    designer_cap: "wardrobe-designer-cap",
    urban_shades: "wardrobe-urban-sunglasses",
    street_jacket: "wardrobe-leather-jacket",
    limited_sneakers: "wardrobe-red-sneakers",
    neon_jacket: "wardrobe-hoodie",
    tech_pants: "wardrobe-tech-pants",
    chrono_watch: "wardrobe-gold-watch",
    elite_shades: "wardrobe-visor",
    crown_cap: "wardrobe-designer-cap",
    royal_coat: "wardrobe-full-suit",
    diamond_watch: "wardrobe-gold-watch",
    imperial_shoes: "wardrobe-luxury-sneakers"
  };

  const TIMED_CASE_SPRITE_CLASS = {
    case_2h: "case-wood",
    case_4h: "case-leather",
    case_8h: "case-steel",
    case_24h: "case-cyan"
  };

  const ACCESSORY_CASE_SPRITE_CLASS = {
    free_accessory: "case-leather",
    premium_rare: "case-cyan",
    premium_epic: "case-purple",
    premium_legendary: "case-gold"
  };

  const SPRITE_BUILD_VERSION = "15.0";

  /*
     V14.0 asset manifest.

     IMPORTANT FOR GITHUB PAGES:
     - every repository-local path is relative to the current GitHub Pages project directory
     - vector characters/icons use their real .svg names
     - bitmap cases/sprite sheets use their real .png names
     - old *_v124 sprite names are fallback-only, so an older deployment can
       still recover without rendering a blank game screen.
  */
  const ASSET_PATHS = Object.freeze({
    avatar: "assets/avatar-small.svg",
    avatarFallback: "assets/avatar.png",
    characterMain: "assets/character-main.svg",
    characters: Object.freeze({
      1: Object.freeze({ primary: "assets/character-01.svg", fallback: "assets/character_novice.png" }),
      2: Object.freeze({ primary: "assets/character-02.svg", fallback: "assets/character_street.png" }),
      3: Object.freeze({ primary: "assets/character-03.svg", fallback: "assets/character_hustler.png" }),
      4: Object.freeze({ primary: "assets/character-04.svg", fallback: "assets/character_tycoon.png" })
    }),
    cityMap: "assets/sprite_city_map.png",
    cityMapFallback: "assets/city-map.svg",
    cases: Object.freeze({
      case_2h: "assets/case_2h.png",
      case_4h: "assets/case_4h.png",
      case_8h: "assets/case_8h.png",
      case_24h: "assets/case_24h.png",
      street: "assets/case_street.png",
      hustler: "assets/case_hustler.png",
      tycoon: "assets/case_tycoon.png",
      boss: "assets/case_boss.png"
    }),
    spriteSheets: Object.freeze({
      character: "assets/sprite_character_evolution.png",
      cityMap: "assets/sprite_city_map.png",
      businesses: "assets/sprite_businesses.png",
      cases: "assets/sprite_cases.png",
      workers: "assets/sprite_cards_workers.png",
      wardrobe: "assets/sprite_wardrobe_items.png"
    })
  });

  const OFFICIAL_SPRITE_ASSETS = Object.freeze({
    character: ASSET_PATHS.spriteSheets.character,
    cityMap: ASSET_PATHS.spriteSheets.cityMap,
    businesses: ASSET_PATHS.spriteSheets.businesses,
    cases: ASSET_PATHS.spriteSheets.cases,
    workers: ASSET_PATHS.spriteSheets.workers,
    wardrobe: ASSET_PATHS.spriteSheets.wardrobe
  });

  /*
     V14.4 — fallback paths are ALWAYS arrays.
     Never build a fallback as "pathA pathB": WebKit will treat that as one
     invalid URL. The loader advances to the next array item only on error.
  */
  /*
     V15.0 — every fallback list is a true array.
     City map is tried in this exact order:
       1) assets/sprite_city_map.png
       2) assets/city-map.svg
     Never concatenate these paths into one string.
  */
  const SPRITE_ASSET_FALLBACKS = Object.freeze({
    character: Object.freeze(["assets/sprite_character_evolution.png"]),
    cityMap: Object.freeze(["assets/sprite_city_map.png", "assets/city-map.svg"]),
    businesses: Object.freeze(["assets/sprite_businesses.png"]),
    cases: Object.freeze(["assets/sprite_cases.png"]),
    workers: Object.freeze(["assets/sprite_cards_workers.png"]),
    wardrobe: Object.freeze(["assets/sprite_wardrobe_items.png"])
  });

  /*
     V14.0: the sprite sheets remain the canonical six source assets, but
     individual cells are painted into tiny DPR-aware canvases. This removes
     the WebKit-sensitive dependency on huge CSS background-position crops.
  */
  const SPRITE_CELLS = Object.freeze({
    "char-level-1": { sheet: "character", cols: 2, rows: 2, col: 0, row: 0 },
    "char-level-2": { sheet: "character", cols: 2, rows: 2, col: 1, row: 0 },
    "char-level-3": { sheet: "character", cols: 2, rows: 2, col: 0, row: 1 },
    "char-level-4": { sheet: "character", cols: 2, rows: 2, col: 1, row: 1 },

    "business-hotdog":     { sheet: "businesses", cols: 3, rows: 3, col: 0, row: 0 },
    "business-laundry":    { sheet: "businesses", cols: 3, rows: 3, col: 1, row: 0 },
    "business-gym":        { sheet: "businesses", cols: 3, rows: 3, col: 2, row: 0 },
    "business-barber":     { sheet: "businesses", cols: 3, rows: 3, col: 0, row: 1 },
    "business-bar":        { sheet: "businesses", cols: 3, rows: 3, col: 1, row: 1 },
    "business-dealership": { sheet: "businesses", cols: 3, rows: 3, col: 2, row: 1 },
    "business-nightclub":  { sheet: "businesses", cols: 3, rows: 3, col: 0, row: 2 },
    "business-crypto":     { sheet: "businesses", cols: 3, rows: 3, col: 1, row: 2 },
    "business-empire":     { sheet: "businesses", cols: 3, rows: 3, col: 2, row: 2 },

    "worker-rider":      { sheet: "workers", cols: 3, rows: 3, col: 0, row: 0 },
    "worker-pizza":      { sheet: "workers", cols: 3, rows: 3, col: 1, row: 0 },
    "worker-trainer":    { sheet: "workers", cols: 3, rows: 3, col: 2, row: 0 },
    "worker-barber":     { sheet: "workers", cols: 3, rows: 3, col: 0, row: 1 },
    "worker-bartender":  { sheet: "workers", cols: 3, rows: 3, col: 1, row: 1 },
    "worker-mechanic":   { sheet: "workers", cols: 3, rows: 3, col: 2, row: 1 },
    "worker-realtor":    { sheet: "workers", cols: 3, rows: 3, col: 0, row: 2 },
    "worker-influencer": { sheet: "workers", cols: 3, rows: 3, col: 1, row: 2 },
    "worker-cfo":        { sheet: "workers", cols: 3, rows: 3, col: 2, row: 2 },

    "wardrobe-rookie-cap":        { sheet: "wardrobe", cols: 4, rows: 4, col: 0, row: 0 },
    "wardrobe-designer-cap":      { sheet: "wardrobe", cols: 4, rows: 4, col: 1, row: 0 },
    "wardrobe-urban-sunglasses":  { sheet: "wardrobe", cols: 4, rows: 4, col: 2, row: 0 },
    "wardrobe-visor":             { sheet: "wardrobe", cols: 4, rows: 4, col: 3, row: 0 },
    "wardrobe-hoodie":            { sheet: "wardrobe", cols: 4, rows: 4, col: 0, row: 1 },
    "wardrobe-leather-jacket":    { sheet: "wardrobe", cols: 4, rows: 4, col: 1, row: 1 },
    "wardrobe-white-suit-jacket": { sheet: "wardrobe", cols: 4, rows: 4, col: 2, row: 1 },
    "wardrobe-full-suit":         { sheet: "wardrobe", cols: 4, rows: 4, col: 3, row: 1 },
    "wardrobe-ripped-jeans":      { sheet: "wardrobe", cols: 4, rows: 4, col: 0, row: 2 },
    "wardrobe-tech-pants":        { sheet: "wardrobe", cols: 4, rows: 4, col: 1, row: 2 },
    "wardrobe-red-sneakers":      { sheet: "wardrobe", cols: 4, rows: 4, col: 2, row: 2 },
    "wardrobe-luxury-sneakers":   { sheet: "wardrobe", cols: 4, rows: 4, col: 3, row: 2 },
    "wardrobe-gold-watch":        { sheet: "wardrobe", cols: 4, rows: 4, col: 0, row: 3 },
    "wardrobe-gold-chain":        { sheet: "wardrobe", cols: 4, rows: 4, col: 1, row: 3 },
    "wardrobe-bracelet":          { sheet: "wardrobe", cols: 4, rows: 4, col: 2, row: 3 },
    "wardrobe-ring":              { sheet: "wardrobe", cols: 4, rows: 4, col: 3, row: 3 },

    "case-wood":    { sheet: "cases", cols: 2, rows: 3, col: 0, row: 0 },
    "case-leather": { sheet: "cases", cols: 2, rows: 3, col: 1, row: 0 },
    "case-steel":   { sheet: "cases", cols: 2, rows: 3, col: 0, row: 1 },
    "case-cyan":    { sheet: "cases", cols: 2, rows: 3, col: 1, row: 1 },
    "case-purple":  { sheet: "cases", cols: 2, rows: 3, col: 0, row: 2 },
    "case-gold":    { sheet: "cases", cols: 2, rows: 3, col: 1, row: 2 }
  });

  const SPRITE_SHEET_CLASS_TO_KEY = Object.freeze({
    "sprite-character": "character",
    "sprite-business": "businesses",
    "sprite-worker": "workers",
    "sprite-wardrobe": "wardrobe",
    "sprite-case": "cases"
  });

  const SPRITE_IMAGES = Object.create(null);
  let spriteAssetsReady = false;
  let spriteMutationObserver = null;
  let spriteResizeObserver = null;

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

          if (cleanPath && !candidates.includes(cleanPath)) {
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

      const loadNext = () => {
        if (index >= fallbackArray.length) {
          options.onAllFailed?.(fallbackArray);

          resolve({
            ok: false,
            image: null,
            path: "",
            candidates: fallbackArray
          });
          return;
        }

        const currentPath = fallbackArray[index];
        index += 1;

        const element = new Image();
        element.decoding = "async";

        element.onload = async () => {
          try {
            if (typeof element.decode === "function") {
              await element.decode();
            }
          } catch (_) {
            /* Safari/WKWebView can reject decode() even after onload. */
          }

          options.onSuccess?.(
            element,
            currentPath,
            fallbackArray
          );

          resolve({
            ok: true,
            image: element,
            path: currentPath,
            candidates: fallbackArray
          });
        };

        element.onerror = () => {
          console.warn(
            `[Hustle Empire] Image failed: ${currentPath}. Trying fallback ${index + 1}/${fallbackArray.length}.`
          );

          /*
             IMPORTANT:
             We do NOT build "path1 path2".
             The next call assigns exactly one next URL.
          */
          loadNext();
        };

        element.src = resolveAssetUrl(currentPath);
      };

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

      onAllFailed(failedCandidates) {
        console.error(
          `[Hustle Empire] Sprite failed to load: ${key}`,
          failedCandidates
        );

        document.documentElement.dataset.spriteError = key;
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

    spriteAssetsReady = results.some((result) => result.ok);
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
    const stageOne = ASSET_PATHS.characters[1];

    return Promise.all([
      preloadDirectAsset(
        ASSET_PATHS.avatar,
        [ASSET_PATHS.avatarFallback]
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
  function setDirectImageAsset(imageElement, primaryPath, fallbackPaths = []) {
    if (!(imageElement instanceof HTMLImageElement)) return false;

    const fallbackArray = normalizeAssetCandidates(
      primaryPath,
      fallbackPaths
    );

    if (!fallbackArray.length) {
      imageElement.classList.add("asset-load-error");
      return false;
    }

    let index = 0;

    imageElement.dataset.assetCandidates =
      JSON.stringify(fallbackArray);

    imageElement.classList.remove("asset-load-error");

    const loadNext = () => {
      if (index >= fallbackArray.length) {
        imageElement.onerror = null;
        imageElement.classList.add("asset-load-error");

        console.error(
          "[Hustle Empire] Direct image failed:",
          fallbackArray
        );
        return;
      }

      const currentPath = fallbackArray[index];
      index += 1;

      imageElement.dataset.assetCandidateIndex =
        String(index - 1);

      /*
         Exactly one URL is assigned here.
         The next candidate is assigned only from onerror.
      */
      imageElement.src = resolveAssetUrl(currentPath);
    };

    imageElement.onload = () => {
      imageElement.classList.remove("asset-load-error");
    };

    imageElement.onerror = () => {
      loadNext();
    };

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

  function spriteMarkup(sheetClass, cellClass, extraClass = "") {
    const classes = ["sprite-icon", "sprite-frame", sheetClass, cellClass, extraClass]
      .filter(Boolean)
      .join(" ");
    const layout = SPRITE_CELLS[cellClass];
    const sheetKey = layout?.sheet || SPRITE_SHEET_CLASS_TO_KEY[sheetClass] || "";
    return `<div class="${classes}" data-sprite-sheet="${sheetKey}" data-sprite-cell="${cellClass}" aria-hidden="true"></div>`;
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

  function getCharacterStage(level = state?.level || 1) {
    const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
    if (safeLevel <= 10) return 1;
    if (safeLevel <= 25) return 2;
    if (safeLevel <= 45) return 3;
    return 4;
  }

  function applyCharacterSpriteStage(element, level = state?.level || 1) {
    if (!element) return;

    const stage = getCharacterStage(level);
    const cellClass = `char-level-${stage}`;

    element.classList.remove("char-level-1", "char-level-2", "char-level-3", "char-level-4");
    element.classList.add(cellClass);
    element.dataset.characterStage = String(stage);

    /*
       V14: Home/Wardrobe character images are normal <img> elements.
       This avoids a blank canvas when Telegram iOS/WebKit restores the page
       before a sprite sheet has decoded.
    */
    if (element instanceof HTMLImageElement) {
      const asset = ASSET_PATHS.characters[stage] || ASSET_PATHS.characters[1];
      setDirectImageAsset(element, asset.primary, asset.fallback);
      return;
    }

    /* Legacy/canvas sprite fallback for any remaining sprite-character node. */
    element.dataset.spriteSheet = "character";
    element.dataset.spriteCell = cellClass;
    if (spriteAssetsReady) scheduleSpriteRender(element);
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
      asset: "assets/case_street.png"
    }),
    boss: Object.freeze({
      key: "boss",
      label: "Boss Case",
      asset: "assets/case_boss.png"
    }),
    tycoon: Object.freeze({
      key: "tycoon",
      label: "Tycoon Case",
      asset: "assets/case_tycoon.png"
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
     V15.0 — DAILY RETENTION
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
    Object.freeze({ day: 7, money: 0, gems: 500, caseType: "boss", label: "♦ 500 + Rare Case" })
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

  function tr(key, params = {}) {
    const translated = window.i18n?.t?.(key, params);
    return translated && translated !== key ? translated : key;
  }

  function currentLanguage() {
    return window.i18n?.getLanguage?.() || document.documentElement.lang || "en";
  }

  function getLocalizedValue(value) {
    if (typeof value === "string") return value;
    const lang = currentLanguage();
    return value?.[lang] || value?.en || value?.ru || "";
  }

  function formatNumber(value) {
    return Math.floor(Number(value) || 0).toLocaleString("en-US");
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

  function loadGame() {
    try {
      let raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        for (const key of LEGACY_SAVE_KEYS) {
          raw = localStorage.getItem(key);
          if (raw) break;
        }
      }
      if (!raw) return clone(DEFAULT_STATE);
      return sanitizeState(deepMerge(clone(DEFAULT_STATE), JSON.parse(raw)));
    } catch (error) {
      console.warn("[Hustle Empire] Save load failed:", error);
      return clone(DEFAULT_STATE);
    }
  }

  const state = loadGame();

  function saveGame() {
    state.timestamps.lastSaveAt = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("[Hustle Empire] Save failed:", error);
    }
  }

  /* ==========================================================
     V15.0 — DAILY RETENTION SYSTEM
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
    if (!target) return "Unknown";

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
      ? `✓ Premio riscattato: ${combo.rewardText}`
      : `Maxi-premio: ${combo.rewardText}`;
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
      button.textContent = "Risolto ✓";
      statusNode.textContent =
        `Premio: ${morse.rewardText}`;
      statusNode.className = "daily-retention-status success";
      return;
    }

    input.disabled = false;
    button.disabled = false;
    button.textContent = "Decifra";

    if (status === "morseWrong") {
      statusNode.textContent = "Codice errato. Riprova.";
      statusNode.className = "daily-retention-status error";
    } else if (status === "morseSuccess") {
      statusNode.textContent = "Corretto! Premio accreditato.";
      statusNode.className = "daily-retention-status success";
    } else {
      statusNode.textContent =
        "Converti il Morse nella cifra corretta (0-9).";
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
          <small>DAY ${reward.day}</small>
          <strong>${reward.label}</strong>
          <span>${isClaimed ? "✓" : ""}</span>
        </div>
      `;
    }).join("");

    streakNode.textContent = `${checkIn.streakDays} giorni`;

    button.disabled = claimedToday;
    button.textContent = claimedToday
      ? "Riscattato oggi ✓"
      : `Riscatta Giorno ${rewardDay}`;

    if (status === "checkInSuccess") {
      statusNode.textContent = "Check-in riscattato!";
      statusNode.className = "daily-retention-status success";
    } else if (status === "checkInAlreadyClaimed") {
      statusNode.textContent = "Hai già riscattato il premio di oggi.";
      statusNode.className = "daily-retention-status";
    } else {
      statusNode.textContent =
        "Salta un giorno e la streak riparte da 1.";
      statusNode.className = "daily-retention-status";
    }
  }

  function renderDailyRetentionUI(status = "") {
    ensureDailyRetentionState();

    renderDailyComboUI();
    renderDailyMorseUI(status);
    renderDailyCheckInUI(status);

    const resetTimer = document.getElementById("daily-reset-timer");

    if (resetTimer) {
      resetTimer.textContent = formatDailyResetTimer(
        getSecondsUntilDailyReset()
      );
    }
  }

  function tickDailyRetentionSystem() {
    const changed = ensureDailyRetentionState();

    if (changed) {
      renderDailyRetentionUI();
      return;
    }

    const resetTimer = document.getElementById("daily-reset-timer");

    if (resetTimer) {
      resetTimer.textContent = formatDailyResetTimer(
        getSecondsUntilDailyReset()
      );
    }
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
    stats.globalIncomeMultiplier *= levelUpBoostMultiplier;
    stats.levelUpBoostMultiplier = levelUpBoostMultiplier;

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
    const lang = currentLanguage();
    const target = mission.target;

    const titles = {
      taps: {
        en: `Make ${formatNumber(target)} taps`,
        ru: `Сделать ${formatNumber(target)} тапов`
      },
      jobs: {
        en: `Complete ${formatNumber(target)} ${target === 1 ? "job" : "jobs"}`,
        ru: `Выполнить подработки: ${formatNumber(target)}`
      },
      earn: {
        en: `Earn ${formatCompactMoney(target)} total`,
        ru: `Заработать ${formatCompactMoney(target)}`
      },
      upgrades: {
        en: `Buy ${formatNumber(target)} ${target === 1 ? "upgrade" : "upgrades"}`,
        ru: `Улучшить бизнес: ${formatNumber(target)}`
      },
      bonuses: {
        en: `Collect ${formatNumber(target)} ${target === 1 ? "bonus" : "bonuses"}`,
        ru: `Собрать бонусов: ${formatNumber(target)}`
      },
      events: {
        en: `Join ${formatNumber(target)} ${target === 1 ? "event" : "events"}`,
        ru: `Участвовать в событиях: ${formatNumber(target)}`
      }
    };

    return titles[mission.type]?.[lang] || titles[mission.type]?.en || mission.id;
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
          <div class="quick-job-icon">${cfg.icon}</div>
          <div class="quick-job-content">
            <strong>${getLocalizedValue(cfg.name)}</strong>
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
      getTotalPassiveIncomePerHour({ includeLevelUpBoost: false }) / 3600000;

    const boost = state.levelRewards?.activeBoost;
    const boostMultiplier = Math.max(1, Number(boost?.multiplier) || 1);
    const boostStartedAt = Math.max(0, Number(boost?.startedAt) || 0);
    const boostEndsAt = Math.max(0, Number(boost?.endsAt) || 0);

    const boostedStart = Math.max(last, boostStartedAt);
    const boostedEnd = Math.min(now, boostEndsAt);
    const boostedMs = Math.max(0, boostedEnd - boostedStart);
    const normalMs = Math.max(0, elapsed - boostedMs);

    const earned =
      baseIncomePerMs * normalMs
      +
      baseIncomePerMs * boostedMs * boostMultiplier;

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
      return "Sei stato assente per più di 3 ore (Limite raggiunto!)";
    }

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    if (hours > 0) {
      return `Sei stato assente per: ${hours} ${hours === 1 ? "ora" : "ore"} e ${minutes} ${minutes === 1 ? "minuto" : "minuti"}`;
    }

    if (minutes > 0) {
      return `Sei stato assente per: ${minutes} ${minutes === 1 ? "minuto" : "minuti"}`;
    }

    return "Sei stato assente per meno di un minuto";
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
      getTotalPassiveIncomePerSecond({ includeLevelUpBoost: false })
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

      claimButton.textContent = `Riscatta ${claimAmountLabel}$`;
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

    container.innerHTML = owned.map((businessId) => {
      const cfg = BUSINESS_CONFIGS[businessId];
      const bs = state.businesses[businessId];
      const cost = getBusinessUpgradeCost(businessId);
      const spriteClass = BUSINESS_SPRITE_CLASS[businessId] || "business-hotdog";
      return `
        <article class="business-live-card" data-business-card="${businessId}">
          <div class="business-live-image image-fallback">${spriteMarkup("sprite-business", spriteClass, ["business-nightclub", "business-crypto", "business-empire"].includes(spriteClass) ? "business-edge-safe" : "")}</div>
          <div class="business-live-content">
            <div class="business-live-top"><strong>${getLocalizedValue(cfg.name)}</strong><span class="business-level-badge">${tr("common.levelShort")} ${bs.level}</span></div>
            <span class="business-income-second">${formatIncomePerSecond(getBusinessRevenuePerSecond(businessId))}</span>
            <span class="business-income-label">${tr("home.passiveIncome")}</span>
            <div class="business-income-progress"><span></span></div>
            <button class="business-upgrade-button" type="button" data-business-upgrade="${businessId}" ${state.money >= cost ? "" : "disabled"}>${tr("common.upgrade")} · ${formatCompactMoney(cost)}</button>
          </div>
        </article>`;
    }).join("");

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
      if (strong) strong.textContent = getLocalizedValue(cfg.name);
      if (range) range.textContent = cfg.range;
      if (small) small.textContent = getLocalizedValue(cfg.tagline);
      if (icon) icon.textContent = unlocked ? "✓" : "🔒";
    });

    const district = DISTRICT_CONFIGS[selectedDistrictId];
    if (!district) return;

    const title = document.getElementById("selected-district-name");
    const status = document.getElementById("selected-district-status");
    const container = document.getElementById("district-business-list");
    const districtUnlocked = isDistrictUnlocked(selectedDistrictId);

    if (title) title.textContent = getLocalizedValue(district.name);
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
      let statusText = tr("common.requiresLevel", { level: cfg.unlockLevel });
      let button = `<button class="city-business-button" type="button" disabled>🔒 ${tr("common.levelShort")} ${cfg.unlockLevel}</button>`;

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
      const spriteClass = BUSINESS_SPRITE_CLASS[businessId] || "business-hotdog";

      return `
        <article class="district-business-card ${stateClass}">
          <div class="district-business-image">${spriteMarkup("sprite-business", spriteClass, ["business-nightclub", "business-crypto", "business-empire"].includes(spriteClass) ? "business-edge-safe" : "")}</div>
          <div class="district-business-content">
            <strong>${getLocalizedValue(cfg.name)}</strong>
            <span class="business-status ${stateClass}">${statusText}</span>
            <span class="district-business-income">${formatIncomePerSecond(previewIncome)}</span>
            ${button}
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

    switch (e.type) {
      case "businessIncomePercent": return `+${(e.percentPerLevel || 0) * level}% ${tr("stats.income")}`;
      case "tapPowerFlat": return `+${(e.valuePerLevel || 0) * level} ${tr("stats.tapPower")}`;
      case "criticalRatePercent": return `+${(e.percentPerLevel || 0) * level}% ${tr("stats.criticalRate")}`;
      case "criticalDamagePercent": return `+${(e.percentPerLevel || 0) * level}% ${tr("stats.criticalDamage")}`;
      case "energyMaxFlat": return `+${(e.valuePerLevel || 0) * level} ${tr("stats.maxEnergy")}`;
      case "energyRegenSpeedPercent": return `+${(e.percentPerLevel || 0) * level}% ${tr("stats.energyRegen")}`;
      default: return "";
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
      const workerClass = CARD_WORKER_SPRITE_CLASS[cardId] || "worker-cfo";

      return `
        <article class="collection-card-item compact-card-item ${cfg.rarity}-card ${card.unlocked ? "" : "locked-card"}" data-card-id="${cardId}">
          <div class="compact-card-image">
            ${spriteMarkup("sprite-worker", workerClass, ["worker-pizza", "worker-realtor"].includes(workerClass) ? "worker-edge-safe" : "")}
            ${card.unlocked ? "" : '<span class="compact-card-lock">🔒</span>'}
          </div>
          <div class="compact-card-meta">
            <span class="compact-card-stars">${getRarityStars(cfg.rarity)}</span>
            <span class="compact-card-type">${cfg.type === "business" ? tr("collection.businessCard") : tr("collection.rpgCard")}</span>
          </div>
          <strong class="compact-card-name">${getLocalizedValue(cfg.name)}</strong>
          <span class="compact-card-level">${card.unlocked ? `${tr("common.levelShort")} ${card.level}` : tr("common.locked")}</span>
          <small class="compact-card-bonus">${getCardBonusLabel(cardId)}</small>
          <div class="compact-fragment-row">
            <div class="compact-fragment-bar"><span style="width:${progress}%"></span></div>
            <span class="compact-fragment-count">${maxed ? tr("common.max") : `${card.fragments}/${required}`}</span>
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
    if (sub) sub.textContent = `${summary.unlocked} / ${summary.total}`;

    const compactCount = document.getElementById("collection-summary-count");
    const compactPercent = document.getElementById("collection-summary-percent");
    if (compactCount) compactCount.textContent = `${summary.unlocked} / ${summary.total}`;
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
      const workerClass = EXCLUSIVE_WORKER_SPRITE_CLASS[cardId] || "worker-cfo";
      return `
        <article class="exclusive-card">
          <div class="exclusive-card-image">${spriteMarkup("sprite-worker", workerClass)}</div>
          <strong>${getLocalizedValue(card.name)}</strong>
          <small>${getLocalizedValue(card.description)}</small>
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
      const caseClass = TIMED_CASE_SPRITE_CLASS[caseId] || "case-wood";

      return `
        <article class="real-case-card ${ready ? "ready" : ""} ${caseId === "case_24h" ? "case-24h" : ""}">
          <div class="real-case-art">${spriteMarkup("sprite-case", caseClass)}</div>
          <strong class="real-case-name">${getLocalizedValue(cfg.name)}</strong>
          <span class="real-case-duration">${hours}${currentLanguage() === "ru" ? "ч" : "h"}</span>
          <div class="case-live-timer">${ready ? tr("cases.ready") : formatCaseCountdown(remaining)}</div>
          <div class="real-case-reward-preview"><span>💵 ${tr("common.levelShort")} × ${cfg.moneyMultiplier}</span><span>♦ ${cfg.gemReward}</span><span>🃏 ${cfg.fragments.min}-${cfg.fragments.max}</span></div>
          <div class="real-case-actions">
            <button class="case-open-real-button" type="button" data-timed-case-open="${caseId}" ${ready ? "" : "disabled"}>${ready ? tr("cases.open") : tr("cases.waiting")}</button>
            ${ready ? "" : `<button class="case-skip-button" type="button" data-timed-case-skip="${caseId}" ${state.gems >= cfg.skipGemCost ? "" : "disabled"}>♦ ${cfg.skipGemCost} · ${tr("cases.unlockNow")}</button>`}
          </div>
        </article>`;
    }).join("");
  }

  function showCaseRewardOverlay(reward) {
    const overlay = document.getElementById("case-reward-overlay");
    if (!overlay || !reward.cardReward) return;
    const cfg = TIMED_CASE_CONFIGS[reward.caseId];
    const card = reward.cardReward;

    overlay.querySelector("#case-reward-title").textContent = getLocalizedValue(cfg.name);
    overlay.querySelector("#case-reward-money").textContent = `+${formatCompactMoney(reward.money)}`;
    overlay.querySelector("#case-reward-gems").textContent = `+${reward.gems}`;

    const box = overlay.querySelector("#case-reward-card");
    box.className = `reward-card-preview ${card.rarity}`;
    const sprite = overlay.querySelector("#case-reward-card-sprite");
    if (sprite) {
      sprite.className = `sprite-icon sprite-worker ${CARD_WORKER_SPRITE_CLASS[card.cardId] || "worker-cfo"} reward-card-sprite`;
    }
    overlay.querySelector("#case-reward-rarity").textContent = tr(`rarity.${card.rarity}`).toUpperCase();
    overlay.querySelector("#case-reward-card-name").textContent = getLocalizedValue(card.card.name);
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
    const caseClass = ACCESSORY_CASE_SPRITE_CLASS.free_accessory || "case-leather";

    container.innerHTML = `
      <article class="free-accessory-card">
        <div class="free-accessory-icon">${spriteMarkup("sprite-case", caseClass)}</div>
        <div class="free-accessory-content">
          <strong>${getLocalizedValue(cfg.name)}</strong>
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
      const caseClass = ACCESSORY_CASE_SPRITE_CLASS[caseId] || "case-cyan";

      return `
        <article class="premium-accessory-case ${rarity}">
          <div class="premium-accessory-case-icon">${spriteMarkup("sprite-case", caseClass)}</div>
          <strong>${getLocalizedValue(cfg.name)}</strong>
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

  function showAccessoryReward(itemId) {
    const overlay = document.getElementById("accessory-reward-overlay");
    const cfg = WARDROBE_CATALOG_CONFIGS[itemId];
    if (!overlay || !cfg) return;

    const item = overlay.querySelector("#accessory-reward-item");
    if (item) item.className = `accessory-reward-item ${cfg.rarity}`;

    const sprite = overlay.querySelector("#accessory-reward-sprite");
    if (sprite) {
      sprite.className = `sprite-icon sprite-wardrobe ${WARDROBE_CATALOG_SPRITE_CLASS[itemId] || "wardrobe-gold-watch"} accessory-reward-sprite`;
    }

    const rarity = overlay.querySelector("#accessory-reward-rarity");
    if (rarity) rarity.textContent = tr(`rarity.${cfg.rarity}`).toUpperCase();

    const name = overlay.querySelector("#accessory-reward-name");
    if (name) name.textContent = getLocalizedValue(cfg.name);

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
        default: return sourceId;
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
      const spriteClass = WARDROBE_CATALOG_SPRITE_CLASS[itemId] || "wardrobe-gold-watch";

      return `
        <article class="catalog-item ${cfg.rarity} ${itemState.unlocked ? "unlocked" : "locked"}">
          <div class="catalog-item-image">
            ${spriteMarkup("sprite-wardrobe", spriteClass)}
            ${itemState.unlocked ? "" : '<span class="catalog-lock-icon">🔒</span>'}
          </div>
          <strong>${itemState.unlocked ? getLocalizedValue(cfg.name) : "???"}</strong>
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

  function getEquipmentLocalizedName(equipmentId) {
    const es = state.equipment[equipmentId];
    if (!es?.unlocked) {
      const slotNames = {
        cap: { en: "Headwear", ru: "Головной убор" },
        glasses: { en: "Glasses", ru: "Очки" },
        jacket: { en: "Jacket", ru: "Куртка" },
        pants: { en: "Pants", ru: "Брюки" },
        shoes: { en: "Shoes", ru: "Обувь" },
        accessory: { en: "Accessory", ru: "Аксессуар" }
      };
      return getLocalizedValue(slotNames[equipmentId]);
    }
    return getLocalizedValue(getEquipmentStage(equipmentId, es.level)?.name) || equipmentId;
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
      const spriteClass = EQUIPMENT_SPRITE_CLASS[equipmentId] || "wardrobe-gold-watch";
      row.innerHTML = `
        <div class="wardrobe-item-icon">${spriteMarkup("sprite-wardrobe", spriteClass)}</div>
        <span><strong>${getEquipmentLocalizedName(equipmentId)}</strong><small>${es.unlocked ? `${tr("common.levelShort")} ${es.level} · ${getEquipmentEffectLabel(equipmentId)}` : `${tr("common.locked")} · ${formatCompactMoney(getEquipmentUpgradeCost(equipmentId))}`}</small></span>`;
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
            <strong>${getLocalizedValue(cfg.name)}</strong>
            <small>${getLocalizedValue(cfg.description)}</small>
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
        <strong>${cfg.icon} ${getLocalizedValue(cfg.name)}</strong>
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
      button.innerHTML = `${tr("wardrobe.upgradeToLevel", { level: es.level + 1 })} <strong>${formatCompactMoney(getEquipmentUpgradeCost(selectedWardrobeSlot))}</strong>`;
    }
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
    document.querySelectorAll("[data-character-sprite]").forEach((element) => {
      applyCharacterSpriteStage(element, state.level);
    });
  }

  function updateHomeMetaUI(offlineIncome = null) {
    const streakValue = document.querySelector(".feature-value");
    const streakBonus = streakValue?.parentElement?.querySelector("small");
    const offlineValue = document.querySelector(".offline-value");
    if (streakValue) streakValue.textContent = String(Math.max(0, Number(state.streak?.days) || 0));
    if (streakBonus) streakBonus.textContent = `+${Math.max(0, Number(state.streak?.bonusPercent) || 0)}%`;
    if (offlineValue && offlineIncome !== null) offlineValue.textContent = formatCompactMoney(offlineIncome);
  }

  function updatePlayerResources() {
    const money = document.querySelector(".money-card strong");
    const energy = document.querySelector(".energy-card strong");
    const gems = document.querySelector(".gem-card strong");
    if (money) money.textContent = formatCompactMoney(state.money);
    if (energy) energy.textContent = `${Math.floor(state.energy)}/${state.maxEnergy}`;
    if (gems) gems.textContent = formatNumber(state.gems);
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
    label.textContent = `⚡ Boost ${formatBoostMultiplier(multiplier)}: ${formatBoostTimer(remaining)}`;
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

    if (title) title.textContent = `LEVEL UP! LEVEL ${reward.level}`;
    if (caseName) caseName.textContent = reward.caseLabel;
    if (gems) gems.textContent = `♦ +${formatNumber(reward.gems)} Gemme`;
    if (boost) {
      boost.textContent =
        `⚡ ${formatBoostMultiplier(reward.boostMultiplier)} guadagni · ${formatBoostTimer(reward.boostDurationSeconds * 1000)}`;
    }
    if (inventory) {
      inventory.textContent = `Inventario: ${reward.caseLabel} ×${formatNumber(reward.caseInventoryCount)}`;
    }

    if (image) {
      image.src = resolveAssetUrl(reward.caseAsset);
      image.alt = reward.caseLabel;
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
    if (xp) xp.textContent = `${formatNumber(state.xp)} / ${formatNumber(needed)} XP`;
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
            <span class="quest-icon">${completed ? "✓" : (MISSION_ICONS[mission.type] || "•")}</span>
            <div class="quest-info">
              <strong>${missionTitle(mission)}</strong>
              <div class="mini-progress">
                <span style="width:${percent}%"></span>
              </div>
              <small>${missionProgressText(mission, progress)}</small>
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
        : `${completedCount}/${total} ${currentLanguage() === "ru" ? "миссий завершено" : "missions completed"}`;

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

  function bindUIEvents() {
    bindTapControl();

    document.addEventListener("click", (event) => {
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
    tickDailyRetentionSystem();

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
    }
  }

  function resetGame() {
    localStorage.clear();
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
  }

  async function initGame() {
    document.documentElement.classList.add("sprites-loading");

    /*
       Bind <img> fallbacks before first paint. This is important on Telegram
       iOS where an SVG request can fail before the rest of the app is ready.
    */
    installStaticImageFallbacks(document);
    normalizeSpriteFrames();

    const spritePreloadPromise = preloadOfficialSpriteSheets();
    const directAssetPreloadPromise = preloadCriticalDirectAssets();

    recomputeDerivedState();
    regenerateEnergy();
    ensureDailyRetentionState();

    const offlineResult = checkOfflineEarnings();
    const offlineIncome = Math.max(
      0,
      Number(offlineResult?.pendingAmount) || 0
    );

    if (!state.randomEvents.nextSpawnAt && !state.randomEvents.activeEvent) {
      scheduleNextRandomEvent();
    }

    bindUIEvents();
    renderAllDynamic();
    updateUI();
    updateHomeMetaUI(offlineIncome);

    if (offlineIncome > 0) {
      showOfflineEarningsModal(offlineResult);
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

    setInterval(gameTick, GAME_TICK_INTERVAL);
    setInterval(saveGame, AUTO_SAVE_INTERVAL);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        recordSessionCloseTimestamp();
      } else {
        const resumedOfflineResult = checkOfflineEarnings();

        regenerateEnergy();
        renderAllDynamic();
        updateUI();
        updateHomeMetaUI(resumedOfflineResult.pendingAmount || 0);

        if (Number(resumedOfflineResult.pendingAmount) > 0) {
          showOfflineEarningsModal(resumedOfflineResult);
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
      recordSessionCloseTimestamp();
    }, { passive: true });

    window.addEventListener("beforeunload", () => {
      recordSessionCloseTimestamp();
    });

    window.addEventListener("hustle:languageChanged", () => {
      renderAllDynamic();
      updateUI();
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
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGame, { once: true });
  } else {
    initGame();
  }
})();
