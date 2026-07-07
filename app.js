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
};

const state = {
  nights: 1,
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
    createItem(`トップス（${state.nights}日分）`, "衣類", state.nights),
    createItem(`下着（${state.nights}日分）`, "衣類", state.nights),
    createItem(`靴下（${state.nights}日分）`, "衣類", state.nights),
    createItem("充電器・ケーブル", "その他"),
    createItem("日焼け止め", "その他"),
  ];

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

function renderPreferences() {
  const target = document.querySelector("#preferenceList");
  target.innerHTML = "";

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
  document.querySelector("#tripSummary").textContent = `${state.nights}泊の支度`;

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
    button.innerHTML = `
      <strong>${trip.nights}泊の支度</strong>
      <span>${trip.itemNames.length}個の持ち物 · ${trip.usedCount}回使用</span>
    `;
    button.addEventListener("click", () => {
      trip.usedCount += 1;
      trips.splice(index, 1);
      const sortedTrips = [trip, ...trips].sort((a, b) => b.usedCount - a.usedCount);
      setSavedTrips(sortedTrips);
      state.nights = trip.nights;
      state.items = trip.itemNames.map((name) => createItem(name, inferCategory(name)));
      state.listBackTarget = "home";
      renderChecklist();
      showScreen("list");
    });
    target.append(button);
  });
}

function inferCategory(name) {
  if (["財布", "スマホ", "鍵"].includes(name)) return "貴重品";
  if (name.includes("トップス") || name.includes("下着") || name.includes("靴下")) return "衣類";
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
  if (["充電器・ケーブル", "常備薬", "日焼け止め", "お薬手帳", "痛み止め", "胃薬", "絆創膏"].includes(name)) return "その他";
  return "追加";
}

function saveCurrentTrip() {
  const trips = getSavedTrips();
  const itemNames = state.items.map((item) => item.name);
  const signature = `${state.nights}:${itemNames.join("|")}`;
  const existingIndex = trips.findIndex((trip) => `${trip.nights}:${trip.itemNames.join("|")}` === signature);

  if (existingIndex >= 0) {
    trips[existingIndex].usedCount += 1;
  } else {
    trips.unshift({
      nights: state.nights,
      itemNames,
      usedCount: 1,
      savedAt: new Date().toISOString(),
    });
  }

  setSavedTrips(trips.sort((a, b) => b.usedCount - a.usedCount));
  showScreen("home");
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
