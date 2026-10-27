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
        seq(
          /M::?/,
          field('type',$.sname),
          field('id',$.sname),
          optional($.stack_effect),
          optional($._exprs),
          $.block_end
        ),
    ),

    stack_effect: $ => seq(
      token('('),
      field('input_stack', optional($.effect)),
      $.effect_delimiter,
      field('output_stack', optional($.effect)),
      token(')')),

    // effect: $ => repeat1(seq($.parameter,optional(seq(token(':'),$.stack_effect)))),
    effect: $ => repeat1(
      choice($.parameter, $.quotation_parameter)
    ),

    effect_delimiter: $ => token('--'),

    quotation_parameter: $ => seq($.quotation_name, $.stack_effect),

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
      $.block_c,
      $.block_p,
      $.quotation,
      $.quotation_f,
      $.quotation_l,
      $.quotation_let,
    ),

    quotation: $ => seq(field('open_bracket',token('[')), optional($._exprs), token(']')),
    quotation_f: $ => seq(field('open_bracket',token('\'[')), optional($._exprs), token(']')),
    quotation_l: $ => seq(field('open_bracket',token('[|')), optional($.effect), field('quotation_delimiter',token('|')), optional($._exprs), token(']')),
    quotation_let: $ => seq(field('open_bracket',token('[let')), repeat(seq($.expr, field('quotation_delimiter',token(':>')), $.parameter)), optional($._exprs), token(']')),
    block_c: $ => seq($.block_c_begin, optional($._exprs), token('}')),
    block_p: $ => seq($.block_p_begin, optional($._exprs), token(')')),

    block_c_begin: $ => choice(
      token('\'HS{'),
      token('\'H{'),
      token('\'{'),
      token('B{'),
      token('BV{'),
      token('CS{'),
      token('C{'),
      token('HS{'),
      token('H{'),
      token('IH{'),
      token('T{'),
      token('V{'),
      token('W{'),
      token('intersection{'),
      token('maybe{'),
      token('not{'),
      token('predicate{'),
      token('union{'),
      token('{'),
    ),

    block_p_begin: $ => choice(
      token('call('),
      token('execute('),
    ),

    data: $ => choice(
        $.string,
        $.character,
        $.bool,
        $.number,
    ),

    string: $ => // choice(
        // /"""\s(?:.|\n)*?\s"""/,
        // /"(?:\\\\|\\"|[^"])*"/,
        /"(\\\\|\\"|[^"])*"/,
        // /(\S+")(\s+)((?:\\\\|\\"|[^"])*")/,
    // ),

    character: $ => seq(
        token('CHAR:'),
        /(\\[\\abfnrstv]|[^\\]\S*)/
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

    sname: $ => /[^";\s]\S*/,

    parameter: $ => /[^"(;:\s]+/,

    quotation_name: $ => /[^"(;:\s]+:/,

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
