class SSZZGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
        <div class="sszz-game-playground">
            <div class="sszz-game-playground-buttonfield">
                <div class="sszz-game-playground-buttonfield-item sszz-game-playground-buttonfield-item-return">
                    返回主界面
                </div>
            </div>
        </div>`);
        this.$return = this.$playground.find('.sszz-game-playground-buttonfield-item-return');
        this.hide();
        this.root.$sszz_game.append(this.$playground);
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    update() {

    }

    add_listening_events() {
        let outer = this;
        this.$return.click(function () {
            console.log("click return")
            outer.hide();
            outer.root.menu.show();
        })
    }

    show() {
        //打开playground
        this.$playground.show();
    }
    hide() {
        this.$playground.hide();
    }
}