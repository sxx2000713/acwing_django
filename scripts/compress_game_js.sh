#! /bin/bash
JS_PATH=/home/sxx_django/acapp/game/static/js/
JS_PATH_FINAL=${JS_PATH}final/
JS_PATH_SRC=${JS_PATH}src/

find $JS_PATH_SRC -type f -name '*.js' | sort | xargs cat > ${JS_PATH_FINAL}game.js
echo yes | python3 manage.py collectstatic
