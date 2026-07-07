import SwiftUI

struct NightsView: View {
    @EnvironmentObject private var store: AppStore

    private let options: [(label: String, nights: Int)] = [
        ("1泊", 1), ("2泊", 2), ("3泊", 3), ("それ以上", 4),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                BackButton {
                    store.goHome()
                }

                VStack(alignment: .leading, spacing: 8) {
                    Eyebrow(text: "STEP 1")
                    ScreenTitle(text: "何泊しますか？")
                }

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(options, id: \.nights) { option in
                        Button {
                            store.selectNights(option.nights)
                        } label: {
                            Text(option.label)
                                .font(.title3.weight(.bold))
                                .foregroundStyle(Theme.text)
                                .frame(maxWidth: .infinity, minHeight: 96)
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
                                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                                )
                        }
                    }
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
        }
    }
}
