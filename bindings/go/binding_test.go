package tree_sitter_ocen_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_ocen "github.com/ocen-lang/ocen-tree-sitter/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_ocen.Language())
	if language == nil {
		t.Errorf("Error loading Ocen grammar")
	}
}
