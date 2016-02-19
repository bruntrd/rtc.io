var fs= require('fs');
var https = require('https');

var express = require('express');
var app = express();

var options = {
    key: fs.readFileSync('./ssl/31499481-avi9csjww1.key'),
    cert: fs.readFileSync('./ssl/31499481-avi9csjww1.cert')
};

var server = https.createServer(options, app);
var index = require('./routes/index');
var room = require('socket.io')(server);

app.use('/', index);

var port = 443;
//var room = io.listen(server);
var connectedList = [];
var round;
var callerId1;
var callerId2;
var tookCallOption = '';
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
    console.log('connected ' + socket.id);
    room.sockets.emit('entrance', {message: 'welcome to the lobby'});

    socket.on('relogIn', function(data){
        console.log(socket.id, tookCallOption);
        if (tookCallOption != ''){
            room.to(socket.id).emit('tookCall', {option: tookCallOption});
            tookCallOption = '';
        }
        else {
            console.log('must be a new log in');
        }
    });

    socket.on('login', function(data){
        var push =false;
        var connectedPerson = ({'option': data.option, 'id':socket.id});
        console.log('person trying to login ' + connectedPerson.option, connectedPerson.id);
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
        console.log('server staying connected');
        setTimeout(function(){room.to(socket.id).emit('keepConnected')},20000);
    });

    socket.on('disconnect', function(){
        console.log('who disconneted' + socket.id);
        for (var j= 0;j<connectedList.length;j++){
            if (socket.id == connectedList[j].id){
                //room.sockets.emit('exit', {who: connectedList[j].option});
                connectedList.splice(j,1);
            }
        }
        if (socket.id == inCall[1]){
            console.log('in call is ' + inCall[0]);
            room.to(inCall[0]).emit('redirect');
            numClients = 0;
        } else if(socket.id ==inCall[0]){
            console.log('theKiosk has been disconnected');
            numClients = 0;
        }

    });
    socket.on('callAccepted', function(data){
        for (var j= 0;j<connectedList.length;j++){
            if (socket.id == connectedList[j].id){
                //room.sockets.emit('exit', {who: connectedList[j].option});
                connectedList.splice(j,1);
            }
        }
        tookCallOption = data.option;
        console.log(tookCallOption);
        callerId2 = socket.id;
    });

    socket.on('call', function (data) {
        var id;
        round = 0;
        inCall = [];
        arraySorter(connectedList, 'option', true);
        if (connectedList.length < 1){
            setTimeout(function(){room.sockets.emit('unavailable')}, 4000);
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
                round++;
            } else {
                console.log(nextCall);
                var id = connectedList[nextCall].id;
                room.to(id).emit('invite', {link: '#videochat'})
            }
        }
        else if(round>=2) {
            room.sockets.emit('unavailable');
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


        console.log('consolelogging receptionroom arugment ' + receptionRoom);

        if (numClients === 0) {
            socket.join(receptionRoom);
            socket.emit('created', receptionRoom);
        } else if (numClients == 1) {

            room.sockets. in (receptionRoom).emit('join', receptionRoom);
            room.sockets. in (receptionRoom).emit('sendSomething');
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