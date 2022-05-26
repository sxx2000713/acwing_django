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
        });
        this.$setting.click(function () {
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
        return res;
    }

    start() {//创建一个新对象

    }

    update() { //每帧执行一次

    }

    late_update() {

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

    for (let i = 0; i < SSZZ_GAME_OBJECTS.length; i++) {
        let obj = SSZZ_GAME_OBJECTS[i];
        obj.late_update();
    }

    last_timestamp = timestamp;
    requestAnimationFrame(SSZZ_GAME_ANIMATION);
}

requestAnimationFrame(SSZZ_GAME_ANIMATION);class ChatField {
    constructor(playground) {
        this.playground = playground;

        this.$history = $(`<div class="sszz-game-chatfield-history"></div>`);
        this.$history.hide();
        this.$input = $(`<input type="text" class="sszz-game-chatfield-input">`);
        this.$input.hide();
        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);
        this.start();
    }

    start() {
        this.listen_events();
    }

    add_message(username, text) {
        let message = `[${username}]${text}`;
        let $add = $(`<div>${message}</div>`);
        this.$history.append($add);
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    listen_events() {
        let outer = this;
        this.$input.keydown(function (e) {
            if (e.which === 27) outer.hide_input();
            else if (e.which === 13) {
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text) {
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(text);
                }
                return false;
            }
        })
    }

    show_input() {
        this.$input.show();
        this.$input.focus();
        this.$history.fadeIn();
    }

    hide_input() {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
        this.$history.fadeOut();
    }

    show_history() {
        let outer = this;
        this.$history.fadeIn();

        setTimeout(function () {
            outer.$history.fadeOut();
        }, 3000);
    }
}class EndBoard extends SSZZGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;

        this.state = null;//win loss
        this.win_image = new Image();
        this.win_image.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png";
        this.lose_image = new Image();
        this.lose_image.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png";
        this.start();
    }

    start() {
    }

    listen_events() {
        let outer = this;
        let $canvas = this.playground.game_map.$canvas;
        $canvas.click(function () {
            outer.playground.hide();
            outer.playground.root.menu.show();
            outer.playground.root.noticeboard.hide();
            outer.playground.audio.pause();
        })
    }

    win() {
        this.state = "win";
        let outer = this;
        setTimeout(function () {
            outer.listen_events();
        }, 1000)
    }

    lose() {
        this.state = "lose";
        let outer = this;
        setTimeout(function () {
            outer.listen_events();
        }, 1000)
    }

    late_update() {
        this.render();
    }

    render() {
        let len = this.playground.height / 2;
        if (this.state === "win") {
            this.ctx.drawImage(this.win_image, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if (this.state === "lose") {
            this.ctx.drawImage(this.lose_image, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }
}class GameMap extends SSZZGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);//tabindex：使该标签可以监听读入事件（聚焦后才可）
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
        this.img = new Image();
        this.img.src = "/static/image/playground/background.jpg"
    }
    start() {
        this.$canvas.focus();
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.drawImage(this.img, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        // this.ctx.fillStyle = "rgb(0, 0, 0)";
        // this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.drawImage(this.img, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        // this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        // this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}class NoticeBoard {
    constructor(root) {
        this.root = root;
        this.rankscore = this.root.settings.rank;
        this.$noticeboard = $(`
            <div class="sszz-game-noticeboard">
                <div class="sszz-game-noticeboard-submit">
                    <div class="sperate">
                        <div class="sszz-game-noticeboard-item button1">
                            <button>开始匹配</button>
                        </div>
                    </div>
                    <div class="sperate">
                        <div class="sszz-game-noticeboard-item button2">
                            <button>返回</button>
                        </div>
                    </div>
                    <div class="sperate">
                        <div class="sszz-game-noticeboard-title notice_username">
                        </div>
                    </div>
                    <div class="sperate">
                        <div class="sszz-game-noticeboard-title rank_score">
                        </div>
                    </div>
                </div>
                <div class="sszz-game-noticeboard-waiting">
                    <div class="sszz-game-noticeboard-title">
                        匹配中
                    </div>
                    <div class="sperate">
                        <div class="sszz-game-noticeboard-item button3">
                            <button>取消匹配</button>
                        </div>
                    </div>

                </div>
                <div class="sszz-game-noticeboard-success">
                    <div class="sszz-game-noticeboard-title">
                        匹配成功
                    </div>
                </div>
            </div>
        `)
        //       <div class="sperate">
        //                 <div class="sszz-game-noticeboard-item button4">
        //                     <button>确认</button>
        //                 </div>
        //             </div>
        //             <div class="sperate">
        //                 <div class="sszz-game-noticeboard-item button5">
        //                     <button>取消</button>
        //                 </div>
        //             </div>
        this.hide();
        this.root.$sszz_game.append(this.$noticeboard);
        this.$match_board = this.$noticeboard.find(".sszz-game-noticeboard-submit");
        this.$match_board.hide();
        this.$waiting_board = this.$noticeboard.find(".sszz-game-noticeboard-waiting");
        this.$waiting_board.hide();
        this.$success_board = this.$noticeboard.find(".sszz-game-noticeboard-success");
        this.$success_board.hide();
        this.$start_match = this.$noticeboard.find(".button1 button");
        this.$return_menu = this.$noticeboard.find(".button2 button");
        this.$cancel_match = this.$noticeboard.find(".button3 button");
        this.$rank_score = this.$noticeboard.find(".rank_score");
        this.$notice_username = this.$noticeboard.find(".notice_username")
        // this.$confirm = this.$noticeboard.find(".button4 button");
        // this.$cancel = this.$noticeboard.find(".button5 button");
        // this.ctx = this.playground.game_map.ctx;
        // this.text = "已就绪 0 人";
        this.start();
    }

    start() {
        this.listen_events();
    }
    // write(text) {
    //     this.text = text;
    // }

    listen_events() {
        let outer = this;
        this.$start_match.click(function () {
            outer.$match_board.hide();
            outer.$waiting_board.show();
            outer.root.playground.create_wsconnect();
        })
        this.$return_menu.click(function () {
            // outer.hide();
            // outer.root.playground.audio.pause();
            // outer.root.menu.show();
            location.reload();
        })
        this.$cancel_match.click(function () {
            outer.$waiting_board.hide();
            outer.root.menu.show();
            outer.cancel_match();
            location.reload();
        })
        // this.$confirm.click(function () {
        //     outer.start_game();
        // })
        // this.$cancel.click(function () {
        //     outer.cancel();
        //     outer.$success_board.hide();
        //     outer.$match_board.show();
        // })

    }

    // render() {
    //     // this.ctx.font = "20px serif";
    //     // this.ctx.fillStyle = "white";
    //     // this.ctx.textAlign = "center";
    //     // this.ctx.fillText(this.text, this.playground.width / 2, 20);
    // }

    show() {
        this.$noticeboard.show();
        this.$match_board.show();
        let text_rank = "当前rank分：" + this.rankscore + "分";
        let text_usname = this.root.settings.username;
        this.$notice_username.html(text_usname);
        this.$rank_score.html(text_rank)
    }

    hide() {
        this.$noticeboard.hide();
    }

    cancel_match() {
        let mps = this.root.playground.mps
        let player = mps.firstplayer;
        mps.send_cancel_match(mps.uid, player.username, player.photo, player.rank);
        this.root.playground.hide();
    }

    start_game() {
        let outer = this;
        this.$waiting_board.hide();
        this.$success_board.show();
        setTimeout(function () {
            outer.root.playground.$playground.show();
            outer.$noticeboard.hide();
        }, 3000);
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
    constructor(playground, X, Y, radius, color, speed, character, username, photo, rank) {
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
        this.rank = rank;

        // this.photo = photo;
        if (this.rank <= 1500)
            this.photo = "/static/image/player/2.png";
        else if (this.rank <= 1700)
            this.photo = "/static/image/player/4.png";
        else if (this.rank <= 1900)
            this.photo = "/static/image/player/5.png";
        else if (this.rank <= 2100)
            this.photo = "/static/image/player/1.png";
        else
            this.photo = "/static/image/player/3.png";
        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start() {
        let scale = this.playground.scale;
        this.playground.player_cnt++;
        // this.playground.notice_board.write("已就绪：" + this.playground.player_cnt + "人");
        if (this.playground.player_cnt >= 3) {
            this.playground.state = "fighting";
            // this.playground.notice_board.write("Fighting");
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
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            if (outer.playground.state !== "fighting") return true;
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);
                if (outer.playground.mode === "multiend") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            } else if (e.which === 1) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.cur_skill === "fireball") {
                    let fireball = outer.shoot_fireball(tx, ty);
                    if (outer.playground.mode === "multiend") {
                        outer.playground.mps.send_attack(tx, ty, fireball.uid);
                    }
                }
                outer.cur_skill = null;
            }
        });

        this.playground.game_map.$canvas.keydown(function (e) {
            if (e.which === 13 && outer.playground.mode === "multiend") {
                outer.playground.chatfield.show_input();
                return false;
            } else if (e.which === 27 && outer.playground.mode === "multiend") {
                outer.playground.chatfield.hide_input();
            }
            if (outer.playground.state !== "fighting") return true;
            if (e.which === 65) {
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
            if (fireball.uid === ball_uid) {
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
            // new Particles(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if (this.radius < this.eps) {
            this.destory();
            return false;
        } else {
            this.damagex = Math.cos(angle);
            this.damagey = Math.sin(angle);
            // this.damage_speed = damage * 100;
            this.speed *= 1.1;
        }
    }

    recive_group_send_attack(x, y, angle, damage, ball_uid, attacker) {
        attacker.destory_fireball(ball_uid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);

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

    update_result() {
        if (this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1) {
            this.playground.state = "over";
            this.playground.endboard.win();
        }
    }

    update() {
        this.update_move();
        this.update_result();
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

    }

    on_destory() {
        if (this.character === "me" && this.playground.state === "fighting") {
            this.playground.endboard.lose();
            this.playground.state = "over";
        }
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
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
}class MultiPlayerSocket {
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
        if (player) {//如果玩家存活，移动
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
            fireball.uid = ball_uid;//在新窗口创建出的火球要与旧窗口uid一致
        }
    }

    //要进行的广播操作：更新敌人被击中后的位置，删除击中后的火球
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
}class SSZZGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
        <div class="sszz-game-playground">
        </div> `);
        this.hide();
        this.root.$sszz_game.append(this.$playground);
        this.start();
    }

    start() {
        let outer = this;
        $(window).resize(function () {
            outer.resize();
        });

        $(window).on("contextmenu", function () {
            return false;
        });
    }

    update() {

    }

    show(mode) {
        //打开playground
        let outer = this;
        this.$playground.show();
        this.mode = mode;
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.endboard = new EndBoard(this);
        this.player_cnt = 0;
        this.resize();
        this.state = "waiting"; // waiting > fighting > over

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "lightgreen", 0.15, "me", this.root.settings.username, this.root.settings.photo, this.root.settings.rank));
        this.audio = document.createElement("audio");
        this.audio.loop = true;
        this.audio.src = "/static/audio/backgroundmusic.mp3";
        this.audio.play();
        if (mode === "single") {
            for (let i = 0; i < 5; i++) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "lightblue", 0.15, "robot"));
            }
        } else if (mode === "multiend") {
            this.$playground.hide();
            this.root.menu.hide();
            this.root.noticeboard.show();
        }

    }

    create_wsconnect() {
        let outer = this;
        this.mps = new MultiPlayerSocket(this);
        this.chatfield = new ChatField(this)
        this.mps.uid = this.players[0].uid;
        this.mps.firstplayer = this.players[0];
        this.mps.ws.onopen = function () {//链接创建成功回调
            outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo, outer.root.settings.rank);
        };
    }

    hide() {
        while (this.players && this.players.length > 0) {
            this.players[0].destory();
        }
        if (this.game_map) {
            this.game_map.destory();
            this.game_map = null;
        }

        // if (this.notice_board) {
        //     this.notice_board.destory();
        //     this.notice_board = null;
        // }

        if (this.endboard) {
            this.endboard.destory();
            this.endboard = null;
        }
        this.$playground.empty();
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
        this.rank = 1500;
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
            async: false,
            success: function (resp) {
                if (resp.result === "success") {

                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.rank = resp.rank;
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
        this.$settings.show();
    }

    start() {
        this.getinfo();
        this.listening_events();
    }
}export class SSZZGame {
    constructor(id) {
        this.id = id;
        this.$sszz_game = $('#' + id);
        this.menu = new SSZZGameMenu(this);
        this.settings = new Settings(this);
        this.playground = new SSZZGamePlayground(this);
        this.noticeboard = new NoticeBoard(this);
        this.start();
    }

    start() {

    }
}