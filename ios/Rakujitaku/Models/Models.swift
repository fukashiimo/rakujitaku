import Foundation

enum ItemCategory: String, Codable, CaseIterable {
    case valuables = "貴重品"
    case clothes = "衣類"
    case toiletries = "洗面"
    case others = "その他"
    case extra = "追加"
}

struct PackingItem: Identifiable, Equatable, Codable {
    var id = UUID()
    var name: String
    var category: ItemCategory
    var checked = false
}

/// 途中保存（自動で続きから再開）用の下書き
struct PackingDraft: Codable, Equatable {
    var nights: Int
    var items: [PackingItem]
    var activeTripId: UUID?

    var checkedCount: Int { items.filter(\.checked).count }
}

struct Preferences: Codable, Equatable {
    var contacts = false
    var makeup = false
    var skincare = false
    var hairIron = false
}

struct SavedTrip: Codable, Identifiable, Equatable {
    var id: UUID
    var name: String
    var nights: Int
    var itemNames: [String]
    var addedItemHistory: [String]
    var usedCount: Int
    var savedAt: Date

    init(
        id: UUID = UUID(),
        name: String = "",
        nights: Int,
        itemNames: [String],
        addedItemHistory: [String] = [],
        usedCount: Int,
        savedAt: Date
    ) {
        self.id = id
        self.name = name
        self.nights = nights
        self.itemNames = itemNames
        self.addedItemHistory = addedItemHistory
        self.usedCount = usedCount
        self.savedAt = savedAt
    }

    // 旧バージョンの保存データ（name等が無い）も読めるようにする
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decodeIfPresent(UUID.self, forKey: .id) ?? UUID()
        name = try container.decodeIfPresent(String.self, forKey: .name) ?? ""
        nights = try container.decode(Int.self, forKey: .nights)
        itemNames = try container.decodeIfPresent([String].self, forKey: .itemNames) ?? []
        addedItemHistory = try container.decodeIfPresent([String].self, forKey: .addedItemHistory) ?? []
        usedCount = try container.decodeIfPresent(Int.self, forKey: .usedCount) ?? 1
        savedAt = try container.decodeIfPresent(Date.self, forKey: .savedAt) ?? .now
    }

    var nightsLabel: String {
        nights == 0 ? "日帰り" : "\(nights)泊"
    }

    var title: String {
        name.isEmpty ? "\(nightsLabel)の支度" : name
    }

    var detail: String {
        "\(nightsLabel) · \(itemNames.count)個 · \(usedCount)回使用"
    }

    var signature: String {
        "\(nights):" + itemNames.joined(separator: "|")
    }
}

let preferenceDefinitions: [(label: String, keyPath: WritableKeyPath<Preferences, Bool>)] = [
    ("コンタクトを使う", \.contacts),
    ("メイク用品を持っていく", \.makeup),
    ("スキンケア用品を持っていく", \.skincare),
    ("ヘアアイロンを使う", \.hairIron),
]

let suggestionItems = [
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
]

/// 数量サフィックス（○泊分・○日分・朝晩○回分・その○）だけを除去し、
/// 「（上）」「（下）」のような識別用の括弧は残す
func normalizeItemName(_ name: String) -> String {
    name.replacingOccurrences(
        of: "（[^（）]*(泊分|日分|回分|その[0-9０-９]+)[^（）]*）",
        with: "",
        options: .regularExpression
    )
    .trimmingCharacters(in: .whitespaces)
}

func inferCategory(for name: String) -> ItemCategory {
    let valuableItems = [
        "財布", "スマホ", "鍵", "家の鍵",
        "航空券・予約確認", "身分証", "乗車券・ICカード",
        "運転免許証", "ETCカード", "母子手帳・保険証",
    ]
    let otherItems = [
        "充電器・ケーブル", "常備薬", "日焼け止め", "お薬手帳",
        "痛み止め", "胃薬", "絆創膏", "モバイルバッテリー",
        "雨具", "折りたたみ傘", "汗拭きシート", "飲み物",
        "カイロ", "ゴーグル", "ビーチサンダル", "濡れたもの用の袋",
        "おやつ", "ウェットティッシュ",
    ]
    let clothesKeywords = [
        "トップス", "ボトムス", "インナー", "パジャマ",
        "下着", "靴下", "着替え", "水着", "羽織",
    ]
    let toiletryKeywords = [
        "歯ブラシ", "コンタクト", "メガネ", "目薬",
        "メイク", "ビューラー", "リップ", "スキンケア",
        "洗顔", "化粧水", "乳液", "クリーム",
        "フェイスパック", "ヘアアイロン", "ヘアブラシ",
    ]

    if valuableItems.contains(name) { return .valuables }
    if clothesKeywords.contains(where: { name.contains($0) }) { return .clothes }
    if toiletryKeywords.contains(where: { name.contains($0) }) { return .toiletries }
    if otherItems.contains(name) { return .others }
    return .extra
}
