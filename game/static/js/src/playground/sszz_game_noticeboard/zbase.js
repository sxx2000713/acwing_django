class NoticeBoard {
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


}