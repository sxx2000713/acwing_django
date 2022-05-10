export class SSZZGame {
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