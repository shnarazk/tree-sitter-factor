module.exports = grammar({
  name: 'factor',

  extras: $ => [/\s/, $.comment],

  rules: {
    source_file: $ => seq(
        optional($.shebang),
        optional(repeat($._definition))
    ),

    shebang: $ => /#!.*\n/,

    _definition: $ => choice(
        $.word_defn,
        $.method_defn,
        $.import_defn,
        $.tuple_or_class_defn,
        $.other_syntax_defn,
        $.vocab_private,
        $.expr
    ),

    word_defn: $ => choice(
        seq(/::?/,field('id', $.sname),$.stack_effect,optional($._exprs),$.block_end, optional($.keyword)),
        seq(/MACRO::?/,field('id',$.sname),$.stack_effect,optional($._exprs),$.block_end),
        seq(/MEMO::?/,field('id',$.sname),$.stack_effect,optional($._exprs),$.block_end),
        seq(/TYPED::?/,field('id',$.sname),$.stack_effect,optional($._exprs),$.block_end),
        seq('GENERIC:',field('id',$.sname),$.stack_effect),
        seq('GENERIC#:',field('id',$.sname),/\d+/,$.stack_effect),
        seq('GENERIC#:',field('id',$.sname),/\d+/,$.stack_effect),
        seq('HOOK:',field('id',$.sname),$.sname,$.stack_effect)
    ),

    method_defn: $ => choice(
        seq(/M::?/,field('type',$.sname),field('id',$.sname),optional($._exprs),$.block_end),
    ),

    stack_effect: $ => seq(
      token('('),
      field('input_stack', optional($.effect)),
      field('stack_delimiter', token('--')),
      field('output_stack', optional($.effect)),
      token(')')),

    effect: $ => repeat1(seq($.sname,optional(seq(':',$.stack_effect)))),

    import_defn: $ => choice(
        seq('USING:',$.namel,';'),
        seq(/USE:|UNUSE:|IN:|QUALIFIED:/,$.sname),
        seq('QUALIFIED-WITH:',$.sname,$.sname),
        seq(/FROM:|EXCLUDE:/,$.sname,'=>',$.namel,';'),
        seq('RENAME:',$.sname,$.sname,'=>',$.sname),
        seq(/ALIAS:|TYPEDEF:/,$.sname,$.sname),
        seq(/DEFER:|FORGET:|POSTPONE:/,$.sname)
    ),

    tuple_or_class_defn: $ => choice(
        seq(/TUPLE:|ERROR:/,field('id',$.sname),optional('<'),repeat($.sname),$.block_end),
        seq(/TUPLE:|ERROR:|BUILTIN:/,field('id',$.namel),$.block_end),
        seq(/MIXIN:|UNION:|INTERSECTION:/,field('id',$.sname)),
        seq('PREDICATE:',field('id',$.sname),'<',$.sname),
        seq('C:',field('id',$.sname),$.sname),
        seq('INSTANCE:',field('id',$.sname),$.sname),
        seq('SLOT:',field('id',$.sname)),
        seq('SINGLETON:',field('id',$.sname)),
        seq('SINGLETONS:',field('id',$.namel),$.block_end)
    ),

    other_syntax_defn: $ => choice(
        seq('CONSTANT:',field('id',$.sname),$.sname),
        seq('SYMBOL:',field('id',$.sname)),
        seq('MAIN:',field('id',$.sname)),
        seq('HELP:',field('id',$.sname),$.words,$.block_end),
        seq('SYMBOLS:',field('id',$.sname),$.namel,$.block_end),
        seq('SYNTAX:',field('id',$.sname),$.words,$.block_end),
        seq('ALIEN:',field('id',$.sname)),
        seq('STRUCT:',field('id',$.sname),$.words,$.block_end),
        seq('FUNCTION:',field('id',$.sname),$.sname,'(',$.words,')'),
        seq('FUNCTION-ALIAS:',field('id',$.sname),$.sname,$.sname,'(',$.words,')'),
    ),

    vocab_private: $ => /<PRIVATE|PRIVATE>/,

    _exprs: $ => repeat1($.expr),

    expr: $ => choice(
      $.sname,
      $.data,
      $.block_b,
      $.block_c,
      $.block_p,
      $.block_v,
      $.block_h,
    ),

    block_b: $ => seq(token('['), optional($._exprs), token(']')),
    // block_b: $ => seq($.open_bracket, optional($._exprs), $.close_bracket),
    block_c: $ => seq(token('{'), optional($._exprs), token('}')),
    block_p: $ => seq(token('('), optional($._exprs), token(')')),
    block_v: $ => seq(token('V{'), optional($._exprs), token('}')),
    block_h: $ => choice(
      seq(token('H{'), optional($._exprs), token('}')),
      seq(token('HI{'), optional($._exprs), token('}'))),

    // open_bracket: $ => token('['),
    // close_bracket: $ => token(']'),

    data: $ => choice(
        $.string,
        $.bool,
        // $.symbol,
        $.number,
        // $.keyword
    ),

    string: $ => choice(
        // /"""\s(?:.|\n)*?\s"""/,
        // /"(?:\\\\|\\"|[^"])*"/,
        /"(\\\\|\\"|[^"])*"/,
        // /(\S+")(\s+)((?:\\\\|\\"|[^"])*")/,
        /(CHAR:)(\s+)(\\[\\abfnrstv]|[^\\]\S*)/
    ),

    bool: $ => /[tf]/,

    // symbol: $ => choice(
    //     /[\\$]\s+\S+/,
    //     /M\\\s+\S+\s+\S+/,
    // ),

    number: $ => choice(
        /[+-]?(?:[\d,]*\d)?\.(?:\d([\d,]*\d)?)?(?:[eE][+-]?\d+)?/,
        /[+-]?\d(?:[\d,]*\d)?(?:[eE][+-]?\d+)?/,
        /0x[a-fA-F\d](?:[a-fA-F\d,]*[a-fA-F\d])?(?:p\d([\d,]*\d)?)?/,
        /NAN:\s+[a-fA-F\d](?:[a-fA-F\d,]*[a-fA-F\d])?(?:p\d([\d,]*\d)?)?/,
        /0b[01]+/,
        /0o[0-7]+/,
        /(?:\d([\d,]*\d)?)?\+\d(?:[\d,]*\d)?\/\d(?:[\d,]*\d)?/,
        /(?:\-\d([\d,]*\d)?)?\-\d(?:[\d,]*\d)?\/\d(?:[\d,]*\d)?/,
    ),

    block_end: $ => ';',

    keyword: $ => /(?:deprecated|final|foldable|flushable|inline|recursive)/,

    sname: $ => /[^";\s](\S)*/,

    namel: $ => repeat1(seq($.sname)),

    word: $ => /\S+/,

    words: $ => repeat1(seq($.word)),

    comment: $ => choice(
        /!\n/,
        /![ \t].*\n/,
        /\/\*\s+(?:.|\n)*?\s\*\//
    )
  }
});
