from unittest import result
from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo = models.URLField(max_length=256)
    score = models.IntegerField(default=1500)
    streak = models.IntegerField(default=0)
    momentum = models.IntegerField(default=0)
    rank = models.IntegerField(default=1500)
    def __str__(self):
        return str(self.user)

class Record(models.Model):
    user = models.ForeignKey(Player,on_delete=models.CASCADE)
    game_result = models.IntegerField()
    win_probability = models.DecimalField(max_digits=6, decimal_places=4)
    score_change = models.IntegerField(null=True)
    created_time = models.DateTimeField(auto_now_add=True,null = True)
