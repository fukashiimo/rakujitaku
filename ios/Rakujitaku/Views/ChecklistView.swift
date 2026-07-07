import SwiftUI

struct ChecklistView: View {
    @EnvironmentObject private var store: AppStore
    @State private var newItemName = ""
    @FocusState private var inputFocused: Bool

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                BackButton {
                    store.goBackFromList()
                }

                VStack(alignment: .leading, spacing: 8) {
                    Eyebrow(text: "CHECKLIST")
                    ScreenTitle(text: "持ち物チェック")
                    Text("\(store.nights)泊の支度")
                        .foregroundStyle(Theme.muted)
                }

                progressBox

                ForEach(ItemCategory.allCases, id: \.self) { category in
                    let categoryItems = store.items(in: category)
                    if !categoryItems.isEmpty {
                        categorySection(category, items: categoryItems)
                    }
                }

                addForm

                if !store.availableSuggestions.isEmpty {
                    FlowLayout(spacing: 8) {
                        ForEach(store.availableSuggestions, id: \.self) { name in
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
                    .padding(.vertical, 6)
                }

                PrimaryButton(title: "完了", disabled: !store.isComplete) {
                    store.complete()
                }
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
            .padding(.bottom, 40)
        }
        .scrollDismissesKeyboard(.interactively)
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
            }

            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.white.opacity(0.12))
                    Capsule()
                        .fill(Theme.accent2)
                        .frame(width: geometry.size.width * store.progress)
                        .animation(.easeOut(duration: 0.16), value: store.progress)
                }
            }
            .frame(height: 8)
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

    private func addNewItem() {
        store.addItem(named: newItemName)
        newItemName = ""
        inputFocused = true
    }
}
