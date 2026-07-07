import Foundation

enum ItemCategory: String, Codable, CaseIterable {
    case valuables = "貴重品"
    case clothes = "衣類"
    case toiletries = "洗面"
    case others = "その他"
    case extra = "追加"
}

struct PackingItem: Identifiable, Equatable {
    let id = UUID()
    var name: String
    var category: ItemCategory
    var checked = false
}

struct Preferences: Codable, Equatable {
    var contacts = false
    var makeup = false
    var skincare = false
    var hairIron = false
    var medicine = false
}

struct SavedTrip: Codable, Identifiable, Equatable {
    var id = UUID()
    var nights: Int
    var itemNames: [String]
    var usedCount: Int
    var savedAt: Date

    var signature: String {
        "\(nights):" + itemNames.joined(separator: "|")
    }
}

let preferenceDefinitions: [(label: String, keyPath: WritableKeyPath<Preferences, Bool>)] = [
    ("コンタクトを使う", \.contacts),
    ("メイクを持っていく", \.makeup),
    ("スキンケアを持っていく", \.skincare),
    ("ヘアアイロンを使う", \.hairIron),
    ("常備薬がある", \.medicine),
]

let suggestionItems = [
    "モバイルバッテリー",
    "イヤホン",
    "ティッシュ",
    "マスク",
    "ハンカチ",
    "タオル",
    "ナイトブラ",
    "生理用品",
]

let companionItems: [(keyPath: KeyPath<Preferences, Bool>, items: [(name: String, category: ItemCategory)])] = [
    (\.contacts, [
        ("メガネ（夜用）", .toiletries),
        ("予備コンタクト", .toiletries),
        ("コンタクトケース・洗浄液", .toiletries),
        ("目薬", .toiletries),
    ]),
    (\.makeup, [
        ("メイク落とし", .toiletries),
        ("メイクブラシ・スポンジ", .toiletries),
        ("ビューラー", .toiletries),
        ("リップクリーム", .toiletries),
    ]),
    (\.skincare, [
        ("洗顔料", .toiletries),
        ("化粧水", .toiletries),
        ("乳液・クリーム", .toiletries),
        ("フェイスパック", .toiletries),
    ]),
    (\.hairIron, [
        ("ヘアブラシ", .toiletries),
        ("ヘアアイロン用ポーチ", .toiletries),
    ]),
    (\.medicine, [
        ("お薬手帳", .others),
        ("痛み止め", .others),
        ("胃薬", .others),
        ("絆創膏", .others),
    ]),
]

func normalizeItemName(_ name: String) -> String {
    name.replacingOccurrences(of: "（.*?）", with: "", options: .regularExpression)
        .trimmingCharacters(in: .whitespaces)
}

func inferCategory(for name: String) -> ItemCategory {
    if ["財布", "スマホ", "鍵"].contains(name) { return .valuables }
    if name.contains("トップス") || name.contains("下着") || name.contains("靴下") { return .clothes }
    let toiletryKeywords = [
        "コンタクト", "メガネ", "目薬", "メイク", "ビューラー", "リップ",
        "スキンケア", "洗顔", "化粧水", "乳液", "クリーム", "フェイスパック",
        "ヘアアイロン", "ヘアブラシ",
    ]
    if toiletryKeywords.contains(where: { name.contains($0) }) { return .toiletries }
    if ["充電器・ケーブル", "常備薬", "日焼け止め", "お薬手帳", "痛み止め", "胃薬", "絆創膏"].contains(name) {
        return .others
    }
    return .extra
}
