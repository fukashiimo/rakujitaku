const screens = {
  home: document.querySelector("#homeScreen"),
  nights: document.querySelector("#nightsScreen"),
  travel: document.querySelector("#travelScreen"),
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

// ===== らくじたく+ 専用データ =====

// 旅行手段 → おすすめ持ち物
const travelMethods = [
  {
    key: "airplane",
    label: "飛行機",
    emoji: "✈️",
    items: [
      { name: "航空券・予約確認", category: "貴重品" },
      { name: "身分証", category: "貴重品" },
      { name: "モバイルバッテリー", category: "その他" },
      { name: "ネックピロー", category: "移動" },
      { name: "耳栓・アイマスク", category: "移動" },
    ],
  },
  {
    key: "train",
    label: "新幹線・電車",
    emoji: "🚄",
    items: [
      { name: "乗車券・ICカード", category: "貴重品" },
      { name: "飲み物", category: "その他" },
      { name: "おやつ", category: "移動" },
    ],
  },
  {
    key: "car",
    label: "車",
    emoji: "🚗",
    items: [
      { name: "運転免許証", category: "貴重品" },
      { name: "ETCカード", category: "貴重品" },
      { name: "充電ケーブル（車用）", category: "その他" },
      { name: "酔い止め", category: "移動" },
    ],
  },
  {
    key: "bus",
    label: "高速バス",
    emoji: "🚌",
    items: [
      { name: "ネックピロー", category: "移動" },
      { name: "ブランケット", category: "移動" },
      { name: "アイマスク", category: "移動" },
      { name: "酔い止め", category: "移動" },
    ],
  },
  {
    key: "ship",
    label: "船・フェリー",
    emoji: "⛴️",
    items: [
      { name: "酔い止め", category: "移動" },
      { name: "羽織もの", category: "衣類" },
    ],
  },
];

// カバンは最初から大きな2分類にまとめる
const defaultBags = [
  { key: "packing", label: "荷造りバッグ", emoji: "🧳", description: "スーツケースやボストンバッグ" },
  { key: "carry", label: "手荷物", emoji: "🎒", description: "ショルダー、トート、リュックなど日中使用" },
];

// 現地で買うものの候補
const buyThereSuggestions = [
  "下着・パンツ",
  "靴下",
  "歯ブラシ・歯磨き粉",
  "洗顔・スキンケア",
  "化粧品",
  "日焼け止め",
  "常備薬",
  "飲み物",
  "おやつ",
  "充電ケーブル",
  "モバイルバッテリー",
  "傘",
  "タオル",
  "スリッパ",
  "髭剃り",
  "生理用品",
  "コンタクト用品",
  "洗濯用洗剤",
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

const state = {
  nights: 1,
  travelMethod: null,
  bags: [],
  customBags: [],
  itemBags: {},
  buyThere: [],
  listView: "category",
  activeBagKey: "packing",
  preferences: loadPreferences(),
  items: [],
  removedSuggestions: [],
  listBackTarget: "prefs",
  activeTripId: null,
};

function loadPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem("rakujitaku_plus_preferences"));
    if (stored && typeof stored === "object") {
      return stored;
    }
  } catch (error) {
    localStorage.removeItem("rakujitaku_plus_preferences");
  }

  return {
    contacts: false,
    makeup: false,
    skincare: false,
    hairIron: false,
  };
}

function savePreferences() {
  localStorage.setItem("rakujitaku_plus_preferences", JSON.stringify(state.preferences));
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
  renderTravelOptions();
  showScreen("travel");
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "instant" });

  if (name !== "nights") {
    hideMoreNightsForm();
  }

  if (name === "travel") {
    renderTravelOptions();
  }

  if (name === "prefs") {
    renderPreferences();
  }

  if (name === "home") {
    renderSavedTrips();
    renderDraftCard();
  }
}

// ===== 旅行手段 =====
function renderTravelOptions() {
  const target = document.querySelector("#travelOptions");
  if (!target) return;
  target.innerHTML = "";
  travelMethods.forEach((method) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-card travel-card";
    button.classList.toggle("is-selected", state.travelMethod === method.key);
    button.dataset.travel = method.key;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", state.travelMethod === method.key ? "true" : "false");
    button.innerHTML = `<span class="travel-emoji" aria-hidden="true">${method.emoji}</span><span>${method.label}</span>`;
    target.append(button);
  });
}

function selectTravelMethod(key) {
  state.travelMethod = state.travelMethod === key ? null : key;
  // DOMは作り直さず、選択状態だけ更新する（再描画によるチラつき防止）
  document.querySelectorAll("#travelOptions .travel-card").forEach((card) => {
    const selected = card.dataset.travel === state.travelMethod;
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-checked", selected ? "true" : "false");
  });
}

function getBag(key) {
  return getActiveBags().find((bag) => bag.key === key);
}

function getActiveBags() {
  return defaultBags.concat(state.customBags);
}

function createCustomBag(label) {
  const cleanLabel = label.trim();
  if (!cleanLabel) return;

  const exists = getActiveBags().some((bag) => bag.label === cleanLabel);
  if (exists) return;

  state.customBags.push({
    key: `custom-${crypto.randomUUID()}`,
    label: cleanLabel,
    emoji: "👜",
    description: "",
  });
  state.listView = "bag";
  state.activeBagKey = state.customBags[state.customBags.length - 1].key;
  renderChecklist();
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

function inferInitialBagKey(item) {
  if (item.category === "貴重品" || item.category === "移動") {
    return "carry";
  }

  const carryNames = [
    "スマホ",
    "財布",
    "鍵",
    "身分証",
    "乗車券",
    "航空券",
    "飲み物",
    "おやつ",
    "モバイルバッテリー",
    "イヤホン",
    "ティッシュ",
    "ハンカチ",
    "マスク",
    "日焼け止め",
    "常備薬",
    "酔い止め",
    "折りたたみ傘",
    "雨具",
  ];

  if (carryNames.some((name) => item.name.includes(name))) {
    return "carry";
  }

  return "packing";
}

function assignInitialBags(items) {
  state.itemBags = {};
  items.forEach((item) => {
    state.itemBags[item.id] = inferInitialBagKey(item);
  });
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

  // ③ 旅行手段に応じたおすすめ持ち物
  const method = travelMethods.find((entry) => entry.key === state.travelMethod);
  if (method) {
    method.items.forEach((item) => addChecklistItem(items, item.name, item.category));
  }

  state.items = items;
  state.customBags = [];
  assignInitialBags(items);
  state.buyThere = [];
  state.listView = "bag";
  state.activeBagKey = "packing";
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

function itemRowElement(item, draggable = false, showBagSelect = false) {
  const row = document.createElement("div");
  row.className = `item-row${item.checked ? " is-checked" : ""}${draggable ? " is-draggable" : ""}`;
  row.dataset.itemId = item.id;
  const handle = draggable
    ? `<button class="drag-handle" type="button" aria-label="${item.name}をドラッグして別のカバンへ" data-drag="${item.id}">⠿</button>`
    : "";
  const bagSelect = showBagSelect
    ? `<select class="bag-select" aria-label="${item.name}を入れるバッグ" data-bag-select="${item.id}">
        ${getActiveBags()
          .map(
            (bag) =>
              `<option value="${bag.key}" ${state.itemBags[item.id] === bag.key ? "selected" : ""}>${bag.emoji} ${bag.label}</option>`,
          )
          .join("")}
      </select>`
    : "";
  row.innerHTML = `
    <input type="checkbox" id="${item.id}" ${item.checked ? "checked" : ""} data-item="${item.id}" />
    <label for="${item.id}">${item.name}</label>
    ${bagSelect}
    ${handle}
    <button class="delete-button" type="button" aria-label="${item.name}を削除" data-delete="${item.id}">×</button>
  `;
  return row;
}

function renderCategoryView(target) {
  const categories = ["貴重品", "衣類", "洗面", "その他", "移動", "追加"];
  categories.forEach((category) => {
    const categoryItems = state.items.filter((item) => item.category === category);
    if (categoryItems.length === 0) return;

    const block = document.createElement("section");
    block.className = "category";
    block.innerHTML = `<h2>${category}</h2>`;
    categoryItems.forEach((item) => block.append(itemRowElement(item)));
    target.append(block);
  });
}

function renderBagView(target) {
  const bags = getActiveBags();
  if (!bags.some((bag) => bag.key === state.activeBagKey)) {
    state.activeBagKey = bags[0].key;
  }

  const bagDropZones = document.createElement("div");
  bagDropZones.className = "bag-drop-zones";
  bagDropZones.setAttribute("role", "tablist");
  bagDropZones.setAttribute("aria-label", "バッグの移動先と表示");
  bags.forEach((bag) => {
    const count = state.items.filter((item) => state.itemBags[item.id] === bag.key).length;
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = `bag-drop-zone${bag.key === state.activeBagKey ? " is-selected" : ""}`;
    tab.dataset.bagTab = bag.key;
    tab.dataset.bagKey = bag.key;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", bag.key === state.activeBagKey ? "true" : "false");
    tab.innerHTML = `<span class="bag-zone-title">${bag.emoji} ${bag.label}</span><strong>${count}</strong><small>ここへ移動</small>`;
    bagDropZones.append(tab);
  });
  target.append(bagDropZones);

  const hint = document.createElement("p");
  hint.className = "bag-drag-hint";
  hint.textContent = "持ち物をつまんで、上のバッグエリアへ移動できます。バッグをタップすると一覧を表示します。";
  target.append(hint);

  const activeBag = bags.find((bag) => bag.key === state.activeBagKey);
  const groupItems = state.items.filter((item) => state.itemBags[item.id] === activeBag.key);
  const block = document.createElement("section");
  block.className = "category bag-group";
  block.dataset.bagKey = activeBag.key;
  block.innerHTML =
    `<h2>${activeBag.emoji} ${activeBag.label}<span class="cat-count">${groupItems.length}</span></h2>` +
    (activeBag.description ? `<p class="bag-description">${activeBag.description}</p>` : "");
  if (groupItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "bag-empty";
    empty.textContent = "このバッグにはまだありません";
    block.append(empty);
  } else {
    groupItems.forEach((item) => block.append(itemRowElement(item, true, true)));
  }
  target.append(block);

  const unassigned = state.items.filter((item) => !state.itemBags[item.id]);
  if (unassigned.length > 0) {
    const notice = document.createElement("p");
    notice.className = "bag-unassigned-note";
    notice.textContent = `未割り当て ${unassigned.length}件。カテゴリ別表示から確認してください。`;
    target.append(notice);
  }
}

// ===== カバンへのドラッグ移動（タッチ対応） =====
let bagDrag = null;
let bagDragPending = null;

function bagDropTargetUnderPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  return el ? el.closest(".bag-group, .bag-drop-zone") : null;
}

function removeBagDragListeners() {
  window.removeEventListener("pointermove", onBagDragMove);
  window.removeEventListener("pointerup", onBagDragEnd);
  window.removeEventListener("pointercancel", onBagDragEnd);
}

function clearBagDropTargets() {
  document.querySelectorAll(".bag-group, .bag-drop-zone").forEach((el) => el.classList.remove("is-drop-target"));
}

function cancelPendingBagDrag() {
  if (!bagDragPending) return;
  window.clearTimeout(bagDragPending.timer);
  bagDragPending = null;
  removeBagDragListeners();
}

function beginBagDrag() {
  if (!bagDragPending || bagDrag) return;
  const pending = bagDragPending;
  const row = pending.row;
  const rect = row.getBoundingClientRect();
  const clone = row.cloneNode(true);
  clone.classList.add("drag-clone");
  clone.style.width = `${rect.width}px`;
  clone.style.left = `${pending.currentX - pending.offsetX}px`;
  clone.style.top = `${pending.currentY - pending.offsetY}px`;
  document.body.append(clone);
  row.classList.add("is-dragging-source");
  row.dataset.dragMoved = "true";

  bagDrag = {
    itemId: pending.itemId,
    row,
    clone,
    offsetX: pending.offsetX,
    offsetY: pending.offsetY,
  };
  window.clearTimeout(pending.timer);
  bagDragPending = null;
  pending.event?.preventDefault();
}

function onBagDragMove(event) {
  if (!bagDrag && bagDragPending) {
    bagDragPending.currentX = event.clientX;
    bagDragPending.currentY = event.clientY;
    const movedX = event.clientX - bagDragPending.startX;
    const movedY = event.clientY - bagDragPending.startY;
    const distance = Math.sqrt(movedX * movedX + movedY * movedY);
    if (bagDragPending.pointerType === "touch" && distance > 10) {
      cancelPendingBagDrag();
      return;
    }
    if (bagDragPending.pointerType !== "touch" && distance > 5) {
      beginBagDrag();
    }
  }
  if (!bagDrag) return;
  event.preventDefault();
  bagDrag.clone.style.left = `${event.clientX - bagDrag.offsetX}px`;
  bagDrag.clone.style.top = `${event.clientY - bagDrag.offsetY}px`;
  const group = bagDropTargetUnderPoint(event.clientX, event.clientY);
  document.querySelectorAll(".bag-group, .bag-drop-zone").forEach((el) => el.classList.toggle("is-drop-target", el === group));
}

function onBagDragEnd(event) {
  if (!bagDrag) {
    cancelPendingBagDrag();
    return;
  }
  const group = bagDropTargetUnderPoint(event.clientX, event.clientY);
  removeBagDragListeners();
  bagDrag.clone.remove();
  bagDrag.row.classList.remove("is-dragging-source");
  clearBagDropTargets();

  const itemId = bagDrag.itemId;
  const key = group?.dataset.bagKey;
  bagDrag = null;
  if (key && getBag(key)) {
    state.itemBags[itemId] = key;
    state.activeBagKey = key;
    saveDraft();
  }
  renderChecklist();
}

function onBagDragStart(event) {
  const row = event.target.closest(".item-row.is-draggable");
  const interactive = event.target.closest("input, select, button");
  if (!row || interactive) return;

  const rect = row.getBoundingClientRect();
  const pending = {
    itemId: row.dataset.itemId,
    row,
    pointerType: event.pointerType,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    currentX: event.clientX,
    currentY: event.clientY,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    event,
    timer: null,
  };
  bagDragPending = pending;
  window.addEventListener("pointermove", onBagDragMove, { passive: false });
  window.addEventListener("pointerup", onBagDragEnd);
  window.addEventListener("pointercancel", onBagDragEnd);
  if (event.pointerType === "touch") {
    pending.timer = window.setTimeout(beginBagDrag, 180);
  }
}

function renderChecklist() {
  const nightsLabel = state.nights === 0 ? "日帰り" : `${state.nights}泊`;
  const method = travelMethods.find((entry) => entry.key === state.travelMethod);
  const methodLabel = method ? ` · ${method.emoji}${method.label}` : "";
  document.querySelector("#tripSummary").textContent = `${nightsLabel}の支度${methodLabel}`;

  const toggle = document.querySelector("#viewToggle");
  if (toggle) toggle.hidden = false;
  document.querySelectorAll(".view-tab").forEach((tab) => tab.classList.toggle("is-selected", tab.dataset.view === state.listView));

  const target = document.querySelector("#checklist");
  target.innerHTML = "";
  if (state.listView === "bag") {
    renderBagView(target);
  } else {
    renderCategoryView(target);
  }

  renderProgress();
  renderSuggestions();
  renderItemHistory();
  renderBuyThere();
  saveDraft();
}

// ===== 現地で買うもの =====
function renderBuyThere() {
  const list = document.querySelector("#buyThereList");
  const suggestTarget = document.querySelector("#buyThereSuggestions");
  if (!list || !suggestTarget) return;

  list.innerHTML = "";
  if (state.buyThere.length === 0) {
    list.innerHTML = '<div class="empty-state">下の候補から選ぶと、ここに買い物リストができます。</div>';
  } else {
    state.buyThere.forEach((entry) => {
      const row = document.createElement("div");
      row.className = `item-row${entry.checked ? " is-checked" : ""}`;
      row.innerHTML = `
        <input type="checkbox" id="buy-${entry.id}" ${entry.checked ? "checked" : ""} data-buy="${entry.id}" />
        <label for="buy-${entry.id}">${entry.name}</label>
        <button class="delete-button" type="button" aria-label="${entry.name}を削除" data-buy-delete="${entry.id}">×</button>
      `;
      list.append(row);
    });
  }

  suggestTarget.innerHTML = "";
  const chosen = state.buyThere.map((entry) => entry.name);
  buyThereSuggestions
    .filter((name) => !chosen.includes(name))
    .forEach((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "suggestion-button";
      button.textContent = `＋ ${name}`;
      button.dataset.buyAdd = name;
      suggestTarget.append(button);
    });
}

function addBuyThere(name) {
  if (state.buyThere.some((entry) => entry.name === name)) return;
  state.buyThere.push({ id: crypto.randomUUID(), name, checked: false });
  renderBuyThere();
  saveDraft();
}

function toggleBuyThere(id) {
  const entry = state.buyThere.find((item) => item.id === id);
  if (entry) entry.checked = !entry.checked;
  renderBuyThere();
  saveDraft();
}

function removeBuyThere(id) {
  state.buyThere = state.buyThere.filter((entry) => entry.id !== id);
  renderBuyThere();
  saveDraft();
}

let prevChecked = 0;
let displayedPercent = 0;
let percentRaf = null;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ％をカウントアップ演出
function animateProgressPercent(target) {
  const el = document.querySelector("#progressPercent");
  if (!el) return;
  if (prefersReducedMotion()) {
    el.textContent = `${target}%`;
    displayedPercent = target;
    return;
  }
  if (percentRaf) cancelAnimationFrame(percentRaf);
  const from = displayedPercent;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / 450);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${Math.round(from + (target - from) * eased)}%`;
    if (t < 1) {
      percentRaf = requestAnimationFrame(step);
    } else {
      displayedPercent = target;
      percentRaf = null;
    }
  };
  percentRaf = requestAnimationFrame(step);
}

// バー先端から火花を飛ばす
function spawnProgressSparks(atPercent, count, forceGold = false, spread = 30) {
  const layer = document.querySelector("#progressSparks");
  if (!layer || prefersReducedMotion()) return;
  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement("span");
    spark.className = `spark${forceGold || Math.random() < 0.4 ? " gold" : ""}`;
    spark.style.left = `${atPercent}%`;
    spark.style.setProperty("--dx", `${(Math.random() * 2 - 1) * spread}px`);
    spark.style.setProperty("--dy", `${-(16 + Math.random() * 30)}px`);
    spark.style.setProperty("--dur", `${(0.5 + Math.random() * 0.4).toFixed(2)}s`);
    spark.style.setProperty("--delay", `${(Math.random() * 0.12).toFixed(2)}s`);
    layer.append(spark);
    setTimeout(() => spark.remove(), 1100);
  }
}

// 100%到達の派手なお祝い
function celebrateProgress() {
  const box = document.querySelector(".progress-box");
  if (!box || prefersReducedMotion()) return;
  box.classList.remove("just-completed");
  void box.offsetWidth;
  box.classList.add("just-completed");
  setTimeout(() => box.classList.remove("just-completed"), 800);
  for (let i = 0; i < 22; i += 1) {
    setTimeout(() => spawnProgressSparks(Math.random() * 100, 1, Math.random() < 0.6, 46), i * 18);
  }
}

function renderProgress() {
  const total = state.items.length;
  const checked = state.items.filter((item) => item.checked).length;
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
  const isComplete = total > 0 && checked === total;
  const box = document.querySelector(".progress-box");

  const progressText = document.querySelector("#progressText");
  const nextText = `${checked} / ${total}`;
  if (progressText.textContent !== nextText) {
    progressText.textContent = nextText;
    progressText.classList.remove("pop");
    void progressText.offsetWidth;
    progressText.classList.add("pop");
  }

  document.querySelector("#progressBar").style.width = `${percent}%`;
  animateProgressPercent(percent);

  const wasComplete = box.classList.contains("is-complete");
  box.classList.toggle("is-complete", isComplete);

  // チェックが増えた瞬間の演出（火花・弾み・％ポップ）
  if (checked > prevChecked) {
    const percentEl = document.querySelector("#progressPercent");
    if (percentEl) {
      percentEl.classList.remove("pop");
      void percentEl.offsetWidth;
      percentEl.classList.add("pop");
    }
    if (!prefersReducedMotion()) {
      box.classList.remove("bump");
      void box.offsetWidth;
      box.classList.add("bump");
      spawnProgressSparks(percent, 8);
    }
    if (isComplete && !wasComplete) {
      celebrateProgress();
    }
  }
  prevChecked = checked;

  const completeButton = document.querySelector("#completeButton");
  completeButton.disabled = !isComplete;
  completeButton.classList.toggle("is-ready", isComplete);
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
  // 数量サフィックス（○泊分・○日分・朝晩○回分・その○）だけを除去し、
  // 「（上）」「（下）」のような識別用の括弧は残す
  return name.replace(/（[^（）]*(?:泊分|日分|回分|その[0-9０-９]+)[^（）]*）/g, "").trim();
}

function addItem(name) {
  const cleanName = name.trim();
  if (!cleanName) return;

  const sameCount = state.items.filter((item) => normalizeItemName(item.name) === cleanName).length;
  const displayName = sameCount > 0 ? `${cleanName}（その${sameCount + 1}）` : cleanName;
  const item = createItem(displayName, "追加");
  state.items.push(item);
  const activeBag = state.listView === "bag" ? getBag(state.activeBagKey) : null;
  state.itemBags[item.id] = activeBag ? activeBag.key : inferInitialBagKey(item);
  renderChecklist();
}

function getItemHistory() {
  try {
    const history = JSON.parse(localStorage.getItem("rakujitaku_plus_added_item_history"));
    return Array.isArray(history) ? history : [];
  } catch (error) {
    localStorage.removeItem("rakujitaku_plus_added_item_history");
    return [];
  }
}

function setItemHistory(history) {
  localStorage.setItem("rakujitaku_plus_added_item_history", JSON.stringify(history.slice(0, 20)));
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

// ===== 途中保存（自動で続きから再開）=====
function saveDraft() {
  if (!state.items.length) return;
  const draft = {
    nights: state.nights,
    items: state.items,
    activeTripId: state.activeTripId,
    listBackTarget: state.listBackTarget,
    travelMethod: state.travelMethod,
    bags: state.bags,
    customBags: state.customBags,
    itemBags: state.itemBags,
    buyThere: state.buyThere,
    listView: state.listView,
    activeBagKey: state.activeBagKey,
    updatedAt: Date.now(),
  };
  localStorage.setItem("rakujitaku_plus_draft", JSON.stringify(draft));
}

function loadDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem("rakujitaku_plus_draft"));
    if (draft && Array.isArray(draft.items) && draft.items.length) return draft;
  } catch (error) {
    localStorage.removeItem("rakujitaku_plus_draft");
  }
  return null;
}

function clearDraft() {
  localStorage.removeItem("rakujitaku_plus_draft");
}

function resumeDraft() {
  const draft = loadDraft();
  if (!draft) return;
  state.nights = draft.nights;
  state.items = draft.items.map((item) => ({
    id: item.id || crypto.randomUUID(),
    name: item.name,
    category: item.category,
    count: item.count ?? null,
    checked: !!item.checked,
  }));
  state.activeTripId = draft.activeTripId || null;
  state.listBackTarget = draft.listBackTarget || "home";
  state.travelMethod = draft.travelMethod || null;
  state.bags = Array.isArray(draft.bags) ? draft.bags : [];
  state.customBags = Array.isArray(draft.customBags) ? draft.customBags : [];
  state.itemBags = draft.itemBags && typeof draft.itemBags === "object" ? draft.itemBags : {};
  state.items.forEach((item) => {
    if (!state.itemBags[item.id]) {
      state.itemBags[item.id] = inferInitialBagKey(item);
    }
  });
  state.buyThere = Array.isArray(draft.buyThere) ? draft.buyThere : [];
  state.listView = draft.listView === "bag" ? "bag" : "category";
  state.activeBagKey = draft.activeBagKey || "packing";
  renderChecklist();
  showScreen("list");
}

function renderDraftCard() {
  const target = document.querySelector("#draftResume");
  if (!target) return;

  const draft = loadDraft();
  target.innerHTML = "";
  if (!draft) {
    target.hidden = true;
    return;
  }
  target.hidden = false;

  const checked = draft.items.filter((item) => item.checked).length;
  const total = draft.items.length;
  const nightsLabel = draft.nights === 0 ? "日帰り" : `${draft.nights}泊`;

  const main = document.createElement("button");
  main.type = "button";
  main.className = "draft-main";
  main.innerHTML =
    `<span class="draft-tag">支度の途中</span>` +
    `<strong>${nightsLabel}の支度</strong>` +
    `<span class="draft-detail">${checked} / ${total} 準備済み</span>`;
  main.addEventListener("click", resumeDraft);

  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "draft-dismiss";
  dismiss.textContent = "×";
  dismiss.setAttribute("aria-label", "途中の支度を削除");
  dismiss.addEventListener("click", () => {
    clearDraft();
    renderDraftCard();
  });

  target.append(main, dismiss);
}

function getSavedTrips() {
  try {
    const trips = JSON.parse(localStorage.getItem("rakujitaku_plus_saved_trips"));
    return Array.isArray(trips) ? trips : [];
  } catch (error) {
    localStorage.removeItem("rakujitaku_plus_saved_trips");
    return [];
  }
}

function setSavedTrips(trips) {
  localStorage.setItem("rakujitaku_plus_saved_trips", JSON.stringify(trips.slice(0, 3)));
}

function getItemBagNameMap() {
  return state.items.reduce((map, item) => {
    map[item.name] = state.itemBags[item.id] || inferInitialBagKey(item);
    return map;
  }, {});
}

function restoreSavedBagAssignments(trip) {
  state.customBags = Array.isArray(trip.customBags) ? trip.customBags : [];
  assignInitialBags(state.items);

  const itemBagsByName = trip.itemBagsByName && typeof trip.itemBagsByName === "object" ? trip.itemBagsByName : {};
  state.items.forEach((item) => {
    const savedBagKey = itemBagsByName[item.name];
    if (savedBagKey && getBag(savedBagKey)) {
      state.itemBags[item.id] = savedBagKey;
    }
  });
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
  return {
    title: trip.name || `${nightsLabel}の支度`,
    detail: `${nightsLabel} · ${trip.itemNames.length}個 · ${trip.usedCount}回使用`,
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
      state.items = trip.itemNames.map((name) => createItem(name, inferCategory(name)));
      restoreSavedBagAssignments(trip);
      state.buyThere = [];
      state.listView = "bag";
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
    "家の鍵",
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
    name.includes("インナー") ||
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
    name.includes("歯ブラシ") ||
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
  trip.itemNames = itemNames;
  trip.addedItemHistory = addedItemNames;
  trip.customBags = state.customBags;
  trip.itemBagsByName = getItemBagNameMap();
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
  const itemNames = state.items.map((item) => item.name);
  const addedItemNames = state.items.filter((item) => item.category === "追加").map((item) => item.name);
  const itemBagsByName = getItemBagNameMap();
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
    itemNames,
    addedItemHistory: addedItemNames,
    customBags: state.customBags,
    itemBagsByName,
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
  return [trip.nights, (trip.itemNames || []).join("|")].join(":");
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

  const travelCard = event.target.closest("[data-travel]");
  if (travelCard) {
    selectTravelMethod(travelCard.dataset.travel);
    return;
  }

  const viewTab = event.target.closest("[data-view]");
  if (viewTab) {
    state.listView = viewTab.dataset.view;
    document.querySelectorAll(".view-tab").forEach((tab) => tab.classList.toggle("is-selected", tab === viewTab));
    renderChecklist();
    return;
  }

  const bagTab = event.target.closest("[data-bag-tab]");
  if (bagTab) {
    state.activeBagKey = bagTab.dataset.bagTab;
    state.listView = "bag";
    renderChecklist();
    return;
  }

  const buyAdd = event.target.closest("[data-buy-add]");
  if (buyAdd) {
    addBuyThere(buyAdd.dataset.buyAdd);
    return;
  }

  const buyDelete = event.target.closest("[data-buy-delete]");
  if (buyDelete) {
    removeBuyThere(buyDelete.dataset.buyDelete);
    return;
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
  if (itemRow?.dataset.dragMoved === "true") {
    event.preventDefault();
    delete itemRow.dataset.dragMoved;
    return;
  }
  const directControl = event.target.closest("input, label, button, select");
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

  const bagSelect = event.target.closest("[data-bag-select]");
  if (bagSelect) {
    state.itemBags[bagSelect.dataset.bagSelect] = bagSelect.value;
    state.activeBagKey = bagSelect.value;
    renderChecklist();
  }

  const buyInput = event.target.closest("[data-buy]");
  if (buyInput) {
    toggleBuyThere(buyInput.dataset.buy);
  }
});

document.querySelector("#travelNextButton").addEventListener("click", () => {
  renderPreferences();
  showScreen("prefs");
});

document.querySelector("#buildListButton").addEventListener("click", () => {
  buildItems();
  state.activeTripId = null;
  state.listBackTarget = "prefs";
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

document.querySelector("#addBagForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#bagName");
  createCustomBag(input.value);
  input.value = "";
  input.focus();
});

// CLEAR画面にピクセル紙吹雪を降らせる
function spawnClearConfetti() {
  const stage = document.querySelector("#doneScreen .clear-stage");
  if (!stage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  stage.querySelectorAll(".confetti").forEach((piece) => piece.remove());
  const colors = ["#f8c86a", "#95d5b2", "#c8ced9", "#ff8a80"];
  for (let i = 0; i < 28; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--dx", `${Math.round(Math.random() * 80 - 40)}px`);
    piece.style.setProperty("--t", `${(1 + Math.random() * 0.9).toFixed(2)}s`);
    piece.style.setProperty("--wait", `${(Math.random() * 0.6).toFixed(2)}s`);
    if (i % 2 === 0) piece.style.borderRadius = "50%";
    stage.append(piece);
  }
}

document.querySelector("#completeButton").addEventListener("click", () => {
  clearDraft();
  renderDoneScreen();
  showScreen("done");
  spawnClearConfetti();
});

document.querySelector("#saveTripButton").addEventListener("click", saveCurrentTrip);
document.querySelector("#saveSlotCancel").addEventListener("click", closeSaveSlotChooser);
document.querySelector("#saveSlotModal").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) {
    closeSaveSlotChooser();
  }
});

// スクロールで上部に固定されたプログレスバーに影を付ける（若干の動き）
function setupStickyProgress() {
  const box = document.querySelector(".progress-box");
  if (!box) return;
  const update = () => {
    // 非表示中は無視。スクロール位置がバーの本来位置(top:10px分手前)を超えたら固定中
    if (box.offsetParent === null) {
      box.classList.remove("is-stuck");
      return;
    }
    box.classList.toggle("is-stuck", window.scrollY >= box.offsetTop - 10);
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

document.addEventListener("pointerdown", onBagDragStart);

renderPreferences();
migrateSavedTrips();
renderSavedTrips();
renderDraftCard();
setupStickyProgress();
