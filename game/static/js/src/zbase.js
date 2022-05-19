export class SSZZGame {
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