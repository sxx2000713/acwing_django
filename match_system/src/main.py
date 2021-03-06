#! /usr/bin/env python3

import glob
from pickle import TRUE
import sys
sys.path.insert(0, glob.glob('../../')[0])

from match_server.match_services import Match

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer
#消息队列：
from queue import Queue 
from time import sleep
from threading import Thread

from acapp.asgi import channel_layer
#将并行转为串行
from asgiref.sync import async_to_sync
from django.core.cache import cache

queue = Queue()
queue_state = {}
class Player:
    def __init__(self, score, uid, username, photo, channel_name, rank):
        self.score = score
        self.uid = uid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name #未解决：channel_name无法传入
        self.rank = rank
        self.waiting_time = 0 #等待时间

#匹配池
class Pool:
    def __init__(self):
        self.players = []
    def add_player(self, player):
        print("add %s score: %d"% (player.username, player.score))
        self.players.append(player)
    def remove_player(self, player):
        print("remove %s score: %d"% (player.username, player.score))
        for i in range(len(self.players)):
            p = self.players[i]
            if p.username == player.username:
                self.players = self.players[:i] + self.players[i+1:]
                break
    #匹配策略：
    def check_match(self, a, b):
        if a.username == b.username:
            return False
        dt = abs(a.score - b.score)
        a_max_dif = a.waiting_time * 50
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt <= b_max_dif

    def match_success(self, ps):
        print("Match Success: %s %s %s" %(ps[0].username, ps[1].username, ps[2].username))
        room_name = "room-%s-%s-%s" % (ps[0].uid, ps[1].uid, ps[2].uid)
        players = []
        print(room_name)
        for p in ps:
            async_to_sync(channel_layer.group_add)(room_name, p.channel_name)
            players.append({
                'uid':p.uid,
                'username':p.username,
                'photo':p.photo,
                'hp':100
            })
        cache.set(room_name, players, 3600)
        for p in ps:
            async_to_sync(channel_layer.group_send)(
                room_name,
                {
                    'type':"group_send_event",
                    'event':'create player',
                    'uid':p.uid,
                    'photo':p.photo,
                    'username':p.username,
                    'rank':p.rank,
                }
            )
        async_to_sync(channel_layer.group_send)(
            room_name,
            {
                'type':"group_send_event",
                'event':'match success',
            }
        )

    #总匹配
    def match(self):
        while len(self.players) >= 3:
            self.players = sorted(self.players, key=lambda p:p.score)
            flag = False
            for i in range(len(self.players) - 2):
                a, b, c = self.players[i], self.players[i + 1], self.players[i + 2]
                if self.check_match(a, b) and self.check_match(b, c) and self.check_match(a, c):
                    flag = True
                    self.match_success([a, b, c])
                    self.players = self.players[:i] + self.players[i+3:]
                    break
            if not flag:
                #当前时间容忍度下未匹配成功，跳出等待容忍度上升
                break

        self.incress_waiting_time()
    def incress_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

def worker():
    pool = Pool()
    while TRUE:
        player = get_player_from_queue()
        if not player:
            pool.match()
            sleep(1)
        else:
            if queue_state[player.username] == 1:
                pool.add_player(player)
            elif queue_state[player.username] == 0:
                pool.remove_player(player)
            pool.match()  

def get_player_from_queue():
    try:
        return queue.get_nowait()
    except:
        return None

class MatchHandler:
    def add_player(self, score, uid, username, photo, channel_name, rank):
        player = Player(score, uid, username, photo, channel_name, rank)
        queue.put(player)
        queue_state[username] = 1
        return 0
    def remove_player(self, score, uid, username, photo, channel_name, rank):
        player = Player(score, uid, username, photo, channel_name, rank)
        queue.put(player)
        queue_state[username] = 0
        return 0

if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    # server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)

    # You could do one of these for a multithreaded server
    server = TServer.TThreadedServer(
        processor, transport, tfactory, pfactory)
    # server = TServer.TThreadPoolServer(
    #     processor, transport, tfactory, pfactory)

    Thread(target=worker, daemon=True).start() 
    #daemon=True 杀死主线程该线程也关闭

    print('Starting the server...')
    server.serve()
    print('done.')