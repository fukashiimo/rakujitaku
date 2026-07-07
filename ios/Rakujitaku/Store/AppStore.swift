import SwiftUI

enum Screen {
    case home, nights, prefs, list, done
}

@MainActor
final class AppStore: ObservableObject {
    private static let preferencesKey = "rakujitaku_preferences"
    private static let savedTripsKey = "rakujitaku_saved_trips"
    private static let maxSavedTrips = 3

    @Published var screen: Screen = .home
    @Published var nights = 1
    @Published var items: [PackingItem] = []
    @Published var savedTrips: [SavedTrip] = []
    @Published var preferences = Preferences() {
        didSet { savePreferences() }
    }

    var removedSuggestions: [String] = []
    var listBackTarget: Screen = .prefs

    init() {
        preferences = loadPreferences()
        savedTrips = loadSavedTrips()
    }

    // MARK: - チェックリスト生成

    func buildItems() {
        var built: [PackingItem] = [
            PackingItem(name: "財布", category: .valuables),
            PackingItem(name: "スマホ", category: .valuables),
            PackingItem(name: "鍵", category: .valuables),
            PackingItem(name: "トップス（\(nights)日分）", category: .clothes),
            PackingItem(name: "下着（\(nights)日分）", category: .clothes),
            PackingItem(name: "靴下（\(nights)日分）", category: .clothes),
            PackingItem(name: "充電器・ケーブル", category: .others),
            PackingItem(name: "日焼け止め", category: .others),
        ]

        if preferences.contacts {
            append(&built, name: "コンタクト（\(nights)泊分）", category: .toiletries)
        }
        if preferences.makeup {
            append(&built, name: "メイク用品", category: .toiletries)
        }
        if preferences.skincare {
            append(&built, name: "スキンケア（\(nights)泊分）", category: .toiletries)
        }
        if preferences.hairIron {
            append(&built, name: "ヘアアイロン", category: .toiletries)
        }
        if preferences.medicine {
            append(&built, name: "常備薬", category: .others)
        }

        for group in companionItems where preferences[keyPath: group.keyPath] {
            for item in group.items {
                append(&built, name: item.name, category: item.category)
            }
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
        listBackTarget = .prefs
        screen = .list
    }

    func goBackFromList() {
        screen = listBackTarget
    }

    func complete() {
        screen = .done
    }

    func goHome() {
        screen = .home
    }

    // MARK: - いつもの支度

    func useSavedTrip(_ trip: SavedTrip) {
        guard let index = savedTrips.firstIndex(where: { $0.id == trip.id }) else { return }
        savedTrips[index].usedCount += 1
        let updated = savedTrips.remove(at: index)
        savedTrips = ([updated] + savedTrips).sorted { $0.usedCount > $1.usedCount }
        persistSavedTrips()

        nights = updated.nights
        items = updated.itemNames.map { PackingItem(name: $0, category: inferCategory(for: normalizeItemName($0))) }
        removedSuggestions = []
        listBackTarget = .home
        screen = .list
    }

    func saveCurrentTrip() {
        let itemNames = items.map(\.name)
        let signature = "\(nights):" + itemNames.joined(separator: "|")

        if let index = savedTrips.firstIndex(where: { $0.signature == signature }) {
            savedTrips[index].usedCount += 1
        } else {
            savedTrips.insert(
                SavedTrip(nights: nights, itemNames: itemNames, usedCount: 1, savedAt: .now),
                at: 0
            )
        }

        savedTrips.sort { $0.usedCount > $1.usedCount }
        persistSavedTrips()
        screen = .home
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
}
