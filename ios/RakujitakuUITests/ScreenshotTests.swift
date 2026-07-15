import XCTest

/// App Store用スクリーンショットを撮影する専用テスト。
/// iPhone 17 Pro Max（6.9インチ / 1320×2868）で実行する。
final class ScreenshotTests: XCTestCase {
    func testCaptureAppStoreScreens() throws {
        let app = XCUIApplication()
        app.launchArguments = ["-uitest-reset"]
        app.launch()

        // 1. ホーム画面
        shoot(app, "01_home")

        app.buttons["支度をはじめる"].tap()
        XCTAssertTrue(app.staticTexts["何泊しますか？"].waitForExistence(timeout: 3))

        // 2. 泊数選択
        shoot(app, "02_nights")

        app.buttons["2泊"].tap()
        XCTAssertTrue(app.staticTexts["持っていくものを選ぶ"].waitForExistence(timeout: 3))

        // 洗面カテゴリを増やして見栄えを良くする
        app.buttons["コンタクトを使う"].tap()
        app.buttons["チェックリストへ"].tap()
        XCTAssertTrue(app.staticTexts["持ち物チェック"].waitForExistence(timeout: 3))

        // 進捗バーが途中まで進んだ状態にする
        for name in ["財布", "スマホ", "家の鍵",
                     "トップス（2泊分）", "ボトムス（2泊分）", "靴下（2泊分）"] {
            tapScrollingTo(app.buttons[name], in: app)
        }
        app.swipeDown()  // 先頭（進捗バー）まで戻す

        // 3. チェックリスト
        shoot(app, "03_checklist")

        // 残りもチェックして完了画面へ
        for name in ["インナー（上）（2泊分）", "インナー（下）（2泊分）", "パジャマ",
                     "歯ブラシ", "日焼け止め", "充電器・ケーブル",
                     "コンタクト（2泊分）", "コンタクト液（2泊分）", "メガネ"] {
            tapScrollingTo(app.buttons[name], in: app)
        }
        // 完了ボタンは一覧最下部なので、大きめのスワイプで確実に表示させてからタップ
        var scrolls = 0
        while !app.buttons["完了"].isHittable, scrolls < 8 {
            app.swipeUp()
            scrolls += 1
        }
        app.buttons["完了"].tap()
        XCTAssertTrue(app.staticTexts["すべて準備完了"].waitForExistence(timeout: 5))

        // 4. 完了（CLEAR）画面（演出を少し待ってから撮影）
        Thread.sleep(forTimeInterval: 0.8)
        shoot(app, "04_done")
    }

    private func shoot(_ app: XCUIApplication, _ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    private func tapScrollingTo(_ element: XCUIElement, in app: XCUIApplication) {
        var attempts = 0
        // 上部固定ヘッダーの下に隠れないよう、小さく細かくスクロールして可視域に収める
        while !element.isHittable, attempts < 25 {
            let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.72))
            let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.57))
            start.press(forDuration: 0.01, thenDragTo: end)
            attempts += 1
        }
        element.tap()
    }
}
