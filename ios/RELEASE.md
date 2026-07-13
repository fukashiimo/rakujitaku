# App Store リリース手順

iOS版らくじたくをApp Storeに出すまでの手順。実装・ビルド・UIテストは完了済み。

## プロジェクトについて

- `ios/Rakujitaku.xcodeproj` を開いて開発する（kaedokiと同じくxcodegen製。
  ファイル構成を変えたら `cd ios && xcodegen generate` で再生成）
- Bundle ID: `com.shuyafukai.rakujitaku` / チーム: 登録済みのDevelopment Team設定済み
- テスト実行: Xcodeで ⌘U、またはCLIで
  `xcodebuild -project Rakujitaku.xcodeproj -scheme Rakujitaku -destination 'platform=iOS Simulator,name=iPhone 17 Pro' test`

## 提出前にやること

### 1. アプリアイコン（必須）

`Rakujitaku/Resources/Assets.xcassets/AppIcon.appiconset` に1024×1024のPNGを1枚入れる。
Web版のゲーム風デザイン（黒背景+アンバーのピクセル+バッグ）をモチーフにするとよい。
アイコン案が必要なら生成を手伝えるので声をかけて。

### 2. App Store Connect でアプリを登録

1. https://appstoreconnect.apple.com/ → マイアプリ → 「+」→ 新規アプリ
2. プラットフォーム: iOS / 名前: らくじたく（重複で弾かれたら「らくじたく - 旅行持ち物リスト」等）
3. プライマリ言語: 日本語 / バンドルID: `com.shuyafukai.rakujitaku` / SKU: `rakujitaku`

### 3. ストア情報を用意

- **スクリーンショット**: 6.9インチ（iPhone 17 Pro Max等）必須。シミュレータで ⌘S で撮影
- **説明文・キーワード**: 「旅行 持ち物 チェックリスト パッキング」など
- **プライバシー**: このアプリはデータを一切収集しないので、
  App Privacyは「データを収集しない」を選択。プライバシーポリシーURLは
  GitHub Pages（https://fukashiimo.github.io/rakujitaku/）配下に1ページ足せばOK（作成手伝います）
- **年齢制限**: 4+

### 4. アーカイブ&アップロード

1. Xcodeでデバイス選択を「Any iOS Device (arm64)」に
2. Product → Archive
3. Organizer → Distribute App → App Store Connect → Upload
4. App Store Connectでビルドを選択して審査に提出

#### 新仕様（1.0.0 build 2）の再提出メモ（2026-07-13）

- ビルド番号は `1` → `2` に更新済み（`project.yml` / pbxproj）。バージョンは `1.0.0` のまま
- **build 2 のアーカイブは作成済み**。Xcode Organizer の場所に置いてあるので、
  そのままアップロードできる:
  `~/Library/Developer/Xcode/Archives/2026-07-13/らくじたく 1.0.0 (2) 20-51.xcarchive`
- 手順: Xcode → Window → Organizer → Archives → 上記アーカイブを選択 →
  「Distribute App」→ App Store Connect → Upload（自動署名で配布用に再署名される）
- CLIからのアップロードは配布用証明書とApp Store Connect APIキー（または
  app-specific password）が必要。この端末には配布証明書もAPIキームも無いため、
  Organizerからの手動アップロードが最短。
  ※ APIキーを作れば以後CLIで完結できる（App Store Connect → ユーザーとアクセス →
    Integrations → App Store Connect API → キー生成 → `~/.appstoreconnect/private_keys/` に配置）
- アップロード後、App Store Connect でビルド 2 を選択し、
  「このバージョンの新機能」を記入して審査提出

## 審査の注意点

- シンプルなアプリなので「最小機能（4.2）」を指摘されないよう、
  説明文で「オフライン動作・保存機能・初回設定の記憶」など機能をちゃんと書く
- 初回審査は通常1〜3日
