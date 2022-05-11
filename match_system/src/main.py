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

queue = Queue()

class Player:
    def __init__(self, score, uid, username, channel_name):
        self.score = score
        self.uid = uid
        self.username = username
        self.channel_name = channel_name
        self.waiting_time = 0 #等待时间

#匹配池
class Pool:
    def __init__(self):
        self.players = []
    def add_player(self, player):
        print("add %s score: %d"% (player.username, player.score))
        self.players.append(player)
    #匹配策略：
    def check_match(self, a, b):
        dt = abs(a.score - b.score)
        a_max_dif = a.waiting_time * 50
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt <= b_max_dif

    def match_success(self, ps):
        print("Match Success: %s %s %s" %(ps[0].username, ps[1].username, ps[2].username))
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
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)

def get_player_from_queue():
    try:
        return queue.get_nowait()
    except:
        return None

class MatchHandler:
    def add_player(self,score, uid, username, channel_name):
        player = Player(score, uid, username, channel_name)
        queue.put(player)
        return 0


if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)

    # You could do one of these for a multithreaded server
    # server = TServer.TThreadedServer(
    #     processor, transport, tfactory, pfactory)
    # server = TServer.TThreadPoolServer(
    #     processor, transport, tfactory, pfactory)

    Thread(target=worker, daemon=True).start() 
    #daemon=True 杀死主线程该线程也关闭

    print('Starting the server...')
    server.serve()
    print('done.')