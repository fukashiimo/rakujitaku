import StoreKitTest
import XCTest

@testable import Rakujitaku

@MainActor
final class TipJarTests: XCTestCase {
    func testLoadAndPurchaseTip() async throws {
        let configURL = try XCTUnwrap(
            Bundle(for: Self.self).url(forResource: "Rakujitaku", withExtension: "storekit")
        )
        let session = try SKTestSession(contentsOf: configURL)
        session.disableDialogs = true
        session.clearTransactions()

        let tipJar = TipJar()

        await tipJar.load()
        XCTAssertEqual(tipJar.product?.id, TipJar.productID)

        await tipJar.tip()
        XCTAssertTrue(tipJar.thanked)
    }
}
