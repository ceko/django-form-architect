from django.db import models
from polymorphic import PolymorphicModel
import json


def add_options(model, option_list, group='options'):
    cnt = 0
    for option in option_list:
        new_option = WidgetOption();
        new_option.text = option.get('text', None)
        new_option.selected = bool(option.get('selected', False))
        new_option.sequence = cnt
        new_option.selection_group = group
        
        cnt += 1
        model.options.add(new_option)   

class Form(models.Model):    
    pid = models.AutoField(primary_key=True)
    slug = models.SlugField(help_text='This is the url endpoint')
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    description = models.TextField()
    is_active = models.BooleanField(default=True, help_text='The endpoint will work only if this is true.')
    
    def json_serialize(self):
        return json.dumps({
            'pid' : self.pid,
            'slug' : self.slug,
            'name' : self.name,
            'title' : self.title,
            'description' : self.description,
            'is_active' : self.is_active
        })
    
    def __str__(self):
        return self.__unicode__()
    
    def __unicode__(self):
        return "endpoint:  {0} active: {1}".format(self.slug, self.is_active)
 
class Page(models.Model):
     pid = models.AutoField(primary_key=True)
     name = models.CharField(max_length=50)
     sequence = models.IntegerField(default=0)
     form= models.ForeignKey(Form)
     
     def active_widgets(self):
         return self.widget_set.filter(is_active=True)
     
     def json_serialize(self):
         return json.dumps({
            'pid': self.pid,
            'name': self.name,
            'sequence': self.sequence
         })
     
     class Meta:    
        ordering = ('sequence',)     
         
class Widget(PolymorphicModel):
    pid = models.AutoField(primary_key=True)
    form = models.ForeignKey(Form)
    label = models.CharField(max_length=100, null=True)
    help_text = models.CharField(max_length=100, null=True)
    required = models.BooleanField()
    sequence = models.IntegerField(default=0)
    page = models.ForeignKey(Page, null=True, default=None)
    is_active = models.BooleanField(default=True)
    
    def to_dict(self):
        return {
            'pid': self.pid,
            'label': self.label,
            'help_text': self.help_text,
            'required': self.required,
            'sequence': self.sequence
        }
    
    def from_dict(self, dict):
        if dict.get('pid', None):
            self.pid = dict['pid']
        self.label = dict.get('label', None)
        self.help_text = dict.get('help_text', None)
        self.required = bool(dict.get('required', False))
        self.sequence = dict.get('sequence', 0)        

    class Meta:    
        ordering = ('sequence',)
        

class WidgetOption(models.Model):
    SELECTION_GROUPS = (
        ('options', 'options'),
        ('rows', 'rows'),
        ('columns', 'columns'),
    )
    
    text = models.CharField(max_length=50)
    selected = models.BooleanField()
    widget = models.ForeignKey(Widget)
    sequence = models.IntegerField(default=0)
    selection_group = models.CharField(max_length=10, choices=SELECTION_GROUPS, default='options')
            
    def json_serialize(self):
        return {
            'text': self.text,
            'selected': self.selected,
            'sequence': self.sequence,
            'selection_group': self.selection_group,            
        }        
    
    class Meta:    
        ordering = ('sequence',)
            
class TextBoxWidget(Widget):
    SIZES = (
        ('s', 'small'),
        ('m', 'medium'),
        ('l', 'large'),
    )
    
    default = models.CharField(max_length=100, null=True)
    size = models.CharField(max_length=1, choices=SIZES)
    
    def short_type(self):
        return 'TextBox'
    
    def default_template(self):
        return 'textbox-field-template'
    
    def from_dict(self, dict, *args, **kwargs):        
        super(TextBoxWidget, self).from_dict(dict)
        self.default = dict.get('default', None)
        self.size = dict.get('size', None)
                
    def json_serialize(self):        
        dict = super(TextBoxWidget, self).to_dict()
        dict.update({
            'default': self.default,
            'size': self.size
        })
        
        return json.dumps(dict) 
    
class TextAreaWidget(Widget):
    SIZES = (
        ('s', 'small'),
        ('m', 'medium'),
        ('l', 'large'),
    )
    
    CONTENT_TYPES = (
        ('text', 'text'),
        ('richtext', 'rich text'),        
    )
    
    default = models.TextField(null=True)
    size = models.CharField(max_length=1, choices=SIZES)
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPES)
    
    def short_type(self):
        return 'TextArea'
    
    def default_template(self):
        return 'textarea-field-template'
    
    def from_dict(self, dict, *args, **kwargs):
        super(TextAreaWidget, self).from_dict(dict)
        self.default = dict.get('default', None)
        self.size = dict.get('size', None)
        self.content_type = dict.get('content_type', None)        
        
    def json_serialize(self):        
        dict = super(TextAreaWidget, self).to_dict()
        dict.update({
            'default': self.default,
            'size': self.size,
            'content_Type': self.content_type
        })
        
        return json.dumps(dict) 

class CheckBoxWidget(Widget):
    @property
    def options(self):
        return self.widgetoption_set
    
    def short_type(self):
        return 'CheckBox'
    
    def default_template(self):
        return 'checkbox-field-template'
    
    def from_dict(self, dict, *args, **kwargs):
        super(CheckBoxWidget, self).from_dict(dict)
        
        if self.pid:
            self.options.all().delete()
        else:
            form = kwargs['form']        
            form.widget_set.add(self)
        
        add_options(self, dict.get('options', []))        
        
    def json_serialize(self):        
        dict = super(CheckBoxWidget, self).to_dict()        
        option_dicts = []
        for option in self.options.all():
            option_dicts.append(option.json_serialize())
            
        dict.update({
            'options': option_dicts,            
        })
        
        return json.dumps(dict) 

class DropDownWidget(Widget):
    SIZES = (
        ('s', 'small'),
        ('m', 'medium'),
        ('l', 'large'),
    )
    
    size = models.CharField(max_length=1, choices=SIZES, default='m')
    
    @property
    def options(self):
        return self.widgetoption_set
    
    def short_type(self):
        return 'DropDown'
    
    def default_template(self):
        return 'dropdown-field-template'
    
    def from_dict(self, dict, *args, **kwargs):
        super(DropDownWidget, self).from_dict(dict)
        self.size = dict.get('size', 'm')
        
        if self.pid:
            self.options.all().delete()
        else:
            form = kwargs['form']        
            form.widget_set.add(self)
        
        add_options(self, dict.get('options', []))                  
        
    def json_serialize(self):        
        dict = super(DropDownWidget, self).to_dict()        
        option_dicts = []
        for option in self.options.all():
            option_dicts.append(option.json_serialize())
            
        dict.update({
            'options': option_dicts,   
            'size': self.size,         
        })
        
        return json.dumps(dict)     

class SelectionTableWidget(Widget):
    
    @property
    def options(self):
        return self.widgetoption_set
    
    @property
    def rows(self):
        return self.options.filter(selection_group='rows')
    
    @property
    def columns(self):
        return self.options.filter(selection_group='options')
    
    def short_type(self):
        return 'SelectionTable'
    
    def default_template(self):
        return 'selection-table-field-template'
    
    def from_dict(self, dict, *args, **kwargs):
        super(SelectionTableWidget, self).from_dict(dict)
                
        if self.pid:
            self.options.all().delete()
        else:
            form = kwargs['form']        
            form.widget_set.add(self)
        
        add_options(self, dict.get('rows', []), group='rows')
        add_options(self, dict.get('options', []), group='options')                  
        
    def json_serialize(self):        
        dict = super(SelectionTableWidget, self).to_dict()        
        row_dicts = []
        for row in self.rows.all():
            row_dicts.append(row.json_serialize())
            
        column_dicts = []
        for column in self.columns.all():
            column_dicts.append(column.json_serialize())
            
        dict.update({
            'rows': row_dicts,
            'options': column_dicts,
        })
        
        return json.dumps(dict) 

class SectionBreakWidget(Widget):
    def short_type(self):
        return 'SectionBreak'
    
    def default_template(self):
        return 'section-break-field-template'
    
    def from_dict(self, dict, *args, **kwargs):        
        super(SectionBreakWidget, self).from_dict(dict)
                        
    def json_serialize(self):        
        dict = super(SectionBreakWidget, self).to_dict()
        return json.dumps(dict) 
    
class RadioButtonWidget(Widget):
    @property
    def options(self):
        return self.widgetoption_set
    
    def short_type(self):
        return 'RadioButton'
    
    def default_template(self):
        return 'radiobutton-field-template'
    
    def from_dict(self, dict, *args, **kwargs):
        super(RadioButtonWidget, self).from_dict(dict)
        
        if self.pid:
            self.options.all().delete()
        else:
            form = kwargs['form']        
            form.widget_set.add(self)
        
        add_options(self, dict.get('options', []))        
        
    def json_serialize(self):        
        dict = super(RadioButtonWidget, self).to_dict()        
        option_dicts = []
        for option in self.options.all():
            option_dicts.append(option.json_serialize())
            
        dict.update({
            'options': option_dicts,            
        })
        
        return json.dumps(dict) 
    