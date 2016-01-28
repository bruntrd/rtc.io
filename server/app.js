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
var i;
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
var sendCall = function(){
    //for (var i=0; i<=connectedList.length-1; i++){
        console.log(connectedList[i].option);
        if (connectedList[i].option == "option1"){
            var id = connectedList[i].id;
            console.log(id);
            console.log('something');
            room.to(id).emit('invite', {link: '#VideoChat'})
        }
        else if(connectedList[i].option == "option2"){
            var id = connectedList[i].id;
            console.log(id);
            console.log('something');
            room.to(id).emit('invite', {link: '#VideoChat'})
        }
        else if(connectedList[i].option == "option3"){
            var id = connectedList[i].id;
            console.log(id);
            console.log('something');
            room.to(id).emit('invite', {link: '#VideoChat'})
        }
        else if(connectedList[i].option == "option4"){
            var id = connectedList[i].id;
            console.log(id);
            console.log('something');
            room.to(id).emit('invite', {link: '#VideoChat'})
        }
        else if(connectedList[i].option == "option5"){
            var id = connectedList[i].id;
            console.log(id);
            console.log('something');
            room.to(id).emit('invite', {link: '#VideoChat'})
        }
        else if(connectedList[i].option == "option6"){
            var id = connectedList[i].id;
            console.log(id);
            console.log('something');
            room.to(id).emit('invite', {link: '#VideoChat'})
        }
        else {
            console.log('must be the kiosk');
        }

    i++;
    console.log(i);
    if(i < connectedList.length) {
        setTimeout(sendCall, 7000);
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

    socket.on('call', function (data) {
        arraySorter(connectedList, 'option', true);
        console.log('after sort' + connectedList);
        i = 0;
        sendCall();


        //room.sockets.emit('call', {message: '# ' + data.call})
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
