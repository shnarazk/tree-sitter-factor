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
        seq(field('define_label_word',choice(':', '::')),field('id', $.sname),$.stack_effect,optional($._exprs),$.block_end, optional($.keyword)),
        seq(field('define_label_word',choice('MACRO:', 'MACRO::')),field('id',$.sname),$.stack_effect,optional($._exprs),$.block_end),
        seq(field('define_label_word',choice('MEMO:', 'MEMO::')),field('id',$.sname),$.stack_effect,optional($._exprs),$.block_end),
        seq(field('define_label_word',choice('TYPED:','TYPED::')),field('id',$.sname),$.stack_effect,optional($._exprs),$.block_end),
        seq(field('define_label_word','GENERIC:'),field('id',$.sname),$.stack_effect),
        seq(field('define_label_word','GENERIC#:'),field('id',$.sname),/\d+/,$.stack_effect),
        seq(field('define_label_word','HOOK:'),field('id',$.sname),$.sname,$.stack_effect)
    ),

    method_defn: $ => seq(
        field('define_label_method',choice('M:', 'M::')),
        field('type',$.sname),
        field('id',$.sname),
        optional($.stack_effect),
        optional($._exprs),
        $.block_end
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
        seq(field('define_label_package','USING:'),$.namel,';'),
        seq(field('define_label_package',choice('USE:','UNUSE:','IN:','QUALIFIED:')),$.sname),
        seq(field('define_label_package','QUALIFIED-WITH:'),$.sname,$.sname),
        seq(field('define_label_package',choice('FROM:','EXCLUDE:')),$.sname,'=>',$.namel,';'),
        seq(field('define_label_package','RENAME:'),$.sname,$.sname,'=>',$.sname),
        seq(field('define_label_package',choice('ALIAS:','TYPEDEF:')),$.sname,$.sname),
        seq(field('define_label_package',choice('DEFER:','FORGET:','POSTPONE:')),$.sname)
    ),

    tuple_or_class_defn: $ => choice(
        seq(field('define_label_ext',choice('TUPLE:','ERROR:')),field('id',$.sname),optional('<'),repeat($.sname),$.block_end),
        seq(field('define_label_ext','BUILTIN:'),field('id',$.namel),$.block_end),
        seq(field('define_label_ext',choice('MIXIN:','UNION:','INTERSECTION:')),field('id',$.sname)),
        seq(field('define_label_ext','PREDICATE:'),field('id',$.sname),'<',$.sname),
        seq(field('define_label_ext','C:'),field('id',$.sname),$.sname),
        seq(field('define_label_ext','INSTANCE:'),field('id',$.sname),$.sname),
        seq(field('define_label_ext','SLOT:'),field('id',$.sname)),
        seq(field('define_label_ext','SINGLETON:'),field('id',$.sname)),
        seq(field('define_label_ext','SINGLETONS:'),field('id',$.namel),$.block_end)
    ),

    other_syntax_defn: $ => choice(
        seq(field('define_label_other','CONSTANT:'),field('id',$.sname),$.sname),
        seq(field('define_label_other','SYMBOL:'),field('id',$.sname)),
        seq(field('define_label_other','MAIN:'),field('id',$.sname)),
        seq(field('define_label_other','HELP:'),field('id',$.sname),$.words,$.block_end),
        seq(field('define_label_other','SYMBOLS:'),field('id',$.sname),$.namel,$.block_end),
        seq(field('define_label_other','SYNTAX:'),field('id',$.sname),$.words,$.block_end),
        seq(field('define_label_other','ALIEN:'),field('id',$.sname)),
        seq(field('define_label_other','STRUCT:'),field('id',$.sname),$.words,$.block_end),
        seq(field('define_label_other','FUNCTION:'),field('id',$.sname),$.sname,'(',$.words,')'),
        seq(field('define_label_other','FUNCTION-ALIAS:'),field('id',$.sname),$.sname,$.sname,'(',$.words,')'),
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
        /![ \t][^\n]*\n/,
        /\/\* ([^*]|\*[^/])*\*+\//     // Is this good one?
        // /\/\*\s+(?:.|\n)*?\s\*\//
    )
  }
});
