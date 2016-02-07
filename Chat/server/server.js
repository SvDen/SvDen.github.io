var WebSocketServer = new require('ws');

var clients = {};
var database = require('./db');
database = new database;

var webSocketServer = new WebSocketServer.Server({
    port: 8080,
});

webSocketServer.on('connection', function(ws) {
    var id = Math.random();
    database.addUser(id, ws);
    log('новое соединение ' + id);
    // обновляем количество людей в чате, $ используем как маску

    ws.on('message', function(message) {
        if (message == '') return;
        log('получено сообщение от ' + database.getName(id) + ': ' + message);
        if (message.charAt(0) == '/') {
            database.command(id, message.slice(1));
            return;
        }
        database.sendMessage(id, message);
    });

    ws.on('close', function() {
        var name = database.getName(id);
        log('cоединение закрыто ' + id + ', пользователь ' + name + ' покинул чат.');
        database.deleteUser(id);
        database.sendServiceMessage(name + ' покинул чат.');
        database.sendServiceMessage('$' + Object.keys(clients).length);
    });
});

function log(string) {
    var date = new Date();
    console.log('('
        + ('0' + date.getHours()).slice(-2) + ':'
        + ('0' + date.getMinutes()).slice(-2) + ':'
        + ('0' + date.getSeconds()).slice(-2)
        + ') '
        + string);
}

console.log('Server running on port process.env.PORT');

