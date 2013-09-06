from django.conf.urls.defaults import patterns, url


urlpatterns = patterns('django_form_architect.views',
    url(r'^$', 'home', name='dfa-home'),
    url(r'^new/$', 'build', name='dfa-new'),
    url(r'^edit/(?P<id>\d+)/$', 'build', name='dfa-edit'),        
)
