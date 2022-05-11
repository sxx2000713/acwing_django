class ChatField {
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
}