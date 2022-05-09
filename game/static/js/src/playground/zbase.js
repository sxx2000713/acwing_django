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

    show() {
        //打开playground
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.resize();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, true));
        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "lightblue", 0.15, false));
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