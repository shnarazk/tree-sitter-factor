(keyword) @keyword
(number) @number
(string) @string
(bool) @bool
(comment) @comment
(word_defn
   .
  (sname) @function.method)

(stack_effect
  (effect
    (sname) @variable.parameter))

(tuple_or_class_defn
  (sname) @label)
