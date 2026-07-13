import SwiftUI

struct NightsView: View {
    @EnvironmentObject private var store: AppStore
    @State private var showCustomNights = false
    @State private var customNights = 4

    private let options: [(label: String, nights: Int)] = [
        ("日帰り", 0), ("1泊", 1), ("2泊", 2), ("3泊", 3),
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
                        optionCard(label: option.label, isSelected: false) {
                            showCustomNights = false
                            store.selectNights(option.nights)
                        }
                    }
                    optionCard(label: "それ以上", isSelected: showCustomNights) {
                        withAnimation(.easeOut(duration: 0.2)) {
                            showCustomNights = true
                        }
                    }
                }

                if showCustomNights {
                    customNightsForm
                        .transition(.opacity.combined(with: .move(edge: .top)))
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
            .padding(.bottom, 40)
        }
    }

    private func optionCard(label: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
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
                        .stroke(
                            isSelected ? Color.white.opacity(0.35) : Color.white.opacity(0.12),
                            lineWidth: 1
                        )
                )
        }
    }

    private var customNightsForm: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("宿泊数を入力")
                .font(.body.weight(.bold))
                .foregroundStyle(Theme.muted)

            HStack(spacing: 10) {
                stepButton("−") {
                    customNights = max(4, customNights - 1)
                }
                Text("\(customNights)泊")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Theme.text)
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.radius)
                            .fill(Color(red: 0.063, green: 0.063, blue: 0.063))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.radius)
                            .stroke(Color.white.opacity(0.12), lineWidth: 1)
                    )
                stepButton("＋") {
                    customNights = min(30, customNights + 1)
                }
                Button {
                    store.selectNights(customNights)
                } label: {
                    Text("決定")
                        .foregroundStyle(Theme.text)
                        .frame(width: 84, height: 48)
                        .background(
                            RoundedRectangle(cornerRadius: Theme.radius)
                                .fill(Color(red: 0.14, green: 0.14, blue: 0.14))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.radius)
                                .stroke(Color.white.opacity(0.12), lineWidth: 1)
                        )
                }
            }
        }
    }

    private func stepButton(_ label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.title3.weight(.bold))
                .foregroundStyle(Theme.text)
                .frame(width: 48, height: 48)
                .background(
                    RoundedRectangle(cornerRadius: Theme.radius)
                        .fill(Color(red: 0.14, green: 0.14, blue: 0.14))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radius)
                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                )
        }
    }
}
