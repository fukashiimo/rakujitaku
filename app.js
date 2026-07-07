const screens = {
  home: document.querySelector("#homeScreen"),
  nights: document.querySelector("#nightsScreen"),
  prefs: document.querySelector("#prefsScreen"),
  list: document.querySelector("#listScreen"),
  done: document.querySelector("#doneScreen"),
};

const preferenceDefinitions = [
  { key: "contacts", label: "コンタクトを使う" },
  { key: "makeup", label: "メイクを持っていく" },
  { key: "skincare", label: "スキンケアを持っていく" },
  { key: "hairIron", label: "ヘアアイロンを使う" },
  { key: "medicine", label: "常備薬がある" },
  { key: "kids", label: "子ども連れ" },
];

const suggestionItems = [
  "モバイルバッテリー",
  "イヤホン",
  "ティッシュ",
  "マスク",
  "ハンカチ",
  "タオル",
  "ナイトブラ",
  "生理用品",
];

const companionItems = {
  contacts: [
    { name: "メガネ（夜用）", category: "洗面" },
    { name: "予備コンタクト", category: "洗面" },
    { name: "コンタクトケース・洗浄液", category: "洗面" },
    { name: "目薬", category: "洗面" },
  ],
  makeup: [
    { name: "メイク落とし", category: "洗面" },
    { name: "メイクブラシ・スポンジ", category: "洗面" },
    { name: "ビューラー", category: "洗面" },
    { name: "リップクリーム", category: "洗面" },
  ],
  skincare: [
    { name: "洗顔料", category: "洗面" },
    { name: "化粧水", category: "洗面" },
    { name: "乳液・クリーム", category: "洗面" },
    { name: "フェイスパック", category: "洗面" },
  ],
  hairIron: [
    { name: "ヘアブラシ", category: "洗面" },
    { name: "ヘアアイロン用ポーチ", category: "洗面" },
  ],
  medicine: [
    { name: "お薬手帳", category: "その他" },
    { name: "痛み止め", category: "その他" },
    { name: "胃薬", category: "その他" },
    { name: "絆創膏", category: "その他" },
  ],
  kids: [
    { name: "子どもの着替え", category: "衣類" },
    { name: "おやつ", category: "その他" },
    { name: "ウェットティッシュ", category: "その他" },
    { name: "母子手帳・保険証", category: "貴重品" },
  ],
};

const transportDefinitions = {
  plane: { label: "飛行機", items: ["航空券・予約確認", "身分証"] },
  train: { label: "電車", items: ["乗車券・ICカード"] },
  car: { label: "車", items: ["運転免許証", "ETCカード"] },
};

const templateDefinitions = {
  none: { label: "通常", items: [] },
  homecoming: { label: "実家", items: ["手土産", "実家の鍵", "帰省先の充電器"] },
  business: { label: "出張", items: ["名刺", "PC", "PC充電器", "会社用の身分証"] },
  camp: { label: "キャンプ", items: ["虫よけ", "懐中電灯", "軍手", "レジャーシート"] },
  disney: { label: "ディズニー", items: ["チケット", "モバイルバッテリー", "雨具", "待ち時間用の羽織"] },
  pool: { label: "プール", items: ["水着", "ゴーグル", "ビーチサンダル", "濡れたもの用の袋"] },
};

const destinationDefinitions = [
  { key: "none", label: "未設定", areaCode: null },
  { key: "sapporo", label: "札幌", areaCode: "016000" },
  { key: "aomori", label: "青森", areaCode: "020000" },
  { key: "morioka", label: "盛岡", areaCode: "030000" },
  { key: "sendai", label: "仙台", areaCode: "040000" },
  { key: "akita", label: "秋田", areaCode: "050000" },
  { key: "yamagata", label: "山形", areaCode: "060000" },
  { key: "fukushima", label: "福島", areaCode: "070000" },
  { key: "mito", label: "水戸", areaCode: "080000" },
  { key: "utsunomiya", label: "宇都宮", areaCode: "090000" },
  { key: "maebashi", label: "前橋", areaCode: "100000" },
  { key: "saitama", label: "さいたま", areaCode: "110000" },
  { key: "chiba", label: "千葉", areaCode: "120000" },
  { key: "tokyo", label: "東京", areaCode: "130000" },
  { key: "yokohama", label: "横浜", areaCode: "140000" },
  { key: "niigata", label: "新潟", areaCode: "150000" },
  { key: "toyama", label: "富山", areaCode: "160000" },
  { key: "kanazawa", label: "金沢", areaCode: "170000" },
  { key: "fukui", label: "福井", areaCode: "180000" },
  { key: "kofu", label: "甲府", areaCode: "190000" },
  { key: "nagano", label: "長野", areaCode: "200000" },
  { key: "gifu", label: "岐阜", areaCode: "210000" },
  { key: "shizuoka", label: "静岡", areaCode: "220000" },
  { key: "nagoya", label: "名古屋", areaCode: "230000" },
  { key: "tsu", label: "津", areaCode: "240000" },
  { key: "otsu", label: "大津", areaCode: "250000" },
  { key: "kyoto", label: "京都", areaCode: "260000" },
  { key: "osaka", label: "大阪", areaCode: "270000" },
  { key: "kobe", label: "神戸", areaCode: "280000" },
  { key: "nara", label: "奈良", areaCode: "290000" },
  { key: "wakayama", label: "和歌山", areaCode: "300000" },
  { key: "tottori", label: "鳥取", areaCode: "310000" },
  { key: "matsue", label: "松江", areaCode: "320000" },
  { key: "okayama", label: "岡山", areaCode: "330000" },
  { key: "hiroshima", label: "広島", areaCode: "340000" },
  { key: "yamaguchi", label: "山口", areaCode: "350000" },
  { key: "tokushima", label: "徳島", areaCode: "360000" },
  { key: "takamatsu", label: "高松", areaCode: "370000" },
  { key: "matsuyama", label: "松山", areaCode: "380000" },
  { key: "kochi", label: "高知", areaCode: "390000" },
  { key: "fukuoka", label: "福岡", areaCode: "400000" },
  { key: "saga", label: "佐賀", areaCode: "410000" },
  { key: "nagasaki", label: "長崎", areaCode: "420000" },
  { key: "kumamoto", label: "熊本", areaCode: "430000" },
  { key: "oita", label: "大分", areaCode: "440000" },
  { key: "miyazaki", label: "宮崎", areaCode: "450000" },
  { key: "kagoshima", label: "鹿児島", areaCode: "460100" },
  { key: "naha", label: "那覇", areaCode: "471000" },
];

const state = {
  nights: 1,
  transport: "train",
  template: "none",
  destination: "none",
  weatherSummary: null,
  preferences: loadPreferences(),
  items: [],
  removedSuggestions: [],
  listBackTarget: "prefs",
};

function loadPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem("rakujitaku_preferences"));
    if (stored && typeof stored === "object") {
      return stored;
    }
  } catch (error) {
    localStorage.removeItem("rakujitaku_preferences");
  }

  return {
    contacts: false,
    makeup: false,
    skincare: false,
    hairIron: false,
    medicine: false,
    kids: false,
  };
}

function savePreferences() {
  localStorage.setItem("rakujitaku_preferences", JSON.stringify(state.preferences));
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "instant" });

  if (name === "home") {
    renderSavedTrips();
  }
}

function createItem(name, category, count = null) {
  return {
    id: crypto.randomUUID(),
    name,
    category,
    count,
    checked: false,
  };
}

function addChecklistItem(items, name, category, count = null) {
  if (items.some((item) => normalizeItemName(item.name) === normalizeItemName(name))) return;
  items.push(createItem(name, category, count));
}

function buildItems() {
  const items = [
    createItem("財布", "貴重品"),
    createItem("スマホ", "貴重品"),
    createItem("鍵", "貴重品"),
    createItem("充電器・ケーブル", "その他"),
    createItem("日焼け止め", "その他"),
  ];

  if (state.nights > 0) {
    addChecklistItem(items, `トップス（${state.nights}日分）`, "衣類", state.nights);
    addChecklistItem(items, `ボトムス（${state.nights}日分）`, "衣類", state.nights);
    addChecklistItem(items, `パジャマ（${state.nights}泊分）`, "衣類", state.nights);
    addChecklistItem(items, `下着（${state.nights}日分）`, "衣類", state.nights);
    addChecklistItem(items, `靴下（${state.nights}日分）`, "衣類", state.nights);
  }

  transportDefinitions[state.transport].items.forEach((name) => addChecklistItem(items, name, "その他"));
  templateDefinitions[state.template].items.forEach((name) => addChecklistItem(items, name, inferCategory(name)));

  if (state.preferences.contacts) {
    addChecklistItem(items, `コンタクト（${state.nights}泊分）`, "洗面", state.nights);
  }
  if (state.preferences.makeup) {
    addChecklistItem(items, "メイク用品", "洗面");
  }
  if (state.preferences.skincare) {
    addChecklistItem(items, `スキンケア（${state.nights}泊分）`, "洗面", state.nights);
  }
  if (state.preferences.hairIron) {
    addChecklistItem(items, "ヘアアイロン", "洗面");
  }
  if (state.preferences.medicine) {
    addChecklistItem(items, "常備薬", "その他");
  }

  Object.entries(companionItems).forEach(([key, companions]) => {
    if (!state.preferences[key]) return;
    companions.forEach((item) => addChecklistItem(items, item.name, item.category));
  });

  state.items = items;
  state.removedSuggestions = [];
}

async function applyWeatherItems(items) {
  state.weatherSummary = null;
  const destination = getDestination(state.destination);
  if (!destination?.areaCode) return;

  try {
    const forecast = await fetchForecast(destination.areaCode);
    const summary = summarizeForecast(forecast, destination);
    state.weatherSummary = summary;

    if (summary.needsRainGear) {
      addChecklistItem(items, "折りたたみ傘", "その他");
      addChecklistItem(items, "雨具", "その他");
    }
    if (summary.needsHeatCare) {
      addChecklistItem(items, "帽子", "衣類");
      addChecklistItem(items, "汗拭きシート", "その他");
      addChecklistItem(items, "飲み物", "その他");
    }
    if (summary.needsColdCare) {
      addChecklistItem(items, "羽織", "衣類");
      addChecklistItem(items, "カイロ", "その他");
    }
  } catch (error) {
    state.weatherSummary = {
      destination: destination.label,
      unavailable: true,
    };
  }
}

async function buildItemsWithWeather() {
  buildItems();
  await applyWeatherItems(state.items);
}

async function fetchForecast(areaCode) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`https://www.jma.go.jp/bosai/forecast/data/forecast/${areaCode}.json`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`forecast request failed: ${response.status}`);
    }
    return response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function summarizeForecast(forecast, destination) {
  const today = forecast[0];
  const weekly = forecast[1];
  const weatherArea = today?.timeSeries?.[0]?.areas?.[0];
  const popArea = today?.timeSeries?.[1]?.areas?.[0];
  const tempArea = today?.timeSeries?.[2]?.areas?.[0];
  const weeklyTempArea = weekly?.timeSeries?.[1]?.areas?.[0];
  const weathers = (weatherArea?.weathers || []).join(" ");
  const pops = (popArea?.pops || weekly?.timeSeries?.[0]?.areas?.[0]?.pops || [])
    .filter((value) => value !== "")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  const temps = [
    ...(tempArea?.temps || []),
    ...(weeklyTempArea?.tempsMin || []),
    ...(weeklyTempArea?.tempsMax || []),
  ]
    .filter((value) => value !== "")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  const maxPop = pops.length > 0 ? Math.max(...pops) : null;
  const minTemp = temps.length > 0 ? Math.min(...temps) : null;
  const maxTemp = temps.length > 0 ? Math.max(...temps) : null;

  return {
    destination: destination.label,
    weatherText: weathers,
    maxPop,
    minTemp,
    maxTemp,
    needsRainGear: /雨|雪|雷/.test(weathers) || (maxPop !== null && maxPop >= 40),
    needsHeatCare: maxTemp !== null && maxTemp >= 30,
    needsColdCare: minTemp !== null && minTemp <= 10,
  };
}

function renderPreferences() {
  const target = document.querySelector("#preferenceList");
  target.innerHTML = "";

  const destinationSelect = document.querySelector("#destinationSelect");
  destinationSelect.innerHTML = destinationDefinitions
    .map((destination) => `<option value="${destination.key}">${destination.label}</option>`)
    .join("");
  destinationSelect.value = state.destination;

  document.querySelectorAll("[data-transport]").forEach((button) => {
    const selected = button.dataset.transport === state.transport;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-checked", selected ? "true" : "false");
  });

  document.querySelectorAll("[data-template]").forEach((button) => {
    const selected = button.dataset.template === state.template;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-checked", selected ? "true" : "false");
  });

  preferenceDefinitions.forEach((definition) => {
    const row = document.createElement("label");
    row.className = "check-row";
    row.innerHTML = `
      <input type="checkbox" ${state.preferences[definition.key] ? "checked" : ""} data-pref="${definition.key}" />
      <span>${definition.label}</span>
    `;
    target.append(row);
  });
}

function renderChecklist() {
  const nightsLabel = state.nights === 0 ? "日帰り" : `${state.nights}泊`;
  const templateLabel = getTemplateLabel(state.template);
  const purpose = state.template === "none" ? "" : ` · ${templateLabel}`;
  const destination = getDestination(state.destination);
  const destinationLabel = destination?.areaCode ? ` · ${destination.label}` : "";
  const weatherLabel = getWeatherSummaryLabel();
  document.querySelector("#tripSummary").textContent =
    `${nightsLabel} · ${getTransportLabel(state.transport)}${purpose}${destinationLabel}${weatherLabel}の支度`;

  const target = document.querySelector("#checklist");
  target.innerHTML = "";
  const categories = ["貴重品", "衣類", "洗面", "その他", "追加"];

  categories.forEach((category) => {
    const categoryItems = state.items.filter((item) => item.category === category);
    if (categoryItems.length === 0) return;

    const block = document.createElement("section");
    block.className = "category";
    block.innerHTML = `<h2>${category}</h2>`;

    categoryItems.forEach((item) => {
      const row = document.createElement("div");
      row.className = `item-row${item.checked ? " is-checked" : ""}`;
      row.innerHTML = `
        <input type="checkbox" id="${item.id}" ${item.checked ? "checked" : ""} data-item="${item.id}" />
        <label for="${item.id}">${item.name}</label>
        <button class="delete-button" type="button" aria-label="${item.name}を削除" data-delete="${item.id}">×</button>
      `;
      block.append(row);
    });

    target.append(block);
  });

  renderProgress();
  renderSuggestions();
  renderItemHistory();
}

function renderProgress() {
  const total = state.items.length;
  const checked = state.items.filter((item) => item.checked).length;
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100);

  document.querySelector("#progressText").textContent = `${checked} / ${total}`;
  document.querySelector("#progressBar").style.width = `${percent}%`;
  document.querySelector("#completeButton").disabled = total === 0 || checked !== total;
}

function renderSuggestions() {
  const target = document.querySelector("#suggestions");
  target.innerHTML = "";

  const names = state.items.map((item) => normalizeItemName(item.name));
  const available = suggestionItems
    .concat(state.removedSuggestions)
    .filter((item, index, array) => array.indexOf(item) === index)
    .filter((item) => !names.includes(normalizeItemName(item)));

  available.forEach((item) => {
    const button = document.createElement("button");
    button.className = "suggestion-button";
    button.type = "button";
    button.textContent = `＋ ${item}`;
    button.addEventListener("click", () => addItem(item));
    target.append(button);
  });
}

function normalizeItemName(name) {
  return name.replace(/（.*?）/g, "").trim();
}

function addItem(name) {
  const cleanName = name.trim();
  if (!cleanName) return;

  const sameCount = state.items.filter((item) => normalizeItemName(item.name) === cleanName).length;
  const displayName = sameCount > 0 ? `${cleanName}（その${sameCount + 1}）` : cleanName;
  state.items.push(createItem(displayName, "追加"));
  renderChecklist();
}

function getTransportLabel(key) {
  return transportDefinitions[key]?.label || "移動手段未設定";
}

function getTemplateLabel(key) {
  return templateDefinitions[key]?.label || "通常";
}

function getDestination(key) {
  return destinationDefinitions.find((destination) => destination.key === key) || destinationDefinitions[0];
}

function getWeatherSummaryLabel() {
  if (!state.weatherSummary) return "";
  if (state.weatherSummary.unavailable) return " · 天気取得なし";

  const labels = [];
  if (state.weatherSummary.needsRainGear) labels.push("雨対策");
  if (state.weatherSummary.needsHeatCare) labels.push("暑さ対策");
  if (state.weatherSummary.needsColdCare) labels.push("寒さ対策");
  return labels.length > 0 ? ` · ${labels.join("/")}` : " · 天気追加なし";
}

function getItemHistory() {
  try {
    const history = JSON.parse(localStorage.getItem("rakujitaku_added_item_history"));
    return Array.isArray(history) ? history : [];
  } catch (error) {
    localStorage.removeItem("rakujitaku_added_item_history");
    return [];
  }
}

function setItemHistory(history) {
  localStorage.setItem("rakujitaku_added_item_history", JSON.stringify(history.slice(0, 20)));
}

function rememberAddedItems(names) {
  const current = getItemHistory();
  const merged = names.concat(current).map(normalizeItemName).filter(Boolean);
  setItemHistory(merged.filter((name, index, array) => array.indexOf(name) === index));
}

function renderItemHistory() {
  const target = document.querySelector("#itemHistory");
  target.innerHTML = "";
  const existing = state.items.map((item) => normalizeItemName(item.name));
  const history = getItemHistory().filter((name) => !existing.includes(normalizeItemName(name)));

  if (history.length === 0) {
    target.innerHTML = '<div class="empty-state">保存後に追加履歴が表示されます。</div>';
    return;
  }

  history.forEach((name) => {
    const button = document.createElement("button");
    button.className = "suggestion-button";
    button.type = "button";
    button.textContent = `＋ ${name}`;
    button.addEventListener("click", () => addItem(name));
    target.append(button);
  });
}

function toggleItem(itemId) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return;

  item.checked = !item.checked;
  renderChecklist();
}

function getSavedTrips() {
  try {
    const trips = JSON.parse(localStorage.getItem("rakujitaku_saved_trips"));
    return Array.isArray(trips) ? trips : [];
  } catch (error) {
    localStorage.removeItem("rakujitaku_saved_trips");
    return [];
  }
}

function setSavedTrips(trips) {
  localStorage.setItem("rakujitaku_saved_trips", JSON.stringify(trips.slice(0, 3)));
}

function renderSavedTrips() {
  const trips = getSavedTrips();
  const target = document.querySelector("#savedList");
  document.querySelector("#savedCount").textContent = `${trips.length}/3`;
  target.innerHTML = "";

  if (trips.length === 0) {
    target.innerHTML = '<div class="empty-state">保存した支度はまだありません。</div>';
    return;
  }

  trips.forEach((trip, index) => {
    const button = document.createElement("button");
    button.className = "saved-card";
    button.type = "button";
    const nightsLabel = trip.nights === 0 ? "日帰り" : `${trip.nights}泊`;
    const title = trip.name || `${nightsLabel}の支度`;
    const transportLabel = getTransportLabel(trip.transport || "train");
    const templateLabel = getTemplateLabel(trip.template || "none");
    const purpose = trip.template && trip.template !== "none" ? ` · ${templateLabel}` : "";
    const destination = getDestination(trip.destination || "none");
    const destinationLabel = destination.areaCode ? ` · ${destination.label}` : "";
    button.innerHTML = `
      <strong>${title}</strong>
      <span>${nightsLabel} · ${transportLabel}${purpose}${destinationLabel} · ${trip.itemNames.length}個 · ${trip.usedCount}回使用</span>
    `;
    button.addEventListener("click", () => {
      trip.usedCount += 1;
      trips.splice(index, 1);
      const sortedTrips = [trip, ...trips].sort((a, b) => b.usedCount - a.usedCount);
      setSavedTrips(sortedTrips);
      state.nights = trip.nights;
      state.transport = trip.transport || "train";
      state.template = trip.template || "none";
      state.destination = trip.destination || "none";
      state.weatherSummary = null;
      state.items = trip.itemNames.map((name) => createItem(name, inferCategory(name)));
      state.listBackTarget = "home";
      renderChecklist();
      showScreen("list");
    });
    target.append(button);
  });
}

function inferCategory(name) {
  const valuableItems = [
    "財布",
    "スマホ",
    "鍵",
    "実家の鍵",
    "航空券・予約確認",
    "身分証",
    "乗車券・ICカード",
    "運転免許証",
    "ETCカード",
    "名刺",
    "会社用の身分証",
    "母子手帳・保険証",
  ];
  const otherItems = [
    "充電器・ケーブル",
    "常備薬",
    "日焼け止め",
    "お薬手帳",
    "痛み止め",
    "胃薬",
    "絆創膏",
    "手土産",
    "帰省先の充電器",
    "PC",
    "PC充電器",
    "虫よけ",
    "懐中電灯",
    "軍手",
    "レジャーシート",
    "チケット",
    "モバイルバッテリー",
    "雨具",
    "折りたたみ傘",
    "汗拭きシート",
    "飲み物",
    "カイロ",
    "ゴーグル",
    "ビーチサンダル",
    "濡れたもの用の袋",
    "おやつ",
    "ウェットティッシュ",
  ];

  if (valuableItems.includes(name)) {
    return "貴重品";
  }
  if (
    name.includes("トップス") ||
    name.includes("ボトムス") ||
    name.includes("パジャマ") ||
    name.includes("下着") ||
    name.includes("靴下") ||
    name.includes("着替え") ||
    name.includes("水着") ||
    name.includes("羽織")
  ) {
    return "衣類";
  }
  if (
    name.includes("コンタクト") ||
    name.includes("メガネ") ||
    name.includes("目薬") ||
    name.includes("メイク") ||
    name.includes("ビューラー") ||
    name.includes("リップ") ||
    name.includes("スキンケア") ||
    name.includes("洗顔") ||
    name.includes("化粧水") ||
    name.includes("乳液") ||
    name.includes("クリーム") ||
    name.includes("フェイスパック") ||
    name.includes("ヘアアイロン") ||
    name.includes("ヘアブラシ")
  ) {
    return "洗面";
  }
  if (otherItems.includes(name)) {
    return "その他";
  }
  return "追加";
}

function saveCurrentTrip() {
  const trips = getSavedTrips();
  const itemNames = state.items.map((item) => item.name);
  const addedItemNames = state.items.filter((item) => item.category === "追加").map((item) => item.name);
  const input = document.querySelector("#tripName");
  const name = input.value.trim();
  const signature = getTripSignature({
    nights: state.nights,
    transport: state.transport,
    template: state.template,
    destination: state.destination,
    itemNames,
  });
  const existingIndex = trips.findIndex((trip) => getTripSignature(trip) === signature);

  if (existingIndex >= 0) {
    trips[existingIndex].usedCount += 1;
    trips[existingIndex].name = name || trips[existingIndex].name || "";
    trips[existingIndex].transport = state.transport;
    trips[existingIndex].template = state.template;
    trips[existingIndex].destination = state.destination;
    trips[existingIndex].addedItemHistory = addedItemNames;
  } else {
    trips.unshift({
      name,
      nights: state.nights,
      transport: state.transport,
      template: state.template,
      destination: state.destination,
      itemNames,
      addedItemHistory: addedItemNames,
      usedCount: 1,
      savedAt: new Date().toISOString(),
    });
  }

  rememberAddedItems(addedItemNames);
  input.value = "";
  setSavedTrips(trips.sort((a, b) => b.usedCount - a.usedCount));
  showScreen("home");
}

function getTripSignature(trip) {
  return [
    trip.nights,
    trip.transport || "train",
    trip.template || "none",
    trip.destination || "none",
    (trip.itemNames || []).join("|"),
  ].join(":");
}

document.addEventListener("click", (event) => {
  const goButton = event.target.closest("[data-go]");
  if (goButton) {
    showScreen(goButton.dataset.go);
  }

  const nightButton = event.target.closest("[data-nights]");
  if (nightButton) {
    state.nights = Number(nightButton.dataset.nights);
    renderPreferences();
    showScreen("prefs");
  }

  const transportButton = event.target.closest("[data-transport]");
  if (transportButton) {
    state.transport = transportButton.dataset.transport;
    renderPreferences();
  }

  const templateButton = event.target.closest("[data-template]");
  if (templateButton) {
    state.template = templateButton.dataset.template;
    renderPreferences();
  }

  const deleteButton = event.target.closest("[data-delete]");
  if (deleteButton) {
    const item = state.items.find((entry) => entry.id === deleteButton.dataset.delete);
    if (item) {
      state.removedSuggestions.push(normalizeItemName(item.name));
      state.items = state.items.filter((entry) => entry.id !== item.id);
      renderChecklist();
    }
    return;
  }

  const itemRow = event.target.closest(".item-row");
  const directControl = event.target.closest("input, label, button");
  if (itemRow && !directControl) {
    const input = itemRow.querySelector("[data-item]");
    if (input) {
      toggleItem(input.dataset.item);
    }
  }
});

document.addEventListener("change", (event) => {
  const preferenceInput = event.target.closest("[data-pref]");
  if (preferenceInput) {
    state.preferences[preferenceInput.dataset.pref] = preferenceInput.checked;
    savePreferences();
  }

  const destinationSelect = event.target.closest("#destinationSelect");
  if (destinationSelect) {
    state.destination = destinationSelect.value;
  }

  const itemInput = event.target.closest("[data-item]");
  if (itemInput) {
    const item = state.items.find((entry) => entry.id === itemInput.dataset.item);
    if (item) {
      item.checked = itemInput.checked;
      renderChecklist();
    }
  }
});

document.querySelector("#buildListButton").addEventListener("click", async () => {
  const button = document.querySelector("#buildListButton");
  button.disabled = true;
  button.textContent = "天気を確認中";
  await buildItemsWithWeather();
  button.disabled = false;
  button.textContent = "チェックリストへ";
  state.listBackTarget = "prefs";
  renderChecklist();
  showScreen("list");
});

document.querySelector("#listBackButton").addEventListener("click", () => {
  showScreen(state.listBackTarget);
});

document.querySelector("#addForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#itemName");
  addItem(input.value);
  input.value = "";
  input.focus();
});

document.querySelector("#completeButton").addEventListener("click", () => {
  showScreen("done");
});

document.querySelector("#saveTripButton").addEventListener("click", saveCurrentTrip);

renderPreferences();
renderSavedTrips();
