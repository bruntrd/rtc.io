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
var connectedList = [];
function person(option, id){
    this.option = option;
    this.id = id;
}
room.on('connection', function(socket){
    room.sockets.emit('entrance', {message: 'welcome to the lobby'});

    socket.on('login', function(data){

        var connectedPerson = new person(data.option, socket.id);
        connectedList.push(connectedPerson);
        console.log(connectedList);
    });

    socket.on('disconnect', function(){
        room.sockets.emit('exit', {message: 'someone has left'});
    });

    socket.on('call', function (data) {
        for (var i=0; i<=connectedList.length-1; i++){
        console.log('person 1 ' + connectedList[i].option);
            if (connectedList[i].option == "option1"){
                var id = connectedList[i].id
                console.log(id);
                console.log('something');
                room.to(id).emit('invite', {link: '#VideoChat'})
            }
        }
        room.sockets.emit('call', {message: '# ' + data.call})
    });

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