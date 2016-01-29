var express = require('express');
var app = express();
var server = require('http').Server(app);
var index = require('./routes/index');
var Primus = require('primus.io');
var io = require('socket.io');
var connect = require('connect');
var replify = require('replify');

app.use('/', index);

var port = process.env.PORT || 5000;
// create primus ws
//var primus = new Primus(server, { transformer: 'websockets', parser: 'JSON'});
var room = io.listen(server);
var connectedList = [];
var round;
var arraySorter = function(array, string, sortAscending) {
    if(sortAscending == undefined) sortAscending = true;

    if(sortAscending) {
        array.sort(function (a, b) {
            return a[string] > b[string];
        });
    }
    else {
        array.sort(function (a, b) {
            return a[string] < b[string];
        });
    }
};


room.on('connection', function(socket){
    var optionArray = [];
    room.sockets.emit('entrance', {message: 'welcome to the lobby'});

    socket.on('login', function(data){

        var connectedPerson = ({'option': data.option, 'id':socket.id});
        connectedList.push(connectedPerson);
        console.log(connectedList);
    });

    socket.on('disconnect', function(){
        room.sockets.emit('exit', {message: 'someone has left'});
    });
    socket.on('callAccepted', function(){
        round = 4;
        room.sockets.emit('accepted');
    });

    socket.on('call', function (data) {
        round = 0;
        arraySorter(connectedList, 'option', true);
        if (connectedList.length <=1){
            var id= connectedList[0].id;
            room.to(id).emit('unavailable')
        } else{
            var id = connectedList[0].id;
            console.log('sent');
            room.to(id).emit('invite', {link: '#videochat'});
        }



    });

    socket.on('noAnswer', function(data){
        arraySorter(connectedList, 'option', true);
        console.log(data.option);
        if(round <=2) {
            for (var i = 0; i < connectedList.length; i++) {
                if (data.option == connectedList[i].option) {
                    var nextCall= 0;
                    nextCall = i + 1;
                }
            }
            if (connectedList[nextCall].option == 'visitor') {
                var id = connectedList[0].id;
                room.to(id).emit('invite', {link: "#videochat"});
                console.log(round);
                round++;
                console.log(round);
            } else {
                console.log(nextCall);
                var id = connectedList[nextCall].id;
                room.to(id).emit('invite', {link: '#videochat'})
            }
        }
        else if(round>2) {
            var id = connectedList[(connectedList.length-1)]
            room.to(id).emit('unavailable');
        }
    });

    socket.on('getOptions', function(){
        optionArray=[];
        for (var j=0; j<=connectedList.length-1; j++){
            optionArray.push(connectedList[j].option);
        }
        socket.emit('optionArray', {array: optionArray});
    })

});

//create the switchboard
var switchboard = require('rtc-switchboard')(server);

//// we need to expose the primus library
//app.get(Primus, switchboard.library());
//
//
//
//replify({
//    name: 'switchboard',
//    app: switchboard,
//    contexts: {
//        server: server
//    }
//});
//
switchboard.on('room:create', function(room) {
    console.log('room ' + room + ' created, now have ' + switchboard.rooms.length + ' active rooms');
});

switchboard.on('room:destroy', function(room) {
    console.log('room ' + room + ' destroyed, ' + switchboard.rooms.length + ' active rooms remain');

    if (typeof gc == 'function') {
        console.log('gc');
        gc();
    }
});
server.listen(port, function(err) {
    if (err) {
        return;
    }

    console.log('server listening on port: ' + port);
});
module.exports = app;
