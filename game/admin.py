from django.contrib import admin
from game.models.player.player import *

# Register your models here.

admin.site.register(Player)
admin.site.register(Record)