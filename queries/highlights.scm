(bool) @boolean
(comment) @comment
(character) @variant
(keyword) @keyword
(number) @number
(string) @string

(word_defn
   id:(sname) @function)

(method_defn
  type:(sname) @type)

(method_defn
  id:(sname) @function.method)

(tuple_or_class_defn
  id:(sname) @type)

(other_syntax_defn
  id:(sname) @type)

(stack_effect
  (effect) @variable.parameter)

; (stack_effect (effect_delimiter) @punctuation.delimiter)

(stack_effect
  (effect_delimiter) @operator)

[ quotation_delimiter: "|"
  quotation_delimiter: ":>"
] @operator

(quotation_l
  (effect) @variable.parameter)

[ "[" "'[" "[|" "[let"
  (block_c_begin) (block_p_begin)
  ")"  "]" "}"
] @punctuation.bracket

(vocab_private) @attribute

(method_defn         define_label_method:  _ @tag)
(word_defn           define_label_word:    _ @tag)
(import_defn         define_label_package: _ @attribute)
(tuple_or_class_defn define_label_ext:     _ @tag)
(other_syntax_defn   define_label_other:   _ @attribute)
