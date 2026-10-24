(bool) @boolean
(comment) @comment
(character) @variant
(keyword) @keyword
(number) @number

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
  input_stack:(effect) @variable.parameter
  (effect_delimiter) @constant
  output_stack:(effect) @variable.special)

[ (number) (string) (bool) ] @constant

[ "(" ")" "[" "]" "{" "}" "V{" "H{" "HS{" ] @punctuation.bracket
