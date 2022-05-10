class SSZZGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
        <div class="sszz-game-menu">
            <div class="sszz-game-menu-buttonfield">
                <div class="sszz-game-menu-buttonfield-item sszz-game-menu-buttonfield-item-single">
                    单人模式
                </div>
                <br>
                <div class="sszz-game-menu-buttonfield-item sszz-game-menu-buttonfield-item-multiplay">
                    多人模式
                </div>
                <br>
                <div class="sszz-game-menu-buttonfield-item sszz-game-menu-buttonfield-item-setting">
                    设置
                </div>
                <div class="sszz-game-menu-buttonfield-item sszz-game-menu-buttonfield-item-logout">
                    退出
                </div>
            </div>
        </div>
        `);
        this.hide();
        this.root.$sszz_game.append(this.$menu);
        this.$single = this.$menu.find('.sszz-game-menu-buttonfield-item-single');
        this.$multi = this.$menu.find('.sszz-game-menu-buttonfield-item-multiplay');
        this.$setting = this.$menu.find('.sszz-game-menu-buttonfield-item-setting');
        this.$logout = this.$menu.find('.sszz-game-menu-buttonfield-item-logout');
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single.click(function () {
            outer.hide();
            outer.root.playground.show("single");
        });
        this.$multi.click(function () {
            outer.hide();
            outer.root.playground.show("multiend");
            console.log("click multi button");
        });
        this.$setting.click(function () {
            console.log("click setting button");
        });
        this.$logout.click(function () {
            outer.root.settings.logout_remote();
        })

    }

    show() {
        //显示menu
        this.$menu.show();
    }

    hide() {
        //隐藏menu
        this.$menu.hide();
    }
}let SSZZ_GAME_OBJECTS = [];

class SSZZGameObject {
    constructor() {
        SSZZ_GAME_OBJECTS.push(this);

        this.has_start = false; //是否执行start
        this.deltatime = 0; //当前帧距离上一帧的距离
        this.uid = this.create_uid();
    }

    create_uid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
    }

    start() {//创建一个新对象

    }

    update() { //每帧执行一次

    }

    on_destory() {//删掉一个物体前的收尾工作

    }

    destory() {
        this.on_destory();

        for (let i = 0; i < SSZZ_GAME_OBJECTS.length; i++) {
            if (SSZZ_GAME_OBJECTS[i] === this) {
                SSZZ_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }


}

let last_timestamp; // 不需要初始化，第一次执行不会用到，后面用到时已经有值
let SSZZ_GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < SSZZ_GAME_OBJECTS.length; i++) {
        let obj = SSZZ_GAME_OBJECTS[i];
        if (!obj.has_start) {
            obj.start();
            obj.has_start = true;
        } else {
            obj.deltatime = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(SSZZ_GAME_ANIMATION);
}

requestAnimationFrame(SSZZ_GAME_ANIMATION);class GameMap extends SSZZGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }
    start() {

    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgb(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}class Particles extends SSZZGameObject {
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
        this.eps = 0.01;
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
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends SSZZGameObject {
    constructor(playground, X, Y, radius, color, speed, character, username, photo) {
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
        this.photo = photo;
        this.eps = 0.01;
        this.cur_skill = null;
        this.damagex = 0;
        this.damagey = 0;
        this.damage_speed = 0;
        this.fraction = 0.9;
        this.spent_time = 0;
        // if (this.character !== "robot") {
        //     this.img = new Image();
        //     this.img.src = this.photo;
        // }
    }

    start() {
        let scale = this.playground.scale;
        if (this.character === "me") {
            this.add_listening_events();
        } else {
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
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                outer.move_to((e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale);
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball((e.clientX - rect.left) / scale, (e.clientY - rect.top) / scale);
                }
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function (e) {
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
        new Fireball(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
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
            }
        }
    }
}class Fireball extends SSZZGameObject {
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
    }

    start() {

    }

    update() {

        if (this.move_length < this.eps) {
            this.destory();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.deltatime / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }
        this.render();
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
        this.destory();
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class SSZZGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
        <div class="sszz-game-playground">
        </div>`);
        this.hide();
        this.root.$sszz_game.append(this.$playground);

        this.start();
    }

    start() {
        let outer = this;
        $(window).resize(function () {
            outer.resize();
        });
    }

    update() {

    }

    show(mode) {
        //打开playground
        let outer = this;
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.resize();
        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "lightgreen", 0.15, "me", this.root.settings.username, this.root.settings.photo));
        if (mode === "single") {
            for (let i = 0; i < 5; i++) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "lightblue", 0.15, "robot"));
            }
        } else if (mode === "multiend") {
            this.mps = new MultiPlayerSocket(this);
            this.mps.uid = this.players[0].uid;
            this.mps.ws.onopen = function () {
                outer.mps.send_create_player();
            };
        }

    }
    hide() {
        this.$playground.hide();
    }

    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let ratio = this.width / this.height;
        if (ratio < 16 / 9) {
            this.height = this.width / 16 * 9;
        } else {
            this.width = this.height / 9 * 16;
        }
        this.scale = this.height;
        if (this.game_map) this.game_map.resize();
    }
}class Settings {
    constructor(root) {
        this.root = root;
        this.username = "";
        this.photo = "";
        this.$settings = $(`
        <div class="sszz-game-settings">
            <div class="sszz-game-settings-login">
                <div class="sszz-game-settings-title">
                    登录
                </div>
                <div class="sszz-game-settings-errormessage">
                </div>
                <div class="sszz-game-settings-username">
                    <div class="sszz-game-settings-item">
                        <input type="text" placeholder="用户名">
                    </div>
                </div>
                <div class="sszz-game-settings-password">
                    <div class="sszz-game-settings-item">
                        <input type="password" placeholder="密码">
                    </div>
                </div>
                <div class="sszz-game-settings-submit">
                    <div class="sszz-game-settings-item sszz-game-settings-item-login">
                        <button>登录</button>
                    </div>
                </div>
                <div class="sszz-game-settings-submit">
                    <div class="sszz-game-settings-item sszz-game-settings-item-register">
                        <button>注册</button>
                    </div>
                </div>
            </div>
            <div class="sszz-game-settings-register">
                <div class="sszz-game-settings-title">
                    注册
                </div>
                <div class="sszz-game-settings-errormessage">

                </div>
                <div class="sszz-game-settings-username">
                    <div class="sszz-game-settings-item">
                        <input type="text" placeholder="用户名">
                    </div>
                </div>
                <div class="sszz-game-settings-password">
                    <div class="sszz-game-settings-item">
                        <input type="password" placeholder="密码">
                    </div>
                </div>
                <div class="sszz-game-settings-password sszz-game-settings-password-confirm">
                    <div class="sszz-game-settings-item">
                        <input type="password" placeholder="确认密码">
                    </div>
                </div>
                <div class="sszz-game-settings-submit">
                    <div class="sszz-game-settings-item sszz-game-settings-item-register">
                        <button>注册</button>
                    </div>
                </div>
                <div class="sszz-game-settings-submit">
                    <div class="sszz-game-settings-item sszz-game-settings-item-login">
                        <button>返回登录</button>
                    </div>
                </div>
            </div>
        </div>
        `);
        this.$login = this.$settings.find(".sszz-game-settings-login");
        this.$login_username = this.$login.find(".sszz-game-settings-username input");
        this.$login_password = this.$login.find(".sszz-game-settings-password input");
        this.$login_submit = this.$login.find(".sszz-game-settings-item-login button");
        this.$login_errormessage = this.$login.find(".sszz-game-settings-errormessage");
        this.$login_register = this.$login.find(".sszz-game-settings-item-register button");
        this.$login.hide();

        this.$register = this.$settings.find(".sszz-game-settings-register");
        this.$register_username = this.$register.find(".sszz-game-settings-username input");
        this.$register_password = this.$register.find(".sszz-game-settings-password input");
        this.$register_password_confirm = this.$register.find(".sszz-game-settings-password-confirm input");
        this.$register_submit = this.$register.find(".sszz-game-settings-item-register button");
        this.$register_errormessage = this.$register.find(".sszz-game-settings-errormessage");
        this.$register_login = this.$register.find(".sszz-game-settings-item-login button");

        this.$register.hide();
        this.root.$sszz_game.append(this.$settings);
        this.start();
    }

    listening_events() {
        let outer = this;
        this.$login_register.click(function () {
            outer.register();
        })
        this.$register_login.click(function () {
            outer.login();
        })
        this.$login_submit.click(function () {
            outer.login_remote();
        })
        this.$register_submit.click(function () {
            outer.register_remote();
        })
    }

    login() {
        this.$register.hide();
        this.$login.show();
    }

    register() {
        this.$login.hide();
        this.$register.show();
    }

    login_remote() {
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_errormessage.empty();
        let outer = this;
        $.ajax({
            url: "https://app2347.acapp.acwing.com.cn/settings/gamelogin/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_errormessage.html(resp.result);
                }
            }
        })
    }

    register_remote() {
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let confirm_password = this.$register_password_confirm.val();
        this.$register_errormessage.empty();
        let outer = this;
        $.ajax({
            url: "https://app2347.acapp.acwing.com.cn/settings/gameregister/",
            type: "GET",
            data: {
                username: username,
                password: password,
                confirm_password: confirm_password,
            },
            success: function (resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$register_errormessage.html(resp.result);
                }
            }
        })
    }

    logout_remote() {
        let outer = this;
        $.ajax({
            url: "https://app2347.acapp.acwing.com.cn/settings/gamelogout/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    location.reload();
                }
            }
        })
    }

    getinfo() {
        let outer = this;
        $.ajax({
            url: "https://app2347.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.Settings.show();
    }

    start() {
        this.getinfo();
        this.listening_events();
    }
}export class SSZZGame {
    constructor(id) {
        this.id = id;
        this.$sszz_game = $('#' + id);
        this.settings = new Settings(this);
        this.menu = new SSZZGameMenu(this);
        this.playground = new SSZZGamePlayground(this);

        this.start();
    }

    start() {

    }
}