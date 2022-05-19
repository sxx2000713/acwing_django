class NoticeBoard {
    constructor(root) {
        this.root = root;
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
            outer.hide();
            outer.root.playground.audio.pause();
            outer.root.menu.show();
        })
        this.$cancel_match.click(function () {
            outer.$waiting_board.hide();
            outer.$match_board.show();
            outer.cancel_match();
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
    }

    hide() {
        this.$noticeboard.hide();
    }

    cancel_match() {
        let mps = this.root.playground.mps
        this.root.playground.hide();
        mps.send_cancel_match(mps.uid);
    }

    start_game() {
        let outer = this;
        this.$waiting_board.hide();
        this.$success_board.show();
        var audio = document.createElement("audio");
        audio.src = "/static/audio/match_success.mp3";
        audio.play();
        setTimeout(function () {
            outer.root.playground.$playground.show();
        }, 3000);
    }

    cancel() {

    }

}