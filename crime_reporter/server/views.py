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
    path = '/calls/url/URLGetRankedNamedEntities?apikey=5d6c2144be5020ccd0d19ff04419afb28ef2cc99&outputMode=json&url=' + urllib.quote_plus(url)
    print path
    out = {'name': 'root', 'children':[]}
    try:
		conn.request('GET', path)
		res = conn.getresponse().read()
		t =  json.loads(res)
		print t
                
		entities = {}
                children = []
                
                for e in t['entities']:
                    if (e['type'] not in entities):
                        entities[e['type']] = []
                        if ('disambiguated' in e):
                                entities[e['type']].append({e['text']: e['disambiguated']})
                    else:
                        if ('disambiguated' in e):
                            entities[e['type']].append({e['text']: e['disambiguated']})

                print "LOLOLOLOL"
                print "YAYYAYAY"
                
                print entities
                for el in entities:
                    yo = []
                    #print el
                    for ch in entities[el]:
                    #    print el
                        for key in ch:
                            #if ('disambiguated' in entities[el]):
                            if 'subType' in ch[key]:
                                print ch[key]['subType']
                                yo.append({'name': key, 'children': [{'name': k} for k in ch[key]['subType']]})
                            else :
                                yo.append({'name': key, 'children' : None})
                    children.append({'name': el, 'children': yo}) 
                     #   print yo
                        
                out['children'] = children
		#print out
    except:
        print sys.exc_info()

    return json.dumps(out)


def check(l, entity):
	for i in l:
		if(i['name'] == entity):
			return True
	return False

#exempts methods from cross site attack
@csrf_exempt
def concept(request):
    if (request.method == "POST"):
        #client side refers to id --- server side refers to name
        return HttpResponse(load_url(request.POST['url_name']), mimetype="application/json")
    return render_to_response('concept.html')
    
