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
    room.sockets.emit('entrance', {message: 'welcome to the lobby'});

    socket.on('login', function(data){

        var connectedPerson = ({'option': data.option, 'id':socket.id});
        connectedList.push(connectedPerson);
        console.log(connectedList);
        if(data.option =='visitor'){
            callerId1 = socket.id;
        }
    });

    socket.on('disconnect', function(){
        room.sockets.emit('exit', {message: 'someone has left'});
    });
    socket.on('callAccepted', function(){
        callerId2 = socket.Id;
        room.sockets.emit('accepted');
    });

    socket.on('call', function (data) {
        round = 0;
        inCall = [];
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
    });
    
    //video socket info

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
        var id;
        if (socket.id == inCall[0]){
            id = inCall[1];
        } else{
            id = inCall[0];
        }
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
