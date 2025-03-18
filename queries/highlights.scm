; Keywords
(primitive_type) @type.builtin
[
  "struct"
  "enum"
  "union"
  "namespace"
  "typedef"
  "import"
  "as"
  "this"
] @keyword

; Control flow keywords
[
  "if"
  "else"
  "match"
  "for"
  "while"
  "return"
  "break"
  "continue"
  "yield"
  "defer"
  "then"
  "assert"
] @keyword.control

; Operators as keywords
[
  "and"
  "or"
  "not"
  "in"
  "is"
] @keyword.operator

; Function and method definitions
(function_definition
  "def" @keyword.function
  name: [(identifier) @function
         (method_name
           struct_name: (_) @type
           method_name: (identifier) @function.method)
         (overload_operator_name
           type_name: (_) @type
           operator: (identifier) @operator)])

; Template parameters
(template_params
  "<" @punctuation.bracket
  ">" @punctuation.bracket)

(template_param) @variable.parameter

; Attributes
(attribute
  "[" @punctuation.bracket
  name: (identifier) @attribute
  "]" @punctuation.bracket)

; Parameters
(parameter
  name: (identifier) @variable.parameter)

; Struct declaration
(struct_declaration
  "struct" @keyword
  name: (identifier) @type)

(struct_field
  name: (identifier) @property)

; Enum declaration
(enum_declaration
  "enum" @keyword
  name: (identifier) @type)

(enum_variant
  name: (identifier) @constant)

(enum_shared_field
  name: (identifier) @property)

(enum_variant_field
  name: (identifier) @property)

; Union declaration
(union_declaration
  "union" @keyword
  name: (identifier) @type)

(union_field
  name: (identifier) @property)

; Namespace declaration
(namespace_declaration
  "namespace" @keyword
  name: (identifier) @namespace)

; Typedef declaration
(typedef_declaration
  "typedef" @keyword
  name: (identifier) @type)

; Variable and constant declarations
(variable_declaration
  "let" @keyword.storage
  name: (identifier) @variable)

(global_variable_declaration
  "let" @keyword.storage
  name: (identifier) @variable.global)

(constant_declaration
  "const" @keyword.storage
  name: (identifier) @constant)

; Import statement
(import_statement
  "import" @include
  module: [(identifier) @namespace
           (scoped_identifier) @namespace
           (relative_import) @namespace
           (import_module_path) @namespace])

(import_item) @namespace
(import_wildcard) @namespace
(import_this) @namespace

; Types
(primitive_type) @type.builtin

(template_type
  name: [(identifier) @type
         (scoped_identifier) @type])

(template_specialization
  "<" @punctuation.bracket
  ">" @punctuation.bracket)

(array_type
  "[" @punctuation.bracket
  "]" @punctuation.bracket)

(pointer_type
  "&" @operator)

(reference_type
  "&" @operator)

(function_pointer_type
  "fn" @type.builtin)

(closure_type
  "@fn" @type.builtin)

(vector_shorthand_type
  "$[" @punctuation.bracket
  "]" @punctuation.bracket)

(map_shorthand_type
  "${" @punctuation.bracket
  "}" @punctuation.bracket)

; Literals
(number_literal) @number
(boolean_literal) @boolean
(null_literal) @constant.builtin
(string_literal) @string
(multi_line_string_literal) @string
(char_literal) @character
(escape_sequence) @string.escape

; Format strings
(format_string) @string
(format_placeholder
  "{" @punctuation.special
  "}" @punctuation.special) @embedded

; Array, vector, and map literals
(array_literal
  "[" @punctuation.bracket
  "]" @punctuation.bracket)

(vector_literal
  "$[" @punctuation.bracket
  "]" @punctuation.bracket)

(map_literal
  "${" @punctuation.bracket
  "}" @punctuation.bracket)

(map_entry
  key: (_) @variable
  ":" @punctuation.delimiter)

; Expressions
(binary_expression
  operator: _ @operator)

(unary_expression
  operator: _ @operator)

(as_cast_expression
  "as" @keyword.operator)

(function_call
  function: [(identifier) @function.call
             (scoped_identifier) @function.call
             (member_access
               member: (identifier) @function.method.call)
             (dot_shorthand
               member: (identifier) @function.method.call)])

(constructor_call
  constructor_name: [(identifier) @constructor
                     (scoped_identifier) @constructor])

(method_call
  method: (identifier) @function.method.call)

(member_access
  member: (identifier) @property)

(dot_shorthand
  member: (identifier) @property)

(array_access
  "[" @punctuation.bracket
  "]" @punctuation.bracket)

(template_instantiation
  base: [(identifier) @type
         (scoped_identifier) @type]
  method: (identifier) @function)

; Control flow expressions
(match_expression
  "match" @keyword.control)

(match_arm
  pattern: [(match_case) @variable.other
            (match_pattern) @variable.other]
  "=>" @punctuation.special)

(match_case) @variable.other
(enum_variant_pattern
  name: [(identifier) @constant
         (scoped_identifier) @constant])

(is_expression
  "is" @keyword.operator)

; Closures
(closure_expression
  "|" @punctuation.bracket
  "|" @punctuation.bracket
  "=>" @punctuation.special)

(closure_param
  name: (identifier) @variable.parameter)

; Special operators
(error_propagation
  "!" @punctuation.special)

(error_unwrap
  "!!" @punctuation.special)

(compiler_operation
  "@" @punctuation.special
  operation: (identifier) @function.special)

(pointer_test
  "?" @operator)

(try_member_access
  "?." @operator)

; Comments
(comment) @comment

; Identifiers
(identifier) @variable
(scoped_identifier) @variable

; Punctuation
"(" @punctuation.bracket
")" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"," @punctuation.delimiter
";" @punctuation.delimiter
"." @punctuation.delimiter
"::" @punctuation.delimiter
":" @punctuation.delimiter