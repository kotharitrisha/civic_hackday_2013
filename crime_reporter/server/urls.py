from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    
    url(r'^$', 'server.views.concept'),
    url(r'^crime', 'server.views.crime'),
    url(r'^concept', 'server.views.concept'), 
    url(r'^url_concept', 'server.views.concept'),                   
)
