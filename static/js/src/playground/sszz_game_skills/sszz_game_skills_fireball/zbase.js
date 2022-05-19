class Fireball extends SSZZGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 0.01;
        this.damage = damage;
        this.img = new Image();
        this.img.src = "/static/image/player/attack.png";
    }

    start() {

    }

    update() {
        if (this.move_length < this.eps) {
            this.destory();
            return false;
        }
        this.update_move();
        if (this.player.character !== "enemy") {
            this.update_attack(); //只在火球发出者的窗口判断攻击，不判断敌人的攻击是否命中，敌人火球的判断在他的窗口进行
        }

        this.render();
    }

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.deltatime / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
                break;
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius) return true;
        else return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destory();
        if (this.playground.mode === "multiend") {
            this.playground.mps.send_enemy_is_attacked(player.uid, player.x, player.y, angle, this.damage, this.uid);
        }

    }

    render() {
        let scale = this.playground.scale;
        // this.ctx.beginPath();
        // this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        // this.ctx.fillStyle = this.color;
        // this.ctx.fill();
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
        this.ctx.restore();
    }

    on_destroy() {
        for (let i = 0; i < this.player.fireballs.length; i++) {
            let fireball = this.player.fireballs[i];
            if (fireball === this) {
                this.player.fireballs.splice(i, 1);
                break;
            }
        }
    }
}