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
                                    Text("\(trip.nights)泊の支度")
                                        .font(.body.weight(.bold))
                                        .foregroundStyle(Theme.text)
                                    Text("\(trip.itemNames.count)個の持ち物 · \(trip.usedCount)回使用")
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
}
