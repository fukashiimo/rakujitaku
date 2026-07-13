import XCTest

final class RakujitakuUITests: XCTestCase {
    func testFullPackingFlow() throws {
        let app = XCUIApplication()
        app.launch()

        app.buttons["支度をはじめる"].tap()

        XCTAssertTrue(app.staticTexts["何泊しますか？"].waitForExistence(timeout: 3))
        app.buttons["2泊"].tap()

        XCTAssertTrue(app.staticTexts["持っていくものを選ぶ"].waitForExistence(timeout: 3))
        app.buttons["チェックリストへ"].tap()

        XCTAssertTrue(app.staticTexts["持ち物チェック"].waitForExistence(timeout: 3))
        XCTAssertTrue(app.staticTexts["2泊の支度"].exists)

        let completeButton = app.buttons["完了"]
        XCTAssertFalse(completeButton.isEnabled)

        let itemNames = [
            "財布", "スマホ", "家の鍵",
            "トップス（2泊分）", "ボトムス（2泊分）",
            "インナー（上）（2泊分）", "インナー（下）（2泊分）",
            "靴下（2泊分）", "パジャマ",
            "歯ブラシ",
            "日焼け止め", "充電器・ケーブル",
        ]
        for name in itemNames {
            tapScrollingTo(app.buttons[name], in: app)
        }

        XCTAssertTrue(completeButton.isEnabled)
        tapScrollingTo(completeButton, in: app)

        XCTAssertTrue(app.staticTexts["すべて準備完了"].waitForExistence(timeout: 3))
        tapScrollingTo(app.buttons["この支度を保存する"], in: app)

        XCTAssertTrue(app.staticTexts["いつもの支度"].waitForExistence(timeout: 3))
        XCTAssertTrue(app.staticTexts["2泊の支度"].exists)
    }

    func testDayTripFlow() throws {
        let app = XCUIApplication()
        app.launch()

        app.buttons["支度をはじめる"].tap()
        app.buttons["日帰り"].tap()
        app.buttons["チェックリストへ"].tap()

        XCTAssertTrue(app.staticTexts["持ち物チェック"].waitForExistence(timeout: 3))
        XCTAssertTrue(app.staticTexts["日帰りの支度"].exists)

        // 日帰りは衣類なし・モバイルバッテリー入り
        XCTAssertTrue(app.buttons["モバイルバッテリー"].exists)
        XCTAssertFalse(app.buttons["パジャマ"].exists)
    }

    func testSuggestionAndCustomItem() throws {
        let app = XCUIApplication()
        app.launch()

        app.buttons["支度をはじめる"].tap()
        app.buttons["1泊"].tap()
        app.buttons["チェックリストへ"].tap()

        XCTAssertTrue(app.staticTexts["持ち物チェック"].waitForExistence(timeout: 3))

        // 提案チップからの追加
        tapScrollingTo(app.buttons["＋ モバイルバッテリー"], in: app)
        XCTAssertTrue(app.buttons["モバイルバッテリー"].exists)

        // 削除すると提案に戻る
        tapScrollingTo(app.buttons["モバイルバッテリーを削除"], in: app)
        XCTAssertTrue(app.buttons["＋ モバイルバッテリー"].waitForExistence(timeout: 3))
    }

    private func tapScrollingTo(_ element: XCUIElement, in app: XCUIApplication) {
        var attempts = 0
        while !element.isHittable, attempts < 6 {
            app.swipeUp()
            attempts += 1
        }
        element.tap()
    }
}
