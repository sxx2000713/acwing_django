from unittest import result
from django.contrib.auth import authenticate, login
from django.http import JsonResponse

def game_login(request):
    data = request.GET
    username = data.get('username')
    password = data.get('password')
    user = authenticate(username=username, password=password)
    if not username or not password:
        return JsonResponse({
            'result':"用户名或密码不能为空"
        })
    if not user:
        return JsonResponse({
            'result':"用户名或密码不正确"
        })

    login(request, user)
    return JsonResponse({
        'result':"success"
    })
