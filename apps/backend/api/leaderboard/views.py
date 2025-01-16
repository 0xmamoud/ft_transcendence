from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    print("index")
    return HttpResponse("Hello, world. You're at the leaderboard index.")


# Create your views here.
