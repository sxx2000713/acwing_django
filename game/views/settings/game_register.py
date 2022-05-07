from atexit import register
from curses.ascii import US
import imp
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.http import JsonResponse

def game_register(request):
    data = request.GET
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    confirm_password = data.get("confirm_password", "").strip()
    if not username or not password:
        return JsonResponse({
            'result':"用户名或密码不能为空"
        })
    if password != confirm_password:
        return JsonResponse({
            'result':"确认密码与原密码不一致"
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result':"用户名已存在"
        })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="http://49.232.201.217:8000/static/image/settings/avator.jpg")
    login(request, user)
    return JsonResponse({
        'result':"success"
    })