function database() {
    var clients = {};

    /** Блок системных команд **/
    var serviceCommands = {
        setName: changeName,
        help: help,
        info: info,
    };

    function info(userID) {
        info.info = '"/info" — информация о чате';
        sendDirectMessage(userID, 'Супер-чат версии 0.2.0 бета. ' +
            'Учебная работа для тестирования технологии WebSocket. ' +
            'Created by SvDen.')
    }

    function help(userID) {
        sendDirectMessage(userID, '-'.repeat(20));
        // выводим информацию для всех команд, у которых есть соотв. поле
        for (var key in serviceCommands) {
            if (serviceCommands[key].info) sendDirectMessage(userID, serviceCommands[key].info)
        }
        sendDirectMessage(userID, 'Список команд: ');
        sendDirectMessage(userID, '-'.repeat(20));
    }

    function changeName(userID, newName) {
        // использование функции как объекта позволяет добавлять поля вроде этого.
        changeName.info = '"/setName ник" — изменить ваш ник на другой';
        if (clients[userID].name == '') {
            sendDirectMessage(userID, 'Добро пожаловать в лучший в мире чат! ' +
                'Чтобы увидеть список доступных команд, введите "/help"');
            if (newName == 'null' || newName == '') {
                sendDirectMessage(userID, 'Вам присвоено имя "Guest"');
                clients[userID].name = 'Guest';
                // и тут же вызываем функцию ещё раз, чтобы вызвать сообщение
                sendServiceMessage(clients[userID].name + ' online.');
            } else {
                clients[userID].name = newName;
                sendServiceMessage(newName + ' online.');
            }
            return;
        }
        sendServiceMessage(clients[userID].name + ' изменил имя на ' + newName);
        clients[userID].name = newName;
    }
    /*** Конец блока системных команд ***/

    function addUser(userID, ws) {
        clients[userID] = {
            ws: ws,
            name: ''
        };
        sendServiceMessage('$' + Object.keys(clients).length);
        sendServiceMessage('Аноним вошел в чат');
    }

    function sendDirectMessage(userID, mes) {
        clients[userID].ws.send(mes);
    }

    function sendServiceMessage(mes) {
        for (var key in clients) {
            clients[key].ws.send(mes);
        }
    }

    function sendMessage(userID, mes) {
        for (var key in clients) {
            clients[key].ws.send(clients[userID].name + ': ' + mes);
        }
    }

    function deleteUser(userID) {
        delete clients[userID];
    }

    function parseCommands(userID, inputString) {
        var command = inputString.split(' ')[0];
        var message = inputString.split(' ')[1];
        if (serviceCommands[command]) {
            serviceCommands[command](userID, message);
        } else {
            sendDirectMessage(userID, 'Команда введена неверно.');
        }
    }

    this.command = parseCommands;
    this.addUser = addUser;
    this.sendMessage = sendMessage;
    this.deleteUser = deleteUser;
    this.sendServiceMessage = sendServiceMessage;
    this.getName = function(userID) {
        return clients[userID].name;
    }
}

module.exports = database;