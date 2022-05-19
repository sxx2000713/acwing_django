from django.urls import path, include
from game.views.index import index, getRecord

urlpatterns = [
     path('', index, name="index"),
     path("menu/", include("game.urls.menu.index")),
     path("playground/", include("game.urls.playground.index")),
     path("settings/", include("game.urls.settings.index")),
     path("record",getRecord,name = "checkemail"),
]