from django.urls import path
from game.views.settings.getinfo import getinfo
from game.views.settings.game_login import game_login
from game.views.settings.game_logout import game_logout
from game.views.settings.game_register import game_register

urlpatterns = [
    path("getinfo/", getinfo, name="settings_getinfo"),
    path("gamelogin/", game_login, name="settings_login"),
    path("gamelogout/", game_logout, name="seettings_logout"),
    path("gameregister/", game_register, name="settings_register"),
]