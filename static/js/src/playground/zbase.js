class SSZZGamePlayground {
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
        this.mode = mode;
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.notice_board = new NoticeBoard(this);
        this.player_cnt = 0;
        this.resize();
        this.state = "waiting"; // waiting > fighting > over

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "lightgreen", 0.15, "me", this.root.settings.username));
        if (mode === "single") {
            for (let i = 0; i < 5; i++) {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "lightblue", 0.15, "robot"));
            }
        } else if (mode === "multiend") {
            this.mps = new MultiPlayerSocket(this);
            this.mps.uid = this.players[0].uid;
            this.mps.ws.onopen = function () {//链接创建成功回调
                outer.mps.send_create_player(outer.root.settings.username);
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
}