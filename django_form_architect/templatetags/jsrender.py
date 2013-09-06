"""
jQuery templates use constructs like:
 
    {{if condition}} print something{{/if}}
 
This, of course, completely screws up Django templates,
because Django thinks {{ and }} mean something.
 
Wrap {% verbatim %} and {% endverbatim %} around those
blocks of jQuery templates and this will try its best
to output the contents with no changes.
"""
 
from django import template
 
register = template.Library()
 
 
class VerbatimNode(template.Node):
 
    def __init__(self, text):
        self.text = text
    
    def render(self, context):
        return self.text
 
@register.tag
def verbatim(parser, token):
    text = []
    while 1:
        token = parser.tokens.pop(0)
        if token.contents == 'endverbatim' or token.contents == 'endjsrender':
            break
        if token.token_type == template.TOKEN_VAR:
            text.append('{{')
        elif token.token_type == template.TOKEN_BLOCK:
            text.append('{%')
        text.append(token.contents)
        if token.token_type == template.TOKEN_VAR:
            text.append('}}')
        elif token.token_type == template.TOKEN_BLOCK:
            text.append('%}')
    return VerbatimNode(''.join(text))

@register.tag
def jsrender(parser, token):
    script_id = token.split_contents()[-1]
    script_template = "<script type='text/jsrender' id='{0}'>{1}</script>"
    verbatim_node = verbatim(parser, token)
    verbatim_node.text = script_template.format(script_id, verbatim_node.text) 
    return verbatim_node