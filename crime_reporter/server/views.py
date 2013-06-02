from django.shortcuts import render_to_response
from django.http import *
from django.views.decorators.csrf import csrf_exempt
from django.core.context_processors import csrf
import httplib, urllib, json
from urlparse import urlparse
from bs4 import BeautifulSoup

def crime(request):
    #render_to_Response will automatically add all headers etc for the response
    return render_to_response('index.html')


def test(request):
    #render_to_Response will automatically add all headers etc for the response
    return render_to_response('test.html')

def load_url(url):
    #Creating a HTTP connection, and saying get the url
    #reading the response and rendering it using json
    value = urlparse(url)
    #network location of urlparse
    conn = httplib.HTTPConnection('access.alchemyapi.com')
    path = 'calls/url/URLGetRankedNamedEntities?apikey=5d6c2144be5020ccd0d19ff04419afb28ef2cc99&url=' + urllib.urlencode(url)
    print path
    try:
        conn.request('GET', path)
    except:
        print sys.exc_info()
    res = conn.getresponse().read()
    #return json.loads(res)
    return res

#exempts methods from cross site attack
@csrf_exempt
def concept(request):
    if (request.method == "POST"):
        #client side refers to id --- server side refers to name
        return HttpResponse(load_url(request.POST['url_name']))
    return render_to_response('concept.html')
    
