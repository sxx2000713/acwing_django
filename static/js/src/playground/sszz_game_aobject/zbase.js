let SSZZ_GAME_OBJECTS = [];

class SSZZGameObject {
    constructor() {
        SSZZ_GAME_OBJECTS.push(this);

        this.has_start = false; //是否执行start
        this.deltatime = 0; //当前帧距离上一帧的距离
        this.uid = this.create_uid();
    }

    create_uid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
    }

    start() {//创建一个新对象

    }

    update() { //每帧执行一次

    }

    on_destory() {//删掉一个物体前的收尾工作

    }

    destory() {
        this.on_destory();

        for (let i = 0; i < SSZZ_GAME_OBJECTS.length; i++) {
            if (SSZZ_GAME_OBJECTS[i] === this) {
                SSZZ_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }


}

let last_timestamp; // 不需要初始化，第一次执行不会用到，后面用到时已经有值
let SSZZ_GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < SSZZ_GAME_OBJECTS.length; i++) {
        let obj = SSZZ_GAME_OBJECTS[i];
        if (!obj.has_start) {
            obj.start();
            obj.has_start = true;
        } else {
            obj.deltatime = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(SSZZ_GAME_ANIMATION);
}

requestAnimationFrame(SSZZ_GAME_ANIMATION);