import XCTest

/// App Store用スクリーンショットを撮影する専用テスト。
/// iPhone 17 Pro Max（6.9インチ / 1320×2868）で実行する。
final class ScreenshotTests: XCTestCase {
    func testCaptureAppStoreScreens() throws {
        let app = XCUIApplication()
        app.launch()

        // 1. ホーム画面
        shoot(app, "01_home")

        app.buttons["支度をはじめる"].tap()
        XCTAssertTrue(app.staticTexts["何泊しますか？"].waitForExistence(timeout: 3))

        // 2. 泊数選択
        shoot(app, "02_nights")

        app.buttons["2泊"].tap()
        XCTAssertTrue(app.staticTexts["必要なものを選ぶ"].waitForExistence(timeout: 3))

        // 洗面カテゴリを増やして見栄えを良くする
        app.buttons["コンタクトを使う"].tap()
        app.buttons["チェックリストへ"].tap()
        XCTAssertTrue(app.staticTexts["持ち物チェック"].waitForExistence(timeout: 3))

        // 進捗バーが途中まで進んだ状態にする
        for name in ["財布", "スマホ", "鍵", "トップス（2日分）", "下着（2日分）", "靴下（2日分）"] {
            tapScrollingTo(app.buttons[name], in: app)
        }
        app.swipeDown()  // 先頭（進捗バー）まで戻す

        // 3. チェックリスト
        shoot(app, "03_checklist")

        // 残りもチェックして完了画面へ
        for name in ["充電器・ケーブル", "日焼け止め", "コンタクト（2泊分）",
                     "メガネ（夜用）", "予備コンタクト", "コンタクトケース・洗浄液", "目薬"] {
            tapScrollingTo(app.buttons[name], in: app)
        }
        tapScrollingTo(app.buttons["完了"], in: app)
        XCTAssertTrue(app.staticTexts["すべて準備完了"].waitForExistence(timeout: 3))

        // 4. 完了（CLEAR）画面
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
        while !element.isHittable, attempts < 8 {
            app.swipeUp()
            attempts += 1
        }
        element.tap()
    }
}
