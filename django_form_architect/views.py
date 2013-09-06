from django.shortcuts import render_to_response, HttpResponse, Http404, redirect, get_object_or_404
from django.conf import settings
from django.template import RequestContext
import models
import util
import json
from operator import attrgetter

try:
    ERRORPAGE_SUITE_KEY = settings.ERRORPAGE_SUITE_KEY
except AttributeError:
    ERRORPAGE_SUITE_KEY = 'one_hundred_apples' 


def home(request):
    return render_to_response('django_form_architect/index.html', locals(), context_instance=RequestContext(request))

def build(request, id=None):     
    if request.POST:        
        form_dict = json.loads(request.POST.get('form'))
        form = util.FormModelFactory.from_dict(form_dict)                    
        page_request = json.loads(request.POST.get('pages'))                       
        
        page_map = {}
        widget_pids = []    
        page_pids = []
            
        for page_dict in page_request:
            page = util.PageModelFactory.from_dict(page_dict, form)
            page_map[page.sequence] = {
                'pid': page.pid,
                'widgets': {},
            }
            if len(page_dict.get('widgets', [])) == 0:                
                page.delete()
            else:
                page_pids.append(page.pid)
                for widget_dict in page_dict.get('widgets', []):
                    widget = util.WidgetModelFactory.from_dict(widget_dict, form=form, page=page)
                    if widget:
                        page_map[page.sequence]['widgets'][widget.sequence] = widget.pid                    
                        widget_pids.append(widget.pid)                
                
        for unused_page in (p for p in form.page_set.all() if p.pid not in page_pids):            
            unused_page.delete()
        
        for unused_widget in (w for w in form.widget_set.all() if w.pid not in widget_pids):
            unused_widget.is_active = False
            unused_widget.page = None
            unused_widget.save() 
        
        return HttpResponse(json.dumps({
            'form_pid' : form.pid,
            'page_map' : page_map
        }), content_type="application/json")
        
    if id:        
        form = get_object_or_404(models.Form.objects, pid=id)        
        
    return render_to_response('django_form_architect/new.html', locals(), context_instance=RequestContext(request))