class Settings {
    constructor(root) {
        this.root = root;
        this.username = "";
        this.photo = "";
        this.$settings = $(`
        <div class="sszz-game-settings">
            <div class="sszz-game-settings-login">
                <div class="sszz-game-settings-title">
                    登录
                </div>
                <div class="sszz-game-settings-errormessage">
                </div>
                <div class="sszz-game-settings-username">
                    <div class="sszz-game-settings-item">
                        <input type="text" placeholder="用户名">
                    </div>
                </div>
                <div class="sszz-game-settings-password">
                    <div class="sszz-game-settings-item">
                        <input type="password" placeholder="密码">
                    </div>
                </div>
                <div class="sszz-game-settings-submit">
                    <div class="sszz-game-settings-item sszz-game-settings-item-login">
                        <button>登录</button>
                    </div>
                </div>
                <div class="sszz-game-settings-submit">
                    <div class="sszz-game-settings-item sszz-game-settings-item-register">
                        <button>注册</button>
                    </div>
                </div>
            </div>
            <div class="sszz-game-settings-register">
                <div class="sszz-game-settings-title">
                    注册
                </div>
                <div class="sszz-game-settings-errormessage">

                </div>
                <div class="sszz-game-settings-username">
                    <div class="sszz-game-settings-item">
                        <input type="text" placeholder="用户名">
                    </div>
                </div>
                <div class="sszz-game-settings-password">
                    <div class="sszz-game-settings-item">
                        <input type="password" placeholder="密码">
                    </div>
                </div>
                <div class="sszz-game-settings-password sszz-game-settings-password-confirm">
                    <div class="sszz-game-settings-item">
                        <input type="password" placeholder="确认密码">
                    </div>
                </div>
                <div class="sszz-game-settings-submit">
                    <div class="sszz-game-settings-item sszz-game-settings-item-register">
                        <button>注册</button>
                    </div>
                </div>
                <div class="sszz-game-settings-submit">
                    <div class="sszz-game-settings-item sszz-game-settings-item-login">
                        <button>返回登录</button>
                    </div>
                </div>
            </div>
        </div>
        `);
        this.$login = this.$settings.find(".sszz-game-settings-login");
        this.$login_username = this.$login.find(".sszz-game-settings-username input");
        this.$login_password = this.$login.find(".sszz-game-settings-password input");
        this.$login_submit = this.$login.find(".sszz-game-settings-item-login button");
        this.$login_errormessage = this.$login.find(".sszz-game-settings-errormessage");
        this.$login_register = this.$login.find(".sszz-game-settings-item-register button");
        this.$login.hide();

        this.$register = this.$settings.find(".sszz-game-settings-register");
        this.$register_username = this.$register.find(".sszz-game-settings-username input");
        this.$register_password = this.$register.find(".sszz-game-settings-password input");
        this.$register_password_confirm = this.$register.find(".sszz-game-settings-password-confirm input");
        this.$register_submit = this.$register.find(".sszz-game-settings-item-register button");
        this.$register_errormessage = this.$register.find(".sszz-game-settings-errormessage");
        this.$register_login = this.$register.find(".sszz-game-settings-item-login button");

        this.$register.hide();
        this.root.$sszz_game.append(this.$settings);
        this.start();
    }

    listening_events() {
        let outer = this;
        this.$login_register.click(function () {
            outer.register();
        })
        this.$register_login.click(function () {
            outer.login();
        })
        this.$login_submit.click(function () {
            outer.login_remote();
        })
        this.$register_submit.click(function () {
            outer.register_remote();
        })
    }

    login() {
        this.$register.hide();
        this.$login.show();
    }

    register() {
        this.$login.hide();
        this.$register.show();
    }

    login_remote() {
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_errormessage.empty();
        let outer = this;
        $.ajax({
            url: "https://app2347.acapp.acwing.com.cn/settings/gamelogin/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_errormessage.html(resp.result);
                }
            }
        })
    }

    register_remote() {
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let confirm_password = this.$register_password_confirm.val();
        this.$register_errormessage.empty();
        let outer = this;
        $.ajax({
            url: "https://app2347.acapp.acwing.com.cn/settings/gameregister/",
            type: "GET",
            data: {
                username: username,
                password: password,
                confirm_password: confirm_password,
            },
            success: function (resp) {
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$register_errormessage.html(resp.result);
                }
            }
        })
    }

    logout_remote() {
        let outer = this;
        $.ajax({
            url: "https://app2347.acapp.acwing.com.cn/settings/gamelogout/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                }
            }
        })
    }

    getinfo() {
        let outer = this;
        $.ajax({
            url: "https://app2347.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            async: false,
            success: function (resp) {
                if (resp.result === "success") {

                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();

                } else {
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }

    start() {
        this.getinfo();
        this.listening_events();
    }
}