import models

class FormModelFactory(object):
    
    @staticmethod
    def from_dict(dict):
        if(dict.get('pid', None)):
            f = models.Form.objects.get(pid = dict['pid'])
        else:
            f = models.Form()
        
        f.slug = dict.get('slug', f.slug)
        f.name = dict.get('name', f.name)
        f.title = dict.get('title', f.title)
        f.description = dict.get('description', f.description)
        f.is_active = bool(dict.get('is_active', f.is_active))
        f.save()
        
        return f        
        
class PageModelFactory(object):
    
    @staticmethod
    def from_dict(dict, form):        
        if(dict.get('pid', None)):
            p = models.Page.objects.get(pid = dict['pid'])
        else:
            p = models.Page()
        
        p.form = form
        p.name = dict.get('name', p.name)
        p.sequence = dict.get('sequence', p.sequence)                
        p.save()
        
        return p 

class WidgetModelFactory(object):
    
    @staticmethod
    def from_dict(dict, form, page):
        type = dict['type']
        type_map = '%sWidget' % type.split('.')[-1]
        if hasattr(models, type_map):
            widget = [w for w in form.widget_set.all() if w.pid == dict.get('pid')]
            if(len(widget) == 1):
                widget = widget[0]
            else:
                widget_type = getattr(models, type_map)
                widget = widget_type()
            
            widget.page = page                            
            widget.from_dict(dict, form=form)
            form.widget_set.add(widget)
            page.widget_set.add(widget)
            
            return widget
        else:
            return None
        