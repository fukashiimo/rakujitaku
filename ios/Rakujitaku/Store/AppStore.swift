import SwiftUI

enum Screen {
    case home, nights, prefs, list, done
}

@MainActor
final class AppStore: ObservableObject {
    private static let preferencesKey = "rakujitaku_preferences"
    private static let savedTripsKey = "rakujitaku_saved_trips"
    private static let itemHistoryKey = "rakujitaku_added_item_history"
    private static let maxSavedTrips = 3
    private static let maxItemHistory = 20

    @Published var screen: Screen = .home
    @Published var nights = 1
    @Published var items: [PackingItem] = []
    @Published var savedTrips: [SavedTrip] = []
    @Published var itemHistory: [String] = []
    @Published var tripName = ""
    /// 保存枠が満杯のとき、入れ替え先の選択待ちになっている新規支度
    @Published var pendingSaveTrip: SavedTrip?
    @Published var preferences = Preferences() {
        didSet { savePreferences() }
    }

    var removedSuggestions: [String] = []
    var listBackTarget: Screen = .prefs
    /// 「いつもの支度」から開いた場合の上書き保存先
    var activeTripId: UUID?

    init() {
        preferences = loadPreferences()
        savedTrips = loadSavedTrips()
        itemHistory = loadItemHistory()
    }

    // MARK: - チェックリスト生成（持ち物生成仕様に準拠、天気条件は含まない）

    func buildItems() {
        var built: [PackingItem] = []

        // ① 常に表示する（デフォルト）
        // 貴重品
        append(&built, name: "財布", category: .valuables)
        append(&built, name: "スマホ", category: .valuables)
        append(&built, name: "家の鍵", category: .valuables)

        // 衣類（泊数に応じて自動生成。日帰りは無し）
        if nights > 0 {
            append(&built, name: "トップス（\(nights)泊分）", category: .clothes)
            append(&built, name: "ボトムス（\(nights)泊分）", category: .clothes)
            append(&built, name: "インナー（上）（\(nights)泊分）", category: .clothes)
            append(&built, name: "インナー（下）（\(nights)泊分）", category: .clothes)
            append(&built, name: "靴下（\(nights)泊分）", category: .clothes)
            append(&built, name: "パジャマ", category: .clothes) // 1泊以上なら1着
        }

        // 洗面
        append(&built, name: "歯ブラシ", category: .toiletries)

        // その他
        append(&built, name: "日焼け止め", category: .others)
        if nights > 0 {
            append(&built, name: "充電器・ケーブル", category: .others) // 1泊以上のみ
        } else {
            append(&built, name: "モバイルバッテリー", category: .others) // 日帰りのみ
        }

        // ② 初回設定による条件付き表示
        let nightsSuffix = nights > 0 ? "（\(nights)泊分）" : ""
        if preferences.contacts {
            append(&built, name: "コンタクト\(nightsSuffix)", category: .toiletries)
            append(&built, name: "コンタクト液\(nightsSuffix)", category: .toiletries)
            append(&built, name: "メガネ", category: .toiletries)
        }
        if preferences.makeup {
            append(&built, name: "メイク用品", category: .toiletries)
            if nights > 0 {
                append(&built, name: "メイク落とし（\(nights)泊分）", category: .toiletries) // 1泊以上のみ
            }
        }
        if preferences.skincare {
            let times = nights * 2 // 泊数 × 2（朝晩）
            let label = times > 0 ? "スキンケア用品（朝晩\(times)回分）" : "スキンケア用品"
            append(&built, name: label, category: .toiletries)
        }
        if preferences.hairIron {
            append(&built, name: "ヘアアイロン", category: .toiletries)
        }

        items = built
        removedSuggestions = []
    }

    private func append(_ items: inout [PackingItem], name: String, category: ItemCategory) {
        let normalized = normalizeItemName(name)
        guard !items.contains(where: { normalizeItemName($0.name) == normalized }) else { return }
        items.append(PackingItem(name: name, category: category))
    }

    // MARK: - チェックリスト操作

    func items(in category: ItemCategory) -> [PackingItem] {
        items.filter { $0.category == category }
    }

    var checkedCount: Int { items.filter(\.checked).count }

    var progress: Double {
        items.isEmpty ? 0 : Double(checkedCount) / Double(items.count)
    }

    var isComplete: Bool {
        !items.isEmpty && checkedCount == items.count
    }

    var nightsLabel: String {
        nights == 0 ? "日帰り" : "\(nights)泊"
    }

    func toggle(_ item: PackingItem) {
        guard let index = items.firstIndex(where: { $0.id == item.id }) else { return }
        items[index].checked.toggle()
    }

    func delete(_ item: PackingItem) {
        removedSuggestions.append(normalizeItemName(item.name))
        items.removeAll { $0.id == item.id }
    }

    func addItem(named name: String) {
        let cleanName = name.trimmingCharacters(in: .whitespaces)
        guard !cleanName.isEmpty else { return }

        let sameCount = items.filter { normalizeItemName($0.name) == cleanName }.count
        let displayName = sameCount > 0 ? "\(cleanName)（その\(sameCount + 1)）" : cleanName
        items.append(PackingItem(name: displayName, category: .extra))
    }

    var availableSuggestions: [String] {
        let existing = Set(items.map { normalizeItemName($0.name) })
        var seen = Set<String>()
        return (suggestionItems + removedSuggestions).filter { name in
            guard !seen.contains(name) else { return false }
            seen.insert(name)
            return !existing.contains(normalizeItemName(name))
        }
    }

    /// 過去に追加した持ち物のうち、まだリストに入っていないもの
    var availableHistory: [String] {
        let existing = Set(items.map { normalizeItemName($0.name) })
        return itemHistory.filter { !existing.contains(normalizeItemName($0)) }
    }

    // MARK: - 画面遷移

    func startPacking() {
        screen = .nights
    }

    func selectNights(_ value: Int) {
        nights = value
        screen = .prefs
    }

    func showChecklist() {
        buildItems()
        activeTripId = nil
        listBackTarget = .prefs
        screen = .list
    }

    func goBackFromList() {
        screen = listBackTarget
    }

    func complete() {
        tripName = activeTrip?.name ?? ""
        screen = .done
    }

    func goHome() {
        screen = .home
    }

    // MARK: - いつもの支度

    var activeTrip: SavedTrip? {
        guard let activeTripId else { return nil }
        return savedTrips.first { $0.id == activeTripId }
    }

    var isOverwriting: Bool { activeTrip != nil }

    func useSavedTrip(_ trip: SavedTrip) {
        guard let index = savedTrips.firstIndex(where: { $0.id == trip.id }) else { return }
        savedTrips[index].usedCount += 1
        let updated = savedTrips.remove(at: index)
        savedTrips = ([updated] + savedTrips).sorted { $0.usedCount > $1.usedCount }
        persistSavedTrips()

        activeTripId = updated.id
        nights = updated.nights
        items = updated.itemNames.map { PackingItem(name: $0, category: inferCategory(for: $0)) }
        removedSuggestions = []
        listBackTarget = .home
        screen = .list
    }

    func saveCurrentTrip() {
        let itemNames = items.map(\.name)
        let addedItemNames = items.filter { $0.category == .extra }.map(\.name)
        let name = tripName.trimmingCharacters(in: .whitespaces)

        // ①「いつもの支度」から開いた支度は、そのまま上書き保存する
        if let activeTripId, let index = savedTrips.firstIndex(where: { $0.id == activeTripId }) {
            apply(to: &savedTrips[index], name: name, itemNames: itemNames, addedItemNames: addedItemNames)
            finalizeSave(addedItemNames: addedItemNames)
            return
        }

        // ② 内容が完全一致する既存の支度があれば、それを更新する
        let signature = "\(nights):" + itemNames.joined(separator: "|")
        if let index = savedTrips.firstIndex(where: { $0.signature == signature }) {
            savedTrips[index].usedCount += 1
            apply(to: &savedTrips[index], name: name, itemNames: itemNames, addedItemNames: addedItemNames)
            finalizeSave(addedItemNames: addedItemNames)
            return
        }

        // ③ 新規保存。保存枠（3つ）が埋まっていれば入れ替え確認を出す
        let newTrip = SavedTrip(
            name: name,
            nights: nights,
            itemNames: itemNames,
            addedItemHistory: addedItemNames,
            usedCount: 1,
            savedAt: .now
        )

        if savedTrips.count >= Self.maxSavedTrips {
            pendingSaveTrip = newTrip
            return
        }

        savedTrips.insert(newTrip, at: 0)
        finalizeSave(addedItemNames: addedItemNames)
    }

    func replaceTrip(with targetId: UUID) {
        guard let newTrip = pendingSaveTrip else { return }
        savedTrips.removeAll { $0.id == targetId }
        savedTrips.insert(newTrip, at: 0)
        pendingSaveTrip = nil
        finalizeSave(addedItemNames: newTrip.addedItemHistory)
    }

    func cancelSlotChooser() {
        pendingSaveTrip = nil
    }

    private func apply(to trip: inout SavedTrip, name: String, itemNames: [String], addedItemNames: [String]) {
        trip.name = name.isEmpty ? trip.name : name
        trip.nights = nights
        trip.itemNames = itemNames
        trip.addedItemHistory = addedItemNames
    }

    private func finalizeSave(addedItemNames: [String]) {
        rememberAddedItems(addedItemNames)
        tripName = ""
        activeTripId = nil
        savedTrips.sort { $0.usedCount > $1.usedCount }
        persistSavedTrips()
        screen = .home
    }

    // MARK: - 追加履歴

    private func rememberAddedItems(_ names: [String]) {
        let merged = (names + itemHistory)
            .map(normalizeItemName)
            .filter { !$0.isEmpty }
        var seen = Set<String>()
        itemHistory = Array(merged.filter { seen.insert($0).inserted }.prefix(Self.maxItemHistory))
        persistItemHistory()
    }

    // MARK: - 永続化

    private func loadPreferences() -> Preferences {
        guard let data = UserDefaults.standard.data(forKey: Self.preferencesKey),
              let stored = try? JSONDecoder().decode(Preferences.self, from: data)
        else { return Preferences() }
        return stored
    }

    private func savePreferences() {
        guard let data = try? JSONEncoder().encode(preferences) else { return }
        UserDefaults.standard.set(data, forKey: Self.preferencesKey)
    }

    private func loadSavedTrips() -> [SavedTrip] {
        guard let data = UserDefaults.standard.data(forKey: Self.savedTripsKey),
              let stored = try? JSONDecoder().decode([SavedTrip].self, from: data)
        else { return [] }
        return stored
    }

    private func persistSavedTrips() {
        savedTrips = Array(savedTrips.prefix(Self.maxSavedTrips))
        guard let data = try? JSONEncoder().encode(savedTrips) else { return }
        UserDefaults.standard.set(data, forKey: Self.savedTripsKey)
    }

    private func loadItemHistory() -> [String] {
        UserDefaults.standard.stringArray(forKey: Self.itemHistoryKey) ?? []
    }

    private func persistItemHistory() {
        UserDefaults.standard.set(itemHistory, forKey: Self.itemHistoryKey)
    }
}
