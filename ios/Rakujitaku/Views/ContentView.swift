import SwiftUI

struct ContentView: View {
    @StateObject private var store = AppStore()

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            Group {
                switch store.screen {
                case .home:
                    HomeView()
                case .nights:
                    NightsView()
                case .prefs:
                    PrefsView()
                case .list:
                    ChecklistView()
                case .done:
                    DoneView()
                }
            }
            .transition(.opacity)
        }
        .animation(.easeInOut(duration: 0.15), value: store.screen)
        .environmentObject(store)
        .preferredColorScheme(.dark)
    }
}

#Preview {
    ContentView()
}
