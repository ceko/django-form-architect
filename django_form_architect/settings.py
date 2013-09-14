from django_form_architect import WidgetDescriptor
from django.conf import settings
from os.path import join
import models


DEFAULT_JS_FOLDER = join(settings.STATIC_URL, 'django_form_architect/js/')
DEFAULT_BUILDER_TEMPLATE_FOLDER = 'django_form_architect/widgets/builder/'

BUILTIN_WIDGETS = {
    'CheckBoxWidget': WidgetDescriptor(
        name='Checkbox Group', 
        builder_js=DEFAULT_JS_FOLDER + 'widgets/checkbox.js',
        builder_template_path=DEFAULT_BUILDER_TEMPLATE_FOLDER + 'checkbox.html',
        js_klass='dfb.widgets.CheckBox', 
        model_klass=models.CheckBoxWidget
    ),
    'RadioButtonWidget': WidgetDescriptor(
        name='Radio Button Group', 
        builder_js=DEFAULT_JS_FOLDER + 'widgets/radiobutton.js',
        builder_template_path=DEFAULT_BUILDER_TEMPLATE_FOLDER + 'radiobutton.html',
        js_klass='dfb.widgets.RadioButton', 
        model_klass=models.RadioButtonWidget
    ),                    
    'DropDownWidget': WidgetDescriptor(
        name='Dropdown', 
        builder_js=DEFAULT_JS_FOLDER + 'widgets/dropdown.js',
        builder_template_path=DEFAULT_BUILDER_TEMPLATE_FOLDER + 'dropdown.html',
        js_klass='dfb.widgets.DropDown', 
        model_klass=models.DropDownWidget
    ),
    'TextBoxWidget': WidgetDescriptor(
        name='Textbox', 
        builder_js=DEFAULT_JS_FOLDER + 'widgets/textbox.js',
        builder_template_path=DEFAULT_BUILDER_TEMPLATE_FOLDER + 'textbox.html',
        js_klass='dfb.widgets.TextBox', 
        model_klass=models.TextBoxWidget
    ),
    'TextAreaWidget': WidgetDescriptor(
        name='Textarea', 
        builder_js=DEFAULT_JS_FOLDER + 'widgets/textarea.js',
        builder_template_path=DEFAULT_BUILDER_TEMPLATE_FOLDER + 'textarea.html',
        js_klass='dfb.widgets.TextArea', 
        model_klass=models.TextAreaWidget
    ),
    'SectionBreakWidget': WidgetDescriptor(
        name='Section Break', 
        builder_js=DEFAULT_JS_FOLDER + 'widgets/sectionbreak.js',
        builder_template_path=DEFAULT_BUILDER_TEMPLATE_FOLDER + 'sectionbreak.html',
        js_klass='dfb.widgets.SectionBreak', 
        model_klass=models.SectionBreakWidget
    ),
    'SelectionTableWidget': WidgetDescriptor(
        name='Selection Table', 
        builder_js=DEFAULT_JS_FOLDER + 'widgets/selectiontable.js',
        builder_template_path=DEFAULT_BUILDER_TEMPLATE_FOLDER + 'selectiontable.html',
        js_klass='dfb.widgets.SelectionTable', 
        model_klass=models.SelectionTableWidget
    ),
    'PhoneNumberWidget': WidgetDescriptor(
        name='Phone Number', 
        builder_js=DEFAULT_JS_FOLDER + 'widgets/phonenumber.js',
        builder_template_path=DEFAULT_BUILDER_TEMPLATE_FOLDER + 'phonenumber.html',
        js_klass='dfb.widgets.PhoneNumber', 
        model_klass=models.PhoneNumberWidget
    ),
}