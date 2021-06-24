## Ithub tasks - чтобы студенты могли следить за своими задачами и событиями
### Как сделать JSON с парами

В WSL консоли в корневой папке проекта:

    cd parser
    mkdir output
    npm install
    node parser_v2.js

Полученные JSON будут лежать в папке parser/output

### Как запустить проект
Всё как обычно с питоном - сначала venv

    python3 -m venv venv
    source venv/bin/activate

Потом зависимости

    pip install -r req.txt

Запуск

    export FLASK_APP=lessons.py
    flask run

### Где посмотреть модель БД
В папке "db sources" лежит DDL, модель для MySQL-WB и картинки 
