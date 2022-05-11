from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

from match_system.src.match_server.match_services import Match

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

    async def create_player(self,data):
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

    # Connect!
        transport.open()
        client.add_player(1500, data['uid'], data['username'], self.channel_name)

    # Close!
        transport.close()

    
    async def group_send_event(self, data):
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