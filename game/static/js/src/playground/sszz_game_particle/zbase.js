class Particles extends SSZZGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.fraction = 0.9;
        this.eps = 3;
        this.move_length = 0.5 * move_length;
    }

    start() {

    }

    update() {
        if (this.move_length < 0.1 || this.speed < this.eps) {
            this.destory();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.deltatime / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        this.speed *= this.fraction;
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}