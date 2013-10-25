from django import forms
import django_form_architect.settings
from django.utils.html import format_html, format_html_join
from django.utils.encoding import force_text


class WidgetFieldFactory(object):
    
    @staticmethod
    def from_widget(widget_model):
        field_settings = django_form_architect.settings.BUILTIN_WIDGETS[widget_model.class_name] 
        field_klass = field_settings.field_klass                
        widget_field = field_klass(widget_model=widget_model, widget_settings=field_settings)
        
        return widget_field

class WidgetField(object):
    
    template_path = None
    
    def __init__(self, *args, **kwargs):
        widget_model = kwargs.pop('widget_model', None)
        field_settings = kwargs.pop('widget_settings')
        
        kwargs['label'] = widget_model.label
        kwargs['help_text'] = widget_model.help_text

        if field_settings: #error if not?
            self.template_path = field_settings.field_template_path
            
        super(WidgetField, self).__init__(*args, **kwargs)

    """
    def widget_attrs(self, widget):        
        attrs = super(WidgetField, self).widget_attrs(widget)
        css_class = attrs.get('class', '')
        css_class += ' error'
        attrs['class'] = css_class
        
        return attrs        
    """
    
class TextBoxWidget(WidgetField, forms.fields.CharField):
    
    def __init__(self, *args, **kwargs):
        super(TextBoxWidget, self).__init__(*args, **kwargs)
        
class CheckBoxWidget(WidgetField, forms.fields.TextInput):
    pass

class RadioButtonWidget(WidgetField, forms.fields.ChoiceField):
    def __init__(self, *args, **kwargs):
        widget_model = kwargs.get('widget_model', None)
        
        choices = ((o.id, o.text) for o in widget_model.options.all())
        kwargs['choices'] = choices
        kwargs['widget'] = forms.RadioSelect(renderer=RadioFieldRenderer)
        
        super(RadioButtonWidget, self).__init__(*args, **kwargs)    

class RadioFieldRenderer(forms.widgets.RadioFieldRenderer):
    def __iter__(self):
        for i, choice in enumerate(self.choices):
            yield RadioInput(self.name, self.value, self.attrs.copy(), choice, i)

    def __getitem__(self, idx):
        choice = self.choices[idx] # Let the IndexError propogate
        return RadioInput(self.name, self.value, self.attrs.copy(), choice, idx)
    
    def render(self):
        return format_html(format_html_join('\n', '<span>{0}</span>', [(force_text(w),) for w in self]))

class RadioInput(forms.widgets.RadioInput):    
    def render(self, name=None, value=None, attrs=None, choices=()):
        name = name or self.name
        value = value or self.value
        attrs = attrs or self.attrs
        if 'id' in self.attrs:
            label_for = format_html(' for="{0}_{1}"', self.attrs['id'], self.index)
        else:
            label_for = ''
        choice_label = force_text(self.choice_label)
        return format_html('{1}<label{0}>{2}</label>', label_for, self.tag(), choice_label)

class DropDownWidget(WidgetField, forms.fields.ChoiceField):
    def __init__(self, *args, **kwargs):
        widget_model = kwargs.get('widget_model', None)
        
        choices = ((o.id if o.text != '' else '', o.text) for o in widget_model.options.all())
        kwargs['choices'] = choices
        kwargs['widget'] = forms.Select()
        
        super(DropDownWidget, self).__init__(*args, **kwargs)

class TextAreaWidget(WidgetField, forms.fields.TextInput):
    pass

class SectionBreakWidget(WidgetField, forms.fields.TextInput):
    pass

class SelectionTableWidget(WidgetField, forms.fields.TextInput):
    pass

class PhoneNumberWidget(WidgetField, forms.fields.TextInput):
    pass