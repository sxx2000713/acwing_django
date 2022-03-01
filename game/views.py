from django.http import HttpResponse

def index(request):
    line1 = '<h1 style="text-align: center">术士之战</h1>'
    line2 = '<img src="https://tse1-mm.cn.bing.net/th/id/R-C.1a6e835c9e2a41d6fbf33ab0d0938f02?rik=s25%2bcT3Mf8HZjw&riu=http%3a%2f%2fwww.desktx.com%2fd%2ffile%2fwallpaper%2fgame%2f20161108%2feb7254c8de337fd7aa528b48129f34d7.jpg&ehk=7Lf85lGP2FPf4DhC29dqaBPHtqEOVcTH2rvCzK4Z8CA%3d&risl=&pid=ImgRaw&r=0%E3%80%81">'
    return HttpResponse(line1+line2)

