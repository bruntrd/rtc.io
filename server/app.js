var express = require('express');
var app = express();
var server = require('http').Server(app);
var index = require('./routes/index');
var Primus = require('primus.io');
var io = require('socket.io');
var connect = require('connect');


app.use('/', index);

var port = process.env.PORT || 5000;

// create primus ws
//var primus = new Primus(server, { transformer: 'websockets', parser: 'JSON'});
var room = io.listen(server);

room.on('connection', function(socket){
    var count = 0;
    room.sockets.emit('entrance', {message: 'a new person has entered.'});

});

// create the switchboard
//var switchboard = require('rtc-switchboard')(server);

// we need to expose the primus library
//app.get('/rtc.io/primus.js', switchboard.library());



//replify({
//    name: 'switchboard',
//    app: switchboard,
//    contexts: {
//        server: server
//    }
//});

//switchboard.on('room:create', function(room) {
//    console.log('room ' + room + ' created, now have ' + switchboard.rooms.length + ' active rooms');
//});
//
//switchboard.on('room:destroy', function(room) {
//    console.log('room ' + room + ' destroyed, ' + switchboard.rooms.length + ' active rooms remain');
//
//    if (typeof gc == 'function') {
//        console.log('gc');
//        gc();
//    }
//});
server.listen(port, function(err) {
    if (err) {
        return;
    }

    console.log('server listening on port: ' + port);
});
module.exports = app;