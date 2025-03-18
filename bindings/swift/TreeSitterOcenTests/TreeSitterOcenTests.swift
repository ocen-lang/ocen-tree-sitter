import XCTest
import SwiftTreeSitter
import TreeSitterOcen

final class TreeSitterOcenTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_ocen())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Ocen grammar")
    }
}
