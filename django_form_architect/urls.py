from django.conf.urls.defaults import patterns, url

urlpatterns = patterns('django_form_architect.views', 
    url(r'^$', 'home'),
    url(r'^new/$', 'build'),
    url(r'^edit/(?P<id>\d+)/$', 'build'),        
)
