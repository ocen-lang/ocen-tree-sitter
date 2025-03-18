; Indent on opening brackets/keywords
[
  "{"
  "("
  "["
  "$["
  "${"
] @indent

; Dedent on closing brackets
[
  "}"
  ")"
  "]"
] @outdent

; Block-like constructs that should increase indentation
[
  (struct_body)
  (enum_body)
  (union_body)
  (namespace_body)
  (block)
  (match_body)
] @indent

; Control flow structures should increase indentation
(if_statement
  condition: (_) @indent)

(multi_if_statement
  "{" @indent
  "}" @outdent)

(match_statement
  value: (_) @indent)

(for_loop
  body: (_) @indent)

(while_loop
  body: (_) @indent)

; Dedent for lines starting with these keywords/symbols
[
  "else"
  "=>"
] @outdent

; Dedent for lines with match patterns
(match_arm
  pattern: (_)
  "=>" @outdent)

; Handle multi-line chaining of methods
(method_call) @aligned_indent