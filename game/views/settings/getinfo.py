from django.http import JsonResponse
from game.models.player.player import Player

def getinfo(request):
    
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result':"fail",
        })
    else:
        return JsonResponse({
            'result':"success",
            'username': user.username,
        })
