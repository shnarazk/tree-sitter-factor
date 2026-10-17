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
        $.import_defn,
        $.tuple_or_class_defn,
        $.other_syntax_defn,
        $.vocab_private,
        // $.expr
    ),

    word_defn: $ => prec(1,choice(
        seq(/::?/,$.sname,$.stack_effect,optional($._exprs),$.block_end, optional($.keyword)),
        seq(/MACRO::?/,$.sname,$.stack_effect,optional($._exprs),';'),
        seq(/MEMO::?/,$.sname,$.stack_effect,optional($._exprs),';'),
        seq(/TYPED::?/,$.sname,$.stack_effect,optional($._exprs),';'),
        seq(/M::?/,$.sname,$.sname,optional($._exprs),';'),
        seq('GENERIC:',$.sname,$.stack_effect),
        seq('GENERIC#:',$.sname,/\d+/,$.stack_effect),
        seq('GENERIC#:',$.sname,/\d+/,$.stack_effect),
        seq('HOOK:',$.sname,$.sname,$.stack_effect)
    )),

    stack_effect: $ => seq('(',optional($.effect),'--',optional($.effect),')'),

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
        seq(/TUPLE:|ERROR:/,$.sname,optional('<'),repeat($.sname),$.block_end),
        seq(/TUPLE:|ERROR:|BUILTIN:/,$.namel,$.block_end),
        seq(/MIXIN:|UNION:|INTERSECTION:/,$.sname),
        seq('PREDICATE:',$.sname,'<',$.sname),
        seq('C:',$.sname,$.sname),
        seq('INSTANCE:',$.sname,$.sname),
        seq('SLOT:',$.sname),
        seq('SINGLETON:',$.sname),
        seq('SINGLETONS:',$.namel,$.block_end)
    ),

    other_syntax_defn: $ => choice(
        seq('CONSTANT:',$.sname,$.sname),
        seq('SYMBOL:',$.sname),
        seq('MAIN:',$.sname,$.sname),
        seq('HELP:',$.sname,$.words,';'),
        seq('SYMBOLS:',$.sname,$.namel,';'),
        seq('SYNTAX:',$.sname,$.words,';'),
        seq('ALIEN:',$.sname),
        seq('STRUCT:',$.sname,$.words,';'),
        seq('FUNCTION:',$.sname,$.sname,'(',$.words,')'),
        seq('FUNCTION-ALIAS:',$.sname,$.sname,$.sname,'(',$.words,')'),
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

    block_b: $ => seq("[", optional($._exprs), "]"),
    block_c: $ => seq("{", optional($._exprs), "}"),
    block_p: $ => seq("(", optional($._exprs), ")"),
    block_v: $ => seq("V{", optional($._exprs), "}"),
    block_h: $ => seq(/HI?\{/, optional($._exprs), "}"),

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

    symbol: $ => choice(
        /[\\$]\s+\S+/,
        /M\\\s+\S+\s+\S+/,
    ),

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

    sname: $ => /[^";](\S)*/,

    namel: $ => repeat1(seq($.sname)),

    word: $ => /\S+/,

    words: $ => repeat1(seq($.word)),

    comment: $ => choice(
        /!\s+.*\n/,
        /#!\s+.*\n/,
        /\/\*\s+(?:.|\n)*?\s\*\//
    )
  }
});
