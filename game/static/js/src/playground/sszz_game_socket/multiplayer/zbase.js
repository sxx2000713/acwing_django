class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app2347.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }

    start() {
        this.recive();
    }

    send_create_player(username, photo, rank) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create player",
            'uid': outer.uid,
            'username': username,
            'photo': photo,
            'rank': rank,
        }))
    }
    recive() {
        let outer = this;
        this.ws.onmessage = function (e) {
            let data = JSON.parse(e.data);
            let uid = data.uid;
            if (uid === outer.uid) return false;
            let event = data.event;
            if (event === "create player") {
                outer.recive_create_player(uid, data.username, data.photo, data.rank);
            } else if (event === "move") {
                outer.recive_move_to(uid, data.tx, data.ty);
            } else if (event === "attack") {
                outer.recive_attack(uid, data.tx, data.ty, data.ball_uid);
            } else if (event === "enemy_attacked") {
                outer.recive_enemy_is_attacked(uid, data.enemy_uid, data.enemy_x, data.enemy_y, data.angle, data.damage, data.ball_uid);
            } else if (event === "send message") {
                outer.recive_message(uid, data.text);
            } else if (event === "match success") {
                outer.playground.root.noticeboard.start_game();
            }
        }
    }

    recive_create_player(uid, username, photo, rank) {
        let player = new Player(this.playground, this.playground.width / 2 / this.playground.scale, 0.5, 0.05, "white", 0.15, "enemy", username, photo, rank);
        player.uid = uid;
        this.playground.players.push(player);
    }

    get_player(uid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            if (player.uid === uid) return player;
        }
    }

    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move",
            'uid': outer.uid,
            'tx': tx,
            'ty': ty
        }))
    }

    recive_move_to(uid, tx, ty) {
        let player = this.get_player(uid);
        if (player) {//???????????????????????????
            player.move_to(tx, ty);
        }
    }

    send_attack(tx, ty, ball_uid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uid': outer.uid,
            'tx': tx,
            'ty': ty,
            'ball_uid': ball_uid
        }))
    }

    recive_attack(uid, tx, ty, ball_uid) {
        let player = this.get_player(uid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uid = ball_uid;//?????????????????????????????????????????????uid??????
        }
    }

    //???????????????????????????????????????????????????????????????????????????????????????
    send_enemy_is_attacked(enemy_uid, enemy_x, enemy_y, angle, damage, ball_uid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "enemy_attacked",
            'uid': outer.uid,
            'enemy_uid': enemy_uid,
            'enemy_x': enemy_x,
            'enemy_y': enemy_y,
            'angle': angle,
            'ball_uid': ball_uid,
            'damage': damage
        }))
    }

    recive_enemy_is_attacked(uid, enemy_uid, enemy_x, enemy_y, angle, damage, ball_uid) {
        let attacker = this.get_player(uid);
        let enemy = this.get_player(enemy_uid);
        if (attacker && enemy) {
            enemy.recive_group_send_attack(enemy_x, enemy_y, angle, damage, ball_uid, attacker);
        }
    }

    send_message(text) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "send message",
            'text': text,
            'uid': outer.uid
        }))
    }

    recive_message(uid, text) {
        let player = this.get_player(uid);
        player.playground.chatfield.add_message(player.username, text);
        player.playground.chatfield.show_history();
    }

    send_cancel_match(uid, username, photo, rank) {
        this.ws.send(JSON.stringify({
            'event': "cancel match",
            'uid': uid,
            'username': username,
            'photo': photo,
            'rank': rank,
        }))
    }
}