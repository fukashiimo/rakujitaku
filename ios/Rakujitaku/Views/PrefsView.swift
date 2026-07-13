import SwiftUI

struct PrefsView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                BackButton {
                    store.screen = .nights
                }

                VStack(alignment: .leading, spacing: 8) {
                    Eyebrow(text: "STEP 2")
                    ScreenTitle(text: "持っていくものを選ぶ")
                    Text("この質問は初回だけ。次からは同じ設定を使えます。")
                        .foregroundStyle(Theme.muted)
                }

                VStack(spacing: 10) {
                    ForEach(preferenceDefinitions, id: \.label) { definition in
                        Button {
                            store.preferences[keyPath: definition.keyPath].toggle()
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: store.preferences[keyPath: definition.keyPath]
                                    ? "checkmark.square.fill"
                                    : "square")
                                    .font(.title3)
                                    .foregroundStyle(store.preferences[keyPath: definition.keyPath]
                                        ? Theme.accent2
                                        : Theme.soft)
                                Text(definition.label)
                                    .foregroundStyle(Theme.text)
                                Spacer()
                            }
                            .padding(15)
                            .panelStyle()
                        }
                    }
                }

                PrimaryButton(title: "チェックリストへ") {
                    store.showChecklist()
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
            .padding(.bottom, 40)
        }
    }
}
