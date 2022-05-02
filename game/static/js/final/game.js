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
            </div>
        </div>
        `);
        this.root.$sszz_game.append(this.$menu);
        this.$single = this.$menu.find('.sszz-game-menu-buttonfield-item-single');
        this.$multi = this.$menu.find('.sszz-game-menu-buttonfield-item-multiplay');
        this.$setting = this.$menu.find('.sszz-game-menu-buttonfield-item-setting');
        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single.click(function () {
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi.click(function () {
            console.log("click multi button");
        });
        this.$setting.click(function () {
            console.log("click setting button");
        });
    }

    show() {
        //显示menu
        this.$menu.show();
    }

    hide() {
        //隐藏menu
        this.$menu.hide();
    }
}class SSZZGamePlayground {
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
}class SSZZGame {
    constructor(id) {
        this.id = id;
        this.$sszz_game = $('#' + id);
        this.menu = new SSZZGameMenu(this);
        this.playground = new SSZZGamePlayground(this);

        this.start();
    }

    start() {

    }
}