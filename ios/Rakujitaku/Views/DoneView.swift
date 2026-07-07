import SwiftUI

struct DoneView: View {
    @EnvironmentObject private var store: AppStore

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
                    PrimaryButton(title: "この支度を保存する") {
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
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 40)
        }
    }
}
