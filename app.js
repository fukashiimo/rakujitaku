const screens = {
  home: document.querySelector("#homeScreen"),
  nights: document.querySelector("#nightsScreen"),
  prefs: document.querySelector("#prefsScreen"),
  list: document.querySelector("#listScreen"),
  done: document.querySelector("#doneScreen"),
};

const preferenceDefinitions = [
  { key: "contacts", label: "コンタクトを使う" },
  { key: "makeup", label: "メイク用品を持っていく" },
  { key: "skincare", label: "スキンケア用品を持っていく" },
  { key: "hairIron", label: "ヘアアイロンを使う" },
];

const suggestionItems = [
  "モバイルバッテリー",
  "充電ケーブル",
  "イヤホン",
  "常備薬",
  "エコバッグ",
  "ビニール袋",
  "ティッシュ",
  "マスク",
  "ハンカチ",
  "タオル",
  "ナイトブラ",
  "生理用品",
];

// 天気予報に応じて「持ち物を追加」に提案する候補（保存には含めない）
const weatherSuggestionSets = [
  { flag: "needsRainGear", tag: "☔ 雨予報", items: ["折りたたみ傘", "レインコート", "濡れたもの用の袋"] },
  { flag: "needsHeatCare", tag: "☀️ 暑さ対策", items: ["日焼け止め", "日傘", "汗拭きシート"] },
  { flag: "needsColdCare", tag: "❄️ 寒さ対策", items: ["カイロ", "手袋", "マフラー"] },
];

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
  destinationKeys: [],
  travelDate: getTodayDate(),
  customDestinations: loadCustomDestinations(),
  weatherSummary: null,
  weatherPreviews: {},
  preferences: loadPreferences(),
  items: [],
  removedSuggestions: [],
  listBackTarget: "prefs",
  activeTripId: null,
};

const weatherPreviewQueue = [];
const weatherPreviewRequestKeys = new Set();
const weatherPreviewConcurrency = 4;
let weatherPreviewActiveCount = 0;

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
  };
}

function savePreferences() {
  localStorage.setItem("rakujitaku_preferences", JSON.stringify(state.preferences));
}

function loadCustomDestinations() {
  try {
    const destinations = JSON.parse(localStorage.getItem("rakujitaku_custom_destinations"));
    if (!Array.isArray(destinations)) return [];

    return destinations
      .map((destination) => ({
        key: typeof destination.key === "string" ? destination.key : "",
        label: normalizeDestinationLabel(destination.label || ""),
        areaCode: null,
        custom: true,
      }))
      .filter((destination) => destination.key.startsWith("custom:") && destination.label);
  } catch (error) {
    localStorage.removeItem("rakujitaku_custom_destinations");
    return [];
  }
}

function saveCustomDestinations() {
  localStorage.setItem("rakujitaku_custom_destinations", JSON.stringify(state.customDestinations.slice(0, 30)));
}

function normalizeDestinationLabel(label) {
  return String(label).replace(/\s+/g, " ").replace(/　+/g, " ").trim();
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDate() {
  return formatLocalDate(new Date());
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getTomorrowDate() {
  return formatLocalDate(addDays(new Date(), 1));
}

function normalizeDate(value) {
  const text = String(value || "");
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : getTodayDate();
}

function getForecastDateLabel(date = state.travelDate) {
  const normalizedDate = normalizeDate(date);
  if (normalizedDate === getTodayDate()) return "今日";
  if (normalizedDate === getTomorrowDate()) return "明日";

  const [, month, day] = normalizedDate.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function hideMoreNightsForm() {
  const form = document.querySelector("#moreNightsForm");
  if (form) {
    form.hidden = true;
  }

  const button = document.querySelector("#moreNightsButton");
  if (button) {
    button.classList.remove("is-selected");
    button.setAttribute("aria-expanded", "false");
  }
}

function showMoreNightsForm() {
  const form = document.querySelector("#moreNightsForm");
  const input = document.querySelector("#customNights");
  const button = document.querySelector("#moreNightsButton");
  if (!form || !input || !button) return;

  form.hidden = false;
  button.classList.add("is-selected");
  button.setAttribute("aria-expanded", "true");

  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "nearest", behavior: "smooth" });
    input.focus();
    input.select();
  });
}

function selectNights(value) {
  state.nights = value;
  hideMoreNightsForm();
  renderPreferences();
  showScreen("prefs");
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "instant" });

  if (name !== "nights") {
    hideMoreNightsForm();
  }

  if (name !== "prefs") {
    closeDestinationPanel();
  }

  if (name === "home") {
    renderSavedTrips();
  }
}

function createItem(name, category, count = null, fromWeather = false) {
  return {
    id: crypto.randomUUID(),
    name,
    category,
    count,
    checked: false,
    fromWeather,
  };
}

function addChecklistItem(items, name, category, count = null) {
  if (items.some((item) => normalizeItemName(item.name) === normalizeItemName(name))) return;
  items.push(createItem(name, category, count));
}

// 持ち物生成仕様（天気条件は含まない）に沿って持ち物リストを作る
function buildItems() {
  const nights = state.nights;
  const items = [];

  // ① 常に表示する（デフォルト）
  // 貴重品
  addChecklistItem(items, "財布", "貴重品");
  addChecklistItem(items, "スマホ", "貴重品");
  addChecklistItem(items, "家の鍵", "貴重品");

  // 衣類（泊数に応じて自動生成。日帰りは無し）
  if (nights > 0) {
    addChecklistItem(items, `トップス（${nights}泊分）`, "衣類", nights);
    addChecklistItem(items, `ボトムス（${nights}泊分）`, "衣類", nights);
    addChecklistItem(items, `インナー（上）（${nights}泊分）`, "衣類", nights);
    addChecklistItem(items, `インナー（下）（${nights}泊分）`, "衣類", nights);
    addChecklistItem(items, `靴下（${nights}泊分）`, "衣類", nights);
    addChecklistItem(items, "パジャマ", "衣類"); // 1泊以上なら1着
  }

  // 洗面
  addChecklistItem(items, "歯ブラシ", "洗面");

  // その他
  addChecklistItem(items, "日焼け止め", "その他");
  if (nights > 0) {
    addChecklistItem(items, "充電器・ケーブル", "その他"); // 1泊以上のみ
  } else {
    addChecklistItem(items, "モバイルバッテリー", "その他"); // 日帰りのみ
  }

  // ② 初回設定による条件付き表示
  const nightsSuffix = nights > 0 ? `（${nights}泊分）` : "";
  if (state.preferences.contacts) {
    addChecklistItem(items, `コンタクト${nightsSuffix}`, "洗面", nights || null);
    addChecklistItem(items, `コンタクト液${nightsSuffix}`, "洗面", nights || null);
    addChecklistItem(items, "メガネ", "洗面");
  }
  if (state.preferences.makeup) {
    addChecklistItem(items, "メイク用品", "洗面");
    if (nights > 0) {
      addChecklistItem(items, `メイク落とし（${nights}泊分）`, "洗面", nights); // 1泊以上のみ
    }
  }
  if (state.preferences.skincare) {
    const times = nights * 2; // 泊数 × 2（朝晩）
    const skincareLabel = times > 0 ? `スキンケア用品（朝晩${times}回分）` : "スキンケア用品";
    addChecklistItem(items, skincareLabel, "洗面", times || null);
  }
  if (state.preferences.hairIron) {
    addChecklistItem(items, "ヘアアイロン", "洗面");
  }

  state.items = items;
  state.removedSuggestions = [];
}

function preloadDestinationWeather() {
  getDestinations()
    .filter((destination) => destination.areaCode)
    .forEach((destination) => queueDestinationWeatherPreview(destination, state.travelDate));
  runWeatherPreviewQueue();
}

function getWeatherPreviewKey(destinationKey, date = state.travelDate) {
  return `${destinationKey}:${normalizeDate(date)}`;
}

function getWeatherPreview(destination, date = state.travelDate) {
  return state.weatherPreviews[getWeatherPreviewKey(destination.key, date)];
}

function setWeatherPreview(destination, date, summary) {
  state.weatherPreviews[getWeatherPreviewKey(destination.key, date)] = summary;
}

function queueDestinationWeatherPreview(destination, date = state.travelDate) {
  const cacheKey = getWeatherPreviewKey(destination.key, date);
  if (
    state.weatherPreviews[cacheKey] ||
    weatherPreviewRequestKeys.has(cacheKey)
  ) {
    return;
  }

  weatherPreviewRequestKeys.add(cacheKey);
  weatherPreviewQueue.push({ destination, date: normalizeDate(date), cacheKey });
}

function runWeatherPreviewQueue() {
  while (weatherPreviewActiveCount < weatherPreviewConcurrency && weatherPreviewQueue.length > 0) {
    const request = weatherPreviewQueue.shift();
    weatherPreviewActiveCount += 1;
    fetchDestinationWeatherPreview(request).finally(() => {
      weatherPreviewActiveCount -= 1;
      runWeatherPreviewQueue();
    });
  }
}

async function getDestinationWeatherSummary(destination, date = state.travelDate) {
  const cachedSummary = getWeatherPreview(destination, date);
  if (cachedSummary && !cachedSummary.unavailable) return cachedSummary;

  try {
    const forecast = await fetchForecast(destination.areaCode);
    const summary = summarizeForecast(forecast, destination, date);
    summary.destinationKey = destination.key;
    setWeatherPreview(destination, date, summary);
    return summary;
  } catch (error) {
    const summary = {
      destination: destination.label,
      destinationKey: destination.key,
      forecastDate: normalizeDate(date),
      unavailable: true,
    };
    setWeatherPreview(destination, date, summary);
    return summary;
  }
}

async function fetchDestinationWeatherPreview(request) {
  const { destination, date, cacheKey } = request;
  try {
    await getDestinationWeatherSummary(destination, date);
  } finally {
    weatherPreviewRequestKeys.delete(cacheKey);
    renderDestinationOptions();
    renderSelectedDestinations();
    if (screens.list.classList.contains("is-active")) {
      renderWeatherSuggestions();
    }
  }
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

function getDateKey(value) {
  return String(value || "").slice(0, 10);
}

function collectForecastValues(timeSeries, area, propName, targetDate) {
  const timeDefines = timeSeries?.timeDefines || [];
  const values = area?.[propName] || [];
  return timeDefines
    .map((time, index) => (getDateKey(time) === targetDate ? values[index] : null))
    .filter((value) => value !== null && value !== "");
}

function summarizeForecast(forecast, destination, date = state.travelDate) {
  const targetDate = normalizeDate(date);
  const today = forecast[0];
  const weekly = forecast[1];
  const weatherSeries = today?.timeSeries?.[0];
  const popSeries = today?.timeSeries?.[1];
  const tempSeries = today?.timeSeries?.[2];
  const weeklyPopSeries = weekly?.timeSeries?.[0];
  const weeklyTempSeries = weekly?.timeSeries?.[1];
  const weatherArea = weatherSeries?.areas?.[0];
  const popArea = popSeries?.areas?.[0];
  const tempArea = tempSeries?.areas?.[0];
  const weeklyPopArea = weeklyPopSeries?.areas?.[0];
  const weeklyTempArea = weeklyTempSeries?.areas?.[0];
  const weathers = collectForecastValues(weatherSeries, weatherArea, "weathers", targetDate)
    .filter((value, index, array) => array.indexOf(value) === index)
    .join(" ");
  const pops = [
    ...collectForecastValues(popSeries, popArea, "pops", targetDate),
    ...collectForecastValues(weeklyPopSeries, weeklyPopArea, "pops", targetDate),
  ]
    .filter((value) => value !== "")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  const temps = [
    ...collectForecastValues(tempSeries, tempArea, "temps", targetDate),
    ...collectForecastValues(weeklyTempSeries, weeklyTempArea, "tempsMin", targetDate),
    ...collectForecastValues(weeklyTempSeries, weeklyTempArea, "tempsMax", targetDate),
  ]
    .filter((value) => value !== "")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  const maxPop = pops.length > 0 ? Math.max(...pops) : null;
  const minTemp = temps.length > 0 ? Math.min(...temps) : null;
  const maxTemp = temps.length > 0 ? Math.max(...temps) : null;

  return {
    destination: destination.label,
    destinationKey: destination.key,
    forecastDate: targetDate,
    unavailable: !weathers && maxPop === null && minTemp === null && maxTemp === null,
    weatherText: weathers,
    maxPop,
    minTemp,
    maxTemp,
    needsRainGear: /雨|雪|雷/.test(weathers) || (maxPop !== null && maxPop >= 40),
    needsHeatCare: maxTemp !== null && maxTemp >= 30,
    needsColdCare: minTemp !== null && minTemp <= 10,
  };
}

function getDestinationOptionLabel(destination) {
  if (!destination.areaCode) {
    return destination.label;
  }

  const summary = getWeatherPreview(destination);
  if (!summary) {
    return `${destination.label}（⏳確認中）`;
  }
  if (summary.unavailable) {
    return `${destination.label}（⚠️予報なし）`;
  }

  return `${destination.label}（${formatWeatherSummary(summary)}）`;
}

function formatWeatherSummary(summary) {
  const parts = [];
  const weatherText = normalizeWeatherText(summary.weatherText);
  const weatherEmoji = getWeatherEmoji(weatherText || summary.weatherText);
  if (weatherText) parts.push(`${weatherEmoji}${weatherText}`);

  if (summary.minTemp !== null && summary.maxTemp !== null) {
    parts.push(summary.minTemp === summary.maxTemp ? `🌡️${summary.maxTemp}℃` : `🌡️${summary.minTemp}-${summary.maxTemp}℃`);
  } else if (summary.maxTemp !== null) {
    parts.push(`🌡️最高${summary.maxTemp}℃`);
  } else if (summary.minTemp !== null) {
    parts.push(`🌡️最低${summary.minTemp}℃`);
  }

  if (summary.maxPop !== null) {
    parts.push(`💧${summary.maxPop}%`);
  }

  return parts.join(" / ") || "🌤️天気情報あり";
}

function formatWeatherBadge(summary) {
  const weatherText = normalizeWeatherText(summary.weatherText);
  const emoji = getWeatherEmoji(weatherText || summary.weatherText);
  const temp = summary.maxTemp !== null ? `${summary.maxTemp}°` : summary.minTemp !== null ? `${summary.minTemp}°` : "";
  return `${emoji}${temp}`;
}

function normalizeWeatherText(text) {
  return String(text || "").replace(/\s+/g, " ").replace(/　+/g, " ").trim().split(" ")[0] || "";
}

function getWeatherEmoji(text) {
  const weatherText = String(text || "");
  if (/雷/.test(weatherText)) return "⛈️";
  if (/雪/.test(weatherText)) return "❄️";
  if (/雨/.test(weatherText)) return "☔";
  if (/くもり|曇/.test(weatherText)) return "☁️";
  if (/晴/.test(weatherText)) return "☀️";
  return "🌤️";
}

function updateDestinationWeatherPreview() {
  const destination = getSelectedDestinations().find((entry) => entry.areaCode && !getWeatherPreview(entry));
  if (!destination) {
    renderDestinationOptions();
    renderSelectedDestinations();
    return;
  }

  queueDestinationWeatherPreview(destination);
  runWeatherPreviewQueue();
  renderDestinationOptions();
  renderSelectedDestinations();
}

function renderDestinationOptions() {
  const optionsContainer = document.querySelector("#destinationOptions");
  if (!optionsContainer) return;

  const filterInput = document.querySelector("#destinationFilter");
  const query = (filterInput ? filterInput.value : "").trim();

  optionsContainer.innerHTML = "";
  const destinations = getDestinations().filter((destination) => destination.key !== "none");
  const matches = query
    ? destinations.filter((destination) => destination.label.includes(query))
    : destinations;

  matches.forEach((destination) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "select-option";
    option.dataset.destinationKey = destination.key;
    option.setAttribute("role", "option");
    const selected = state.destinationKeys.includes(destination.key);
    option.setAttribute("aria-selected", selected ? "true" : "false");
    if (selected) option.classList.add("is-selected");

    const name = document.createElement("span");
    name.className = "select-option-name";
    name.textContent = destination.label;
    option.append(name);

    if (destination.areaCode) {
      const meta = document.createElement("span");
      meta.className = "select-option-meta";
      const summary = getWeatherPreview(destination);
      if (!summary) meta.textContent = "⏳";
      else if (summary.unavailable) meta.textContent = "⚠️";
      else meta.textContent = formatWeatherBadge(summary);
      option.append(meta);
    }

    optionsContainer.append(option);
  });

  const noMatch = document.querySelector("#destinationNoMatch");
  if (noMatch) noMatch.hidden = matches.length > 0;

  updateDestinationTriggerLabel();
}

function updateDestinationTriggerLabel() {
  const label = document.querySelector("#destinationTriggerLabel");
  if (!label) return;
  const summary = getDestinationListLabel();
  label.textContent = summary || "行き先を選ぶ";
  label.classList.toggle("is-placeholder", !summary);
}

function openDestinationPanel() {
  const panel = document.querySelector("#destinationPanel");
  const trigger = document.querySelector("#destinationTrigger");
  const control = document.querySelector("#destinationControl");
  if (!panel || !trigger || !control || !panel.hidden) return;

  const filter = document.querySelector("#destinationFilter");
  if (filter) filter.value = "";
  renderDestinationOptions();

  panel.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
  control.classList.add("is-open");
  if (filter) window.requestAnimationFrame(() => filter.focus());
}

function closeDestinationPanel() {
  const panel = document.querySelector("#destinationPanel");
  const trigger = document.querySelector("#destinationTrigger");
  const control = document.querySelector("#destinationControl");
  if (!panel || panel.hidden) return;

  panel.hidden = true;
  if (trigger) trigger.setAttribute("aria-expanded", "false");
  if (control) control.classList.remove("is-open");
}

function toggleDestinationPanel() {
  const panel = document.querySelector("#destinationPanel");
  if (!panel) return;
  if (panel.hidden) openDestinationPanel();
  else closeDestinationPanel();
}

function renderSelectedDestinations() {
  const target = document.querySelector("#selectedDestinations");
  if (!target) return;

  target.innerHTML = "";
  const destinations = getSelectedDestinations();
  if (destinations.length === 0) {
    const empty = document.createElement("span");
    empty.className = "destination-empty";
    empty.textContent = "未設定";
    target.append(empty);
    return;
  }

  destinations.forEach((destination) => {
    const chip = document.createElement("span");
    chip.className = "destination-chip";
    const summary = destination.areaCode ? getWeatherPreview(destination) : null;
    const label = document.createElement("span");
    label.textContent = destination.areaCode && summary && !summary.unavailable
      ? `${destination.label} ${formatWeatherSummary(summary)}`
      : destination.label;
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `${destination.label}を外す`);
    button.dataset.removeDestination = destination.key;
    button.textContent = "×";
    chip.append(label, button);
    target.append(chip);
  });
}

function renderDateControls() {
  const input = document.querySelector("#travelDate");
  if (input) {
    const today = new Date();
    input.min = getTodayDate();
    input.max = formatLocalDate(addDays(today, 7));
    input.value = state.travelDate;
  }

  document.querySelectorAll("[data-date-preset]").forEach((button) => {
    const presetDate = button.dataset.datePreset === "tomorrow" ? getTomorrowDate() : getTodayDate();
    button.classList.toggle("is-selected", state.travelDate === presetDate);
  });
}

function setTravelDate(value) {
  state.travelDate = normalizeDate(value);
  renderDateControls();
  preloadDestinationWeather();
  renderDestinationOptions();
  renderSelectedDestinations();
}

function renderPreferences() {
  const target = document.querySelector("#preferenceList");
  target.innerHTML = "";

  renderDateControls();
  preloadDestinationWeather();
  renderDestinationOptions();
  renderSelectedDestinations();

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
  const dateLabel = ` · ${getForecastDateLabel()}`;
  const destinationName = getDestinationListLabel();
  const destinationLabel = destinationName ? ` · ${destinationName}` : "";
  document.querySelector("#tripSummary").textContent =
    `${nightsLabel}${dateLabel}${destinationLabel}の支度`;

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
  renderWeatherSuggestions();
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

// 選択中の行き先・旅行日の予報から、天気に応じた提案グループを作る
function getWeatherSuggestionGroups() {
  const summaries = getSelectedDestinations()
    .filter((destination) => destination.areaCode)
    .map((destination) => getWeatherPreview(destination, state.travelDate))
    .filter((summary) => summary && !summary.unavailable);
  if (summaries.length === 0) return [];

  const existing = state.items.map((item) => normalizeItemName(item.name));
  return weatherSuggestionSets
    .filter((set) => summaries.some((summary) => summary[set.flag]))
    .map((set) => ({
      tag: set.tag,
      items: set.items.filter((name) => !existing.includes(normalizeItemName(name))),
    }))
    .filter((group) => group.items.length > 0);
}

function renderWeatherSuggestions() {
  const target = document.querySelector("#weatherSuggestions");
  if (!target) return;
  target.innerHTML = "";

  const groups = getWeatherSuggestionGroups();
  if (groups.length === 0) {
    target.hidden = true;
    return;
  }
  target.hidden = false;

  const title = document.createElement("p");
  title.className = "weather-suggest-title";
  title.textContent = "天気のおすすめ（いつもの支度には保存されません）";
  target.append(title);

  groups.forEach((group) => {
    const row = document.createElement("div");
    row.className = "weather-suggest-row";
    const tag = document.createElement("span");
    tag.className = "weather-suggest-tag";
    tag.textContent = group.tag;
    row.append(tag);

    group.items.forEach((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "suggestion-button is-weather";
      button.textContent = `＋ ${name}`;
      button.addEventListener("click", () => addItem(name, true));
      row.append(button);
    });

    target.append(row);
  });
}

// リスト画面で選択中の行き先の予報を取得（未取得分のみ）
function ensureListWeatherPreviews() {
  getSelectedDestinations()
    .filter((destination) => destination.areaCode && !getWeatherPreview(destination))
    .forEach((destination) => queueDestinationWeatherPreview(destination));
  runWeatherPreviewQueue();
}

function normalizeItemName(name) {
  // 数量サフィックス（○泊分・○日分・朝晩○回分・その○）だけを除去し、
  // 「（上）」「（下）」のような識別用の括弧は残す
  return name.replace(/（[^（）]*(?:泊分|日分|回分|その[0-9０-９]+)[^（）]*）/g, "").trim();
}

function addItem(name, fromWeather = false) {
  const cleanName = name.trim();
  if (!cleanName) return;

  const sameCount = state.items.filter((item) => normalizeItemName(item.name) === cleanName).length;
  const displayName = sameCount > 0 ? `${cleanName}（その${sameCount + 1}）` : cleanName;
  state.items.push(createItem(displayName, "追加", null, fromWeather));
  renderChecklist();
}

function getDestinations() {
  return destinationDefinitions.concat(state.customDestinations);
}

function getDestination(key) {
  return getDestinations().find((destination) => destination.key === key) || destinationDefinitions[0];
}

function normalizeDestinationKeys(keys) {
  const inputKeys = Array.isArray(keys) ? keys : [keys];
  const destinationKeys = inputKeys
    .filter((key) => key && key !== "none")
    .filter((key) => getDestination(key).key !== "none");
  return destinationKeys.filter((key, index, array) => array.indexOf(key) === index);
}

function getTripDestinationKeys(trip) {
  return normalizeDestinationKeys(trip.destinationKeys || trip.destinations || trip.destination || []);
}

function getSelectedDestinations() {
  return normalizeDestinationKeys(state.destinationKeys).map((key) => getDestination(key));
}

function getDestinationListLabel(keys = state.destinationKeys) {
  const labels = normalizeDestinationKeys(keys).map((key) => getDestination(key).label);
  if (labels.length === 0) return "";
  if (labels.length <= 3) return labels.join("・");
  return `${labels.slice(0, 3).join("・")}ほか${labels.length - 3}件`;
}

function addDestinationKey(key) {
  if (key === "none") {
    state.destinationKeys = [];
  } else {
    state.destinationKeys = normalizeDestinationKeys(state.destinationKeys.concat(key));
  }

  renderDestinationOptions();
  renderSelectedDestinations();
}

function removeDestinationKey(key) {
  state.destinationKeys = normalizeDestinationKeys(state.destinationKeys.filter((destinationKey) => destinationKey !== key));
  renderDestinationOptions();
  renderSelectedDestinations();
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

// 旧データに安定IDを付与（上書き保存の対象特定に使う）
function migrateSavedTrips() {
  const trips = getSavedTrips();
  let changed = false;
  trips.forEach((trip) => {
    if (!trip.id) {
      trip.id = crypto.randomUUID();
      changed = true;
    }
  });
  if (changed) {
    setSavedTrips(trips);
  }
}

function describeTrip(trip) {
  const nightsLabel = trip.nights === 0 ? "日帰り" : `${trip.nights}泊`;
  const dateLabel = getForecastDateLabel(trip.travelDate || getTodayDate());
  const destinationName = getDestinationListLabel(getTripDestinationKeys(trip));
  const destinationLabel = destinationName ? ` · ${destinationName}` : "";
  return {
    title: trip.name || `${nightsLabel}の支度`,
    detail: `${nightsLabel} · ${dateLabel}${destinationLabel} · ${trip.itemNames.length}個 · ${trip.usedCount}回使用`,
  };
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
    const info = describeTrip(trip);
    const titleText = document.createElement("strong");
    titleText.textContent = info.title;
    const detailText = document.createElement("span");
    detailText.textContent = info.detail;
    button.append(titleText, detailText);
    button.addEventListener("click", () => {
      trip.usedCount += 1;
      trips.splice(index, 1);
      const sortedTrips = [trip, ...trips].sort((a, b) => b.usedCount - a.usedCount);
      setSavedTrips(sortedTrips);
      state.activeTripId = trip.id;
      state.nights = trip.nights;
      state.destinationKeys = getTripDestinationKeys(trip);
      state.travelDate = normalizeDate(trip.travelDate || getTodayDate());
      state.weatherSummary = null;
      state.items = trip.itemNames.map((name) => createItem(name, inferCategory(name)));
      state.listBackTarget = "home";
      ensureListWeatherPreviews();
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
    "航空券・予約確認",
    "身分証",
    "乗車券・ICカード",
    "運転免許証",
    "ETCカード",
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

function applyTripData(trip, { name, itemNames, addedItemNames }) {
  trip.name = name;
  trip.nights = state.nights;
  trip.destination = state.destinationKeys[0] || "none";
  trip.destinationKeys = state.destinationKeys;
  trip.travelDate = state.travelDate;
  trip.itemNames = itemNames;
  trip.addedItemHistory = addedItemNames;
}

function finalizeSave(trips, addedItemNames) {
  rememberAddedItems(addedItemNames);
  document.querySelector("#tripName").value = "";
  state.activeTripId = null;
  setSavedTrips(trips.sort((a, b) => b.usedCount - a.usedCount));
  showScreen("home");
}

function saveCurrentTrip() {
  const trips = getSavedTrips();
  // 天気由来の持ち物（傘・合羽など）は保存対象から除外する
  const savableItems = state.items.filter((item) => !item.fromWeather);
  const itemNames = savableItems.map((item) => item.name);
  const addedItemNames = savableItems.filter((item) => item.category === "追加").map((item) => item.name);
  const input = document.querySelector("#tripName");
  const name = input.value.trim();

  // ①「いつもの支度」から開いた支度は、そのまま上書き保存する
  const activeIndex = state.activeTripId ? trips.findIndex((trip) => trip.id === state.activeTripId) : -1;
  if (activeIndex >= 0) {
    applyTripData(trips[activeIndex], { name: name || trips[activeIndex].name || "", itemNames, addedItemNames });
    finalizeSave(trips, addedItemNames);
    return;
  }

  // ② 内容が完全一致する既存の支度があれば、それを更新する
  const signature = getTripSignature({
    nights: state.nights,
    destinationKeys: state.destinationKeys,
    travelDate: state.travelDate,
    itemNames,
  });
  const existingIndex = trips.findIndex((trip) => getTripSignature(trip) === signature);
  if (existingIndex >= 0) {
    trips[existingIndex].usedCount += 1;
    applyTripData(trips[existingIndex], { name: name || trips[existingIndex].name || "", itemNames, addedItemNames });
    finalizeSave(trips, addedItemNames);
    return;
  }

  // ③ 新規保存。保存枠（3つ）が埋まっていれば入れ替え確認を出す
  const newTrip = {
    id: crypto.randomUUID(),
    name,
    nights: state.nights,
    destination: state.destinationKeys[0] || "none",
    destinationKeys: state.destinationKeys,
    travelDate: state.travelDate,
    itemNames,
    addedItemHistory: addedItemNames,
    usedCount: 1,
    savedAt: new Date().toISOString(),
  };

  if (trips.length >= 3) {
    openSaveSlotChooser(newTrip);
    return;
  }

  trips.unshift(newTrip);
  finalizeSave(trips, addedItemNames);
}

function openSaveSlotChooser(newTrip) {
  const modal = document.querySelector("#saveSlotModal");
  const optionsEl = document.querySelector("#saveSlotOptions");
  optionsEl.innerHTML = "";

  getSavedTrips().forEach((trip) => {
    const info = describeTrip(trip);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "modal-option";
    const titleText = document.createElement("strong");
    titleText.textContent = info.title;
    const detailText = document.createElement("span");
    detailText.textContent = info.detail;
    button.append(titleText, detailText);
    button.addEventListener("click", () => replaceTripSlot(trip.id, newTrip));
    optionsEl.append(button);
  });

  modal.hidden = false;
}

function replaceTripSlot(targetId, newTrip) {
  const trips = getSavedTrips();
  const index = trips.findIndex((trip) => trip.id === targetId);
  if (index >= 0) {
    trips.splice(index, 1);
  }
  trips.unshift(newTrip);
  closeSaveSlotChooser();
  finalizeSave(trips, newTrip.addedItemHistory);
}

function closeSaveSlotChooser() {
  document.querySelector("#saveSlotModal").hidden = true;
}

function renderDoneScreen() {
  const active = state.activeTripId ? getSavedTrips().find((trip) => trip.id === state.activeTripId) : null;
  const button = document.querySelector("#saveTripButton");
  const input = document.querySelector("#tripName");
  if (active) {
    button.textContent = "この支度を上書き保存する";
    input.value = active.name || "";
  } else {
    button.textContent = "この支度を保存する";
  }
}

function getTripSignature(trip) {
  return [
    trip.nights,
    normalizeDate(trip.travelDate || getTodayDate()),
    getTripDestinationKeys(trip).join(",") || "none",
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
    selectNights(Number(nightButton.dataset.nights));
  }

  const moreNightsButton = event.target.closest("#moreNightsButton");
  if (moreNightsButton) {
    showMoreNightsForm();
  }

  const destinationTrigger = event.target.closest("#destinationTrigger");
  if (destinationTrigger) {
    toggleDestinationPanel();
    return;
  }

  const destinationOption = event.target.closest(".select-option");
  if (destinationOption) {
    addDestinationKey(destinationOption.dataset.destinationKey);
    updateDestinationWeatherPreview();
    const filter = document.querySelector("#destinationFilter");
    if (filter) filter.focus();
    return;
  }

  const removeDestinationButton = event.target.closest("[data-remove-destination]");
  if (removeDestinationButton) {
    removeDestinationKey(removeDestinationButton.dataset.removeDestination);
    return;
  }

  const datePresetButton = event.target.closest("[data-date-preset]");
  if (datePresetButton) {
    setTravelDate(datePresetButton.dataset.datePreset === "tomorrow" ? getTomorrowDate() : getTodayDate());
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

  const panel = document.querySelector("#destinationPanel");
  if (panel && !panel.hidden && !event.target.closest("#destinationControl")) {
    closeDestinationPanel();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.closest("#destinationFilter")) {
    renderDestinationOptions();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const panel = document.querySelector("#destinationPanel");
    if (panel && !panel.hidden) {
      closeDestinationPanel();
      const trigger = document.querySelector("#destinationTrigger");
      if (trigger) trigger.focus();
    }
  }
});

document.addEventListener("change", (event) => {
  const preferenceInput = event.target.closest("[data-pref]");
  if (preferenceInput) {
    state.preferences[preferenceInput.dataset.pref] = preferenceInput.checked;
    savePreferences();
  }

  const travelDateInput = event.target.closest("#travelDate");
  if (travelDateInput) {
    setTravelDate(travelDateInput.value);
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

document.querySelector("#buildListButton").addEventListener("click", () => {
  buildItems();
  state.activeTripId = null;
  state.listBackTarget = "prefs";
  ensureListWeatherPreviews();
  renderChecklist();
  showScreen("list");
});

document.querySelector("#listBackButton").addEventListener("click", () => {
  showScreen(state.listBackTarget);
});

document.querySelector("#moreNightsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#customNights");
  const nights = Math.min(30, Math.max(4, Number(input.value) || 4));
  input.value = String(nights);
  selectNights(nights);
});

document.querySelector("#addForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#itemName");
  addItem(input.value);
  input.value = "";
  input.focus();
});

document.querySelector("#completeButton").addEventListener("click", () => {
  renderDoneScreen();
  showScreen("done");
});

document.querySelector("#saveTripButton").addEventListener("click", saveCurrentTrip);
document.querySelector("#saveSlotCancel").addEventListener("click", closeSaveSlotChooser);
document.querySelector("#saveSlotModal").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) {
    closeSaveSlotChooser();
  }
});

renderPreferences();
migrateSavedTrips();
renderSavedTrips();
