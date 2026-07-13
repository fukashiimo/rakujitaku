import SwiftUI

enum Theme {
    static let bg = Color(red: 0.02, green: 0.02, blue: 0.02)
    static let panel = Color(red: 0.09, green: 0.09, blue: 0.09)
    static let panelLight = Color(red: 0.126, green: 0.126, blue: 0.126)
    static let text = Color(red: 0.96, green: 0.96, blue: 0.957)
    static let muted = Color(red: 0.722, green: 0.737, blue: 0.78)
    static let soft = Color(red: 0.545, green: 0.576, blue: 0.639)
    static let accent = Color(red: 0.973, green: 0.784, blue: 0.416)
    static let accent2 = Color(red: 0.584, green: 0.835, blue: 0.698)
    static let danger = Color(red: 1.0, green: 0.541, blue: 0.502)
    static let radius: CGFloat = 8
}

struct Eyebrow: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption.weight(.bold))
            .foregroundStyle(Theme.accent)
    }
}

struct ScreenTitle: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.system(size: 34, weight: .bold))
            .foregroundStyle(Theme.text)
    }
}

struct PrimaryButton: View {
    let title: String
    var disabled = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.body.weight(.heavy))
                .frame(maxWidth: .infinity, minHeight: 48)
                .background(Theme.text)
                .foregroundStyle(Color(red: 0.03, green: 0.03, blue: 0.03))
                .clipShape(RoundedRectangle(cornerRadius: Theme.radius))
        }
        .disabled(disabled)
        .opacity(disabled ? 0.5 : 1)
    }
}

struct SecondaryButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .frame(maxWidth: .infinity, minHeight: 48)
                .foregroundStyle(Theme.text)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radius)
                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                )
        }
    }
}

struct BackButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text("戻る")
                .foregroundStyle(Theme.muted)
                .padding(.horizontal, 14)
                .frame(minHeight: 40)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radius)
                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                )
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct PanelBackground: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: Theme.radius)
                    .fill(Color.white.opacity(0.045))
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.radius)
                    .stroke(Color.white.opacity(0.09), lineWidth: 1)
            )
    }
}

extension View {
    func panelStyle() -> some View {
        modifier(PanelBackground())
    }
}

/// ゲーム画面風の演出パネル（ホーム・完了画面で使用）
struct GameStage: View {
    enum Mode {
        case loading, clear
    }

    let mode: Mode
    @State private var blink = false
    @State private var float = false

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: Theme.radius)
                .fill(Color.black.opacity(0.42))
            RoundedRectangle(cornerRadius: Theme.radius)
                .stroke(Theme.accent.opacity(0.32), lineWidth: 1)

            pixel(Theme.accent).offset(x: -110, y: -90)
            pixel(Theme.accent2).offset(x: 100, y: -60).opacity(blink ? 0.25 : 1)
            pixel(Theme.accent).offset(x: 70, y: 50).opacity(blink ? 1 : 0.25)
            pixel(Color(red: 0.784, green: 0.808, blue: 0.851)).offset(x: -80, y: 70)

            if mode == .clear {
                PixelConfetti()
            }

            // ピクセル風バッグ
            HStack(spacing: 0) {
                Rectangle().fill(Color(red: 0.56, green: 0.42, blue: 0.235)).frame(width: 8, height: 8)
                Rectangle().fill(Theme.accent).frame(width: 8, height: 8).offset(y: -8)
                Rectangle().fill(Color(red: 0.56, green: 0.42, blue: 0.235)).frame(width: 8, height: 8)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
            .padding(.leading, 22)
            .padding(.bottom, 22)

            VStack(spacing: 8) {
                switch mode {
                case .loading:
                    Text("らくじたく")
                        .font(.system(size: 44, weight: .heavy))
                        .foregroundStyle(Theme.text)
                case .clear:
                    Text("CLEAR")
                        .font(.title3.weight(.heavy))
                        .fontDesign(.monospaced)
                        .foregroundStyle(Theme.accent2)
                    Text("支度ができました")
                        .font(.system(size: 30, weight: .heavy))
                        .foregroundStyle(Theme.text)
                }
            }
            .offset(y: float ? -5 : 0)
            .shadow(color: Theme.accent.opacity(0.22), radius: 14)

            Group {
                switch mode {
                case .loading:
                    HStack(spacing: 2) {
                        Text("NOW LOADING")
                            .font(.caption)
                            .foregroundStyle(Theme.muted)
                        Text("...")
                            .foregroundStyle(Theme.accent)
                            .opacity(blink ? 1 : 0.2)
                    }
                    .fontDesign(.monospaced)
                    .fontWeight(.heavy)
                case .clear:
                    Text("READY")
                        .font(.caption.weight(.heavy))
                        .fontDesign(.monospaced)
                        .foregroundStyle(Theme.accent2)
                        .padding(.horizontal, 9)
                        .padding(.vertical, 5)
                        .background(Theme.accent2.opacity(0.1))
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.radius)
                                .stroke(Theme.accent2.opacity(0.45), lineWidth: 1)
                        )
                        .opacity(blink ? 1 : 0.4)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
            .padding(.trailing, 18)
            .padding(.bottom, 16)
        }
        .frame(minHeight: mode == .loading ? 260 : 230)
        .onAppear {
            withAnimation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true)) {
                blink = true
            }
            withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
                float = true
            }
        }
    }

    private func pixel(_ color: Color) -> some View {
        Rectangle()
            .fill(color)
            .frame(width: 8, height: 8)
            .shadow(color: color.opacity(0.7), radius: 7)
    }
}

/// CLEAR画面に降るピクセル紙吹雪（Reduce Motion時は表示しない）
struct PixelConfetti: View {
    private struct Piece {
        let x: CGFloat
        let color: Color
        let delay: Double
        let duration: Double
        let drift: CGFloat
        let isRound: Bool
    }

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var fall = false
    private let pieces: [Piece]

    init() {
        let palette: [Color] = [
            Theme.accent,
            Theme.accent2,
            Color(red: 0.784, green: 0.808, blue: 0.851),
            Theme.danger,
        ]
        pieces = (0..<24).map { index in
            Piece(
                x: CGFloat.random(in: 0.02...0.98),
                color: palette[index % palette.count],
                delay: Double.random(in: 0...0.6),
                duration: Double.random(in: 1.0...1.9),
                drift: CGFloat.random(in: -40...40),
                isRound: index.isMultiple(of: 2)
            )
        }
    }

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .topLeading) {
                ForEach(pieces.indices, id: \.self) { index in
                    let piece = pieces[index]
                    RoundedRectangle(cornerRadius: piece.isRound ? 3.5 : 1)
                        .fill(piece.color)
                        .frame(width: 7, height: 7)
                        .rotationEffect(.degrees(fall ? 560 : 0))
                        .position(
                            x: piece.x * geometry.size.width + (fall ? piece.drift : 0),
                            y: fall ? geometry.size.height + 12 : -12
                        )
                        .opacity(fall ? 0.85 : 1)
                        .animation(.easeIn(duration: piece.duration).delay(piece.delay), value: fall)
                }
            }
            .clipped()
        }
        .allowsHitTesting(false)
        .onAppear {
            if !reduceMotion {
                fall = true
            }
        }
    }
}

/// 提案チップなどを折り返して並べるレイアウト
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x > 0, x + size.width > maxWidth {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }

        return CGSize(width: proposal.width ?? x, height: y + rowHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        var y = bounds.minY
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x > bounds.minX, x + size.width > bounds.maxX {
                x = bounds.minX
                y += rowHeight + spacing
                rowHeight = 0
            }
            subview.place(at: CGPoint(x: x, y: y), anchor: .topLeading, proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
