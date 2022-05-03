class SSZZGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
        <div class="sszz-game-playground">
        </div>`);
        this.hide();
        this.root.$sszz_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "lightblue", this.height * 0.15, false));
        }

        this.start();
    }

    start() {
    }

    update() {

    }

    show() {
        //打开playground
        this.$playground.show();
    }
    hide() {
        this.$playground.hide();
    }
}