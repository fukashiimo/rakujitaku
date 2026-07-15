import SwiftUI
import StoreKit

struct DoneView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.requestReview) private var requestReview
    @StateObject private var tipJar = TipJar()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                VStack(alignment: .leading, spacing: 8) {
                    Eyebrow(text: "DONE")
                    ScreenTitle(text: "すべて準備完了")
                    Text("チェック状態は保存せず、泊数と持ち物だけを残します。")
                        .foregroundStyle(Theme.muted)
                }
                .padding(.top, 14)

                VStack(spacing: 14) {
                    GameStage(mode: .clear)
                    saveNameField
                    PrimaryButton(title: store.isOverwriting ? "この支度を上書き保存する" : "この支度を保存する") {
                        store.saveCurrentTrip()
                    }
                    SecondaryButton(title: "ホームへ戻る") {
                        store.goHome()
                    }
                }
                .padding(22)
                .background(
                    RoundedRectangle(cornerRadius: Theme.radius)
                        .fill(LinearGradient(
                            colors: [Theme.panelLight, Theme.panel],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radius)
                        .stroke(Color.white.opacity(0.08), lineWidth: 1)
                )

                tipSection
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 40)
        }
        .task { await tipJar.load() }
        .onAppear {
            guard store.wantsReviewPrompt else { return }
            store.wantsReviewPrompt = false
            // CLEAR演出を少し見せてから、完了画面上で評価を依頼する
            Task {
                try? await Task.sleep(for: .seconds(1.2))
                if store.screen == .done {
                    requestReview()
                }
            }
        }
        .confirmationDialog(
            "保存できるのは3つまで",
            isPresented: Binding(
                get: { store.pendingSaveTrip != nil },
                set: { if !$0 { store.cancelSlotChooser() } }
            ),
            titleVisibility: .visible
        ) {
            ForEach(store.savedTrips) { trip in
                Button("\(trip.title)（\(trip.detail)）") {
                    store.replaceTrip(with: trip.id)
                }
            }
            Button("やめる", role: .cancel) {
                store.cancelSlotChooser()
            }
        } message: {
            Text("入れ替える支度を選ぶと、その支度が今の内容に置き換わります。")
        }
    }

    private var saveNameField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("保存名")
                .font(.body.weight(.bold))
                .foregroundStyle(Theme.muted)
            TextField("例：夏の帰省、旅行セット", text: $store.tripName)
                .padding(.horizontal, 14)
                .frame(minHeight: 48)
                .background(
                    RoundedRectangle(cornerRadius: Theme.radius)
                        .fill(Color(red: 0.063, green: 0.063, blue: 0.063))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radius)
                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                )
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    @ViewBuilder
    private var tipSection: some View {
        if tipJar.thanked {
            Text("ごちそうさまです！応援ありがとうございます ☕️")
                .font(.subheadline)
                .foregroundStyle(Theme.accent2)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
        } else if let product = tipJar.product {
            Button {
                Task { await tipJar.tip() }
            } label: {
                Text("☕️ 開発者にコーヒーをおごる（\(product.displayPrice)）")
                    .font(.subheadline)
                    .foregroundStyle(Theme.muted)
                    .frame(maxWidth: .infinity, minHeight: 44)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.radius)
                            .stroke(Color.white.opacity(0.12), lineWidth: 1)
                    )
            }
            .disabled(tipJar.purchasing)
            .opacity(tipJar.purchasing ? 0.5 : 1)
        }
    }
}
