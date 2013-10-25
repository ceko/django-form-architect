from django.conf.urls.defaults import patterns, url

urlpatterns = patterns('django_form_architect.views', 
    url(r'^$', 'home'),
    url(r'^fill-out/(?P<id>\d+)/$', 'fill_out'),
    url(r'^new/$', 'build'),
    url(r'^edit/(?P<id>\d+)/$', 'build'), 
    url(r'^share/(?P<id>\d+)/$', 'share'),
)
