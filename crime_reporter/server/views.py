from django.shortcuts import render_to_response
from django.http import *



def home(request):
    #render_to_Response will automatically add all headers etc for the response
    return render_to_response('index.html')
