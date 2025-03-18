; Top-level structures for the code outline
(function_definition
  name: [
    (identifier) @name
    (method_name
      struct_name: (_) @context
      method_name: (identifier) @name)
    (overload_operator_name
      type_name: (_) @context
      operator: (identifier) @name)
  ]) @item

; Struct definitions 
(struct_declaration
  name: (identifier) @name) @item

; Struct methods (additional context for the outline)
(method_name
  struct_name: (identifier) @context
  method_name: (identifier) @name) @item

; Enum definitions
(enum_declaration
  name: (identifier) @name) @item

; Union definitions
(union_declaration
  name: (identifier) @name) @item

; Namespace declarations
(namespace_declaration
  name: (identifier) @name) @item

; Typedef declarations
(typedef_declaration
  name: (identifier) @name) @item

; Global variables
(global_variable_declaration
  name: (identifier) @name) @item

; Constants
(constant_declaration
  name: (identifier) @name) @item

; Import statements (giving them a name for the outline)
(import_statement
  module: [
    (identifier) @name
    (scoped_identifier) @name
    (relative_import) @name
    (import_module_path) @name
  ]) @item

; Attributes as annotations
(attribute
  name: (identifier) @annotation)

; Comments directly before declarations as annotations
(comment) @annotation

; Enum variants for nested outline view
(enum_variant
  name: (identifier) @name) @item.child

; Struct fields for nested outline view
(struct_field
  name: (identifier) @name) @item.child

; Union fields for nested outline view
(union_field
  name: (identifier) @name) @item.child