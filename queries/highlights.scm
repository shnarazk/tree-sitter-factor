(keyword) @keyword
(comment) @comment

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
  "--" @constant
  output_stack:(effect) @variable.special)

[ (number) (string) (bool) ] @constant

[ "(" ")" "[" "]" "{" "}" "V{" ] @punctuation.bracket
