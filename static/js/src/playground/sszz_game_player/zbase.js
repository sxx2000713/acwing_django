class Player extends SSZZGameObject {
    constructor(playground, X, Y, radius, color, speed, character, username) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = X;
        this.y = Y;
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.eps = 0.01;
        this.cur_skill = null;
        this.damagex = 0;
        this.damagey = 0;
        this.damage_speed = 0;
        this.fraction = 0.9;
        this.spent_time = 0;
        this.fireballs = [];
        // if (this.character !== "robot") {
        //     this.img = new Image();
        //     this.img.src = this.photo;
        // }
    }

    start() {
        let scale = this.playground.scale;
        this.playground.player_cnt++;
        this.playground.notice_board.write("已就绪：" + this.playground.player_cnt + "人");
        if (this.playground.player_cnt >= 2) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }
        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            let tx = Math.random() * this.playground.width / scale;
            let ty = Math.random() * this.playground.height / scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        let scale = this.playground.scale;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            if (outer.playground.state !== "fighting") return false;
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                let tx = (e.clientX - rect.left) / scale;
                let ty = (e.clientY - rect.top) / scale;
                outer.move_to(tx, ty);
                if (outer.playground.mode === "multiend") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            } else if (e.which === 1) {
                let tx = (e.clientX - rect.left) / scale;
                let ty = (e.clientY - rect.top) / scale;
                if (outer.cur_skill === "fireball") {
                    let fireball = outer.shoot_fireball(tx, ty);
                    if (outer.playground.mode === "multiend") {
                        outer.playground.mps.send_attack(tx, ty, fireball.uid);
                    }
                }
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function (e) {
            if (outer.playground.state !== "fighting") return false;
            if (e.which === 81) {
                outer.cur_skill = "fireball";
                return false;
            }
        })
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        let fireball = new Fireball(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.fireballs.push(fireball);
        return fireball;
    }

    destory_fireball(ball_uid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.ball_uid === ball_uid) {
                fireball.destory();
                break;
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 10 + Math.random() * 5; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 10;
            new Particles(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if (this.radius < this.eps) {
            this.destory();
            return false;
        } else {
            this.damagex = Math.cos(angle);
            this.damagey = Math.sin(angle);
            this.damage_speed = damage * 100;
            this.speed *= 1.1;
        }
    }

    recive_group_send_attack(x, y, angle, damage, ball_uid, attacker) {
        attacker.destory_fireball(ball_uid);
        this.x = x;
        this.y = y;
        this.is_attacked(damage, angle);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    update_move() {
        this.spent_time += this.deltatime / 1000;
        let scale = this.playground.scale;
        if (this.character === "robot") {
            if (Math.random() < 1 / 300.0 && this.spent_time > 2) {
                let ran = Math.floor(Math.random() * this.playground.players.length);
                let player = this.playground.players[ran];
                this.shoot_fireball(player.x, player.y);
            }
        }

        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damagex * this.damage_speed * this.deltatime / 1000;
            this.y += this.damagey * this.damage_speed * this.deltatime / 1000;
            this.damage_speed *= this.fraction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / scale;
                    let ty = Math.random() * this.playground.height / scale;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.deltatime / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    update() {
        this.update_move();
        this.render();
    }

    render() {
        // if (this.is_me) {
        //     this.ctx.save();
        //     this.ctx.beginPath();
        //     this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        //     this.ctx.stroke();
        //     this.ctx.clip();
        //     this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        //     this.ctx.restore();
        // } else {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        // }

    }

    on_destory() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}