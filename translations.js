/* ============================================================
   URBAN TYCOON — CENTRAL EN/RU TRANSLATIONS
   V17.6
============================================================ */
(() => {
  "use strict";

  const STORAGE_KEY = "urbanTycoonLanguageV1";
  const SUPPORTED = Object.freeze(["en", "ru"]);

  const TRANSLATIONS = Object.freeze({
    en: Object.freeze({
      "app.title": "Hustle Empire",
      "language.switchToRussian": "Switch to Russian",
      "language.switchToEnglish": "Switch to English",
      "hud.player": "Player",
      "hud.xp": "XP",
      "hud.money": "Money",
      "hud.energy": "Energy",
      "hud.gems": "Gems",
      "hud.notifications": "Notifications",
      "hud.leaderboard": "Leaderboard",
      "hud.menu": "Menu",
      "hud.boost": "⚡ Boost {multiplier}: {time}",
      "common.buy": "Buy",
      "common.claim": "Claim",
      "common.close": "Close",
      "common.continue": "Continue",
      "common.done": "Done",
      "common.levelShort": "LV",
      "common.locked": "Locked",
      "common.max": "MAX",
      "common.new": "NEW",
      "common.requiresLevel": "Requires LV {level}",
      "common.upgrade": "Upgrade",
      "nav.home": "Home",
      "nav.city": "City",
      "nav.cases": "Cases",
      "nav.collection": "Cards",
      "nav.wardrobe": "Wardrobe",
      "nav.shop": "Shop",
      "home.tagline": "Small steps. Big empire.",
      "home.dailyChallenges": "Daily Challenges",
      "home.dailyChallengesProgressZero": "0/3 completed",
      "home.dailyChallengesComplete": "Completed ✓",
      "home.dailyChallengesProgress": "{completed}/3 completed",
      "home.socialTasks": "Social Tasks",
      "home.dailyRewards": "Daily Rewards",
      "home.socialTasksHint": "Complete tasks and claim rewards",
      "home.dailyChest": "Daily Chest",
      "home.streak": "Hustle Streak",
      "home.offlineEarnings": "Offline Earnings",
      "home.quickHustle": "Quick Hustle",
      "home.tapToEarn": "Tap to Earn",
      "home.missions": "Missions",
      "home.nextLevel": "Next Level",
      "home.quickActivity": "Quick Activity",
      "home.quickJobs": "Quick Jobs",
      "home.completed": "Completed",
      "home.missionsCompletedCount": "{completed}/{total} missions completed",
      "home.empireManagement": "Empire Management",
      "home.activeBusinesses": "Active Businesses",
      "home.totalIncome": "Total Income",
      "home.passiveIncome": "Passive Income",
      "home.perTap": "per tap",
      "city.districtActivity": "District Activity",
      "city.unlocked": "Unlocked",
      "city.poorBlock": "POOR BLOCK",
      "city.starterDistrict": "Starter District",
      "city.cityCenter": "CITY CENTER",
      "city.cityHustles": "City Hustles",
      "city.businessDistrict": "BUSINESS DISTRICT",
      "city.bigBusiness": "Big Business",
      "city.richSkyline": "RICH SKYLINE",
      "city.endgameEmpire": "Endgame Empire",
      "cases.rewards": "Rewards",
      "cases.title": "Cases",
      "cases.helper": "Come back when the timer finishes or spend Gems to unlock instantly.",
      "cases.caseOpened": "Case opened",
      "cases.reward": "Reward",
      "cases.money": "Money",
      "cases.gems": "Gems",
      "cases.fragments": "Fragments",
      "cases.open": "Open",
      "cases.ready": "Ready",
      "cases.unlockNow": "Unlock now",
      "cases.waiting": "Waiting",
      "cases.durationHours": "{hours}h",
      "cases.fragmentsZero": "+0 Fragments",
      "accessoryCases.eyebrow": "Wardrobe Loot",
      "accessoryCases.title": "Premium Accessory Cases",
      "accessoryCases.gemsOnly": "Gems Only",
      "accessoryCases.newItem": "New Item",
      "accessoryCases.collectionComplete": "Collection complete",
      "accessoryCases.openFree": "Open free",
      "accessoryCases.ready": "Ready",
      "accessoryCases.waiting": "Waiting",
      "accessoryCases.itemPlaceholder": "Item",
      "accessorySources.free": "Free Case",
      "accessorySources.rare": "Rare Case",
      "accessorySources.epic": "Epic Case",
      "accessorySources.legendary": "Legendary Case",
      "collection.book": "Collection Book",
      "collection.specialCollection": "Special Collection",
      "collection.exclusiveTitle": "Special Exclusive Cards",
      "collection.exclusiveLabel": "Exclusive",
      "collection.exclusiveSubtitle": "These cards cannot be obtained from normal cases.",
      "collection.businessCard": "Business Card",
      "collection.rpgCard": "RPG Card",
      "collection.levelUp": "Level Up",
      "collection.specialPurchase": "Special Purchase",
      "collection.unlock": "Unlock",
      "collection.cardPlaceholder": "Card",
      "rarity.common": "Common",
      "rarity.rare": "Rare",
      "rarity.epic": "Epic",
      "rarity.legendary": "Legendary",
      "rarity.mythic": "Mythic",
      "business.available": "Available",
      "business.owned": "Owned",
      "hustles.completed": "Completed",
      "hustles.notEnoughEnergy": "Not enough energy",
      "hustles.run": "Run",
      "randomEvents.energyReward": "+{amount} Energy",
      "randomEvents.tapBoostReward": "Tap boost activated",
      "stats.income": "Income",
      "stats.tapPower": "Tap Power",
      "stats.criticalRate": "Critical Rate",
      "stats.criticalDamage": "Critical Damage",
      "stats.maxEnergy": "Max Energy",
      "stats.energyRegen": "Energy Regen",
      "wardrobe.title": "Wardrobe",
      "wardrobe.tabs.items": "Items",
      "wardrobe.tabs.sets": "Style Sets",
      "wardrobe.catalog": "Accessory Catalog",
      "wardrobe.collection": "Collection",
      "wardrobe.outfitProgress": "Outfit Progress",
      "wardrobe.unlockSlot": "Buy LV 1 to unlock",
      "wardrobe.totalStats": "Total Stat Bonuses",
      "wardrobe.buyLevelOne": "Buy LV 1",
      "wardrobe.completeSet": "Complete set",
      "wardrobe.maxLevel": "Max Level",
      "wardrobe.requiredEquipmentLevel": "Requires equipment LV {level}",
      "wardrobe.setComplete": "Set complete",
      "wardrobe.slotLocked": "Slot locked",
      "wardrobe.styleSetProgress": "Style Set Progress",
      "wardrobe.unlockSource": "Source",
      "wardrobe.unlocked": "Unlocked",
      "wardrobe.upgradeToLevel": "Upgrade to LV {level}",
      "wardrobe.character": "Character",
      "wardrobe.zeroIncome": "★ +0% Income",
      "wardrobe.zeroTapPower": "★ +0% Tap Power",
      "wardrobe.zeroCriticalRate": "★ +0% Critical Rate",
      "wardrobe.zeroCriticalDamage": "★ +0% Critical Damage",
      "wardrobe.zeroMaxEnergy": "★ +0 Max Energy",
      "wardrobe.zeroEnergyRegen": "★ +0% Energy Regen",
      "wardrobeSlots.cap": "Headwear",
      "wardrobeSlots.hat": "Headwear",
      "wardrobeSlots.glasses": "Glasses",
      "wardrobeSlots.jacket": "Jacket",
      "wardrobeSlots.pants": "Pants",
      "wardrobeSlots.shoes": "Shoes",
      "wardrobeSlots.accessory": "Accessory",
      "wardrobeSlots.watch": "Accessory",
      "shop.title": "Shop",
      "shop.boosts": "Boosts & Upgrades",
      "shop.income2x": "2x Offline Income",
      "shop.income3x": "3x Offline Income",
      "shop.sevenDays": "For 7 days",
      "shop.offlineCap": "Offline Cap +24h",
      "shop.extendsLimit": "Extends the limit",
      "shop.autoCollect": "Auto-Collect",
      "shop.automaticCollection": "Automatic collection",
      "shop.eventBooster": "Event Booster",
      "shop.bonus24h": "+50% for 24 hours",
      "shop.tapBoost": "Tap Power Boost",
      "shop.bonus12h": "+100% for 12 hours",
      "shop.energyPack": "Energy Pack",
      "shop.energy500": "+500 Energy",
      "shop.businessBooster": "Business Booster",
      "shop.income12h": "+100% Income 12h",
      "shop.luckyEvents": "Lucky Events",
      "shop.chance50": "+50% event chance",
      "shop.gems": "Gems",
      "shop.premiumCase": "Premium Case",
      "shop.premiumCaseDesc": "Open a premium case",
      "shop.outfitSkin": "Outfit / Skin",
      "shop.outfitSkinDesc": "Unlock new outfits",
      "shop.hustleBundle": "Hustle Bundle",
      "shop.hustleBundleDesc": "Exceptional value!",
      "shop.empirePass": "Empire Pass",
      "shop.empirePassDesc": "Unlock your true potential",
      "shop.perMonth": "{price} / month",
      "offline.welcome": "Welcome back, Boss!",
      "offline.accumulated": "Accumulated passive income",
      "offline.maxCap": "Maximum accumulation: 3 hours",
      "offline.cappedAway": "You were away for more than 3h (cap reached).",
      "offline.awayHoursMinutes": "You were away for: {hours}h {minutes}m",
      "offline.awayMinutes": "You were away for: {minutes}m",
      "offline.awayLessMinute": "You were away for less than a minute",
      "offline.claimAmount": "Claim ${amount}",
      "daily.closeAria": "Close Daily Challenges",
      "daily.title": "Daily Challenges",
      "daily.subtitle": "Complete today’s activities and come back tomorrow for a new rotation.",
      "daily.comboTitle": "Daily Combo",
      "daily.comboHint": "Buy or upgrade the 3 targets selected for today.",
      "daily.grandReward": "Grand reward",
      "daily.comboRewardClaimed": "✓ Reward claimed: {reward}",
      "daily.comboMaxReward": "Grand reward: {reward}",
      "daily.cipherTitle": "Morse Cipher",
      "daily.cipherHint": "Decode the Morse sequence into the correct digit.",
      "daily.answerAria": "Morse digit answer",
      "daily.decipherCode": "Decode",
      "daily.cipherDefault": "Convert Morse into the correct digit (0–9).",
      "daily.solved": "Solved ✓",
      "daily.reward": "Reward: {reward}",
      "daily.wrong": "Wrong code. Try again.",
      "daily.success": "Correct! Reward credited.",
      "daily.checkinHint": "Log in every day to grow your reward streak.",
      "daily.day": "DAY {day}",
      "daily.days": "{count} days",
      "daily.claimDay": "Claim Day {day}",
      "daily.claimDay1": "Claim Day 1",
      "daily.claimedToday": "Claimed today ✓",
      "daily.checkinSuccess": "Check-in claimed!",
      "daily.alreadyClaimed": "You already claimed today’s reward.",
      "daily.streakResetHint": "Miss a day and the streak resets to 1.",
      "levelUp.title": "LEVEL UP! LEVEL {level}",
      "levelUp.subtitle": "New level reached. Your rewards are already in your account.",
      "levelUp.gems": "♦ +{amount} Gems",
      "levelUp.earningsBoost": "⚡ {multiplier} earnings · {time}",
      "levelUp.inventory": "Inventory: {caseName} ×{count}",
      "levelUp.claim": "Claim and Use the Boost!",
      "levelUp.case.street": "Street Case",
      "levelUp.case.boss": "Boss Case",
      "levelUp.case.tycoon": "Tycoon Case",
      "leaderboard.seasonRanking": "SEASON RANKING",
      "leaderboard.title": "Leaderboard",
      "leaderboard.subtitle": "Climb the ranking by increasing your income per second.",
      "leaderboard.countdownAria": "Season countdown",
      "leaderboard.seasonEndsIn": "Season ends in",
      "leaderboard.rewardsAtClose": "Rewards are distributed when the season ends",
      "leaderboard.supportAria": "Leaderboard rewards and offer",
      "leaderboard.seasonRewards": "SEASON REWARDS",
      "leaderboard.endSeasonRewards": "End-of-season rewards",
      "leaderboard.reward1000Gems": "1,000 Gems",
      "leaderboard.legendaryAccessory": "+ Legendary Accessory",
      "leaderboard.reward500Gems": "500 Gems",
      "leaderboard.exclusiveAccessory": "+ Exclusive Accessory",
      "leaderboard.reward150Gems": "150 Gems",
      "leaderboard.epicAccessoryCase": "+ Epic Accessory Case",
      "leaderboard.flashOffer": "⚡ FLASH OFFER",
      "leaderboard.doubleIncomeBoost": "x2 Income Boost",
      "leaderboard.doubleIncomePitch": "Double your income for 30 minutes and climb the ranking.",
      "leaderboard.activeProductionOnly": "Applies to active production. Does not increase offline earnings.",
      "leaderboard.activateX2": "ACTIVATE x2",
      "leaderboard.topTycoons": "TOP TYCOONS",
      "leaderboard.globalRanking": "Global Ranking",
      "leaderboard.season01": "SEASON 01",
      "leaderboard.player": "Player",
      "leaderboard.incomePerSecond": "Income / s",
      "leaderboard.listAria": "Player ranking",
      "leaderboard.currentAvatar": "Your avatar",
      "leaderboard.you": "You",
      "leaderboard.yourPosition": "YOUR POSITION",
      "leaderboard.prestige": "Prestige",
      "leaderboard.rewardMax": "#1 · Maximum reward",
      "leaderboard.rewardTop3": "Top 3 · #{rank}",
      "leaderboard.rewardTop10": "Top 10 · #{rank}",
      "leaderboard.rewardOutside": "#{rank} · Outside Top 10",
      "leaderboard.defendFirst": "You’re already #1 — defend first place.",
      "leaderboard.gapPrestige": "You need {gap} more Prestige to reach #{rank}.",
      "leaderboard.gapIncome": "You need {gap} more to reach #{rank}.",
      "leaderboard.boostTimeRemaining": "Boost time remaining",
      "leaderboard.offerTimeRemaining": "Offer time remaining",
      "leaderboard.boostActiveButton": "BOOST ACTIVE",
      "leaderboard.expiredButton": "EXPIRED",
      "leaderboard.activateButton": "ACTIVATE x2",
      "leaderboard.boostActiveStatus": "Income x{multiplier} active · ends in {time}",
      "leaderboard.offerExpiredStatus": "This season’s offer has ended.",
      "leaderboard.offerAffordableStatus": "x2 Income for 30 minutes · does not increase offline earnings.",
      "leaderboard.offerNeedGemsStatus": "You need {gems} Gems · tap to open the Shop.",
      "time.dayShort": "d",
      "time.hourShort": "h",
      "time.minuteShort": "m",
      "social.openAria": "Open Daily Tasks & Rewards",
      "social.closeAria": "Close Daily Tasks & Rewards",
      "social.eyebrow": "SOCIAL REWARDS",
      "social.title": "Daily Tasks & Rewards",
      "social.subtitle": "Complete social tasks to earn extra rewards.",
      "social.progressToday": "TODAY’S PROGRESS",
      "social.daily": "Daily",
      "social.resetsEvery24h": "Resets every 24h",
      "social.reset24h": "Reset in 24h",
      "social.resetCountdown": "Reset in {hours}h {minutes}m",
      "social.dailyReward": "Daily Reward",
      "social.dailyRewardHint": "Log in every day and claim the reward",
      "social.rewardAvailableAria": "Reward available",
      "social.socialCommunity": "Social & Community",
      "social.completeOnce": "Complete once",
      "social.joinTelegram": "Join the Telegram channel",
      "social.officialChannel": "Urban Tycoon Official",
      "social.followX": "Follow Urban Tycoon on X",
      "social.followOfficialProfile": "Follow the official profile",
      "social.invite3": "Invite 3 friends",
      "social.invite3Zero": "0 / 3 friends invited",
      "social.invite10": "Invite 10 friends",
      "social.invite10Zero": "0 / 10 friends invited",
      "social.visitCommunity": "Visit the Community",
      "social.openOfficialCommunity": "Open the official community",
      "social.newTasksDaily": "New tasks are available every day.",
      "social.claimed": "Reward claimed",
      "social.claimReady": "Reward ready to claim",
      "social.verifying": "Verifying...",
      "social.inviteProgress": "{progress} / {target} friends invited",
      "social.completeTask": "Complete the task",
      "social.statusCompleted": "Completed",
      "social.statusRewardAvailable": "Reward available",
      "social.statusVerifying": "Verification in progress",
      "social.statusPending": "To complete",
      "social.shareText": "Play Urban Tycoon with me!",
      "notifications.eyebrow": "TYCOON ALERTS",
      "notifications.title": "Notifications",
      "notifications.subtitle": "Useful updates about your empire.",
      "notifications.closeAria": "Close notifications",
      "notifications.dailyTitle": "Daily Challenges",
      "notifications.dailyMessage": "{completed}/3 completed · finish the activities before reset.",
      "notifications.nextLevelTitle": "Next Level ready",
      "notifications.nextLevelMessage": "You completed all {count} missions for level {level}.",
      "notifications.boostTitle": "Income boost active",
      "notifications.boostMessage": "{multiplier} for another {time}.",
      "notifications.count": "{count} notifications",
      "notifications.none": "No new notifications",
      "notifications.allClear": "Everything under control",
      "notifications.noUrgent": "There are no urgent notifications right now."
}),
    ru: Object.freeze({
      "app.title": "Hustle Empire",
      "language.switchToRussian": "Переключить на русский",
      "language.switchToEnglish": "Переключить на английский",
      "hud.player": "Игрок",
      "hud.xp": "Опыт",
      "hud.money": "Деньги",
      "hud.energy": "Энергия",
      "hud.gems": "Кристаллы",
      "hud.notifications": "Уведомления",
      "hud.leaderboard": "Лидерборд",
      "hud.menu": "Меню",
      "hud.boost": "⚡ Буст {multiplier}: {time}",
      "common.buy": "Купить",
      "common.claim": "Забрать",
      "common.close": "Закрыть",
      "common.continue": "Продолжить",
      "common.done": "Готово",
      "common.levelShort": "УР",
      "common.locked": "Закрыто",
      "common.max": "МАКС",
      "common.new": "НОВОЕ",
      "common.requiresLevel": "Требуется УР {level}",
      "common.upgrade": "Улучшить",
      "nav.home": "Главная",
      "nav.city": "Город",
      "nav.cases": "Кейсы",
      "nav.collection": "Карты",
      "nav.wardrobe": "Гардероб",
      "nav.shop": "Магазин",
      "home.tagline": "Маленькие шаги. Большая империя.",
      "home.dailyChallenges": "Ежедневные задания",
      "home.dailyChallengesProgressZero": "0/3 выполнено",
      "home.dailyChallengesComplete": "Готово ✓",
      "home.dailyChallengesProgress": "{completed}/3 выполнено",
      "home.socialTasks": "Социальные задания",
      "home.dailyRewards": "Ежедневные награды",
      "home.socialTasksHint": "Выполняй задания и забирай награды",
      "home.dailyChest": "Ежедневный сундук",
      "home.streak": "Серия активности",
      "home.offlineEarnings": "Офлайн-доход",
      "home.quickHustle": "Быстрый заработок",
      "home.tapToEarn": "Нажимай и зарабатывай",
      "home.missions": "Миссии",
      "home.nextLevel": "Следующий уровень",
      "home.quickActivity": "Быстрая активность",
      "home.quickJobs": "Быстрые задания",
      "home.completed": "Выполнено",
      "home.missionsCompletedCount": "{completed}/{total} миссий выполнено",
      "home.empireManagement": "Управление империей",
      "home.activeBusinesses": "Активные бизнесы",
      "home.totalIncome": "Общий доход",
      "home.passiveIncome": "Пассивный доход",
      "home.perTap": "за тап",
      "city.districtActivity": "Активность района",
      "city.unlocked": "Открыто",
      "city.poorBlock": "БЕДНЫЙ КВАРТАЛ",
      "city.starterDistrict": "Стартовый район",
      "city.cityCenter": "ЦЕНТР ГОРОДА",
      "city.cityHustles": "Городские дела",
      "city.businessDistrict": "ДЕЛОВОЙ РАЙОН",
      "city.bigBusiness": "Большой бизнес",
      "city.richSkyline": "БОГАТЫЙ РАЙОН",
      "city.endgameEmpire": "Империя эндгейма",
      "cases.rewards": "Награды",
      "cases.title": "Кейсы",
      "cases.helper": "Вернись после таймера или потрать кристаллы, чтобы открыть сразу.",
      "cases.caseOpened": "Кейс открыт",
      "cases.reward": "Награда",
      "cases.money": "Деньги",
      "cases.gems": "Кристаллы",
      "cases.fragments": "Фрагменты",
      "cases.open": "Открыть",
      "cases.ready": "Готово",
      "cases.unlockNow": "Открыть сейчас",
      "cases.waiting": "Ожидание",
      "cases.durationHours": "{hours}ч",
      "cases.fragmentsZero": "+0 фрагментов",
      "accessoryCases.eyebrow": "Лут гардероба",
      "accessoryCases.title": "Премиальные кейсы аксессуаров",
      "accessoryCases.gemsOnly": "Только за кристаллы",
      "accessoryCases.newItem": "Новый предмет",
      "accessoryCases.collectionComplete": "Коллекция собрана",
      "accessoryCases.openFree": "Открыть бесплатно",
      "accessoryCases.ready": "Готово",
      "accessoryCases.waiting": "Ожидание",
      "accessoryCases.itemPlaceholder": "Предмет",
      "accessorySources.free": "Бесплатный кейс",
      "accessorySources.rare": "Редкий кейс",
      "accessorySources.epic": "Эпический кейс",
      "accessorySources.legendary": "Легендарный кейс",
      "collection.book": "Коллекция карт",
      "collection.specialCollection": "Особая коллекция",
      "collection.exclusiveTitle": "Эксклюзивные карты",
      "collection.exclusiveLabel": "Эксклюзив",
      "collection.exclusiveSubtitle": "Эти карты не выпадают из обычных кейсов.",
      "collection.businessCard": "Карта бизнеса",
      "collection.rpgCard": "RPG-карта",
      "collection.levelUp": "Улучшить",
      "collection.specialPurchase": "Купить отдельно",
      "collection.unlock": "Открыть",
      "collection.cardPlaceholder": "Карта",
      "rarity.common": "Обычная",
      "rarity.rare": "Редкая",
      "rarity.epic": "Эпическая",
      "rarity.legendary": "Легендарная",
      "rarity.mythic": "Мифическая",
      "business.available": "Доступно",
      "business.owned": "Куплено",
      "hustles.completed": "Выполнено",
      "hustles.notEnoughEnergy": "Недостаточно энергии",
      "hustles.run": "Запустить",
      "randomEvents.energyReward": "+{amount} энергии",
      "randomEvents.tapBoostReward": "Буст тапа активирован",
      "stats.income": "Доход",
      "stats.tapPower": "Сила тапа",
      "stats.criticalRate": "Шанс крита",
      "stats.criticalDamage": "Крит. урон",
      "stats.maxEnergy": "Макс. энергия",
      "stats.energyRegen": "Реген энергии",
      "wardrobe.title": "Гардероб",
      "wardrobe.tabs.items": "Предметы",
      "wardrobe.tabs.sets": "Комплекты",
      "wardrobe.catalog": "Каталог аксессуаров",
      "wardrobe.collection": "Коллекция",
      "wardrobe.outfitProgress": "Прогресс образа",
      "wardrobe.unlockSlot": "Купи УР 1, чтобы открыть",
      "wardrobe.totalStats": "Общие бонусы характеристик",
      "wardrobe.buyLevelOne": "Купить УР 1",
      "wardrobe.completeSet": "Собрать сет",
      "wardrobe.maxLevel": "Макс. уровень",
      "wardrobe.requiredEquipmentLevel": "Нужен УР экипировки {level}",
      "wardrobe.setComplete": "Сет собран",
      "wardrobe.slotLocked": "Слот закрыт",
      "wardrobe.styleSetProgress": "Прогресс сета",
      "wardrobe.unlockSource": "Источник",
      "wardrobe.unlocked": "Открыто",
      "wardrobe.upgradeToLevel": "Улучшить до УР {level}",
      "wardrobe.character": "Персонаж",
      "wardrobe.zeroIncome": "★ +0% Доход",
      "wardrobe.zeroTapPower": "★ +0% Сила тапа",
      "wardrobe.zeroCriticalRate": "★ +0% Шанс крита",
      "wardrobe.zeroCriticalDamage": "★ +0% Крит. урон",
      "wardrobe.zeroMaxEnergy": "★ +0 Макс. энергия",
      "wardrobe.zeroEnergyRegen": "★ +0% Реген энергии",
      "wardrobeSlots.cap": "Головной убор",
      "wardrobeSlots.hat": "Головной убор",
      "wardrobeSlots.glasses": "Очки",
      "wardrobeSlots.jacket": "Куртка",
      "wardrobeSlots.pants": "Брюки",
      "wardrobeSlots.shoes": "Обувь",
      "wardrobeSlots.accessory": "Аксессуар",
      "wardrobeSlots.watch": "Аксессуар",
      "shop.title": "Магазин",
      "shop.boosts": "Бусты и улучшения",
      "shop.income2x": "2x доход офлайн",
      "shop.income3x": "3x доход офлайн",
      "shop.sevenDays": "На 7 дней",
      "shop.offlineCap": "Лимит офлайн +24ч",
      "shop.extendsLimit": "Увеличивает лимит",
      "shop.autoCollect": "Автосбор",
      "shop.automaticCollection": "Автоматический сбор",
      "shop.eventBooster": "Буст событий",
      "shop.bonus24h": "+50% на 24 часа",
      "shop.tapBoost": "Буст силы тапа",
      "shop.bonus12h": "+100% на 12 часов",
      "shop.energyPack": "Пак энергии",
      "shop.energy500": "+500 энергии",
      "shop.businessBooster": "Буст бизнеса",
      "shop.income12h": "+100% дохода на 12ч",
      "shop.luckyEvents": "Удачные события",
      "shop.chance50": "+50% шанс события",
      "shop.gems": "Кристаллы",
      "shop.premiumCase": "Премиум кейс",
      "shop.premiumCaseDesc": "Открыть премиум кейс",
      "shop.outfitSkin": "Образ / Скин",
      "shop.outfitSkinDesc": "Открыть новые образы",
      "shop.hustleBundle": "Hustle набор",
      "shop.hustleBundleDesc": "Максимальная выгода!",
      "shop.empirePass": "Empire Pass",
      "shop.empirePassDesc": "Раскрой потенциал империи",
      "shop.perMonth": "{price} / месяц",
      "offline.welcome": "С возвращением, Босс!",
      "offline.accumulated": "Накопленный пассивный доход",
      "offline.maxCap": "Максимальное накопление: 3 часа",
      "offline.cappedAway": "Тебя не было больше 3ч (лимит достигнут).",
      "offline.awayHoursMinutes": "Тебя не было: {hours}ч {minutes}м",
      "offline.awayMinutes": "Тебя не было: {minutes}м",
      "offline.awayLessMinute": "Тебя не было меньше минуты",
      "offline.claimAmount": "Забрать ${amount}",
      "daily.closeAria": "Закрыть ежедневные задания",
      "daily.title": "Ежедневные задания",
      "daily.subtitle": "Выполни сегодняшние задания и вернись завтра за новой ротацией.",
      "daily.comboTitle": "Ежедневное комбо",
      "daily.comboHint": "Купи или улучши 3 выбранные сегодня цели.",
      "daily.grandReward": "Главная награда",
      "daily.comboRewardClaimed": "✓ Награда получена: {reward}",
      "daily.comboMaxReward": "Главная награда: {reward}",
      "daily.cipherTitle": "Шифр Морзе",
      "daily.cipherHint": "Расшифруй последовательность Морзе в правильную цифру.",
      "daily.answerAria": "Ответ для шифра Морзе",
      "daily.decipherCode": "Расшифровать",
      "daily.cipherDefault": "Преобразуй Морзе в правильную цифру (0–9).",
      "daily.solved": "Решено ✓",
      "daily.reward": "Награда: {reward}",
      "daily.wrong": "Неверный код. Попробуй снова.",
      "daily.success": "Верно! Награда начислена.",
      "daily.checkinHint": "Заходи каждый день, чтобы увеличивать серию наград.",
      "daily.day": "ДЕНЬ {day}",
      "daily.days": "{count} дн.",
      "daily.claimDay": "Забрать день {day}",
      "daily.claimDay1": "Забрать день 1",
      "daily.claimedToday": "Сегодня получено ✓",
      "daily.checkinSuccess": "Награда за вход получена!",
      "daily.alreadyClaimed": "Сегодняшняя награда уже получена.",
      "daily.streakResetHint": "Пропусти день — серия сбросится до 1.",
      "levelUp.title": "НОВЫЙ УРОВЕНЬ! УРОВЕНЬ {level}",
      "levelUp.subtitle": "Новый уровень достигнут. Награды уже зачислены на аккаунт.",
      "levelUp.gems": "♦ +{amount} кристаллов",
      "levelUp.earningsBoost": "⚡ {multiplier} доход · {time}",
      "levelUp.inventory": "Инвентарь: {caseName} ×{count}",
      "levelUp.claim": "Забрать и использовать буст!",
      "levelUp.case.street": "Уличный кейс",
      "levelUp.case.boss": "Босс-кейс",
      "levelUp.case.tycoon": "Кейс магната",
      "leaderboard.seasonRanking": "РЕЙТИНГ СЕЗОНА",
      "leaderboard.title": "Лидерборд",
      "leaderboard.subtitle": "Поднимайся в рейтинге, увеличивая доход в секунду.",
      "leaderboard.countdownAria": "Таймер сезона",
      "leaderboard.seasonEndsIn": "До конца сезона",
      "leaderboard.rewardsAtClose": "Награды будут выданы после завершения сезона",
      "leaderboard.supportAria": "Награды и предложение лидерборда",
      "leaderboard.seasonRewards": "НАГРАДЫ СЕЗОНА",
      "leaderboard.endSeasonRewards": "Награды за сезон",
      "leaderboard.reward1000Gems": "1 000 кристаллов",
      "leaderboard.legendaryAccessory": "+ Легендарный аксессуар",
      "leaderboard.reward500Gems": "500 кристаллов",
      "leaderboard.exclusiveAccessory": "+ Эксклюзивный аксессуар",
      "leaderboard.reward150Gems": "150 кристаллов",
      "leaderboard.epicAccessoryCase": "+ Эпический кейс аксессуаров",
      "leaderboard.flashOffer": "⚡ ФЛЭШ-ПРЕДЛОЖЕНИЕ",
      "leaderboard.doubleIncomeBoost": "Буст дохода x2",
      "leaderboard.doubleIncomePitch": "Удвой доход на 30 минут и поднимись в рейтинге.",
      "leaderboard.activeProductionOnly": "Работает на активный доход. Не увеличивает офлайн-доход.",
      "leaderboard.activateX2": "АКТИВИРОВАТЬ x2",
      "leaderboard.topTycoons": "ТОП МАГНАТОВ",
      "leaderboard.globalRanking": "Глобальный рейтинг",
      "leaderboard.season01": "СЕЗОН 01",
      "leaderboard.player": "Игрок",
      "leaderboard.incomePerSecond": "Доход / с",
      "leaderboard.listAria": "Рейтинг игроков",
      "leaderboard.currentAvatar": "Твой аватар",
      "leaderboard.you": "Ты",
      "leaderboard.yourPosition": "ТВОЯ ПОЗИЦИЯ",
      "leaderboard.prestige": "Престиж",
      "leaderboard.rewardMax": "#1 · Максимальная награда",
      "leaderboard.rewardTop3": "Топ 3 · #{rank}",
      "leaderboard.rewardTop10": "Топ 10 · #{rank}",
      "leaderboard.rewardOutside": "#{rank} · Вне топ-10",
      "leaderboard.defendFirst": "Ты уже #1 — удерживай первое место.",
      "leaderboard.gapPrestige": "Нужно ещё {gap} престижа до #{rank}.",
      "leaderboard.gapIncome": "Нужно ещё {gap} до #{rank}.",
      "leaderboard.boostTimeRemaining": "Осталось времени буста",
      "leaderboard.offerTimeRemaining": "Осталось времени предложения",
      "leaderboard.boostActiveButton": "БУСТ АКТИВЕН",
      "leaderboard.expiredButton": "ИСТЕКЛО",
      "leaderboard.activateButton": "АКТИВИРОВАТЬ x2",
      "leaderboard.boostActiveStatus": "Доход x{multiplier} активен · осталось {time}",
      "leaderboard.offerExpiredStatus": "Предложение этого сезона завершено.",
      "leaderboard.offerAffordableStatus": "x2 доход на 30 минут · не увеличивает офлайн-доход.",
      "leaderboard.offerNeedGemsStatus": "Нужно {gems} кристаллов · нажми, чтобы открыть Магазин.",
      "time.dayShort": "д",
      "time.hourShort": "ч",
      "time.minuteShort": "м",
      "social.openAria": "Открыть ежедневные задания и награды",
      "social.closeAria": "Закрыть ежедневные задания и награды",
      "social.eyebrow": "СОЦИАЛЬНЫЕ НАГРАДЫ",
      "social.title": "Ежедневные задания и награды",
      "social.subtitle": "Выполняй социальные задания и получай дополнительные награды.",
      "social.progressToday": "ПРОГРЕСС СЕГОДНЯ",
      "social.daily": "Ежедневное",
      "social.resetsEvery24h": "Сброс каждые 24ч",
      "social.reset24h": "Сброс через 24 ч",
      "social.resetCountdown": "Сброс через {hours}ч {minutes}м",
      "social.dailyReward": "Ежедневная награда",
      "social.dailyRewardHint": "Заходи каждый день и забирай награду",
      "social.rewardAvailableAria": "Награда доступна",
      "social.socialCommunity": "Соцсети и сообщество",
      "social.completeOnce": "Выполняется один раз",
      "social.joinTelegram": "Вступить в Telegram-канал",
      "social.officialChannel": "Urban Tycoon Official",
      "social.followX": "Подписаться на Urban Tycoon в X",
      "social.followOfficialProfile": "Подпишись на официальный профиль",
      "social.invite3": "Пригласить 3 друзей",
      "social.invite3Zero": "0 / 3 друзей приглашено",
      "social.invite10": "Пригласить 10 друзей",
      "social.invite10Zero": "0 / 10 друзей приглашено",
      "social.visitCommunity": "Посетить сообщество",
      "social.openOfficialCommunity": "Открыть официальное сообщество",
      "social.newTasksDaily": "Новые задания доступны каждый день.",
      "social.claimed": "Награда получена",
      "social.claimReady": "Награда готова",
      "social.verifying": "Проверка...",
      "social.inviteProgress": "{progress} / {target} друзей приглашено",
      "social.completeTask": "Выполни задание",
      "social.statusCompleted": "Выполнено",
      "social.statusRewardAvailable": "Награда доступна",
      "social.statusVerifying": "Идёт проверка",
      "social.statusPending": "Нужно выполнить",
      "social.shareText": "Играй со мной в Urban Tycoon!",
      "notifications.eyebrow": "ОПОВЕЩЕНИЯ TYCOON",
      "notifications.title": "Уведомления",
      "notifications.subtitle": "Полезные обновления о твоей империи.",
      "notifications.closeAria": "Закрыть уведомления",
      "notifications.dailyTitle": "Ежедневные задания",
      "notifications.dailyMessage": "{completed}/3 выполнено · заверши задания до сброса.",
      "notifications.nextLevelTitle": "Следующий уровень готов",
      "notifications.nextLevelMessage": "Все {count} миссий уровня {level} выполнены.",
      "notifications.boostTitle": "Буст дохода активен",
      "notifications.boostMessage": "{multiplier} ещё {time}.",
      "notifications.count": "{count} уведомлений",
      "notifications.none": "Новых уведомлений нет",
      "notifications.allClear": "Всё под контролем",
      "notifications.noUrgent": "Сейчас нет срочных уведомлений."
})
  });

  function normalizeLanguage(language) {
    return String(language || "").toLowerCase().startsWith("ru") ? "ru" : "en";
  }

  function detectInitialLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (_) {}

    const telegramLanguage =
      window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;

    if (telegramLanguage) return normalizeLanguage(telegramLanguage);
    return normalizeLanguage(navigator.language || document.documentElement.lang || "en");
  }

  function interpolate(template, params = {}) {
    return String(template ?? "").replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(params, key)
        ? String(params[key])
        : `{${key}}`;
    });
  }

  let activeLanguage = detectInitialLanguage();

  function t(key, params = {}, language = activeLanguage) {
    const lang = normalizeLanguage(language);
    const source = TRANSLATIONS[lang] || TRANSLATIONS.en;
    const fallback = TRANSLATIONS.en;

    const value =
      source[key]
      ?? fallback[key]
      ?? key;

    return interpolate(value, params);
  }

  function applyTranslations(root = document) {
    root.querySelectorAll?.("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (!key) return;
      element.textContent = t(key);
    });

    root.querySelectorAll?.("[data-i18n-aria-label]").forEach((element) => {
      const key = element.dataset.i18nAriaLabel;
      if (!key) return;
      element.setAttribute("aria-label", t(key));
    });

    root.querySelectorAll?.("[data-i18n-title]").forEach((element) => {
      const key = element.dataset.i18nTitle;
      if (!key) return;
      element.setAttribute("title", t(key));
    });

    root.querySelectorAll?.("[data-i18n-placeholder]").forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      if (!key) return;
      element.setAttribute("placeholder", t(key));
    });

    root.querySelectorAll?.("[data-i18n-alt]").forEach((element) => {
      const key = element.dataset.i18nAlt;
      if (!key) return;
      element.setAttribute("alt", t(key));
    });

    document.title = t("app.title");
  }

  function updateLanguageButton() {
    const button = document.getElementById("language-switch");
    if (!button) return;

    const target = activeLanguage === "en" ? "ru" : "en";
    button.textContent = target.toUpperCase();
    button.dataset.targetLanguage = target;

    const ariaKey =
      target === "ru"
        ? "language.switchToRussian"
        : "language.switchToEnglish";

    button.setAttribute("aria-label", t(ariaKey));
    button.title = t(ariaKey);
  }

  function setLanguage(language, options = {}) {
    const nextLanguage = normalizeLanguage(language);
    const previousLanguage = activeLanguage;

    activeLanguage = nextLanguage;
    document.documentElement.lang = nextLanguage;

    if (options.persist !== false) {
      try {
        localStorage.setItem(STORAGE_KEY, nextLanguage);
      } catch (_) {}
    }

    applyTranslations(document);
    updateLanguageButton();

    if (options.notify !== false && previousLanguage !== nextLanguage) {
      window.dispatchEvent(new CustomEvent("hustle:languageChanged", {
        detail: {
          language: nextLanguage,
          previousLanguage
        }
      }));
    }

    return nextLanguage;
  }

  function switchLanguage() {
    return setLanguage(activeLanguage === "en" ? "ru" : "en");
  }

  function getLanguage() {
    return activeLanguage;
  }

  window.i18n = Object.freeze({
    translations: TRANSLATIONS,
    supported: SUPPORTED,
    t,
    apply: applyTranslations,
    setLanguage,
    switchLanguage,
    getLanguage
  });

  /*
     Capture phase prevents any legacy language-click handler from toggling
     the language a second time.
  */
  document.addEventListener("click", (event) => {
    const button = event.target?.closest?.("#language-switch");
    if (!button) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    switchLanguage();
  }, true);

  setLanguage(activeLanguage, {
    persist: false,
    notify: false
  });

  document.addEventListener("DOMContentLoaded", () => {
    applyTranslations(document);
    updateLanguageButton();
  }, { once: true });
})();
