(bool) @boolean
(comment) @comment
(character) @variant
(keyword) @keyword
(number) @number
(string) @string

[ (import_defn) "USING:" (vocab_private) ] @property

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

(stack_effect
  (effect_delimiter) @constant)

(block_l
  (effect) @variable.parameter)

[ "(" ")" "[" "]" "{" "}" "V{" "H{" "HS{" ] @punctuation.bracket
