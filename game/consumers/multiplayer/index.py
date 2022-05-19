import math
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

from match_system.src.match_server.match_services import Match
from game.models.player.player import Player, Record
from channels.db import database_sync_to_async

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        # for i in range(1000):
        #     name = "room-%d" % (i)
        #     if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
        #         self.room_name = name
        #         break
        # if not self.room_name:
        #     return
        await self.accept()
        print('accept')

        # if not cache.has_key(self.room_name):
        #     cache.set(self.room_name, [], 3600) 
        # for player in cache.get(self.room_name):
        #     await self.send(text_data=json.dumps({
        #         'event':"create player",
        #         'uid':player['uid'],
        #         'username':player['username'],
        #     }))

        # await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):
        if self.room_name:
            print('disconnect')
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        # players = cache.get(self.room_name)
        # players.append({
        #     'uid':data['uid'],
        #     'username':data['username'],
        # })
        # cache.set(self.room_name, players, 3600)
        # await self.channel_layer.group_send(
        #     self.room_name,
        #     {
        #         'type' : "group_send_event",
        #         'event' : "create player",
        #         'uid' : data['uid'],
        #         'username' : data['username'],
        #     }
        # )
        self.room_name = None
        self.uid = data['uid']
        transport = TSocket.TSocket('127.0.0.1', 9090)
    # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)
    # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)
    # Create a client to use the protocol encoder
        client = Match.Client(protocol)
        def db_get_player():
            return Player.objects.get(user__username=data['username'])
        player = await database_sync_to_async(db_get_player)()
    # Connect!
        transport.open()
        client.add_player(player.score, data['uid'], data['username'], data['photo'], self.channel_name)

    # Close!
        transport.close()
    
    async def cancel_match(self, data):
        self.uid = data['uid']
        transport = TSocket.TSocket('127.0.0.1', 9090)
        transport = TTransport.TBufferedTransport(transport)
        protocol = TBinaryProtocol.TBinaryProtocol(transport)
        client = Match.Client(protocol)
        transport.open()
        client.remove_player(data['uid'])
        transport.close()


    
    async def group_send_event(self, data):
        if not self.room_name:
            keys = cache.keys('*%s*' % (self.uid))
            if keys:
                self.room_name = keys[0]
        await self.send(text_data=json.dumps(data))

    async def move_to(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event':"move",
                'uid':data['uid'],
                'tx':data['tx'],
                'ty':data['ty']
            }
        )
    
    async def attack(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event':"attack",
                'uid' : data['uid'],
                'tx':data['tx'],
                'ty': data['ty'],
                'ball_uid':data['ball_uid']
            }
        )
    
    async def enemy_attacked(self, data):
        if not self.room_name:
            return
        players = cache.get(self.room_name)
        if not players:
            return 
        for player in players:
            if player['uid'] == data['enemy_uid']:
                player['hp'] -= 25
        remain_cnt = 0
        for player in players:
            if player['hp'] > 0:
                remain_cnt += 1
        if remain_cnt <= 1:
            def update_record(username, result, score):
                mean_enemy_score = 0
                other_cnt = 0
                player = Player.objects.get(user__username=username)
                for p in players:
                    if p['username'] != username:
                        pl = Player.objects.get(user__username=p['username'])
                        mean_enemy_score += pl.score
                        other_cnt += 1
                mean_enemy_score /= other_cnt
                score_difference = player.score - mean_enemy_score
                win_probablity = 1 / (1 + math.pow(10, - (score_difference / 400)))
                Record.objects.create(user = player, game_result = result, win_probability = win_probablity, score_change = score)
            def conculate_change(username):
                player = Player.objects.get(user__username=username)
                record_list = Record.objects.filter(user = player).order_by("created_time")
                cnt = 0
                sum_win_p = 0.0
                sum_win = 0
                score = 0
                k = 0
                if player.score <= 1500:
                    k = 20
                elif player.score <= 2100:
                    k = 10
                else:
                    k = 5
                for obj in record_list:
                    cnt += 1
                    sum_win_p = float(obj.win_probability) + sum_win_p
                    sum_win += obj.game_result
                    if cnt >= 5 :
                        break
                score = k * (sum_win - sum_win_p)
                return score
            def db_update_player_score(username, score):
                player = Player.objects.get(user__username=username)
                record_list = Record.objects.filter(user = player).order_by("-created_time")
                record = record_list.first()
                record.score_change = score
                record.save()
                player.score += score
                player.save()
            def db_update_player_rank(username, score):
                player = Player.objects.get(user__username=username)
                player.rank += score
                player.save()
            for player in players:
                if player['hp'] <= 0 :
                    await database_sync_to_async(update_record)(player['username'], 0, 0)
                    database_sync_to_async(db_update_player_rank)(player['username'], -5)
                else:
                    await database_sync_to_async(update_record)(player['username'], 1, 0)
                    database_sync_to_async(db_update_player_rank)(player['username'], 10)
                score = await database_sync_to_async(conculate_change)(player['username'])
                await database_sync_to_async(db_update_player_score)(player['username'], score)
        else:
            if self.room_name:
                cache.set(self.room_name, players, 3600)
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event':"enemy_attacked",
                'uid':data['uid'],
                'enemy_uid':data['enemy_uid'],
                'enemy_x' :data['enemy_x'],
                'enemy_y':data['enemy_y'],
                'angle':data['angle'],
                'damage':data['damage'],
                'ball_uid':data['ball_uid']
            }
        )
    
    async def message(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type':"group_send_event",
                'event':"send message",
                'uid':data['uid'],
                'text':data['text']
            }
        )


    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create player":
            await self.create_player(data)
        elif event == "move":
            await self.move_to(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "enemy_attacked":
            await self.enemy_attacked(data)
        elif event == "send message":
            await self.message(data)
        elif event == "cancel match":
            await self.cancel_match(data)