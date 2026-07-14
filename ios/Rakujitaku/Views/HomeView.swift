import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 30) {
                VStack(alignment: .leading, spacing: 8) {
                    Eyebrow(text: "RAKUJITAKU")
                    Text("らくじたく")
                        .font(.system(size: 30, weight: .bold))
                        .foregroundStyle(Theme.text)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                    Text("泊数を選んだら、あとはチェックするだけ。")
                        .foregroundStyle(Theme.muted)
                }
                .padding(.top, 14)

                VStack(spacing: 22) {
                    GameStage(mode: .loading)
                    PrimaryButton(title: "支度をはじめる") {
                        store.startPacking()
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

                if let draft = store.draft {
                    draftCard(draft)
                }

                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        Text("いつもの支度")
                            .font(.title3.weight(.bold))
                        Spacer()
                        Text("\(store.savedTrips.count)/3")
                    }
                    .foregroundStyle(Theme.muted)

                    if store.savedTrips.isEmpty {
                        Text("保存した支度はまだありません。")
                            .foregroundStyle(Theme.muted)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(16)
                            .panelStyle()
                    } else {
                        ForEach(store.savedTrips) { trip in
                            Button {
                                store.useSavedTrip(trip)
                            } label: {
                                VStack(alignment: .leading, spacing: 10) {
                                    Text(trip.title)
                                        .font(.body.weight(.bold))
                                        .foregroundStyle(Theme.text)
                                    Text(trip.detail)
                                        .font(.subheadline)
                                        .foregroundStyle(Theme.soft)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(16)
                                .panelStyle()
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 40)
        }
    }

    private func draftCard(_ draft: PackingDraft) -> some View {
        let nightsLabel = draft.nights == 0 ? "日帰り" : "\(draft.nights)泊"
        return HStack(spacing: 8) {
            Button {
                store.resumeDraft()
            } label: {
                VStack(alignment: .leading, spacing: 6) {
                    Text("支度の途中")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Theme.accent)
                    Text("\(nightsLabel)の支度")
                        .font(.body.weight(.bold))
                        .foregroundStyle(Theme.text)
                    Text("\(draft.checkedCount) / \(draft.items.count) 準備済み")
                        .font(.subheadline)
                        .foregroundStyle(Theme.muted)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(16)
                .background(
                    RoundedRectangle(cornerRadius: Theme.radius)
                        .fill(Theme.accent.opacity(0.08))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radius)
                        .stroke(Theme.accent.opacity(0.4), lineWidth: 1)
                )
            }

            Button {
                store.clearDraft()
            } label: {
                Image(systemName: "xmark")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(Theme.soft)
                    .frame(width: 44)
                    .frame(maxHeight: .infinity)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.radius)
                            .stroke(Color.white.opacity(0.12), lineWidth: 1)
                    )
            }
            .accessibilityLabel("途中の支度を削除")
            .fixedSize(horizontal: true, vertical: false)
        }
        .fixedSize(horizontal: false, vertical: true)
    }
}
