## Ithub tasks - чтобы студенты могли следить за своими задачами и событиями
### Как сделать JSON с парами
Берешь сначал укропу потом кошачью... так 

В WSL консоли в корневой папке проекта:

    cd parser
    npm install
    mkdir output
    node parser_v2.js

Полученные JSON будут лежать в папке parser/output

### Собственно задачи
* Для начала надо заполнить базу на основе тех данных, что есть в JSON, там много пропущенных данных, но пока что пофиг, потом будем править через админку
* Админка, если с Максом напишете, пока я уехал, будет очень здорово. Её можно на чистом HTML5, чтобы просто был route у фласка
* Ну и restfull API, чтобы можно было CRUD и ещё различные штуки, типа добавить/убрать пользователя из команды и так далее