/* ============================================================
   HUSTLE EMPIRE TYCOON
   CENTRAL CONFIG — V11
   Level-1 progression + Accessory Cases + Random Events + Compact Cards
============================================================ */

window.GAME_CONFIG = {
  BASE_TAP_REWARD: 1,
  XP_PER_TAP: 1,

  PLAYER_STATS: {
    BASE_CRIT_RATE: 0,
    BASE_CRIT_DAMAGE_MULTIPLIER: 2,
    CRIT_RATE_CAP: 0.75
  },

  ENERGY_MAX: 120,
  ENERGY_REGEN_RATE: 1,
  ENERGY_REGEN_INTERVAL_SECONDS: 60,

  ECONOMY: {
    PLAYER_XP_BASE: 100,
    PLAYER_XP_GROWTH: 1.25,
    BUSINESS_UPGRADE_GROWTH: 1.15,
    EQUIPMENT_UPGRADE_GROWTH: 1.5
  },

  QUESTS: {
    tap250: { id: "tap250", target: 250, reward: 250 },
    deliveries8: { id: "deliveries8", target: 8, reward: 500 },
    earn25k: { id: "earn25k", target: 25000, reward: 1500 },
    events3: { id: "events3", target: 3, reward: 750 },
    buyUpgrade1: { id: "buyUpgrade1", target: 1, reward: 300 },
    collectBonus4: { id: "collectBonus4", target: 4, reward: 400 }
  },

  HUSTLES: {
    pizza_delivery: {
      id: "pizza_delivery",
      unlockLevel: 1,
      energyCost: 10,
      rewardMoney: 50,
      rewardXp: 15,
      icon: "🍕",
      name: { en: "Pizza Delivery", ru: "Доставка пиццы" }
    },
    flyer_delivery: {
      id: "flyer_delivery",
      unlockLevel: 2,
      energyCost: 15,
      rewardMoney: 90,
      rewardXp: 20,
      icon: "📄",
      name: { en: "Flyer Delivery", ru: "Раздача листовок" }
    },
    bike_courier: {
      id: "bike_courier",
      unlockLevel: 5,
      energyCost: 20,
      rewardMoney: 160,
      rewardXp: 30,
      icon: "🚲",
      name: { en: "Bike Courier", ru: "Велокурьер" }
    },
    event_helper: {
      id: "event_helper",
      unlockLevel: 10,
      energyCost: 30,
      rewardMoney: 300,
      rewardXp: 45,
      icon: "🎪",
      name: { en: "Event Helper", ru: "Помощник на мероприятии" }
    }
  },

  DISTRICTS: {
    poor_block: {
      id: "poor_block",
      unlockLevel: 1,
      range: "LV 1-10",
      tagline: { en: "Starter District", ru: "Стартовый район" },
      name: { en: "POOR BLOCK", ru: "БЕДНЫЙ КВАРТАЛ" },
      businessIds: ["kiosk", "gym", "laundry"]
    },
    city_center: {
      id: "city_center",
      unlockLevel: 11,
      range: "LV 11-20",
      tagline: { en: "City Hustles", ru: "Городской бизнес" },
      name: { en: "CITY CENTER", ru: "ЦЕНТР ГОРОДА" },
      businessIds: ["cafe", "bar", "restaurant"]
    },
    business_district: {
      id: "business_district",
      unlockLevel: 21,
      range: "LV 21-30",
      tagline: { en: "Big Business", ru: "Большой бизнес" },
      name: { en: "BUSINESS DISTRICT", ru: "БИЗНЕС-РАЙОН" },
      businessIds: ["office", "car_dealer", "agency"]
    },
    rich_skyline: {
      id: "rich_skyline",
      unlockLevel: 31,
      range: "LV 31-40+",
      tagline: { en: "Endgame Empire", ru: "Империя высокого уровня" },
      name: { en: "RICH SKYLINE", ru: "БОГАТЫЙ РАЙОН" },
      businessIds: ["nightclub", "luxury_hotel", "empire_tower"]
    }
  },

  /*
     Upgrade = baseCost * 1.15 ^ currentLevel
     Income/sec = baseIncomePerSecond * level * cardMultiplier * outfitMultiplier
  */
  BUSINESSES: {
    kiosk: {
      id: "kiosk", districtId: "poor_block", unlockLevel: 1,
      initialOwned: true, startingLevel: 1, purchaseCost: 0,
      baseCost: 10, baseIncomePerSecond: 0.20,
      asset: "./assets/skin_coffee.png",
      name: { en: "Street Kiosk", ru: "Уличный киоск" }
    },
    gym: {
      id: "gym", districtId: "poor_block", unlockLevel: 4,
      initialOwned: false, startingLevel: 1, purchaseCost: 100,
      baseCost: 50, baseIncomePerSecond: 1,
      asset: "./assets/gym.png",
      name: { en: "Gym", ru: "Тренажерный зал" }
    },
    laundry: {
      id: "laundry", districtId: "poor_block", unlockLevel: 8,
      initialOwned: false, startingLevel: 1, purchaseCost: 700,
      baseCost: 250, baseIncomePerSecond: 4,
      asset: "./assets/skin-01.svg",
      name: { en: "Laundry", ru: "Прачечная" }
    },

    cafe: {
      id: "cafe", districtId: "city_center", unlockLevel: 11,
      initialOwned: false, startingLevel: 1, purchaseCost: 2000,
      baseCost: 750, baseIncomePerSecond: 8,
      asset: "./assets/skin_coffee.png",
      name: { en: "Cafe", ru: "Кофейня" }
    },
    bar: {
      id: "bar", districtId: "city_center", unlockLevel: 14,
      initialOwned: false, startingLevel: 1, purchaseCost: 5000,
      baseCost: 1800, baseIncomePerSecond: 20,
      asset: "./assets/collection_chef.png",
      name: { en: "Bar", ru: "Бар" }
    },
    restaurant: {
      id: "restaurant", districtId: "city_center", unlockLevel: 18,
      initialOwned: false, startingLevel: 1, purchaseCost: 15000,
      baseCost: 6000, baseIncomePerSecond: 60,
      asset: "./assets/skin-02.svg",
      name: { en: "Restaurant", ru: "Ресторан" }
    },

    office: {
      id: "office", districtId: "business_district", unlockLevel: 21,
      initialOwned: false, startingLevel: 1, purchaseCost: 45000,
      baseCost: 15000, baseIncomePerSecond: 150,
      asset: "./assets/skin_influencer.png",
      name: { en: "Office", ru: "Офис" }
    },
    car_dealer: {
      id: "car_dealer", districtId: "business_district", unlockLevel: 24,
      initialOwned: false, startingLevel: 1, purchaseCost: 100000,
      baseCost: 40000, baseIncomePerSecond: 350,
      asset: "./assets/skin_autodealer.png",
      name: { en: "Car Dealer", ru: "Автосалон" }
    },
    agency: {
      id: "agency", districtId: "business_district", unlockLevel: 28,
      initialOwned: false, startingLevel: 1, purchaseCost: 250000,
      baseCost: 100000, baseIncomePerSecond: 900,
      asset: "./assets/collection_street.png",
      name: { en: "Agency", ru: "Агентство" }
    },

    nightclub: {
      id: "nightclub", districtId: "rich_skyline", unlockLevel: 31,
      initialOwned: false, startingLevel: 1, purchaseCost: 500000,
      baseCost: 200000, baseIncomePerSecond: 1800,
      asset: "./assets/collection_influencer.png",
      name: { en: "Nightclub", ru: "Ночной клуб" }
    },
    luxury_hotel: {
      id: "luxury_hotel", districtId: "rich_skyline", unlockLevel: 35,
      initialOwned: false, startingLevel: 1, purchaseCost: 1500000,
      baseCost: 600000, baseIncomePerSecond: 5000,
      asset: "./assets/skin-03.svg",
      name: { en: "Luxury Hotel", ru: "Люксовый отель" }
    },
    empire_tower: {
      id: "empire_tower", districtId: "rich_skyline", unlockLevel: 40,
      initialOwned: false, startingLevel: 1, purchaseCost: 5000000,
      baseCost: 2000000, baseIncomePerSecond: 15000,
      asset: "./assets/character_tycoon.png",
      name: { en: "Empire Tower", ru: "Башня Империи" }
    }
  },

  COLLECTION: {
    UNIQUE_CARD_COUNT: 10,
    MAX_CARD_LEVEL: 5,
    UNLOCK_FRAGMENTS: 10,
    FRAGMENTS_TO_LEVEL: { 2: 20, 3: 35, 4: 55, 5: 80 }
  },

  CARDS: {
    gym_income: {
      id: "gym_income", type: "business", rarity: "common", asset: "./assets/gym.png",
      name: { en: "Iron Gym", ru: "Железный зал" },
      effect: { type: "businessIncomePercent", businessId: "gym", percentPerLevel: 15 },
      initial: { unlocked: false, level: 0, fragments: 0 }
    },
    coffee_income: {
      id: "coffee_income", type: "business", rarity: "common", asset: "./assets/collection_chef.png",
      name: { en: "Kiosk Master", ru: "Мастер киоска" },
      effect: { type: "businessIncomePercent", businessId: "kiosk", percentPerLevel: 12 },
      initial: { unlocked: false, level: 0, fragments: 0 }
    },
    delivery_income: {
      id: "delivery_income", type: "business", rarity: "rare", asset: "./assets/collection_street.png",
      name: { en: "City Operator", ru: "Городской оператор" },
      effect: { type: "businessIncomePercent", businessId: "bar", percentPerLevel: 14 },
      initial: { unlocked: false, level: 0, fragments: 0 }
    },
    garage_income: {
      id: "garage_income", type: "business", rarity: "epic", asset: "./assets/skin_autodealer.png",
      name: { en: "Auto Dealer", ru: "Автодилер" },
      effect: { type: "businessIncomePercent", businessId: "car_dealer", percentPerLevel: 18 },
      initial: { unlocked: false, level: 0, fragments: 0 }
    },
    nightclub_income: {
      id: "nightclub_income", type: "business", rarity: "legendary", asset: "./assets/collection_influencer.png",
      name: { en: "Nightlife Mogul", ru: "Ночной магнат" },
      effect: { type: "businessIncomePercent", businessId: "nightclub", percentPerLevel: 20 },
      initial: { unlocked: false, level: 0, fragments: 0 }
    },
    tap_power: {
      id: "tap_power", type: "rpg", rarity: "rare", asset: "./assets/character_level12.png",
      name: { en: "Hustle Power", ru: "Сила хастла" },
      effect: { type: "tapPowerFlat", valuePerLevel: 1 },
      initial: { unlocked: false, level: 0, fragments: 0 }
    },
    critical_rate: {
      id: "critical_rate", type: "rpg", rarity: "epic", asset: "./assets/collection_hustler.png",
      name: { en: "Sharp Instinct", ru: "Точный удар" },
      effect: { type: "criticalRatePercent", percentPerLevel: 2 },
      initial: { unlocked: false, level: 0, fragments: 0 }
    },
    critical_damage: {
      id: "critical_damage", type: "rpg", rarity: "legendary", asset: "./assets/collection_tycoon.png",
      name: { en: "Big Score", ru: "Большой куш" },
      effect: { type: "criticalDamagePercent", percentPerLevel: 25 },
      initial: { unlocked: false, level: 0, fragments: 0 }
    },
    energy_max: {
      id: "energy_max", type: "rpg", rarity: "rare", asset: "./assets/equipment_watch.png",
      name: { en: "Energy Reserve", ru: "Запас энергии" },
      effect: { type: "energyMaxFlat", valuePerLevel: 10 },
      initial: { unlocked: false, level: 0, fragments: 0 }
    },
    energy_regen: {
      id: "energy_regen", type: "rpg", rarity: "mythic", asset: "./assets/equipment_sneakers.png",
      name: { en: "Second Wind", ru: "Второе дыхание" },
      effect: { type: "energyRegenSpeedPercent", percentPerLevel: 10 },
      initial: { unlocked: false, level: 0, fragments: 0 }
    }
  },

  WARDROBE: {
    SLOT_COUNT: 6,
    MAX_LEVEL: 10,
    MILESTONES: [1, 5, 10]
  },

  EQUIPMENT: {
    cap: {
      id: "cap", baseCost: 25,
      effect: { type: "globalIncomePercent", valuePerLevel: 1.5 },
      stages: [
        { minLevel: 1, icon: "🧢", asset: "./assets/equipment_cap.png", name: { en: "Canvas Cap", ru: "Хлопковая кепка" } },
        { minLevel: 5, icon: "🧢✨", asset: "./assets/equipment_cap.png", name: { en: "Designer Snapback", ru: "Дизайнерский снэпбэк" } },
        { minLevel: 10, icon: "👑", asset: "./assets/equipment_cap.png", name: { en: "Empire Crown", ru: "Корона Империи" } }
      ]
    },
    glasses: {
      id: "glasses", baseCost: 40,
      effect: { type: "criticalRatePercent", valuePerLevel: 0.5 },
      stages: [
        { minLevel: 1, icon: "👓", asset: "./assets/equipment_glasses.png", name: { en: "Basic Glasses", ru: "Простые очки" } },
        { minLevel: 5, icon: "😎", asset: "./assets/equipment_glasses.png", name: { en: "Street Shades", ru: "Уличные очки" } },
        { minLevel: 10, icon: "💎", asset: "./assets/equipment_glasses.png", name: { en: "Diamond Shades", ru: "Бриллиантовые очки" } }
      ]
    },
    jacket: {
      id: "jacket", baseCost: 75,
      effect: { type: "criticalDamagePercent", valuePerLevel: 5 },
      stages: [
        { minLevel: 1, icon: "🧥", asset: "./assets/equipment_jacket.png", name: { en: "Street Jacket", ru: "Уличная куртка" } },
        { minLevel: 5, icon: "🧥✨", asset: "./assets/equipment_jacket.png", name: { en: "Brand Jacket", ru: "Брендовая куртка" } },
        { minLevel: 10, icon: "🤵", asset: "./assets/equipment_jacket.png", name: { en: "Luxury Suit", ru: "Люксовый костюм" } }
      ]
    },
    pants: {
      id: "pants", baseCost: 50,
      effect: { type: "tapPowerPercent", valuePerLevel: 2 },
      stages: [
        { minLevel: 1, icon: "👖", asset: "./assets/equipment_pants.png", name: { en: "Basic Jeans", ru: "Базовые джинсы" } },
        { minLevel: 5, icon: "👖✨", asset: "./assets/equipment_pants.png", name: { en: "Streetwear Pants", ru: "Стритвир-брюки" } },
        { minLevel: 10, icon: "🕴️", asset: "./assets/equipment_pants.png", name: { en: "Executive Pants", ru: "Брюки босса" } }
      ]
    },
    shoes: {
      id: "shoes", baseCost: 60,
      effect: { type: "energyMaxFlat", valuePerLevel: 4 },
      stages: [
        { minLevel: 1, icon: "👟", asset: "./assets/equipment_sneakers.png", name: { en: "Basic Sneakers", ru: "Базовые кроссовки" } },
        { minLevel: 5, icon: "👟✨", asset: "./assets/equipment_sneakers.png", name: { en: "Limited Sneakers", ru: "Лимитированные кроссовки" } },
        { minLevel: 10, icon: "👞", asset: "./assets/equipment_sneakers.png", name: { en: "Luxury Shoes", ru: "Люксовая обувь" } }
      ]
    },
    accessory: {
      id: "accessory", baseCost: 100,
      effect: { type: "energyRegenSpeedPercent", valuePerLevel: 2 },
      stages: [
        { minLevel: 1, icon: "⌚", asset: "./assets/equipment_watch.png", name: { en: "Basic Watch", ru: "Простые часы" } },
        { minLevel: 5, icon: "⌚✨", asset: "./assets/equipment_watch.png", name: { en: "Designer Watch", ru: "Дизайнерские часы" } },
        { minLevel: 10, icon: "💎", asset: "./assets/equipment_watch.png", name: { en: "Diamond Watch", ru: "Бриллиантовые часы" } }
      ]
    }
  },

  STYLE_SETS: {
    street_set: {
      id: "street_set", requiredEquipmentLevel: 1, icon: "🧢",
      name: { en: "Street Starter", ru: "Уличный старт" },
      description: { en: "Own all 6 equipment pieces at LV 1 or higher.", ru: "Все 6 предметов экипировки должны быть УР 1 или выше." }
    },
    brand_set: {
      id: "brand_set", requiredEquipmentLevel: 5, icon: "✨",
      name: { en: "Designer Streetwear", ru: "Дизайнерский стиль" },
      description: { en: "Raise all 6 equipment pieces to LV 5.", ru: "Повысьте все 6 предметов экипировки до УР 5." }
    },
    empire_set: {
      id: "empire_set", requiredEquipmentLevel: 10, icon: "👑",
      name: { en: "Empire Luxury", ru: "Имперская роскошь" },
      description: { en: "Reach LV 10 with every equipment piece.", ru: "Достигните УР 10 на каждом предмете экипировки." }
    }
  },

  TIMED_CASES: {
    case_2h: {
      id: "case_2h", durationSeconds: 2 * 60 * 60,
      moneyMultiplier: 100, gemReward: 1, skipGemCost: 5,
      icon: "📦", name: { en: "2H Case", ru: "Кейс 2ч" },
      rates: { common: 72, rare: 22, epic: 5, legendary: 1 },
      fragments: { min: 2, max: 4 }
    },
    case_4h: {
      id: "case_4h", durationSeconds: 4 * 60 * 60,
      moneyMultiplier: 250, gemReward: 2, skipGemCost: 9,
      icon: "🎁", name: { en: "4H Case", ru: "Кейс 4ч" },
      rates: { common: 60, rare: 28, epic: 10, legendary: 2 },
      fragments: { min: 3, max: 6 }
    },
    case_8h: {
      id: "case_8h", durationSeconds: 8 * 60 * 60,
      moneyMultiplier: 600, gemReward: 4, skipGemCost: 16,
      icon: "💼", name: { en: "8H Case", ru: "Кейс 8ч" },
      rates: { common: 45, rare: 32, epic: 18, legendary: 5 },
      fragments: { min: 5, max: 9 }
    },
    case_24h: {
      id: "case_24h", durationSeconds: 24 * 60 * 60,
      moneyMultiplier: 2000, gemReward: 10, skipGemCost: 35,
      icon: "👑", name: { en: "24H Empire Case", ru: "Имперский кейс 24ч" },
      rates: { common: 25, rare: 35, epic: 28, legendary: 12 },
      fragments: { min: 10, max: 18 }
    }
  },


  /* ==========================================================
     PREMIUM ACCESSORY CASES
  ========================================================== */

  ACCESSORY_CASES: {
    free_accessory: {
      id: "free_accessory",
      type: "free",
      durationSeconds: 12 * 60 * 60,
      gemCost: 0,
      icon: "🎒",
      name: { en: "Free Accessory Case", ru: "Бесплатный кейс аксессуаров" },
      rates: { rare: 85, epic: 15, legendary: 0 }
    },

    premium_rare: {
      id: "premium_rare",
      type: "premium",
      gemCost: 100,
      icon: "💼",
      name: { en: "Rare Accessory Case", ru: "Редкий кейс аксессуаров" },
      rates: { rare: 80, epic: 20, legendary: 0 }
    },

    premium_epic: {
      id: "premium_epic",
      type: "premium",
      gemCost: 250,
      icon: "🔮",
      name: { en: "Epic Accessory Case", ru: "Эпический кейс аксессуаров" },
      rates: { rare: 0, epic: 85, legendary: 15 }
    },

    premium_legendary: {
      id: "premium_legendary",
      type: "premium",
      gemCost: 500,
      icon: "👑",
      name: { en: "Legendary Accessory Case", ru: "Легендарный кейс аксессуаров" },
      rates: { rare: 0, epic: 0, legendary: 100 }
    }
  },

  /* ==========================================================
     WARDROBE PREMIUM CATALOG
  ========================================================== */

  WARDROBE_CATALOG: {
    designer_cap: {
      id: "designer_cap", slot: "cap", rarity: "rare", icon: "🧢",
      asset: "./assets/equipment_cap.png",
      name: { en: "Designer Cap", ru: "Дизайнерская кепка" },
      sources: ["free_accessory", "premium_rare"]
    },
    urban_shades: {
      id: "urban_shades", slot: "glasses", rarity: "rare", icon: "😎",
      asset: "./assets/equipment_glasses.png",
      name: { en: "Urban Shades", ru: "Уличные очки" },
      sources: ["free_accessory", "premium_rare"]
    },
    street_jacket: {
      id: "street_jacket", slot: "jacket", rarity: "rare", icon: "🧥",
      asset: "./assets/equipment_jacket.png",
      name: { en: "Premium Street Jacket", ru: "Премиум уличная куртка" },
      sources: ["premium_rare"]
    },
    limited_sneakers: {
      id: "limited_sneakers", slot: "shoes", rarity: "rare", icon: "👟",
      asset: "./assets/equipment_sneakers.png",
      name: { en: "Limited Sneakers", ru: "Лимитированные кроссовки" },
      sources: ["premium_rare"]
    },

    neon_jacket: {
      id: "neon_jacket", slot: "jacket", rarity: "epic", icon: "💜",
      asset: "./assets/equipment_jacket.png",
      name: { en: "Neon Jacket", ru: "Неоновая куртка" },
      sources: ["free_accessory", "premium_rare", "premium_epic"]
    },
    tech_pants: {
      id: "tech_pants", slot: "pants", rarity: "epic", icon: "👖",
      asset: "./assets/equipment_pants.png",
      name: { en: "Techwear Pants", ru: "Техно-брюки" },
      sources: ["premium_epic"]
    },
    chrono_watch: {
      id: "chrono_watch", slot: "accessory", rarity: "epic", icon: "⌚",
      asset: "./assets/equipment_watch.png",
      name: { en: "Chrono Watch", ru: "Хроно-часы" },
      sources: ["premium_epic"]
    },
    elite_shades: {
      id: "elite_shades", slot: "glasses", rarity: "epic", icon: "🕶️",
      asset: "./assets/equipment_glasses.png",
      name: { en: "Elite Shades", ru: "Элитные очки" },
      sources: ["premium_epic"]
    },

    crown_cap: {
      id: "crown_cap", slot: "cap", rarity: "legendary", icon: "👑",
      asset: "./assets/equipment_cap.png",
      name: { en: "Royal Crown", ru: "Королевская корона" },
      sources: ["premium_epic", "premium_legendary"]
    },
    royal_coat: {
      id: "royal_coat", slot: "jacket", rarity: "legendary", icon: "🤵",
      asset: "./assets/equipment_jacket.png",
      name: { en: "Royal Coat", ru: "Королевское пальто" },
      sources: ["premium_legendary"]
    },
    diamond_watch: {
      id: "diamond_watch", slot: "accessory", rarity: "legendary", icon: "💎",
      asset: "./assets/equipment_watch.png",
      name: { en: "Diamond Watch", ru: "Бриллиантовые часы" },
      sources: ["premium_legendary"]
    },
    imperial_shoes: {
      id: "imperial_shoes", slot: "shoes", rarity: "legendary", icon: "✨",
      asset: "./assets/equipment_sneakers.png",
      name: { en: "Imperial Sneakers", ru: "Имперские кроссовки" },
      sources: ["premium_legendary"]
    }
  },

  /* ==========================================================
     RANDOM FLYING EVENTS
  ========================================================== */

  RANDOM_EVENTS: {
    MIN_INTERVAL_SECONDS: 120,
    MAX_INTERVAL_SECONDS: 300,
    VISIBLE_SECONDS: 5,

    EVENTS: {
      tap_boost: {
        id: "tap_boost",
        type: "tapMultiplier",
        icon: "🦋",
        weight: 65,
        multiplier: 2,
        durationSeconds: 180,
        name: { en: "Lucky Butterfly", ru: "Счастливая бабочка" }
      },

      energy_drop: {
        id: "energy_drop",
        type: "energy",
        icon: "⚡",
        weight: 35,
        amount: 20,
        name: { en: "Energy Drop", ru: "Энергетический бонус" }
      }
    }
  },

  EXCLUSIVE_CARDS: {
    founder: {
      id: "founder", rarity: "exclusive", purchaseType: "special",
      asset: "./assets/character_boss.png",
      name: { en: "Empire Founder", ru: "Основатель Империи" },
      description: { en: "+10% Global Income", ru: "+10% ко всему доходу" }
    },
    golden_tycoon: {
      id: "golden_tycoon", rarity: "exclusive", purchaseType: "special",
      asset: "./assets/character_tycoon.png",
      name: { en: "Golden Tycoon", ru: "Золотой Магнат" },
      description: { en: "+15% Critical Income", ru: "+15% критического дохода" }
    },
    neon_king: {
      id: "neon_king", rarity: "exclusive", purchaseType: "special",
      asset: "./assets/collection_influencer.png",
      name: { en: "Neon King", ru: "Неоновый Король" },
      description: { en: "+15% Energy Regen", ru: "+15% восстановления энергии" }
    }
  },

  SHOP_UNLOCK_LEVELS: {
    energyRefill: 3,
    income24h: 5,
    tap5x1h: 6,
    offline3x: 8,
    "offline-cap": 10,
    "auto-collect": 12,
    "event-booster": 15,
    "business-booster": 18,
    "lucky-events": 20,
    gemPacks: 2,
    premiumCase: 5,
    outfitSkin: 5,
    hustleBundle: 10,
    empirePass: 5
  },

  SHOP_PRICES: {
    HUSTLE_PASS_MONTHLY: 250,
    GEMS: {
      gems100: { gems: 100, stars: 50 },
      gems500: { gems: 500, stars: 120 },
      gems1200: { gems: 1200, stars: 300 }
    }
  },

  SHOP_GEM_COSTS: {
    income24h: 100,
    offline3x: 180,
    "offline-cap": 120,
    "auto-collect": 250,
    "event-booster": 150,
    tap5x1h: 120,
    energyRefill: 120,
    "business-booster": 200,
    "lucky-events": 120,
    premiumCase: 250,
    outfitSkin: 400,
    hustleBundle: 1000
  }
};
