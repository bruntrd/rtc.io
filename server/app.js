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
var callerId1;
var callerId2;
var numClients = 0;
var inCall=[];
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

    //lobby Sockets
    room.sockets.emit('entrance', {message: 'welcome to the lobby'});

    socket.on('login', function(data){
        var push =false;
        var connectedPerson = ({'option': data.option, 'id':socket.id});
        console.log('person trying to login ' + connectedPerson.option, connectedPerson.id);
        console.log(connectedList.length);
        if (connectedList.length==0){
            connectedList.push(connectedPerson);
            push = true;
        } else {
            for (var l = 0; l < connectedList.length; l++) {
                if (connectedPerson.option == connectedList[l].option && connectedPerson.id != connectedList[l].id) {
                    connectedList[l].splice(l, 1);
                    connectedList.push(connectedPerson);
                    push = true;
                    break;
                }
            }
        }
        for (var j = 0; j<connectedList.length; j++){
            if (connectedPerson.option == connectedList[j].option && connectedPerson.id == connectedList[j].id){
                push = true;
            }
        }
        if (push==false){
            connectedList.push(connectedPerson);
        }
        room.to(socket.id).emit('keepConnected');

        console.log(connectedList);
    });

    socket.on('stayConnected', function(data){
        room.to(socket.id).emit('keepConnected');
    });

    socket.on('disconnect', function(){
        for (var j= 0;j<connectedList.length;j++){
            if (socket.id == connectedList[j].id){
                //room.sockets.emit('exit', {who: connectedList[j].option});
                connectedList.splice(j,1);
            }
        }
        numClients = 0;
    });
    socket.on('callAccepted', function(data){
        console.log('call accepted option ' + data.option);
        for (var j= 0;j<connectedList.length;j++){
            if (socket.id == connectedList[j].id){
                //room.sockets.emit('exit', {who: connectedList[j].option});
                connectedList.splice(j,1);
            }
        }
        callerId2 = socket.Id;
        room.sockets.emit('accepted');
    });

    socket.on('call', function (data) {
        var id;
        round = 0;
        inCall = [];
        arraySorter(connectedList, 'option', true);
        if (connectedList.length < 1){
            room.sockets.emit('unavailable')
        } else{
            room.to(connectedList[0].id).emit('invite', {link: 'videochat'});
        }

    });

    socket.on('noAnswer', function(data){

        if(round <2) {
            for (var j = 0; j < connectedList.length; j++) {
                if (data.option == connectedList[j].option) {
                    var nextCall= 0;
                    nextCall = j + 1;
                }
            }
            if (nextCall >= connectedList.length) {
                var id = connectedList[0].id;
                room.to(id).emit('invite', {link: "#videochat"});
                console.log('round before increment ' + round);
                round++;
                console.log('round after increment ' +round);
            } else {
                console.log(nextCall);
                var id = connectedList[nextCall].id;
                room.to(id).emit('invite', {link: '#videochat'})
            }
        }
        else if(round>=2) {
            console.log('round is greater' + round)
            var id = connectedList[(connectedList.length-1)]
            room.to(id).emit('unavailable');
        }
    });

    socket.on('getOptions', function(){
        optionArray=[];
        for (var j=0; j<connectedList.length; j++){
            optionArray.push(connectedList[j].option);
        }
        socket.emit('optionArray', {array: optionArray});
    });
    
    //video sockets

    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
    });

    socket.on('chat', function(message) {
        socket.broadcast.emit('chat', message);
    });

    socket.on('create or join', function(receptionRoom) {
        inCall.push(socket.id);
        console.log(inCall);


        console.log(numClients);
        console.log(receptionRoom);

        if (numClients === 0) {
            socket.join(receptionRoom);
            socket.emit('created', receptionRoom);
        } else if (numClients == 1) {

            room.sockets. in (receptionRoom).emit('join', receptionRoom);
            socket.join(receptionRoom);
            socket.emit('joined', receptionRoom);
        } else {
            socket.emit('full', receptionRoom);
        }
        socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
        socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
        numClients = numClients + 1;

    });

    socket.on('endCall', function(data){
        console.log(inCall.length);
        var id;
        if (socket.id == inCall[0]){
            id = inCall[1];
        } else{
            id = inCall[0];
        }
        numClients = 0;

        room.to(id).emit('redirect', {whatever: 'redirecting'})


    })

});





server.listen(port, function(err) {
    if (err) {
        return;
    }

    console.log('server listening on port: ' + port);
});
module.exports = app;
