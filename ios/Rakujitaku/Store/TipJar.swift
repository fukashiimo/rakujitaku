import StoreKit

/// 投げ銭（消耗型アプリ内課金）。
/// 商品がApp Store Connectに未設定の間は product が nil のままになり、
/// ボタンは表示されない。
@MainActor
final class TipJar: ObservableObject {
    static let productID = "com.shuyafukai.rakujitaku.tip.coffee"

    @Published var product: Product?
    @Published var purchasing = false
    @Published var thanked = false

    private var updatesTask: Task<Void, Never>?

    init() {
        updatesTask = Task {
            for await update in Transaction.updates {
                if case .verified(let transaction) = update {
                    await transaction.finish()
                }
            }
        }
    }

    deinit {
        updatesTask?.cancel()
    }

    func load() async {
        product = try? await Product.products(for: [Self.productID]).first
    }

    func tip() async {
        guard let product, !purchasing else { return }
        purchasing = true
        defer { purchasing = false }

        guard let result = try? await product.purchase() else { return }
        if case .success(let verification) = result,
           case .verified(let transaction) = verification {
            await transaction.finish()
            thanked = true
        }
    }
}
