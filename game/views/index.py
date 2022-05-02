from django.shortcuts import render
#django渲染api


def index(request):
    return render(request, "multiterm/web.html")
    #render默认去找templates下的文件