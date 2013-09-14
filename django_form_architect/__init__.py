 

class WidgetDescriptor(object):
    
    @property
    def name(self):
        return self._name
    
    @name.setter
    def name(self, value):
        self._name = value
    
    #full path to the javascript file used to build this widget
    @property
    def builder_js(self):
        return self._builder_js
    
    @builder_js.setter
    def builder_js(self, value):
        self._builder_js = value
        
    @property
    def builder_template_path(self):
        return self._builder_template_path
    
    @builder_template_path.setter
    def builder_template_path(self, value):
        self._builder_template_path = value
        
    @property
    def model_klass(self):
        return self._model_klass
    
    @model_klass.setter
    def model_klass(self, value):
        self._model_klass = value
    
    @property
    def js_klass(self):
        return self._js_klass
    
    @js_klass.setter
    def js_klass(self, value):
        self._js_klass = value
        
    def __init__(self, name, builder_js, builder_template_path, js_klass, model_klass):
        self.name = name
        self.builder_js = builder_js
        self.builder_template_path = builder_template_path
        self.js_klass = js_klass
        self.model_klass = model_klass
    