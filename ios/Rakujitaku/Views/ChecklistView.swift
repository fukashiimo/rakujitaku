import SwiftUI

struct ChecklistView: View {
    @EnvironmentObject private var store: AppStore
    @State private var newItemName = ""
    @FocusState private var inputFocused: Bool
    @State private var progressPulse = false
    @State private var sheenOffset: CGFloat = -1.2

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ForEach(ItemCategory.allCases, id: \.self) { category in
                    let categoryItems = store.items(in: category)
                    if !categoryItems.isEmpty {
                        categorySection(category, items: categoryItems)
                    }
                }

                addForm

                if !store.availableSuggestions.isEmpty {
                    suggestionChips(store.availableSuggestions)
                        .padding(.vertical, 6)
                }

                itemHistorySection

                PrimaryButton(title: "完了", disabled: !store.isComplete) {
                    store.complete()
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
            .padding(.bottom, 40)
        }
        .scrollDismissesKeyboard(.interactively)
        // スクロールしても上部で固定されるヘッダー（プログレスバーを含む）
        .safeAreaInset(edge: .top, spacing: 0) {
            VStack(alignment: .leading, spacing: 12) {
                BackButton {
                    store.goBackFromList()
                }

                VStack(alignment: .leading, spacing: 8) {
                    Eyebrow(text: "CHECKLIST")
                    ScreenTitle(text: "持ち物チェック")
                    Text("\(store.nightsLabel)の支度")
                        .foregroundStyle(Theme.muted)
                }

                progressBox
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
            .padding(.bottom, 12)
            .background(Theme.bg)
            .overlay(alignment: .bottom) {
                Rectangle()
                    .fill(Theme.accent2.opacity(0.22))
                    .frame(height: 1)
            }
            .shadow(color: .black.opacity(0.4), radius: 8, y: 5)
        }
    }

    private var progressBox: some View {
        VStack(spacing: 12) {
            HStack(alignment: .firstTextBaseline) {
                Text("\(store.checkedCount) / \(store.items.count)")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Theme.text)
                Spacer()
                Text("準備済み")
                    .foregroundStyle(Theme.muted)
                Text("\(Int((store.progress * 100).rounded()))%")
                    .font(.system(size: 22, weight: .heavy, design: .rounded))
                    .foregroundStyle(Theme.accent2)
                    .shadow(color: Theme.accent2.opacity(0.35), radius: 8)
                    .scaleEffect(progressPulse ? 1.08 : 1)
            }

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.white.opacity(0.1))
                        .shadow(color: .black.opacity(0.45), radius: 3, y: 1)
                    Capsule()
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(red: 0.435, green: 0.749, blue: 0.584),
                                    Theme.accent2,
                                    Color(red: 0.804, green: 0.933, blue: 0.871),
                                    Theme.accent2,
                                    Color(red: 0.435, green: 0.749, blue: 0.584),
                                ],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .overlay {
                            Capsule()
                                .fill(
                                    LinearGradient(
                                        colors: [.clear, .white.opacity(0.58), .clear],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(width: 64)
                                .offset(x: sheenOffset * geometry.size.width)
                                .mask(Capsule())
                        }
                        .frame(width: max(0, geometry.size.width * store.progress))
                        .shadow(color: Theme.accent2.opacity(0.55), radius: 8)
                        .animation(.easeOut(duration: 0.42), value: store.progress)

                    if store.progress > 0 {
                        Circle()
                            .fill(Color.white.opacity(0.9))
                            .frame(width: 8, height: 8)
                            .shadow(color: Theme.accent2, radius: 6)
                            .offset(x: max(4, geometry.size.width * store.progress - 4))
                            .animation(.easeOut(duration: 0.42), value: store.progress)
                    }
                }
            }
            .frame(height: 14)
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: Theme.radius)
                .fill(Color(red: 0.063, green: 0.094, blue: 0.078))
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radius)
                .stroke(Theme.accent2.opacity(0.22), lineWidth: 1)
        )
        .scaleEffect(progressPulse ? 1.01 : 1)
        .animation(.easeOut(duration: 0.26), value: progressPulse)
        .onAppear {
            withAnimation(.linear(duration: 2.6).repeatForever(autoreverses: false)) {
                sheenOffset = 1.2
            }
        }
        .onChange(of: store.checkedCount) { oldValue, newValue in
            guard newValue > oldValue else { return }
            progressPulse = true
            withAnimation(.easeOut(duration: 0.3)) {
                progressPulse = false
            }
        }
    }

    private func categorySection(_ category: ItemCategory, items: [PackingItem]) -> some View {
        VStack(spacing: 0) {
            Text(category.rawValue)
                .font(.body.weight(.bold))
                .foregroundStyle(Theme.text)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(Color.white.opacity(0.06))

            ForEach(items) { item in
                HStack(spacing: 10) {
                    Button {
                        store.toggle(item)
                    } label: {
                        HStack(spacing: 10) {
                            Image(systemName: item.checked ? "checkmark.square.fill" : "square")
                                .font(.title3)
                                .foregroundStyle(item.checked ? Theme.accent2 : Theme.soft)
                            Text(item.name)
                                .foregroundStyle(item.checked ? Theme.soft : Theme.text)
                                .strikethrough(item.checked)
                            Spacer()
                        }
                    }

                    Button {
                        store.delete(item)
                    } label: {
                        Text("×")
                            .foregroundStyle(Theme.danger)
                            .frame(width: 36, height: 36)
                    }
                    .accessibilityLabel("\(item.name)を削除")
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .overlay(alignment: .top) {
                    Rectangle()
                        .fill(Color.white.opacity(0.07))
                        .frame(height: 1)
                }
            }
        }
        .panelStyle()
        .clipShape(RoundedRectangle(cornerRadius: Theme.radius))
    }

    private var addForm: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("持ち物を追加")
                .font(.body.weight(.bold))
                .foregroundStyle(Theme.muted)

            HStack(spacing: 10) {
                TextField("例：モバイルバッテリー", text: $newItemName)
                    .focused($inputFocused)
                    .submitLabel(.done)
                    .onSubmit(addNewItem)
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

                Button(action: addNewItem) {
                    Text("追加")
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
        .padding(.top, 6)
    }

    private func suggestionChips(_ names: [String]) -> some View {
        FlowLayout(spacing: 8) {
            ForEach(names, id: \.self) { name in
                Button {
                    store.addItem(named: name)
                } label: {
                    Text("＋ \(name)")
                        .font(.subheadline)
                        .foregroundStyle(Theme.muted)
                        .padding(.horizontal, 12)
                        .frame(minHeight: 38)
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.radius)
                                .stroke(Color.white.opacity(0.12), lineWidth: 1)
                        )
                }
            }
        }
    }

    private var itemHistorySection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("過去に追加した持ち物")
                .font(.body.weight(.bold))
                .foregroundStyle(Theme.muted)

            if store.availableHistory.isEmpty {
                Text("保存後に追加履歴が表示されます。")
                    .foregroundStyle(Theme.muted)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .panelStyle()
            } else {
                suggestionChips(store.availableHistory)
            }
        }
    }

    private func addNewItem() {
        store.addItem(named: newItemName)
        newItemName = ""
        inputFocused = true
    }
}
