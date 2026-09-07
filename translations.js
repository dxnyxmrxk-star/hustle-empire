/* ============================================================
   HUSTLE EMPIRE — CENTRAL EN/RU TRANSLATIONS
   Version 21.0

   Canonical translation engine.

   Responsibilities:
   - English / Russian dictionaries
   - Language detection
   - Language persistence
   - DOM translations
   - Dynamic DOM translation observer
   - Translation auditing
   - Compatibility aliases for current game.js

   IMPORTANT:
   script.js DOES NOT own language state anymore.
============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     CONFIGURATION
  ========================================================== */

  const STORAGE_KEY = "hustleEmpireLanguageV2";

  /*
   * V21 keeps these historical keys during migration.
   *
   * Do not remove them yet because existing players may have
   * their language preference stored there.
   */
  const LEGACY_STORAGE_KEYS = Object.freeze([
    "urbanTycoonLanguageV1",
    "hustleEmpireLanguage"
  ]);

  const SUPPORTED = Object.freeze([
    "en",
    "ru"
  ]);

  /* ==========================================================
     TRANSLATIONS
  ========================================================== */

  const TRANSLATIONS = Object.freeze({

    /* ========================================================
       ENGLISH
    ======================================================== */

    en: Object.freeze({

      /* APP */

      "app.title": "Hustle Empire",

      "language.switchToRussian": "Switch to Russian",
      "language.switchToEnglish": "Switch to English",

      /* HUD */

      "hud.player": "Player",
      "hud.xp": "XP",
      "hud.money": "Money",
      "hud.energy": "Energy",
      "hud.gems": "Gems",
      "hud.notifications": "Notifications",
      "hud.leaderboard": "Leaderboard",
      "hud.menu": "Menu",
      "hud.boost": "⚡ Boost {multiplier}: {time}",

      /* COMMON */

      "common.buy": "Buy",
      "common.claim": "Claim",
      "common.close": "Close",
      "common.continue": "Continue",
      "common.done": "Done",
      "common.levelShort": "LV",
      "common.locked": "Locked",
      "common.max": "MAX",
      "common.new": "NEW",
      "common.unknown": "Unknown",
      "common.textUnavailable": "Text unavailable",
      "common.ok": "OK",
      "common.requiresLevel": "Requires LV {level}",
      "common.upgrade": "Upgrade",

      /* NAVIGATION */

      "nav.home": "Home",
      "nav.city": "City",
      "nav.cases": "Cases",
      "nav.collection": "Cards",
      "nav.wardrobe": "Wardrobe",
      "nav.shop": "Shop",

      /* CHARACTER SELECT */

      "characterSelect.eyebrow": "WELCOME TO HUSTLE EMPIRE",

      "characterSelect.title":
        "Choose your character",

      "characterSelect.subtitle":
        "Pick the character that will represent you across your empire.",

      "characterSelect.male":
        "Man",

      "characterSelect.maleHint":
        "Build your empire with the male character.",

      "characterSelect.female":
        "Woman",

      "characterSelect.femaleHint":
        "Build your empire with the female character.",

      "characterSelect.savedHint":
        "Your choice is saved automatically with your game progress.",

      /* HOME */

      "home.tagline":
        "Small steps. Big empire.",

      "home.dailyChallenges":
        "Daily Challenges",

      "home.dailyChallengesProgressZero":
        "0/3 completed",

      "home.dailyChallengesComplete":
        "Completed ✓",

      "home.dailyChallengesProgress":
        "{completed}/3 completed",

      "home.socialTasks":
        "Social Tasks",

      "home.dailyRewards":
        "Daily Rewards",

      "home.socialTasksHint":
        "Complete tasks and claim rewards",

      "home.dailyChest":
        "Daily Chest",

      "home.streak":
        "Hustle Streak",

      "home.offlineEarnings":
        "Offline Earnings",

      "home.quickHustle":
        "Quick Hustle",

      "home.tapToEarn":
        "Tap to Earn",

      "home.missions":
        "Missions",

      "home.nextLevel":
        "Next Level",

      "home.quickActivity":
        "Quick Jobs",

      "home.quickJobs":
        "Quick Jobs",

      "home.completed":
        "Completed",

      "home.missionsCompletedCount":
        "{completed}/{total} missions completed",

      /* MISSIONS */

      "missions.taps":
        "Tap {target} times",

      "missions.jobs":
        "Complete quick jobs: {target}",

      "missions.earn":
        "Earn {target}",

      "missions.upgrades":
        "Buy upgrades: {target}",

      "missions.bonuses":
        "Collect bonuses: {target}",

      "missions.events":
        "Join events: {target}",

      /* QUICK HUSTLES */

      "hustles.jobFallback":
        "Quick Job",

      "hustles.energyCost":
        "Energy",

      "hustles.moneyReward":
        "Reward",

      "hustles.xpReward":
        "XP",

      /* HOME BUSINESS */

      "home.empireManagement":
        "Empire Management",

      "home.activeBusinesses":
        "Active Businesses",

      "home.totalIncome":
        "Total Income",

      "home.passiveIncome":
        "Passive Income",

      "home.perTap":
        "per tap",

      /* CITY */

      "city.districtActivity":
        "District Activity",

      "city.unlocked":
        "Unlocked",

      "city.poorBlock":
        "POOR BLOCK",

      "city.starterDistrict":
        "Starter District",

      "city.cityCenter":
        "CITY CENTER",

      "city.cityHustles":
        "City Hustles",

      "city.businessDistrict":
        "BUSINESS DISTRICT",

      "city.bigBusiness":
        "Big Business",

      "city.richSkyline":
        "RICH SKYLINE",

      "city.endgameEmpire":
        "Endgame Empire",

      "city.rangePoor":
        "LV 1–10",

      "city.rangeCenter":
        "LV 11–20",

      "city.rangeBusiness":
        "LV 21–30",

      "city.rangeRich":
        "LV 31–40+",

      /* DISTRICTS */

      "districts.poor_block.name":
        "POOR BLOCK",

      "districts.poor_block.tagline":
        "Starter District",

      "districts.poor_block.range":
        "LV 1–10",

      "districts.city_center.name":
        "CITY CENTER",

      "districts.city_center.tagline":
        "City Hustles",

      "districts.city_center.range":
        "LV 11–20",

      "districts.business_district.name":
        "BUSINESS DISTRICT",

      "districts.business_district.tagline":
        "Big Business",

      "districts.business_district.range":
        "LV 21–30",

      "districts.rich_skyline.name":
        "RICH SKYLINE",

      "districts.rich_skyline.tagline":
        "Endgame Empire",

      "districts.rich_skyline.range":
        "LV 31–40+",

      /* CASES */

      "cases.rewards":
        "Rewards",

      "cases.title":
        "Cases",

      "cases.helper":
        "Come back when the timer finishes or spend Gems to unlock instantly.",

      "cases.caseOpened":
        "Case opened",

      "cases.reward":
        "Reward",

      "cases.money":
        "Money",

      "cases.gems":
        "Gems",

      "cases.fragments":
        "Fragments",

      "cases.open":
        "Open",

      "cases.ready":
        "Ready",

      "cases.unlockNow":
        "Unlock now",

      "cases.caseUnlockNow":
        "Unlock now",

      "cases.unlockWith":
        "Unlock with",

      "cases.unlockWithGems":
        "Unlock with Gems",

      /*
       * Historical key containing a space.
       * Kept because current game.js may still reference it.
       */
      "cases.unlockWith Gems":
        "Unlock with Gems",

      "cases.caseWaiting":
        "Waiting",

      "caseNames.case_2h":
        "2-Hour Case",

      "caseNames.case_4h":
        "4-Hour Case",

      "caseNames.case_8h":
        "8-Hour Case",

      "caseNames.case_24h":
        "24-Hour Case",

      "cases.waiting":
        "Waiting",

      "cases.durationHours":
        "{hours}h",

      "cases.fragmentsZero":
        "+0 Fragments",

      "cases.timer":
        "Time remaining",

      "cases.case_2h":
        "2-Hour Case",

      "cases.case_4h":
        "4-Hour Case",

      "cases.case_8h":
        "8-Hour Case",

      "cases.case_24h":
        "24-Hour Case",

      /* ACCESSORY CASES */

      "accessoryCases":
        "Accessory Cases",

      "accessory.uses.true":
        "Accessories included",

      "accessory.uses.false":
        "No accessories included",

      "accessoryCases.eyebrow":
        "Wardrobe Loot",

      "accessoryCases.title":
        "Premium Accessory Cases",

      "accessoryCases.gemsOnly":
        "Gems Only",

      "accessoryCases.newItem":
        "New Item",

      "accessoryCases.collectionComplete":
        "Collection complete",

      "accessoryCases.openFree":
        "Open free",

      "accessoryCases.ready":
        "Ready",

      "accessoryCases.waiting":
        "Waiting",

      "accessoryCases.itemPlaceholder":
        "Item",

      "accessoryCaseNames.free_accessory":
        "Free Accessory Case",

      "accessoryCaseNames.premium_rare":
        "Rare Accessory Case",

      "accessoryCaseNames.premium_epic":
        "Epic Accessory Case",

      "accessoryCaseNames.premium_legendary":
        "Legendary Accessory Case",

      "accessoryCases.free_accessory":
        "Free Accessory Case",

      "accessoryCases.premium_rare":
        "Rare Accessory Case",

      "accessoryCases.premium_epic":
        "Epic Accessory Case",

      "accessoryCases.premium_legendary":
        "Legendary Accessory Case",

      "accessorySources.unknown":
        "Accessory Case",

      "accessorySources.free":
        "Free Case",

      "accessorySources.rare":
        "Rare Case",

      "accessorySources.epic":
        "Epic Case",

      "accessorySources.legendary":
        "Legendary Case",

      /* COLLECTION */

      "collection.book":
        "Collection Book",

      "collection.specialCollection":
        "Special Collection",

      "collection.exclusiveTitle":
        "Special Exclusive Cards",

      "collection.exclusiveLabel":
        "Exclusive",

      "collection.exclusiveSubtitle":
        "These cards cannot be obtained from normal cases.",

      "collection.businessCard":
        "Business Card",

      "collection.rpgCard":
        "RPG Card",

      "collection.levelUp":
        "Level Up",

      "collection.specialPurchase":
        "Special Purchase",

      "collection.unlock":
        "Unlock",

      "collection.cardPlaceholder":
        "Card",

      "collection.summaryZero":
        "0 / 10 cards",

      "collection.summaryCount":
        "{unlocked} / {total} cards",

      "collection.fragments":
        "Fragments",

      "collection.fragmentsProgress":
        "{current}/{required} fragments",

      "collection.bonus":
        "Bonus",

      /* CARD BONUSES */

      "cards.bonus.businessIncomePercent":
        "+{value}% Income",

      "cards.bonus.tapPowerFlat":
        "+{value} Tap Power",

      "cards.bonus.criticalRatePercent":
        "+{value}% Critical Rate",

      "cards.bonus.criticalDamagePercent":
        "+{value}% Critical Damage",

      "cards.bonus.energyMaxFlat":
        "+{value} Max Energy",

      "cards.bonus.energyRegenSpeedPercent":
        "+{value}% Energy Regen",

      /* SPECIAL CARDS */

      "cards.founder.description":
        "Exclusive founder card for early empire builders.",

      "cards.golden_tycoon.description":
        "Premium exclusive card for elite empire builders.",

      "cards.neon_king.description":
        "Exclusive neon-era card for high-prestige empire builders.",

      "cards.gym_income.name":
        "Gym Income",

      "cards.coffee_income.name":
        "Coffee Income",

      "cards.delivery_income.name":
        "Delivery Income",

      "cards.garage_income.name":
        "Garage Income",

      "cards.nightclub_income.name":
        "Nightclub Income",

      "cards.tap_power.name":
        "Tap Power",

      "cards.critical_rate.name":
        "Critical Rate",

      "cards.critical_damage.name":
        "Critical Damage",

      "cards.energy_max.name":
        "Max Energy",

      "cards.energy_regen.name":
        "Energy Regen",

      "cards.founder.name":
        "Founder",

      "cards.golden_tycoon.name":
        "Golden Tycoon",

      "cards.neon_king.name":
        "Neon King",

      /* RARITY */

      "rarity.common":
        "Common",

      "rarity.rare":
        "Rare",

      "rarity.epic":
        "Epic",

      "rarity.legendary":
        "Legendary",

      "rarity.mythic":
        "Mythic",

      /* BUSINESS */

      "business.available":
        "Available",

      "business.owned":
        "Owned",

      "business.locked":
        "Locked",

      "business.active":
        "Active",

      "business.incomePerSecond":
        "Income / s",

      "business.incomePerHour":
        "Income / h",

      "business.zeroPerHour":
        "0 / h",

      "business.unlockAtLevel":
        "Unlocks at LV {level}",

      "home.noActiveBusinesses":
        "Buy your first business in the City.",

      "businesses.kiosk.name":
        "Street Kiosk",

      "businesses.laundry.name":
        "Laundry",

      "businesses.gym.name":
        "Gym",

      "businesses.pizza.name":
        "Pizza Shop",

      "businesses.barber.name":
        "Barber Shop",

      "businesses.autodealer.name":
        "Auto Dealer",

      "businesses.club.name":
        "Club",

      "businesses.hotel.name":
        "Hotel",

      "businesses.bank.name":
        "Bank",

      "businesses.cafe.name":
        "Café",

      "businesses.bar.name":
        "Bar",

      "businesses.restaurant.name":
        "Restaurant",

      "businesses.office.name":
        "Office",

      "businesses.car_dealer.name":
        "Car Dealer",

      "businesses.agency.name":
        "Agency",

      "businesses.nightclub.name":
        "Nightclub",

      "businesses.luxury_hotel.name":
        "Luxury Hotel",

      "businesses.empire_tower.name":
        "Empire Tower",

      /* HUSTLES */

      "hustles.completed":
        "Completed",

      "hustles.notEnoughEnergy":
        "Not enough energy",

      "hustles.run":
        "Run",

      /* RANDOM EVENTS */

      "randomEvents.energyReward":
        "+{amount} Energy",

      "randomEvents.tapBoostReward":
        "Tap boost activated",

      "randomEvents.bonusTitle":
        "BONUS!",

      "randomEvents.tapX2":
        "Tap x2",

      /* STATS */

      "stats.income":
        "Income",

      "stats.tapPower":
        "Tap Power",

      "stats.criticalRate":
        "Critical Rate",

      "stats.criticalDamage":
        "Critical Damage",

      "stats.maxEnergy":
        "Max Energy",

      "stats.energyRegen":
        "Energy Regen",

      /* WARDROBE */

      "wardrobe.title":
        "Wardrobe",

      "wardrobe.tabs.items":
        "Items",

      "wardrobe.tabs.sets":
        "Style Sets",

      "wardrobe.catalog":
        "Accessory Catalog",

      "wardrobe.collection":
        "Collection",

      "wardrobe.outfitProgress":
        "Outfit Progress",

      "wardrobe.unlockSlot":
        "Buy LV 1 to unlock",

      "wardrobe.totalStats":
        "Total Stat Bonuses",

      "wardrobe.buyLevelOne":
        "Buy LV 1",

      "wardrobe.completeSet":
        "Complete set",

      "wardrobe.maxLevel":
        "Max Level",

      "wardrobe.requiredEquipmentLevel":
        "Requires equipment LV {level}",

      "wardrobe.setComplete":
        "Set complete",

      "wardrobe.slotLocked":
        "Slot locked",

      "wardrobe.styleSetProgress":
        "Style Set Progress",

      "wardrobe.unlockSource":
        "Source",

      "wardrobe.unlocked":
        "Unlocked",

      "wardrobe.upgradeToLevel":
        "Upgrade to LV {level}",

      "wardrobe.upgradeByLevel":
        "Upgrade to LV {level}",

      "wardrobe.upgradeByLevelCost":
        "Upgrade to LV {level}",

      /* WARDROBE ITEMS */

      "wardrobeItems.designer_cap.name":
        "Designer Cap",

      "wardrobeItems.urban_shades.name":
        "Urban Shades",

      "wardrobeItems.street_jacket.name":
        "Street Jacket",

      "wardrobeItems.limited_sneakers.name":
        "Limited Sneakers",

      "wardrobeItems.neon_jacket.name":
        "Neon Jacket",

      "wardrobeItems.tech_pants.name":
        "Tech Pants",

      "wardrobeItems.chrono_watch.name":
        "Chrono Watch",

      "wardrobeItems.elite_shades.name":
        "Elite Shades",

      "wardrobeItems.crown_cap.name":
        "Crown Cap",

      "wardrobeItems.royal_coat.name":
        "Royal Coat",

      "wardrobeItems.diamond_watch.name":
        "Diamond Watch",

      "wardrobeItems.imperial_shoes.name":
        "Imperial Shoes",

      /* EQUIPMENT */

      "equipment.cap.stage1.name":
        "Canvas Cap",

      "equipment.cap.stage5.name":
        "Designer Snapback",

      "equipment.cap.stage10.name":
        "Empire Crown",

      "equipment.glasses.stage1.name":
        "Basic Glasses",

      "equipment.glasses.stage5.name":
        "Street Shades",

      "equipment.glasses.stage10.name":
        "Diamond Shades",

      "equipment.jacket.stage1.name":
        "Street Jacket",

      "equipment.jacket.stage5.name":
        "Brand Jacket",

      "equipment.jacket.stage10.name":
        "Luxury Suit",

      "equipment.pants.stage1.name":
        "Basic Jeans",

      "equipment.pants.stage5.name":
        "Streetwear Pants",

      "equipment.pants.stage10.name":
        "Executive Pants",

      "equipment.shoes.stage1.name":
        "Basic Sneakers",

      "equipment.shoes.stage5.name":
        "Limited Sneakers",

      "equipment.shoes.stage10.name":
        "Luxury Shoes",

      "equipment.accessory.stage1.name":
        "Basic Watch",

      "equipment.accessory.stage5.name":
        "Designer Watch",

      "equipment.accessory.stage10.name":
        "Diamond Watch",

      /* STYLE SETS */

      "styleSets.street_set.name":
        "Street Starter",

      "styleSets.street_set.description":
        "Own all 6 equipment pieces at LV 1 or higher.",

      "styleSets.brand_set.name":
        "Designer Streetwear",

      "styleSets.brand_set.description":
        "Raise all 6 equipment pieces to LV 5.",

      "styleSets.empire_set.name":
        "Empire Luxury",

      "styleSets.empire_set.description":
        "Reach LV 10 with every equipment piece.",

      "wardrobe.itemLevelName":
        "{slot} · LV {level}",

      "wardrobe.styleSetFallback":
        "Style Set",

      "wardrobe.styleSetDescriptionFallback":
        "Upgrade the required equipment to complete this set.",

      "wardrobe.character":
        "Character",

      "wardrobe.zeroIncome":
        "★ +0% Income",

      "wardrobe.zeroTapPower":
        "★ +0% Tap Power",

      "wardrobe.zeroCriticalRate":
        "★ +0% Critical Rate",

      "wardrobe.zeroCriticalDamage":
        "★ +0% Critical Damage",

      "wardrobe.zeroMaxEnergy":
        "★ +0 Max Energy",

      "wardrobe.zeroEnergyRegen":
        "★ +0% Energy Regen",

      /* WARDROBE SLOTS */

      "wardrobeSlots.cap":
        "Headwear",

      "wardrobeSlots.hat":
        "Headwear",

      "wardrobeSlots.glasses":
        "Glasses",

      "wardrobeSlots.jacket":
        "Jacket",

      "wardrobeSlots.pants":
        "Pants",

      "wardrobeSlots.shoes":
        "Shoes",

      "wardrobeSlots.accessory":
        "Accessory",

      "wardrobeSlots.watch":
        "Accessory",

      /* SHOP */

      "shop.title":
        "Shop",

      "shop.boosts":
        "Boosts & Upgrades",

      "shop.income2x":
        "2x Offline Income",

      "shop.income3x":
        "3x Offline Income",

      "shop.sevenDays":
        "For 7 days",

      "shop.offlineCap":
        "Offline Cap +24h",

      "shop.extendsLimit":
        "Extends the limit",

      "shop.autoCollect":
        "Auto-Collect",

      "shop.automaticCollection":
        "Automatic collection",

      "shop.eventBooster":
        "Event Booster",

      "shop.bonus24h":
        "+50% for 24 hours",

      "shop.tapBoost":
        "Tap Power Boost",

      "shop.bonus12h":
        "+100% for 12 hours",

      "shop.energyPack":
        "Energy Pack",

      "shop.energy500":
        "+500 Energy",

      "shop.businessBooster":
        "Business Booster",

      "shop.income12h":
        "+100% Income 12h",

      "shop.luckyEvents":
        "Lucky Events",

      "shop.chance50":
        "+50% event chance",

      "shop.gems":
        "Gems",

      "shop.premiumCase":
        "Premium Case",

      "shop.premiumCaseDesc":
        "Open a premium case",

      "shop.outfitSkin":
        "Outfit / Skin",

      "shop.outfitSkinDesc":
        "Unlock new outfits",

      "shop.hustleBundle":
        "Hustle Bundle",

      "shop.hustleBundleDesc":
        "Bonus Gems, case and accessory in one bundle.",

      "shop.empirePass":
        "Empire Pass",

      "shop.empirePassDesc":
        "Monthly premium rewards and progression bonuses",

      "shop.perMonth":
        "{price} ★ / month",

      /* OFFLINE */

      "offline.kicker":
        "OFFLINE EARNINGS",

      /*
       * Historical typo retained for current game.js compatibility.
       */
      "offline.hicker":
        "OFFLINE EARNINGS",

      "offline.welcome":
        "Welcome back!",

      "offline.accumulated":
        "Accumulated",

      "offline.maxCap":
        "Maximum: 3 hours",

      "offline.cappedAway":
        "Maximum: 3 hours",

      "offline.awayHoursMinutes":
        "You were away for: {hours}h {minutes}m",

      "offline.awayMinutes":
        "You were away for: {minutes}m",

      "offline.awayLessMinute":
        "You were away for less than a minute",

      "offline.awayExample":
        "You were away for: 2h 15m",

      "offline.claimAmount":
        "Claim ${amount}",

      /* GENERIC MODALS */

      "modal.dailyChest":
        "Daily Chest",

      "modal.dailyChestText":
        "Come back when the timer reaches zero to claim your Daily Chest.",

      "modal.dailyChestRemaining":
        "Time remaining: {time}",

      "modal.notifications":
        "Notifications",

      "modal.notificationsText":
        "Rewards, completed missions, events and offline income appear here.",

      "modal.settings":
        "Settings",

      "modal.settingsText":
        "Audio, language, notifications and Telegram account settings.",

      "modal.offline":
        "Offline Earnings",

      "modal.offlineText":
        "Your businesses keep generating income while you are offline.",

      "modal.levelUp":
        "Level Up",

      "modal.levelUpText":
        "Complete missions to unlock the next level.",

      "modal.setBonus":
        "Set Bonus",

      "modal.setBonusText":
        "Complete equipment and card sets to unlock permanent bonuses.",

      "modal.premiumPlaceholder":
        "Telegram Stars payment will open here when payments are enabled.",

      /* DAILY */

      "daily.closeAria":
        "Close Daily Challenges",

      "daily.title":
        "Daily Challenges",

      "daily.eyebrow":
        "DAILY HUSTLE",

      "daily.reset":
        "RESET",

      "daily.comboEyebrow":
        "DAILY COMBO",

      "daily.cipherEyebrow":
        "DAILY CIPHER",

      "daily.streakEyebrow":
        "7-DAY STREAK",

      "daily.checkinTitle":
        "Daily Check-in",

      "daily.subtitle":
        "Complete today’s activities and come back tomorrow for a new rotation.",

      "daily.comboTitle":
        "Daily Combo",

      "daily.comboHint":
        "Buy or upgrade the 3 targets selected for today.",

      "daily.grandReward":
        "Grand reward",

      "daily.comboRewardClaimed":
        "✓ Reward claimed: {reward}",

      "daily.comboMaxReward":
        "Grand reward: {reward}",

      "daily.cipherTitle":
        "Morse Cipher",

      "daily.cipherHint":
        "Decode the Morse sequence into the correct digit.",

      "daily.answerAria":
        "Morse digit answer",

      "daily.decipherCode":
        "Decode",

      "daily.cipherDefault":
        "Convert Morse into the correct digit (0–9).",

      "daily.solved":
        "Solved ✓",

      "daily.reward":
        "Reward: {reward}",

      "daily.wrong":
        "Wrong code. Try again.",

      "daily.success":
        "Correct! Reward credited.",

      "daily.checkinHint":
        "Log in every day to grow your reward streak.",

      "daily.day":
        "DAY {day}",

      "daily.days":
        "{count} days",

      "daily.claimDay":
        "Claim Day {day}",

      "daily.claimDay1":
        "Claim Day 1",

      "daily.claimedToday":
        "Claimed today ✓",

      "daily.checkinSuccess":
        "Check-in claimed!",

      "daily.alreadyClaimed":
        "You already claimed today’s reward.",

      "daily.streakResetHint":
        "Miss a day and the streak resets to 1.",

      /* LEVEL UP */

      "levelUp.title":
        "LEVEL UP! LEVEL {level}",

      "levelUp.subtitle":
        "New level reached. Your rewards are already in your account.",

      "levelUp.gems":
        "♦ +{amount} Gems",

      "levelUp.earningsBoost":
        "⚡ {multiplier} earnings · {time}",

      "levelUp.inventory":
        "Inventory: {caseName} ×{count}",

      "levelUp.claim":
        "Claim and Use the Boost!",

      "levelUp.case.street":
        "Street Case",

      "levelUp.case.boss":
        "Boss Case",

      "levelUp.case.tycoon":
        "Tycoon Case",

      /* LEADERBOARD */

      "leaderboard.seasonRanking":
        "SEASON RANKING",

      "leaderboard.title":
        "Leaderboard",

      "leaderboard.subtitle":
        "Climb the ranking by increasing your income per second.",

      "leaderboard.countdownAria":
        "Season countdown",

      "leaderboard.seasonEndsIn":
        "Season ends in",

      "leaderboard.rewardsAtClose":
        "Rewards are distributed when the season ends",

      "leaderboard.supportAria":
        "Leaderboard rewards and offer",

      "leaderboard.seasonRewards":
        "SEASON REWARDS",

      "leaderboard.endSeasonRewards":
        "End-of-season rewards",

      "leaderboard.reward1000Gems":
        "1,000 Gems",

      "leaderboard.legendaryAccessory":
        "+ Legendary Accessory",

      "leaderboard.reward500Gems":
        "500 Gems",

      "leaderboard.exclusiveAccessory":
        "+ Exclusive Accessory",

      "leaderboard.reward150Gems":
        "150 Gems",

      "leaderboard.epicAccessoryCase":
        "+ Epic Accessory Case",

      "leaderboard.flashOffer":
        "⚡ FLASH OFFER",

      "leaderboard.doubleIncomeBoost":
        "x2 Income Boost",

      "leaderboard.doubleIncomePitch":
        "Double your income for 30 minutes and climb the ranking.",

      "leaderboard.activeProductionOnly":
        "Applies to active production. Does not increase offline earnings.",

      "leaderboard.activateX2":
        "ACTIVATE x2",

      "leaderboard.topTycoons":
        "TOP TYCOONS",

      "leaderboard.top3Short":
        "TOP 3",

      "leaderboard.top10Short":
        "TOP 10",

      "leaderboard.youBadge":
        "YOU",

      "leaderboard.globalRanking":
        "Global Ranking",

      "leaderboard.season01":
        "SEASON 01",

      "leaderboard.player":
        "Player",

      "leaderboard.incomePerSecond":
        "Income / s",

      "leaderboard.listAria":
        "Player ranking",

      "leaderboard.currentAvatar":
        "Your avatar",

      "leaderboard.you":
        "You",

      "leaderboard.yourPosition":
        "YOUR POSITION",

      "leaderboard.prestige":
        "Prestige",

      "leaderboard.rewardMax":
        "#1 · Maximum reward",

      "leaderboard.rewardTop3":
        "Top 3 · #{rank}",

      "leaderboard.rewardTop10":
        "Top 10 · #{rank}",

      "leaderboard.rewardOutside":
        "#{rank} · Outside Top 10",

      "leaderboard.defendFirst":
        "You’re already #1 — defend first place.",

      "leaderboard.gapPrestige":
        "You need {gap} more Prestige to reach #{rank}.",

      "leaderboard.gapIncome":
        "You need {gap} more to reach #{rank}.",

      "leaderboard.boostTimeRemaining":
        "Boost time remaining",

      "leaderboard.offerTimeRemaining":
        "Offer time remaining",

      "leaderboard.boostActiveButton":
        "BOOST ACTIVE",

      "leaderboard.expiredButton":
        "EXPIRED",

      "leaderboard.activateButton":
        "ACTIVATE x2",

      "leaderboard.boostActiveStatus":
        "Income x{multiplier} active · ends in {time}",

      "leaderboard.offerExpiredStatus":
        "This season’s offer has ended.",

      "leaderboard.offerAffordableStatus":
        "x2 Income for 30 minutes · does not increase offline earnings.",

      "leaderboard.offerNeedGemsStatus":
        "You need {gems} Gems · tap to open the Shop.",

      /* TIME */

      "time.dayShort":
        "d",

      "time.hourShort":
        "h",

      "time.minuteShort":
        "m",

      /* SOCIAL */

      "social.openAria":
        "Open Daily Tasks & Rewards",

      "social.closeAria":
        "Close Daily Tasks & Rewards",

      "social.eyebrow":
        "SOCIAL REWARDS",

      "social.title":
        "Daily Tasks & Rewards",

      "social.subtitle":
        "Complete social tasks to earn extra rewards.",

      "social.progressToday":
        "TODAY’S PROGRESS",

      "social.daily":
        "Daily",

      "social.resetsEvery24h":
        "Resets every 24h",

      "social.reset24h":
        "Reset in 24h",

      "social.resetCountdown":
        "Reset in {hours}h {minutes}m",

      "social.dailyReward":
        "Daily Reward",

      "social.dailyRewardHint":
        "Log in every day and claim the reward",

      "social.rewardAvailableAria":
        "Reward available",

      "social.socialCommunity":
        "Social & Community",

      "social.completeOnce":
        "Complete once",

      "social.joinTelegram":
        "Join the Telegram channel",

      "social.officialChannel":
        "Hustle Empire Official",

      "social.followX":
        "Follow Hustle Empire on X",

      "social.followOfficialProfile":
        "Follow the official profile",

      "social.invite3":
        "Invite 3 friends",

      "social.invite3Zero":
        "0 / 3 friends invited",

      "social.invite10":
        "Invite 10 friends",

      "social.invite10Zero":
        "0 / 10 friends invited",

      "social.visitCommunity":
        "Visit the Community",

      "social.openOfficialCommunity":
        "Open the official community",

      "social.newTasksDaily":
        "New tasks are available every day.",

      "social.claimed":
        "Reward claimed",

      "social.claimReady":
        "Reward ready to claim",

      "social.verifying":
        "Verifying...",

      "social.inviteProgress":
        "{progress} / {target} friends invited",

      "social.completeTask":
        "Complete the task",

      "social.statusCompleted":
        "Completed",

      "social.statusRewardAvailable":
        "Reward available",

      "social.statusVerifying":
        "Verification in progress",

      "social.statusPending":
        "To complete",

      "social.shareText":
        "Play Hustle Empire with me!",

      /* NOTIFICATIONS */

      "notifications.eyebrow":
        "EMPIRE ALERTS",

      "notifications.title":
        "Notifications",

      "notifications.subtitle":
        "Useful updates about your empire.",

      "notifications.closeAria":
        "Close notifications",

      "notifications.dailyTitle":
        "Daily Challenges",

      "notifications.dailyMessage":
        "{completed}/3 completed · finish the activities before reset.",

      "notifications.nextLevelTitle":
        "Next Level ready",

      "notifications.nextLevelMessage":
        "You completed all {count} missions for level {level}.",

      "notifications.boostTitle":
        "Income boost active",

      "notifications.boostMessage":
        "{multiplier} for another {time}.",

      "notifications.count":
        "{count} notifications",

      "notifications.none":
        "No new notifications",

      "notifications.allClear":
        "Everything under control",

      "notifications.noUrgent":
        "There are no urgent notifications right now."

    }),


    /* ========================================================
       RUSSIAN
    ======================================================== */

    ru: Object.freeze({

      /* APP */

      "app.title":
        "Hustle Empire",

      "language.switchToRussian":
        "Переключить на русский",

      "language.switchToEnglish":
        "Переключить на английский",

      /* HUD */

      "hud.player":
        "Игрок",

      "hud.xp":
        "Опыт",

      "hud.money":
        "Деньги",

      "hud.energy":
        "Энергия",

      "hud.gems":
        "Кристаллы",

      "hud.notifications":
        "Уведомления",

      "hud.leaderboard":
        "Лидерборд",

      "hud.menu":
        "Меню",

      "hud.boost":
        "⚡ Буст {multiplier}: {time}",

      /* COMMON */

      "common.buy":
        "Купить",

      "common.claim":
        "Забрать",

      "common.close":
        "Закрыть",

      "common.continue":
        "Продолжить",

      "common.done":
        "Готово",

      "common.levelShort":
        "УР",

      "common.locked":
        "Закрыто",

      "common.max":
        "МАКС",

      "common.new":
        "НОВОЕ",

      "common.unknown":
        "Неизвестно",

      "common.textUnavailable":
        "Текст недоступен",

      "common.ok":
        "OK",

      "common.requiresLevel":
        "Требуется УР {level}",

      "common.upgrade":
        "Улучшить",

      /* NAV */

      "nav.home":
        "Главная",

      "nav.city":
        "Город",

      "nav.cases":
        "Кейсы",

      "nav.collection":
        "Карты",

      "nav.wardrobe":
        "Гардероб",

      "nav.shop":
        "Магазин",

      /* CHARACTER */

      "characterSelect.eyebrow":
        "ДОБРО ПОЖАЛОВАТЬ В HUSTLE EMPIRE",

      "characterSelect.title":
        "Выберите персонажа",

      "characterSelect.subtitle":
        "Выберите персонажа, который будет представлять вас в вашей империи.",

      "characterSelect.male":
        "Мужчина",

      "characterSelect.maleHint":
        "Стройте империю с мужским персонажем.",

      "characterSelect.female":
        "Женщина",

      "characterSelect.femaleHint":
        "Стройте империю с женским персонажем.",

      "characterSelect.savedHint":
        "Выбор автоматически сохраняется вместе с игровым прогрессом.",

      /* HOME */

      "home.tagline":
        "Маленькие шаги. Большая империя.",

      "home.dailyChallenges":
        "Ежедневные задания",

      "home.dailyChallengesProgressZero":
        "0/3 выполнено",

      "home.dailyChallengesComplete":
        "Готово ✓",

      "home.dailyChallengesProgress":
        "{completed}/3 выполнено",

      "home.socialTasks":
        "Социальные задания",

      "home.dailyRewards":
        "Ежедневные награды",

      "home.socialTasksHint":
        "Выполняй задания и забирай награды",

      "home.dailyChest":
        "Ежедневный сундук",

      "home.streak":
        "Серия активности",

      "home.offlineEarnings":
        "Офлайн-доход",

      "home.quickHustle":
        "Быстрый заработок",

      "home.tapToEarn":
        "Нажимай и зарабатывай",

      "home.missions":
        "Миссии",

      "home.nextLevel":
        "Следующий уровень",

      "home.quickActivity":
        "Быстрые задания",

      "home.quickJobs":
        "Быстрые задания",

      "home.completed":
        "Выполнено",

      "home.missionsCompletedCount":
        "{completed}/{total} миссий выполнено",

      /* MISSIONS */

      "missions.taps":
        "Нажать {target} раз",

      "missions.jobs":
        "Выполнить быстрые задания: {target}",

      "missions.earn":
        "Заработать {target}",

      "missions.upgrades":
        "Купить улучшения: {target}",

      "missions.bonuses":
        "Собрать бонусы: {target}",

      "missions.events":
        "Участвовать в событиях: {target}",

      /* HUSTLES */

      "hustles.jobFallback":
        "Быстрое задание",

      "hustles.energyCost":
        "Энергия",

      "hustles.moneyReward":
        "Награда",

      "hustles.xpReward":
        "Опыт",

      /* HOME BUSINESS */

      "home.empireManagement":
        "Управление империей",

      "home.activeBusinesses":
        "Активные бизнесы",

      "home.totalIncome":
        "Общий доход",

      "home.passiveIncome":
        "Пассивный доход",

      "home.perTap":
        "за тап",

      /* CITY */

      "city.districtActivity":
        "Активность района",

      "city.unlocked":
        "Открыто",

      "city.poorBlock":
        "БЕДНЫЙ КВАРТАЛ",

      "city.starterDistrict":
        "Стартовый район",

      "city.cityCenter":
        "ЦЕНТР ГОРОДА",

      "city.cityHustles":
        "Городские дела",

      "city.businessDistrict":
        "ДЕЛОВОЙ РАЙОН",

      "city.bigBusiness":
        "Большой бизнес",

      "city.richSkyline":
        "БОГАТЫЙ РАЙОН",

      "city.endgameEmpire":
        "Империя эндгейма",

      "city.rangePoor":
        "УР 1–10",

      "city.rangeCenter":
        "УР 11–20",

      "city.rangeBusiness":
        "УР 21–30",

      "city.rangeRich":
        "УР 31–40+",

      /* DISTRICTS */

      "districts.poor_block.name":
        "БЕДНЫЙ КВАРТАЛ",

      "districts.poor_block.tagline":
        "Стартовый район",

      "districts.poor_block.range":
        "УР 1–10",

      "districts.city_center.name":
        "ЦЕНТР ГОРОДА",

      "districts.city_center.tagline":
        "Городские дела",

      "districts.city_center.range":
        "УР 11–20",

      "districts.business_district.name":
        "ДЕЛОВОЙ РАЙОН",

      "districts.business_district.tagline":
        "Большой бизнес",

      "districts.business_district.range":
        "УР 21–30",

      "districts.rich_skyline.name":
        "БОГАТЫЙ РАЙОН",

      "districts.rich_skyline.tagline":
        "Империя эндгейма",

      "districts.rich_skyline.range":
        "УР 31–40+",

      /* CASES */

      "cases.rewards":
        "Награды",

      "cases.title":
        "Кейсы",

      "cases.helper":
        "Вернись после таймера или потрать кристаллы, чтобы открыть сразу.",

      "cases.caseOpened":
        "Кейс открыт",

      "cases.reward":
        "Награда",

      "cases.money":
        "Деньги",

      "cases.gems":
        "Кристаллы",

      "cases.fragments":
        "Фрагменты",

      "cases.open":
        "Открыть",

      "cases.ready":
        "Готово",

      "cases.unlockNow":
        "Открыть сейчас",

      "cases.caseUnlockNow":
        "Открыть сейчас",

      "cases.unlockWith":
        "Открыть за",

      "cases.unlockWithGems":
        "Открыть за кристаллы",

      "cases.unlockWith Gems":
        "Открыть за кристаллы",

      "cases.caseWaiting":
        "Ожидание",

      "caseNames.case_2h":
        "Кейс на 2 часа",

      "caseNames.case_4h":
        "Кейс на 4 часа",

      "caseNames.case_8h":
        "Кейс на 8 часов",

      "caseNames.case_24h":
        "Кейс на 24 часа",

      "cases.waiting":
        "Ожидание",

      "cases.durationHours":
        "{hours}ч",

      "cases.fragmentsZero":
        "+0 фрагментов",

      "cases.timer":
        "Осталось времени",

      "cases.case_2h":
        "Кейс на 2 часа",

      "cases.case_4h":
        "Кейс на 4 часа",

      "cases.case_8h":
        "Кейс на 8 часов",

      "cases.case_24h":
        "Кейс на 24 часа",

      /* ACCESSORY CASES */

      "accessoryCases":
        "Кейсы аксессуаров",

      "accessory.uses.true":
        "Аксессуары включены",

      "accessory.uses.false":
        "Без аксессуаров",

      "accessoryCases.eyebrow":
        "Лут гардероба",

      "accessoryCases.title":
        "Премиальные кейсы аксессуаров",

      "accessoryCases.gemsOnly":
        "Только за кристаллы",

      "accessoryCases.newItem":
        "Новый предмет",

      "accessoryCases.collectionComplete":
        "Коллекция собрана",

      "accessoryCases.openFree":
        "Открыть бесплатно",

      "accessoryCases.ready":
        "Готово",

      "accessoryCases.waiting":
        "Ожидание",

      "accessoryCases.itemPlaceholder":
        "Предмет",

      "accessoryCaseNames.free_accessory":
        "Бесплатный кейс аксессуаров",

      "accessoryCaseNames.premium_rare":
        "Редкий кейс аксессуаров",

      "accessoryCaseNames.premium_epic":
        "Эпический кейс аксессуаров",

      "accessoryCaseNames.premium_legendary":
        "Легендарный кейс аксессуаров",

      "accessoryCases.free_accessory":
        "Бесплатный кейс аксессуаров",

      "accessoryCases.premium_rare":
        "Редкий кейс аксессуаров",

      "accessoryCases.premium_epic":
        "Эпический кейс аксессуаров",

      "accessoryCases.premium_legendary":
        "Легендарный кейс аксессуаров",

      "accessorySources.unknown":
        "Кейс аксессуаров",

      "accessorySources.free":
        "Бесплатный кейс",

      "accessorySources.rare":
        "Редкий кейс",

      "accessorySources.epic":
        "Эпический кейс",

      "accessorySources.legendary":
        "Легендарный кейс",

      /* COLLECTION */

      "collection.book":
        "Коллекция карт",

      "collection.specialCollection":
        "Особая коллекция",

      "collection.exclusiveTitle":
        "Эксклюзивные карты",

      "collection.exclusiveLabel":
        "Эксклюзив",

      "collection.exclusiveSubtitle":
        "Эти карты не выпадают из обычных кейсов.",

      "collection.businessCard":
        "Карта бизнеса",

      "collection.rpgCard":
        "RPG-карта",

      "collection.levelUp":
        "Улучшить",

      "collection.specialPurchase":
        "Купить отдельно",

      "collection.unlock":
        "Открыть",

      "collection.cardPlaceholder":
        "Карта",

      "collection.summaryZero":
        "0 / 10 карт",

      "collection.summaryCount":
        "{unlocked} / {total} карт",

      "collection.fragments":
        "Фрагменты",

      "collection.fragmentsProgress":
        "{current}/{required} фрагментов",

      "collection.bonus":
        "Бонус",

      /* CARD BONUSES */

      "cards.bonus.businessIncomePercent":
        "+{value}% к доходу",

      "cards.bonus.tapPowerFlat":
        "+{value} к силе тапа",

      "cards.bonus.criticalRatePercent":
        "+{value}% к шансу крита",

      "cards.bonus.criticalDamagePercent":
        "+{value}% к крит. урону",

      "cards.bonus.energyMaxFlat":
        "+{value} к макс. энергии",

      "cards.bonus.energyRegenSpeedPercent":
        "+{value}% к регену энергии",

      /* CARDS */

      "cards.founder.description":
        "Эксклюзивная карта основателя для первых владельцев империи.",

      "cards.golden_tycoon.description":
        "Премиальная эксклюзивная карта для элитных владельцев империй.",

      "cards.neon_king.description":
        "Эксклюзивная неоновая карта для игроков с высоким престижем.",

      "cards.gym_income.name":
        "Доход спортзала",

      "cards.coffee_income.name":
        "Доход кофейни",

      "cards.delivery_income.name":
        "Доход доставки",

      "cards.garage_income.name":
        "Доход гаража",

      "cards.nightclub_income.name":
        "Доход ночного клуба",

      "cards.tap_power.name":
        "Сила тапа",

      "cards.critical_rate.name":
        "Шанс крита",

      "cards.critical_damage.name":
        "Крит. урон",

      "cards.energy_max.name":
        "Макс. энергия",

      "cards.energy_regen.name":
        "Реген энергии",

      "cards.founder.name":
        "Основатель",

      "cards.golden_tycoon.name":
        "Золотой магнат",

      "cards.neon_king.name":
        "Неоновый король",

      /* RARITY */

      "rarity.common":
        "Обычная",

      "rarity.rare":
        "Редкая",

      "rarity.epic":
        "Эпическая",

      "rarity.legendary":
        "Легендарная",

      "rarity.mythic":
        "Мифическая",

      /* BUSINESS */

      "business.available":
        "Доступно",

      "business.owned":
        "Куплено",

      "business.locked":
        "Закрыто",

      "business.active":
        "Активен",

      "business.incomePerSecond":
        "Доход / с",

      "business.incomePerHour":
        "Доход / ч",

      "business.zeroPerHour":
        "0 / ч",

      "business.unlockAtLevel":
        "Откроется на УР {level}",

      "home.noActiveBusinesses":
        "Купи первый бизнес в разделе «Город».",

      "businesses.kiosk.name":
        "Уличный киоск",

      "businesses.laundry.name":
        "Прачечная",

      "businesses.gym.name":
        "Спортзал",

      "businesses.pizza.name":
        "Пиццерия",

      "businesses.barber.name":
        "Барбершоп",

      "businesses.autodealer.name":
        "Автосалон",

      "businesses.club.name":
        "Клуб",

      "businesses.hotel.name":
        "Отель",

      "businesses.bank.name":
        "Банк",

      "businesses.cafe.name":
        "Кафе",

      "businesses.bar.name":
        "Бар",

      "businesses.restaurant.name":
        "Ресторан",

      "businesses.office.name":
        "Офис",

      "businesses.car_dealer.name":
        "Автосалон",

      "businesses.agency.name":
        "Агентство",

      "businesses.nightclub.name":
        "Ночной клуб",

      "businesses.luxury_hotel.name":
        "Люксовый отель",

      "businesses.empire_tower.name":
        "Башня империи",

      /* HUSTLES */

      "hustles.completed":
        "Выполнено",

      "hustles.notEnoughEnergy":
        "Недостаточно энергии",

      "hustles.run":
        "Запустить",

      /* RANDOM EVENTS */

      "randomEvents.energyReward":
        "+{amount} энергии",

      "randomEvents.tapBoostReward":
        "Буст тапа активирован",

      "randomEvents.bonusTitle":
        "БОНУС!",

      "randomEvents.tapX2":
        "Тап x2",

      /* STATS */

      "stats.income":
        "Доход",

      "stats.tapPower":
        "Сила тапа",

      "stats.criticalRate":
        "Шанс крита",

      "stats.criticalDamage":
        "Крит. урон",

      "stats.maxEnergy":
        "Макс. энергия",

      "stats.energyRegen":
        "Реген энергии",

      /* WARDROBE */

      "wardrobe.title":
        "Гардероб",

      "wardrobe.tabs.items":
        "Предметы",

      "wardrobe.tabs.sets":
        "Комплекты",

      "wardrobe.catalog":
        "Каталог аксессуаров",

      "wardrobe.collection":
        "Коллекция",

      "wardrobe.outfitProgress":
        "Прогресс образа",

      "wardrobe.unlockSlot":
        "Купи УР 1, чтобы открыть",

      "wardrobe.totalStats":
        "Общие бонусы характеристик",

      "wardrobe.buyLevelOne":
        "Купить УР 1",

      "wardrobe.completeSet":
        "Собрать сет",

      "wardrobe.maxLevel":
        "Макс. уровень",

      "wardrobe.requiredEquipmentLevel":
        "Нужен УР экипировки {level}",

      "wardrobe.setComplete":
        "Сет собран",

      "wardrobe.slotLocked":
        "Слот закрыт",

      "wardrobe.styleSetProgress":
        "Прогресс сета",

      "wardrobe.unlockSource":
        "Источник",

      "wardrobe.unlocked":
        "Открыто",

      "wardrobe.upgradeToLevel":
        "Улучшить до УР {level}",

      "wardrobe.upgradeByLevel":
        "Улучшить до УР {level}",

      "wardrobe.upgradeByLevelCost":
        "Улучшить до УР {level}",

      /* WARDROBE ITEMS */

      "wardrobeItems.designer_cap.name":
        "Дизайнерская кепка",

      "wardrobeItems.urban_shades.name":
        "Городские очки",

      "wardrobeItems.street_jacket.name":
        "Уличная куртка",

      "wardrobeItems.limited_sneakers.name":
        "Лимитированные кроссовки",

      "wardrobeItems.neon_jacket.name":
        "Неоновая куртка",

      "wardrobeItems.tech_pants.name":
        "Техно-брюки",

      "wardrobeItems.chrono_watch.name":
        "Часы Chrono",

      "wardrobeItems.elite_shades.name":
        "Элитные очки",

      "wardrobeItems.crown_cap.name":
        "Королевская кепка",

      "wardrobeItems.royal_coat.name":
        "Королевское пальто",

      "wardrobeItems.diamond_watch.name":
        "Бриллиантовые часы",

      "wardrobeItems.imperial_shoes.name":
        "Императорская обувь",

      /* EQUIPMENT */

      "equipment.cap.stage1.name":
        "Хлопковая кепка",

      "equipment.cap.stage5.name":
        "Дизайнерский снэпбэк",

      "equipment.cap.stage10.name":
        "Корона Империи",

      "equipment.glasses.stage1.name":
        "Простые очки",

      "equipment.glasses.stage5.name":
        "Уличные очки",

      "equipment.glasses.stage10.name":
        "Бриллиантовые очки",

      "equipment.jacket.stage1.name":
        "Уличная куртка",

      "equipment.jacket.stage5.name":
        "Брендовая куртка",

      "equipment.jacket.stage10.name":
        "Люксовый костюм",

      "equipment.pants.stage1.name":
        "Базовые джинсы",

      "equipment.pants.stage5.name":
        "Стритвир-брюки",

      "equipment.pants.stage10.name":
        "Брюки босса",

      "equipment.shoes.stage1.name":
        "Базовые кроссовки",

      "equipment.shoes.stage5.name":
        "Лимитированные кроссовки",

      "equipment.shoes.stage10.name":
        "Люксовая обувь",

      "equipment.accessory.stage1.name":
        "Простые часы",

      "equipment.accessory.stage5.name":
        "Дизайнерские часы",

      "equipment.accessory.stage10.name":
        "Бриллиантовые часы",

      /* STYLE SETS */

      "styleSets.street_set.name":
        "Уличный старт",

      "styleSets.street_set.description":
        "Все 6 предметов экипировки должны быть УР 1 или выше.",

      "styleSets.brand_set.name":
        "Дизайнерский стиль",

      "styleSets.brand_set.description":
        "Повысь все 6 предметов экипировки до УР 5.",

      "styleSets.empire_set.name":
        "Имперская роскошь",

      "styleSets.empire_set.description":
        "Повысь каждый предмет экипировки до УР 10.",

      "wardrobe.itemLevelName":
        "{slot} · УР {level}",

      "wardrobe.styleSetFallback":
        "Комплект",

      "wardrobe.styleSetDescriptionFallback":
        "Улучши нужную экипировку, чтобы завершить комплект.",

      "wardrobe.character":
        "Персонаж",

      "wardrobe.zeroIncome":
        "★ +0% Доход",

      "wardrobe.zeroTapPower":
        "★ +0% Сила тапа",

      "wardrobe.zeroCriticalRate":
        "★ +0% Шанс крита",

      "wardrobe.zeroCriticalDamage":
        "★ +0% Крит. урон",

      "wardrobe.zeroMaxEnergy":
        "★ +0 Макс. энергия",

      "wardrobe.zeroEnergyRegen":
        "★ +0% Реген энергии",

      /* SLOTS */

      "wardrobeSlots.cap":
        "Головной убор",

      "wardrobeSlots.hat":
        "Головной убор",

      "wardrobeSlots.glasses":
        "Очки",

      "wardrobeSlots.jacket":
        "Куртка",

      "wardrobeSlots.pants":
        "Брюки",

      "wardrobeSlots.shoes":
        "Обувь",

      "wardrobeSlots.accessory":
        "Аксессуар",

      "wardrobeSlots.watch":
        "Аксессуар",

      /* SHOP */

      "shop.title":
        "Магазин",

      "shop.boosts":
        "Бусты и улучшения",

      "shop.income2x":
        "2x доход офлайн",

      "shop.income3x":
        "3x доход офлайн",

      "shop.sevenDays":
        "На 7 дней",

      "shop.offlineCap":
        "Лимит офлайн +24ч",

      "shop.extendsLimit":
        "Увеличивает лимит",

      "shop.autoCollect":
        "Автосбор",

      "shop.automaticCollection":
        "Автоматический сбор",

      "shop.eventBooster":
        "Буст событий",

      "shop.bonus24h":
        "+50% на 24 часа",

      "shop.tapBoost":
        "Буст силы тапа",

      "shop.bonus12h":
        "+100% на 12 часов",

      "shop.energyPack":
        "Пак энергии",

      "shop.energy500":
        "+500 энергии",

      "shop.businessBooster":
        "Буст бизнеса",

      "shop.income12h":
        "+100% дохода на 12ч",

      "shop.luckyEvents":
        "Удачные события",

      "shop.chance50":
        "+50% шанс события",

      "shop.gems":
        "Кристаллы",

      "shop.premiumCase":
        "Премиум кейс",

      "shop.premiumCaseDesc":
        "Открыть премиум кейс",

      "shop.outfitSkin":
        "Образ / Скин",

      "shop.outfitSkinDesc":
        "Открыть новые образы",

      "shop.hustleBundle":
        "Набор Hustle",

      "shop.hustleBundleDesc":
        "Кристаллы, кейс и аксессуар в одном наборе.",

      "shop.empirePass":
        "Empire Pass",

      "shop.empirePassDesc":
        "Ежемесячные премиум-награды и бонусы прогрессии",

      "shop.perMonth":
        "{price} ★ / месяц",

      /* OFFLINE */

      "offline.kicker":
        "ДОХОД ОФЛАЙН",

      "offline.hicker":
        "ДОХОД ОФЛАЙН",

      "offline.welcome":
        "С возвращением!",

      "offline.accumulated":
        "Накоплено",

      "offline.maxCap":
        "Максимум: 3 часа",

      "offline.cappedAway":
        "Максимум: 3 часа",

      "offline.awayHoursMinutes":
        "Тебя не было: {hours}ч {minutes}м",

      "offline.awayMinutes":
        "Тебя не было: {minutes}м",

      "offline.awayLessMinute":
        "Тебя не было меньше минуты",

      "offline.awayExample":
        "Тебя не было: 2ч 15м",

      "offline.claimAmount":
        "Забрать ${amount}",

      /* MODALS */

      "modal.dailyChest":
        "Ежедневный сундук",

      "modal.dailyChestText":
        "Вернись, когда таймер дойдёт до нуля, чтобы забрать ежедневный сундук.",

      "modal.dailyChestRemaining":
        "Осталось: {time}",

      "modal.notifications":
        "Уведомления",

      "modal.notificationsText":
        "Здесь появляются награды, выполненные миссии, события и офлайн-доход.",

      "modal.settings":
        "Настройки",

      "modal.settingsText":
        "Звук, язык, уведомления и настройки Telegram-аккаунта.",

      "modal.offline":
        "Офлайн-доход",

      "modal.offlineText":
        "Твои бизнесы продолжают приносить доход, пока ты офлайн.",

      "modal.levelUp":
        "Новый уровень",

      "modal.levelUpText":
        "Выполняй миссии, чтобы открыть следующий уровень.",

      "modal.setBonus":
        "Бонус комплекта",

      "modal.setBonusText":
        "Собирай комплекты экипировки и карт для постоянных бонусов.",

      "modal.premiumPlaceholder":
        "Оплата через Telegram Stars откроется здесь после подключения платежей.",

      /* DAILY */

      "daily.closeAria":
        "Закрыть ежедневные задания",

      "daily.title":
        "Ежедневные задания",

      "daily.eyebrow":
        "ЕЖЕДНЕВНЫЙ HUSTLE",

      "daily.reset":
        "СБРОС",

      "daily.comboEyebrow":
        "ЕЖЕДНЕВНОЕ КОМБО",

      "daily.cipherEyebrow":
        "ЕЖЕДНЕВНЫЙ ШИФР",

      "daily.streakEyebrow":
        "СЕРИЯ 7 ДНЕЙ",

      "daily.checkinTitle":
        "Ежедневный вход",

      "daily.subtitle":
        "Выполни сегодняшние задания и вернись завтра за новой ротацией.",

      "daily.comboTitle":
        "Ежедневное комбо",

      "daily.comboHint":
        "Купи или улучши 3 выбранные сегодня цели.",

      "daily.grandReward":
        "Главная награда",

      "daily.comboRewardClaimed":
        "✓ Награда получена: {reward}",

      "daily.comboMaxReward":
        "Главная награда: {reward}",

      "daily.cipherTitle":
        "Шифр Морзе",

      "daily.cipherHint":
        "Расшифруй последовательность Морзе в правильную цифру.",

      "daily.answerAria":
        "Ответ для шифра Морзе",

      "daily.decipherCode":
        "Расшифровать",

      "daily.cipherDefault":
        "Преобразуй Морзе в правильную цифру (0–9).",

      "daily.solved":
        "Решено ✓",

      "daily.reward":
        "Награда: {reward}",

      "daily.wrong":
        "Неверный код. Попробуй снова.",

      "daily.success":
        "Верно! Награда начислена.",

      "daily.checkinHint":
        "Заходи каждый день, чтобы увеличивать серию наград.",

      "daily.day":
        "ДЕНЬ {day}",

      "daily.days":
        "{count} дн.",

      "daily.claimDay":
        "Забрать день {day}",

      "daily.claimDay1":
        "Забрать день 1",

      "daily.claimedToday":
        "Сегодня получено ✓",

      "daily.checkinSuccess":
        "Награда за вход получена!",

      "daily.alreadyClaimed":
        "Сегодняшняя награда уже получена.",

      "daily.streakResetHint":
        "Пропусти день — серия сбросится до 1.",

      /* LEVEL UP */

      "levelUp.title":
        "НОВЫЙ УРОВЕНЬ! УРОВЕНЬ {level}",

      "levelUp.subtitle":
        "Новый уровень достигнут. Награды уже зачислены на аккаунт.",

      "levelUp.gems":
        "♦ +{amount} кристаллов",

      "levelUp.earningsBoost":
        "⚡ {multiplier} доход · {time}",

      "levelUp.inventory":
        "Инвентарь: {caseName} ×{count}",

      "levelUp.claim":
        "Забрать и использовать буст!",

      "levelUp.case.street":
        "Уличный кейс",

      "levelUp.case.boss":
        "Босс-кейс",

      "levelUp.case.tycoon":
        "Кейс магната",

      /* LEADERBOARD */

      "leaderboard.seasonRanking":
        "РЕЙТИНГ СЕЗОНА",

      "leaderboard.title":
        "Лидерборд",

      "leaderboard.subtitle":
        "Поднимайся в рейтинге, увеличивая доход в секунду.",

      "leaderboard.countdownAria":
        "Таймер сезона",

      "leaderboard.seasonEndsIn":
        "До конца сезона",

      "leaderboard.rewardsAtClose":
        "Награды будут выданы после завершения сезона",

      "leaderboard.supportAria":
        "Награды и предложение лидерборда",

      "leaderboard.seasonRewards":
        "НАГРАДЫ СЕЗОНА",

      "leaderboard.endSeasonRewards":
        "Награды за сезон",

      "leaderboard.reward1000Gems":
        "1 000 кристаллов",

      "leaderboard.legendaryAccessory":
        "+ Легендарный аксессуар",

      "leaderboard.reward500Gems":
        "500 кристаллов",

      "leaderboard.exclusiveAccessory":
        "+ Эксклюзивный аксессуар",

      "leaderboard.reward150Gems":
        "150 кристаллов",

      "leaderboard.epicAccessoryCase":
        "+ Эпический кейс аксессуаров",

      "leaderboard.flashOffer":
        "⚡ ФЛЭШ-ПРЕДЛОЖЕНИЕ",

      "leaderboard.doubleIncomeBoost":
        "Буст дохода x2",

      "leaderboard.doubleIncomePitch":
        "Удвой доход на 30 минут и поднимись в рейтинге.",

      "leaderboard.activeProductionOnly":
        "Работает на активный доход. Не увеличивает офлайн-доход.",

      "leaderboard.activateX2":
        "АКТИВИРОВАТЬ x2",

      "leaderboard.topTycoons":
        "ТОП МАГНАТОВ",

      "leaderboard.top3Short":
        "ТОП 3",

      "leaderboard.top10Short":
        "ТОП 10",

      "leaderboard.youBadge":
        "ТЫ",

      "leaderboard.globalRanking":
        "Глобальный рейтинг",

      "leaderboard.season01":
        "СЕЗОН 01",

      "leaderboard.player":
        "Игрок",

      "leaderboard.incomePerSecond":
        "Доход / с",

      "leaderboard.listAria":
        "Рейтинг игроков",

      "leaderboard.currentAvatar":
        "Твой аватар",

      "leaderboard.you":
        "Ты",

      "leaderboard.yourPosition":
        "ТВОЯ ПОЗИЦИЯ",

      "leaderboard.prestige":
        "Престиж",

      "leaderboard.rewardMax":
        "#1 · Максимальная награда",

      "leaderboard.rewardTop3":
        "Топ 3 · #{rank}",

      "leaderboard.rewardTop10":
        "Топ 10 · #{rank}",

      "leaderboard.rewardOutside":
        "#{rank} · Вне топ-10",

      "leaderboard.defendFirst":
        "Ты уже #1 — удерживай первое место.",

      "leaderboard.gapPrestige":
        "Нужно ещё {gap} престижа до #{rank}.",

      "leaderboard.gapIncome":
        "Нужно ещё {gap} до #{rank}.",

      "leaderboard.boostTimeRemaining":
        "Осталось времени буста",

      "leaderboard.offerTimeRemaining":
        "Осталось времени предложения",

      "leaderboard.boostActiveButton":
        "БУСТ АКТИВЕН",

      "leaderboard.expiredButton":
        "ИСТЕКЛО",

      "leaderboard.activateButton":
        "АКТИВИРОВАТЬ x2",

      "leaderboard.boostActiveStatus":
        "Доход x{multiplier} активен · осталось {time}",

      "leaderboard.offerExpiredStatus":
        "Предложение этого сезона завершено.",

      "leaderboard.offerAffordableStatus":
        "x2 доход на 30 минут · не увеличивает офлайн-доход.",

      "leaderboard.offerNeedGemsStatus":
        "Нужно {gems} кристаллов · нажми, чтобы открыть Магазин.",

      /* TIME */

      "time.dayShort":
        "д",

      "time.hourShort":
        "ч",

      "time.minuteShort":
        "м",

      /* SOCIAL */

      "social.openAria":
        "Открыть ежедневные задания и награды",

      "social.closeAria":
        "Закрыть ежедневные задания и награды",

      "social.eyebrow":
        "СОЦИАЛЬНЫЕ НАГРАДЫ",

      "social.title":
        "Ежедневные задания и награды",

      "social.subtitle":
        "Выполняй социальные задания и получай дополнительные награды.",

      "social.progressToday":
        "ПРОГРЕСС СЕГОДНЯ",

      "social.daily":
        "Ежедневное",

      "social.resetsEvery24h":
        "Сброс каждые 24ч",

      "social.reset24h":
        "Сброс через 24 ч",

      "social.resetCountdown":
        "Сброс через {hours}ч {minutes}м",

      "social.dailyReward":
        "Ежедневная награда",

      "social.dailyRewardHint":
        "Заходи каждый день и забирай награду",

      "social.rewardAvailableAria":
        "Награда доступна",

      "social.socialCommunity":
        "Соцсети и сообщество",

      "social.completeOnce":
        "Выполняется один раз",

      "social.joinTelegram":
        "Вступить в Telegram-канал",

      "social.officialChannel":
        "Hustle Empire Official",

      "social.followX":
        "Подписаться на Hustle Empire в X",

      "social.followOfficialProfile":
        "Подпишись на официальный профиль",

      "social.invite3":
        "Пригласить 3 друзей",

      "social.invite3Zero":
        "0 / 3 друзей приглашено",

      "social.invite10":
        "Пригласить 10 друзей",

      "social.invite10Zero":
        "0 / 10 друзей приглашено",

      "social.visitCommunity":
        "Посетить сообщество",

      "social.openOfficialCommunity":
        "Открыть официальное сообщество",

      "social.newTasksDaily":
        "Новые задания доступны каждый день.",

      "social.claimed":
        "Награда получена",

      "social.claimReady":
        "Награда готова",

      "social.verifying":
        "Проверка...",

      "social.inviteProgress":
        "{progress} / {target} друзей приглашено",

      "social.completeTask":
        "Выполни задание",

      "social.statusCompleted":
        "Выполнено",

      "social.statusRewardAvailable":
        "Награда доступна",

      "social.statusVerifying":
        "Идёт проверка",

      "social.statusPending":
        "Нужно выполнить",

      "social.shareText":
        "Играй со мной в Hustle Empire!",

      /* NOTIFICATIONS */

      "notifications.eyebrow":
        "ОПОВЕЩЕНИЯ ИМПЕРИИ",

      "notifications.title":
        "Уведомления",

      "notifications.subtitle":
        "Полезные обновления о твоей империи.",

      "notifications.closeAria":
        "Закрыть уведомления",

      "notifications.dailyTitle":
        "Ежедневные задания",

      "notifications.dailyMessage":
        "{completed}/3 выполнено · заверши задания до сброса.",

      "notifications.nextLevelTitle":
        "Следующий уровень готов",

      "notifications.nextLevelMessage":
        "Все {count} миссий уровня {level} выполнены.",

      "notifications.boostTitle":
        "Буст дохода активен",

      "notifications.boostMessage":
        "{multiplier} ещё {time}.",

      "notifications.count":
        "{count} уведомлений",

      "notifications.none":
        "Новых уведомлений нет",

      "notifications.allClear":
        "Всё под контролем",

      "notifications.noUrgent":
        "Сейчас нет срочных уведомлений."

    })

  });

  /* ==========================================================
     LANGUAGE HELPERS
  ========================================================== */

  function normalizeLanguage(language) {
    const value =
      String(
        language || ""
      )
        .trim()
        .toLowerCase();

    return value.startsWith("ru")
      ? "ru"
      : "en";
  }

  function getStoredLanguage() {
    try {

      const current =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (
        SUPPORTED.includes(
          current
        )
      ) {
        return current;
      }

      for (
        const key
        of LEGACY_STORAGE_KEYS
      ) {

        const legacy =
          localStorage.getItem(
            key
          );

        if (
          SUPPORTED.includes(
            legacy
          )
        ) {
          return legacy;
        }
      }

    } catch (_) {
      /*
       * localStorage may be unavailable in unusual WebViews.
       */
    }

    return null;
  }

  function detectInitialLanguage() {

    const stored =
      getStoredLanguage();

    if (stored) {
      return stored;
    }

    try {

      const telegramLanguage =
        window.Telegram
          ?.WebApp
          ?.initDataUnsafe
          ?.user
          ?.language_code;

      if (
        telegramLanguage
      ) {
        return normalizeLanguage(
          telegramLanguage
        );
      }

    } catch (_) {
      /*
       * Telegram data unavailable.
       */
    }

    return normalizeLanguage(
      navigator.language ||
      document.documentElement.lang ||
      "en"
    );
  }

  function persistLanguage(
    language
  ) {

    const normalized =
      normalizeLanguage(
        language
      );

    try {

      localStorage.setItem(
        STORAGE_KEY,
        normalized
      );

      /*
       * Preserve backwards compatibility with
       * previous Hustle Empire builds.
       */
      LEGACY_STORAGE_KEYS.forEach(
        (key) => {
          localStorage.setItem(
            key,
            normalized
          );
        }
      );

    } catch (_) {
      /*
       * Game continues normally even without storage.
       */
    }
  }

  /* ==========================================================
     INTERPOLATION
  ========================================================== */

  function interpolate(
    template,
    params = {}
  ) {

    return String(
      template ?? ""
    ).replace(
      /\{([a-zA-Z0-9_]+)\}/g,
      (_, key) => {

        if (
          Object.prototype
            .hasOwnProperty
            .call(
              params,
              key
            )
        ) {
          return String(
            params[key]
          );
        }

        return `{${key}}`;
      }
    );
  }

  /* ==========================================================
     ACTIVE LANGUAGE
  ========================================================== */

  let activeLanguage =
    detectInitialLanguage();

  const MISSING_COPY =
    Object.freeze({

      en:
        "Text unavailable",

      ru:
        "Текст недоступен"

    });

  const warnedMissingKeys =
    new Set();

  /* ==========================================================
     TRANSLATION LOOKUP
  ========================================================== */

  function has(
    key,
    language = activeLanguage
  ) {

    const lang =
      normalizeLanguage(
        language
      );

    return (
      Object.prototype
        .hasOwnProperty
        .call(
          TRANSLATIONS[lang],
          key
        )
      &&
      String(
        TRANSLATIONS[lang][key] ??
        ""
      )
        .trim()
        .length > 0
    );
  }

  function warnMissingTranslation(
    key,
    language
  ) {

    const token =
      `${language}:${key}`;

    if (
      warnedMissingKeys.has(
        token
      )
    ) {
      return;
    }

    warnedMissingKeys.add(
      token
    );

    console.warn(
      `[Hustle Empire i18n] Missing ${String(
        language
      ).toUpperCase()} translation: ${key}`
    );
  }

  function t(
    key,
    params = {},
    language = activeLanguage
  ) {

    const lang =
      normalizeLanguage(
        language
      );

    if (
      has(
        key,
        lang
      )
    ) {
      return interpolate(
        TRANSLATIONS[lang][key],
        params
      );
    }

    /*
     * RU may safely fall back to English.
     */
    if (
      lang !== "en" &&
      has(
        key,
        "en"
      )
    ) {

      warnMissingTranslation(
        key,
        lang
      );

      return interpolate(
        TRANSLATIONS.en[key],
        params
      );
    }

    /*
     * Never expose raw internal translation keys
     * to players.
     */
    warnMissingTranslation(
      key,
      lang
    );

    return (
      MISSING_COPY[lang] ||
      MISSING_COPY.en
    );
  }

  /* ==========================================================
     AUDIT
  ========================================================== */

  function placeholderTokens(
    value
  ) {

    return [
      ...String(
        value ?? ""
      ).matchAll(
        /\{([a-zA-Z0-9_]+)\}/g
      )
    ]
      .map(
        (match) =>
          match[1]
      )
      .sort();
  }

  function containsCyrillic(
    value
  ) {
    return /[\u0400-\u04FF]/.test(
      String(
        value ?? ""
      )
    );
  }

  function audit(
    requiredKeys = []
  ) {

    const enKeys =
      new Set(
        Object.keys(
          TRANSLATIONS.en
        )
      );

    const ruKeys =
      new Set(
        Object.keys(
          TRANSLATIONS.ru
        )
      );

    const allKeys =
      new Set([
        ...enKeys,
        ...ruKeys
      ]);

    const missingInEnglish =
      [...allKeys]
        .filter(
          (key) =>
            !has(
              key,
              "en"
            )
        )
        .sort();

    const missingInRussian =
      [...allKeys]
        .filter(
          (key) =>
            !has(
              key,
              "ru"
            )
        )
        .sort();

    const placeholderMismatches =
      [...allKeys]
        .filter(
          (key) =>
            has(
              key,
              "en"
            )
            &&
            has(
              key,
              "ru"
            )
        )
        .filter(
          (key) => {

            const enTokens =
              placeholderTokens(
                TRANSLATIONS
                  .en[key]
              );

            const ruTokens =
              placeholderTokens(
                TRANSLATIONS
                  .ru[key]
              );

            return (
              enTokens.join("|")
              !==
              ruTokens.join("|")
            );
          }
        )
        .sort();

    /*
     * Useful automatic check for accidental
     * Russian text pasted into English entries.
     */
    const englishCyrillicValues =
      Object.entries(
        TRANSLATIONS.en
      )
        .filter(
          ([, value]) =>
            containsCyrillic(
              value
            )
        )
        .map(
          ([key]) =>
            key
        )
        .sort();

    const required =
      [
        ...new Set(
          requiredKeys
        )
      ]
        .filter(Boolean)
        .sort();

    const requiredMissing =
      required.filter(
        (key) =>
          !has(
            key,
            "en"
          )
          ||
          !has(
            key,
            "ru"
          )
      );

    return Object.freeze({

      ok:
        missingInEnglish.length === 0
        &&
        missingInRussian.length === 0
        &&
        placeholderMismatches.length === 0
        &&
        englishCyrillicValues.length === 0
        &&
        requiredMissing.length === 0,

      language:
        activeLanguage,

      totalEnglish:
        enKeys.size,

      totalRussian:
        ruKeys.size,

      missingInEnglish,

      missingInRussian,

      placeholderMismatches,

      englishCyrillicValues,

      requiredMissing

    });
  }

  /* ==========================================================
     DOM KEY COLLECTION
  ========================================================== */

  function collectDomTranslationKeys(
    root = document
  ) {

    const keys =
      new Set();

    const attributes =
      [
        "data-i18n",
        "data-i18n-aria-label",
        "data-i18n-title",
        "data-i18n-placeholder",
        "data-i18n-alt"
      ];

    function visit(
      element
    ) {

      if (
        !element?.getAttribute
      ) {
        return;
      }

      attributes.forEach(
        (attribute) => {

          const key =
            element.getAttribute(
              attribute
            );

          if (key) {
            keys.add(
              key
            );
          }

        }
      );
    }

    if (
      root?.nodeType ===
      Node.ELEMENT_NODE
    ) {
      visit(
        root
      );
    }

    root
      ?.querySelectorAll?.(
        attributes
          .map(
            (attribute) =>
              `[${attribute}]`
          )
          .join(",")
      )
      .forEach(
        visit
      );

    return [
      ...keys
    ];
  }

  /* ==========================================================
     DOM TRANSLATION
  ========================================================== */

  function applyElementTranslations(
    element
  ) {

    if (
      !element
        ?.getAttribute
    ) {
      return;
    }

    const textKey =
      element.getAttribute(
        "data-i18n"
      );

    if (textKey) {
      element.textContent =
        t(
          textKey
        );
    }

    const ariaKey =
      element.getAttribute(
        "data-i18n-aria-label"
      );

    if (ariaKey) {
      element.setAttribute(
        "aria-label",
        t(
          ariaKey
        )
      );
    }

    const titleKey =
      element.getAttribute(
        "data-i18n-title"
      );

    if (titleKey) {
      element.setAttribute(
        "title",
        t(
          titleKey
        )
      );
    }

    const placeholderKey =
      element.getAttribute(
        "data-i18n-placeholder"
      );

    if (placeholderKey) {
      element.setAttribute(
        "placeholder",
        t(
          placeholderKey
        )
      );
    }

    const altKey =
      element.getAttribute(
        "data-i18n-alt"
      );

    if (altKey) {
      element.setAttribute(
        "alt",
        t(
          altKey
        )
      );
    }
  }

  function applyTranslations(
    root = document
  ) {

    if (
      root?.nodeType ===
      Node.ELEMENT_NODE
    ) {
      applyElementTranslations(
        root
      );
    }

    root
      ?.querySelectorAll?.(
        [
          "[data-i18n]",
          "[data-i18n-aria-label]",
          "[data-i18n-title]",
          "[data-i18n-placeholder]",
          "[data-i18n-alt]"
        ].join(",")
      )
      .forEach(
        applyElementTranslations
      );

    if (
      root === document ||
      root ===
        document.documentElement
    ) {
      document.title =
        t(
          "app.title"
        );
    }
  }

  /* ==========================================================
     LANGUAGE BUTTON
  ========================================================== */

  function updateLanguageButton() {

    const button =
      document.getElementById(
        "language-switch"
      );

    if (!button) {
      return;
    }

    const target =
      activeLanguage === "en"
        ? "ru"
        : "en";

    button.textContent =
      target.toUpperCase();

    button.dataset
      .targetLanguage =
      target;

    const ariaKey =
      target === "ru"
        ? "language.switchToRussian"
        : "language.switchToEnglish";

    button.setAttribute(
      "data-i18n-aria-label",
      ariaKey
    );

    button.setAttribute(
      "aria-label",
      t(
        ariaKey
      )
    );

    button.title =
      t(
        ariaKey
      );
  }

  /* ==========================================================
     SET LANGUAGE
  ========================================================== */

  function setLanguage(
    language,
    options = {}
  ) {

    const nextLanguage =
      normalizeLanguage(
        language
      );

    const previousLanguage =
      activeLanguage;

    activeLanguage =
      nextLanguage;

    document.documentElement
      .lang =
      nextLanguage;

    if (
      options.persist !==
      false
    ) {
      persistLanguage(
        nextLanguage
      );
    }

    applyTranslations(
      document
    );

    updateLanguageButton();

    /*
     * game.js redraws Missions, Cases, Cards,
     * Wardrobe, Daily, Notifications and Leaderboard
     * when this event fires.
     */
    if (
      options.notify !==
        false
      &&
      previousLanguage !==
        nextLanguage
    ) {

      window.dispatchEvent(
        new CustomEvent(
          "hustle:languageChanged",
          {
            detail: {

              language:
                nextLanguage,

              previousLanguage,

              source:
                "i18n"

            }
          }
        )
      );

      /*
       * Catch dynamic nodes that game.js created
       * synchronously during the event.
       */
      applyTranslations(
        document
      );

      updateLanguageButton();
    }

    return nextLanguage;
  }

  function switchLanguage() {

    return setLanguage(
      activeLanguage ===
        "en"
        ? "ru"
        : "en"
    );
  }

  function getLanguage() {
    return activeLanguage;
  }

  /* ==========================================================
     MUTATION OBSERVER
  ========================================================== */

  let translationObserver =
    null;

  function installTranslationObserver() {

    if (
      translationObserver ||
      !document.documentElement
    ) {
      return;
    }

    translationObserver =
      new MutationObserver(
        (records) => {

          records.forEach(
            (record) => {

              record.addedNodes
                .forEach(
                  (node) => {

                    if (
                      node.nodeType ===
                      Node.ELEMENT_NODE
                    ) {
                      applyTranslations(
                        node
                      );
                    }

                  }
                );

            }
          );

        }
      );

    translationObserver.observe(
      document.documentElement,
      {
        childList: true,
        subtree: true
      }
    );
  }

  /* ==========================================================
     PUBLIC API
  ========================================================== */

  const i18nApi =
    Object.freeze({

      translations:
        TRANSLATIONS,

      supported:
        SUPPORTED,

      t,

      resolve:
        t,

      has,

      audit,

      collectDomTranslationKeys,

      apply:
        applyTranslations,

      setLanguage,

      switchLanguage,

      getLanguage

    });

  /*
   * Canonical API.
   */
  window.i18n =
    i18nApi;

  /* ==========================================================
     LEGACY NESTED LOCALE COMPATIBILITY
  ========================================================== */

  function buildLegacyNestedLocale(
    flatLocale
  ) {

    const root =
      {};

    Object.entries(
      flatLocale
    ).forEach(
      ([key, value]) => {

        const parts =
          key.split(".");

        let cursor =
          root;

        parts.forEach(
          (
            part,
            index
          ) => {

            const isLeaf =
              index ===
              parts.length - 1;

            if (isLeaf) {

              cursor[part] =
                value;

              return;
            }

            if (
              !cursor[part] ||
              typeof cursor[part] !==
                "object"
            ) {
              cursor[part] =
                {};
            }

            cursor =
              cursor[part];

          }
        );

      }
    );

    return root;
  }

  const LEGACY_LOCALES =
    Object.freeze({

      en:
        buildLegacyNestedLocale(
          TRANSLATIONS.en
        ),

      ru:
        buildLegacyNestedLocale(
          TRANSLATIONS.ru
        )

    });

  /*
   * Temporary aliases.
   *
   * Current game.js still references these names.
   * They will be removed only when we clean game.js
   * during the next stabilization step.
   */
  window.translations =
    TRANSLATIONS;

  window.TRANSLATIONS =
    TRANSLATIONS;

  window.LOCALES =
    LEGACY_LOCALES;

  window.I18N =
    i18nApi;

  /* ==========================================================
     DICTIONARY AUDIT
  ========================================================== */

  const dictionaryAudit =
    audit();

  window.__HUSTLE_EMPIRE_I18N_AUDIT__ =
    dictionaryAudit;

  /*
   * Keep old audit alias temporarily so current
   * diagnostic code does not break.
   */
  window.__URBAN_TYCOON_I18N_AUDIT__ =
    dictionaryAudit;

  if (
    !dictionaryAudit.ok
  ) {

    console.error(
      "[Hustle Empire i18n] Dictionary audit failed:",
      dictionaryAudit
    );

  }

  /* ==========================================================
     LANGUAGE BUTTON EVENT
  ========================================================== */

  /*
   * V21:
   *
   * This is now the ONE AND ONLY language button listener.
   *
   * script.js no longer maintains a second language state.
   */
  document.addEventListener(
    "click",
    (event) => {

      const button =
        event.target
          ?.closest?.(
            "#language-switch"
          );

      if (!button) {
        return;
      }

      event.preventDefault();

      switchLanguage();
    }
  );

  /* ==========================================================
     INITIAL LANGUAGE MIGRATION
  ========================================================== */

  document.documentElement.lang =
    activeLanguage;

  /*
   * Migrate the selected language into the new V21
   * storage key while keeping historical keys alive.
   */
  persistLanguage(
    activeLanguage
  );

  setLanguage(
    activeLanguage,
    {
      persist: false,
      notify: false
    }
  );

  /* ==========================================================
     BOOT
  ========================================================== */

  function finishI18nBoot() {

    applyTranslations(
      document
    );

    updateLanguageButton();

    installTranslationObserver();

    const domAudit =
      audit(
        collectDomTranslationKeys(
          document
        )
      );

    window.__HUSTLE_EMPIRE_I18N_DOM_AUDIT__ =
      domAudit;

    /*
     * Temporary compatibility alias.
     */
    window.__URBAN_TYCOON_I18N_DOM_AUDIT__ =
      domAudit;

    if (
      !domAudit.ok
    ) {

      console.error(
        "[Hustle Empire i18n] DOM translation audit failed:",
        domAudit
      );

    }

    window.dispatchEvent(
      new CustomEvent(
        "hustle:i18nReady",
        {
          detail: {

            language:
              activeLanguage,

            audit:
              domAudit,

            version:
              "21.0"

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
      finishI18nBoot,
      {
        once: true
      }
    );

  } else {

    finishI18nBoot();

  }

})();
