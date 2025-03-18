function sep(separator, rule) {
  return optional(sep1(separator, rule));
}

function sep1(separator, rule) {
  return seq(rule, repeat(seq(separator, rule)));
}

module.exports = grammar({
  name: 'ocen',

  extras: $ => [
    /[ \t\r\f\v]|\\\r?\n/,
    $.comment,
    /\n/
  ],

  conflicts: $ => [
    // FIXME: Should all blocks just be expressions?
    [$.block_expression, $.block],
    [$.match_expression, $.match_statement],
    [$.function_pointer_type],
    [$.enum_variant_pattern],
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($._top_level_declaration),

    _top_level_declaration: $ => choice(
      $.function_definition,
      $.struct_declaration,
      $.enum_declaration,
      $.namespace_declaration,
      $.typedef_declaration,
      $.global_variable_declaration,
      $.constant_declaration,
      $.import_statement,
      $.compiler_directive
    ),

    // Comments
    comment: $ => token(seq('//', /.*/)),

    // Identifiers
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    // Names and qualified identifiers
    scoped_identifier: $ => seq(
      choice(
        $.identifier,
        $.scoped_identifier,
      ),
      '::',
      $.identifier,
    ),

    compiler_directive: $ => seq(
      "@compiler",
      choice("c_include", "c_flag"),
      $.string_literal,
    ),

    // Types
    _type: $ => choice(
      $.primitive_type,
      $.array_type,
      $.pointer_type,
      $.function_pointer_type,
      $.template_type,
      $.vector_shorthand_type,
      $.map_shorthand_type,
      $.identifier,
      $.scoped_identifier,
    ),

    primitive_type: $ => choice(
      'bool',
      'char',
      'u8', 'u16', 'u32', 'u64',
      'i8', 'i16', 'i32', 'i64',
      'f32', 'f64',
      'str',
      'untyped_ptr',
      'void',
    ),

    array_type: $ => seq(
      '[',
      field('element_type', $._type),
      ';',
      field('size', $._expression),
      ']',
    ),

    pointer_type: $ => seq(
      '&',
      field('pointed_type', $._type),
    ),

    function_pointer_type: $ => seq(
      choice('fn', '@fn'),
      '(',
      optional($.parameter_list),
      ')',
      optional(seq(
        ':',
        field('return_type', $._type),
      )),
    ),

    // NOTE: 5 here is higher than < operator in binary_expression
    template_type: $ => prec(5, seq(
      field('name', choice($.identifier, $.scoped_identifier)),
      field('specialization', $.template_specialization),
    )),

    template_specialization: $ => seq(
      '<',
      sep1(',', field('type_argument', $._type)),
      '>',
    ),

    vector_shorthand_type: $ => seq(
      '$[',
      field('element_type', $._type),
      ']',
    ),

    map_shorthand_type: $ => seq(
      '${',
      field('key_type', $._type),
      prec(11, seq(
        ':',
        field('value_type', $._type),
      )),
      '}',
    ),

    // Function declaration
    function_definition: $ => seq(
      repeat($.attribute),
      'def',
      field('name', choice($.identifier, $.method_name)),
      optional($.template_params),
      '(',
      optional($.parameter_list),
      ')',
      optional(seq(
        ':',
        field('return_type', $._type),
      )),
      choice(
        field('body', $.block),
        seq(
          '=>',
          field('expression_body', $._expression),
        ),
      ),
    ),

    method_name: $ => seq(
      field('struct_name', choice($.identifier, $.scoped_identifier)),
      '::',
      field('method_name', $.identifier),
    ),

    parameter_list: $ => sep1(',', $.parameter),

    parameter: $ => choice(
      seq(
        field('name', $.identifier),
        ':',
        field('type', $._type),
        optional(seq(
          '=',
          field('default_value', $._expression),
        )),
      ),
      seq('&', field('name', $.identifier)),  // pass-by-reference parameter
      seq('&', field('name', $.identifier), ':', field('type', $._type)),
      seq(field('name', $.identifier), optional(seq(':', field('type', $._type)))),
      '...',
    ),

    // Struct declaration
    struct_declaration: $ => seq(
      repeat($.attribute),
      choice('struct', 'union'),
      field('name', $.identifier),
      optional($.template_params),
      optional(field('body', $.struct_body)),
    ),

    struct_body: $ => seq(
      '{',
      repeat($.struct_field),
      '}',
    ),

    struct_field: $ => seq(
      repeat($.attribute),
      sep1(',', field('names', $.identifier)),
      ':',
      field('type', $._type),
      optional(seq(
        '=',
        field('default_value', $._expression),
      )),
      choice(',', '\n'),
    ),

    // Enum declaration
    enum_declaration: $ => seq(
      repeat($.attribute),
      'enum',
      field('name', $.identifier),
      optional($.template_params),
      field('body', $.enum_body),
    ),

    enum_body: $ => seq(
      '{',
      optional(repeat($.enum_shared_field)),
      repeat($.enum_variant),
      '}',
    ),

    enum_shared_field: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
      optional(seq(
        '=',
        field('default_value', $._expression),
      )),
      choice(',', '\n'),
    ),

    enum_variant: $ => seq(
      repeat($.attribute),
      field('name', $.identifier),
      optional($.enum_variant_fields),
      choice(',', '\n'),
    ),

    enum_variant_fields: $ => seq(
      '(',
      sep(',', $.enum_variant_field),
      ')',
    ),

    enum_variant_field: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    // Namespace declaration
    namespace_declaration: $ => seq(
      'namespace',
      field('name', $.identifier),
      field('body', $.namespace_body),
    ),

    namespace_body: $ => seq(
      '{',
      repeat($._top_level_declaration),
      '}',
    ),

    // Typedef declaration
    typedef_declaration: $ => seq(
      'typedef',
      field('name', $.identifier),
      '=',
      field('target_type', $._type),
      choice(';', '\n'),
    ),

    // Global variable and constant declarations
    global_variable_declaration: $ => seq(
      repeat($.attribute),
      'let',
      field('name', $.identifier),
      ':',
      field('type', $._type),
      optional(seq(
        '=',
        field('value', $._expression),
      )),
      choice(';', '\n'),
    ),

    constant_declaration: $ => seq(
      repeat($.attribute),
      'const',
      field('name', $.identifier),
      ':',
      field('type', $._type),
      '=',
      field('value', $._expression),
      choice(';', '\n'),
    ),

    // Import statement
    import_statement: $ => seq(
      repeat($.attribute),
      'import',
      // Different types of imoports
      optional(choice(repeat('.'), '@', '::')),
      $.import_path,
    ),

    import_path: $ => choice(
      '*',
      field('items', $.import_list),
      seq(
        field('module', $.identifier),
        optional(choice(
          seq(
            '::',
            field('subpath', $.import_path),
          ),
          seq(
            'as',
            field('alias', $.identifier)
          )
        )),
      ),
    ),

    import_list: $ => seq(
      '{',
      sep1(',', $.import_path),
      '}',
    ),

    // Template parameters
    template_params: $ => seq(
      '<',
      sep1(',', $.template_param),
      '>',
    ),

    template_param: $ => $.identifier,

    // Attributes
    attribute: $ => seq(
      '[',
      field('name', $.identifier),
      optional(seq(
        repeat(field('argument', $.string_literal)),
      )),
      ']',
    ),

    // Statements
    _statement: $ => choice(
      $._terminated_expression,
      $.variable_declaration,
      $.block,
      $.if_statement,
      $.multi_if_statement,
      $.match_statement,
      $.for_loop,
      $.while_loop,
      $.return_statement,
      $.break_statement,
      $.continue_statement,
      $.yield_statement,
      $.defer_statement,
      $.assert_statement,
    ),

    _terminated_expression: $ => seq(
      $._expression,
      choice(';', '\n'),
    ),

    variable_declaration_no_end: $ => seq(
      'let',
      field('name', $.identifier),
      optional(seq(
        ':',
        field('type', $._type),
      )),
      optional(seq(
        '=',
        field('value', $._expression),
      )),
    ),

    variable_declaration: $ => seq(
      $.variable_declaration_no_end,
      choice(';', '\n'),
    ),

    block: $ => seq(
      '{',
      repeat($._statement),
      '}',
    ),

    if_statement: $ => prec.right(seq(
      'if',
      field('condition', $._expression),
      optional("then"),
      field('then_branch', choice(
        $._statement
      )),
      optional(seq(
        'else',
        field('else_branch', choice($._statement)),
      )),
    )),

    multi_if_statement: $ => prec(10, seq(
      'if',
      '{',
      sep1(choice(',', '\n'), $.multi_if_branch),
      optional(
        seq(
          'else',
          '=>',
          field('else_body', choice($.block, $._statement)),
        ),
      ),
      '}',
    )),

    multi_if_branch: $ => prec(10, seq(
      field('condition', $._expression),
      '=>',
      field('body', choice($.block, $._statement)),
    )),

    match_statement: $ => seq(
      'match',
      field('value', $._expression),
      field('body', $.match_body),
    ),

    match_body: $ => seq(
      '{',
      repeat($.match_arm),
      '}',
    ),

    match_arm: $ => seq(
      field('pattern', $.match_pattern),
      '=>',
      field('body', choice($._statement)),
      choice(',', '\n'),
    ),

    match_pattern: $ => choice(
      $.match_case,
      seq($.match_case, '|', $.match_pattern),
      'else',
    ),

    match_case: $ => choice(
      $.enum_variant_pattern,
      $.literal,
    ),

    enum_variant_pattern: $ => seq(
      field('name', choice($.identifier, $.scoped_identifier)),
      optional($.enum_variant_pattern_fields),
    ),

    enum_variant_pattern_fields: $ => seq(
      '(',
      sep(',', choice($.identifier, '_')),
      ')',
    ),

    for_loop: $ => seq(
      'for',
      choice(
        // C-style for loop
        seq(
          optional(field('init', choice(
            $.variable_declaration_no_end,
            $._expression,
          ))),
          ';',
          optional(field('condition', $._expression)),
          ';',
          optional(field('update', $._expression)),
          field('body', $.block),
        ),
        // For-in loop
        prec(10, seq(
          field('item', $.identifier),
          'in',
          field('collection', $._expression),
          field('body', $.block),
        )),
      ),
    ),

    while_loop: $ => seq(
      'while',
      field('condition', $._expression),
      field('body', $.block),
    ),

    return_statement: $ => seq(
      'return',
      optional(field('value', $._expression)),
      choice(';', '\n'),
    ),

    break_statement: $ => seq(
      'break',
      choice(';', '\n'),
    ),

    continue_statement: $ => seq(
      'continue',
      choice(';', '\n'),
    ),

    yield_statement: $ => seq(
      'yield',
      field('value', $._expression),
      choice(';', '\n'),
    ),

    defer_statement: $ => seq(
      'defer',
      field('statement', $._statement),
    ),

    assert_statement: $ => seq(
      'assert',
      field('condition', $._expression),
      optional(seq(
        ',',
        field('message', $._expression)
      )),
      choice(';', '\n'),
    ),


    // Expressions
    _expression: $ => choice(
      $._assignment_expression,
      $.is_expression,
    ),

    _binary_expression: $ => {
      return choice(
        $._cast_expression,
        $.binary_expression,
      );
    },

    binary_expression: $ => {
      const table = [
        ['or', 1], ['and', 2],
        ['==', 3], ['!=', 3], ['<', 3], ['<=', 3], ['>', 3], ['>=', 3], ['in', 3],
        ['+', 4], ['-', 4],
        ['*', 5], ['/', 5], ['%', 5],
        ['<<', 6], ['>>', 6],
        ['&', 7], ['^', 7], ['|', 7],
      ];
      return choice(
        ...table.map(([operator, precedence]) => {
          return prec.left(precedence, seq(
            field('left', $._binary_expression),
            field('operator', operator),
            field('right', $._cast_expression),
          ));
        })
      );
    },

    _assignment_expression: $ => choice(
      $._binary_expression,
      prec.right(1, seq(
        field('left', $._binary_expression),
        field('operator', choice('=', '+=', '-=', '*=', '/=', '<<=', '>>=')),
        field('right', $._assignment_expression),
      ))
    ),

    _cast_expression: $ => choice(
      $._prefix_expression,
      $.as_cast_expression,
    ),

    as_cast_expression: $ => prec.left(8, seq(
      field('value', $._prefix_expression),
      'as',
      field('target_type', $._type),
    )),

    _prefix_expression: $ => choice(
      $._postfix_expression,
      $.new_operation,
      prec.right(8, seq(
        field('operator', choice('!', '-', '*', '&', '++', '--', 'not')),
        field('argument', $._prefix_expression),
      )),
    ),

    new_operation: $ => prec(8, seq(
      '@new',
      field('operand', $._prefix_expression),
    )),

    _postfix_expression: $ => {
      const base = $._primary_expression;

      return choice(
        base,
        $.function_call,
        $.member_access,
        $.array_access,
        $.error_propagation,
        $.error_unwrap,
        $.pointer_test,
        $.try_member_access,
        prec.left(2, seq(
          field('argument', $._postfix_expression),
          field('operator', choice('++', '--', '?')),
        )),
      );
    },

    _primary_expression: $ => choice(
      $.identifier,
      $.literal,
      $.string_literal,
      $.multi_line_string_literal,
      $.char_literal,
      $.format_string,
      $.array_literal,
      $.vector_literal,
      $.map_literal,
      $.parenthesized_expression,
      // $.constructor_call,
      $.template_instantiation,
      $.scoped_identifier,
      $.match_expression,
      $.if_expression,
      $.multi_if_expression,
      $.closure_expression,
      $.block_expression,
      $.dot_shorthand,
    ),

    literal: $ => choice(
      $.number_literal,
      $.boolean_literal,
      $.null_literal,
    ),

    number_literal: $ => {
      const hex_literal = seq(
        choice('0x', '0X'),
        /[0-9a-fA-F_]+/
      )

      const octal_literal = seq(
        choice('0o', '0O'),
        /[0-7_]+/
      )

      const binary_literal = seq(
        choice('0b', '0B'),
        /[01_]+/
      )

      const decimal_literals = choice(
        /[0-9][0-9_]*/,
        /[0-9][0-9_]*\.[0-9_]+/,
        /\.[0-9_]+/
      )

      return token(seq(
        choice(
          hex_literal,
          octal_literal,
          binary_literal,
          decimal_literals,
        ),
        optional(choice(
          /[uif](8|16|32|64)?/,
          /[uif]/,
        )),
      ))
    },

    boolean_literal: $ => choice(
      'true',
      'false',
    ),

    null_literal: $ => 'null',

    string_literal: $ => choice(
      seq(
        '"',
        repeat(choice(
          /[^"\\]/,
          $.escape_sequence,
        )),
        '"',
      ),
      seq(
        'r"',
        /[^"]*/,
        '"',
      ),
    ),

    multi_line_string_literal: $ => seq(
      '"""',
      /[\s\S]*?/,
      '"""',
    ),

    escape_sequence: $ => choice(
      /\\['"\\nrt]/,
      /\\x[0-9a-fA-F]{2}/,
      /\\u\{[0-9a-fA-F]+\}/,
    ),

    char_literal: $ => seq(
      '\'',
      choice(
        /[^'\\]/,
        $.escape_sequence,
      ),
      '\'',
    ),

    format_string: $ => seq(
      '`',
      repeat(choice(
        /[^`\\{]/,
        $.escape_sequence,
        $.format_placeholder,
      )),
      '`',
    ),

    format_placeholder: $ => seq(
      '{',
      field('expression', $._expression),
      optional(field('format_spec', seq(':', /[^}]+/))),
      '}',
    ),

    array_literal: $ => seq(
      '[',
      optional(sep1(',', $._expression)),
      optional(','),
      ']',
    ),

    vector_literal: $ => seq(
      '$[',
      optional(sep1(',', $._expression)),
      optional(','),
      ']',
    ),

    map_literal: $ => seq(
      '${',
      optional(sep1(',', $.map_entry)),
      optional(','),
      '}',
    ),

    map_entry: $ => seq(
      field('key', $._expression),
      ':',
      field('value', $._expression),
    ),

    parenthesized_expression: $ => prec(0, seq(
      '(',
      field('expression', $._expression),
      ')',
    )),

    as_cast_expression: $ => seq(
      field('value', $._expression),
      'as',
      field('target_type', $._type),
    ),

    function_call: $ => prec(9, seq(
      field('function', $._prefix_expression),
      $.call_arguments,
    )),

    call_arguments: $ => prec(9, seq(
      '(',
      sep(',', choice(
        field('argument', $._expression),
        seq(
          field('name', $.identifier),
          ':',
          field('value', $._expression),
        ),
      )),
      optional(','),
      ')',
    )),

    member_access: $ => prec.left(15, seq(
      field('object', $._prefix_expression),
      '.',
      field('member', $.identifier),
    )),

    dot_shorthand: $ => seq(
      '.',
      field('member', $.identifier),
    ),

    array_access: $ => prec.left(1, seq(
      field('array', $._postfix_expression),
      '[',
      field('index', $._expression),
      ']',
    )),

    template_instantiation: $ => prec(5, seq(
      field('base', choice($.identifier, $.scoped_identifier)),
      '::',
      field('method', $.identifier),
      $.template_specialization,
    )),

    match_expression: $ => seq(
      'match',
      field('value', $._expression),
      field('body', $.match_body),
    ),

    if_expression: $ => prec.right(2, seq(
      'if',
      field('condition', $._expression),
      optional('then'),
      field('then_value', $._expression),
      'else',
      field('else_value', $._expression),
    )),

    multi_if_expression: $ => seq(
      'if',
      '{',
      sep1(choice(',', '\n'), $.multi_if_branch),
      'else',
      '=>',
      field('else_value', $._expression),
      '}',
    ),

    is_expression: $ => seq(
      field('value', $._expression),
      'is',
      field('pattern', choice(
        $.enum_variant_pattern,
        prec(10, seq($.enum_variant_pattern, '|', $.enum_variant_pattern)),
      )),
    ),

    closure_expression: $ => prec.left(0, seq(
      '|',
      optional(sep(',', $.closure_param)),
      '|',
      optional(seq(':', field('return_type', $._type))),
      '=>',
      field('body', $._expression),
    )),

    closure_param: $ => seq(
      field('name', $.identifier),
      optional(seq(':', field('type', $._type))),
    ),

    error_propagation: $ => seq(
      field('expression', $._expression),
      '!',
    ),

    error_unwrap: $ => seq(
      field('expression', $._expression),
      '!!',
    ),

    pointer_test: $ => seq(
      field('pointer', $._expression),
      '?',
    ),

    try_member_access: $ => seq(
      field('object', $._expression),
      '?.',
      field('member', $.identifier),
    ),

    block_expression: $ => seq(
      '{',
      repeat($._statement),
      optional(seq('yield', $._expression)),
      '}',
    ),
  }
});
