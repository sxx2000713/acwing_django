class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app2347.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }

    start() {
        this.recive();
    }

    send_create_player(username) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create player",
            'uid': outer.uid,
            'username': username,
        }))
    }
    recive() {
        let outer = this;
        this.ws.onmessage = function (e) {
            let data = JSON.parse(e.data);
            let uid = data.uid;
            console.log(data);
            if (uid === outer.uid) return false;
            let event = data.event;
            if (event === "create player") {
                outer.recive_create_player(uid, data.username);
            }
        }
    }

    recive_create_player(uid, username) {
        let player = new Player(this.playground, this.playground.width / 2 / this.playground.scale, 0.5, 0.05, "white", 0.15, "enemy", username);
        player.uid = uid;
        this.playground.players.push(player);
    }
}