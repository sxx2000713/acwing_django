from django.shortcuts import render
from game.models.player.player import Record
#django渲染api


def index(request):
    return render(request, "multiterm/web.html")
    #render默认去找templates下的文件

def getRecord(request):
    record_list = Record.objects.all()
    return render(request, "multiterm/record.html",locals())

