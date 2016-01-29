var myApp = angular.module('myApp');

myApp.controller('LobbyController', ['$scope','ngAudio', function($scope,ngAudio){
    console.log('lobby controller');
    //Variables
    var socket = io.connect('http://localhost:5000');
    $scope.option = '';
    $scope.kiosk = false;
    $scope.user = false;
    $scope.options=['visitor', 'option1', 'option2', 'option3', 'option4', 'option5', 'option6'];
    $scope.newArray=[];
    $scope.loggedIn = false;
    $scope.link = false;
    $scope.unavailable = false;
    $scope.i = 0;
    $scope.answered = false;

    //Socket Events
    socket.on('optionArray', function(data){
        console.log(data);
        $scope.newArray =[];
        $scope.newArray = data.array;
        for(var i=0; i < $scope.options.length;i++){
            for(var j=0; j < $scope.newArray.length; j++){
                if ($scope.options[i] == $scope.newArray[j]){
                    //console.log('newarray at j ' +$scope.newArray[j]);
                    $scope.options.splice(i,1);
                }
            }
        }
    });
    socket.on('entrance', function (data) {
        //console.log('person has entered');
    });
    socket.on('call', function (data){
        console.log('a call has been made');
        //var whatevs = $("<div>").css("color", "black").text(data.message);
        //$("body").append
    });
    socket.on('invite', function(data){
        console.log('you have been invited' + data.link);
        $scope.incomingCall();
        $scope.soundFunction();
        //var invite = $("<div><button ng-click='receivingCall()'><a href ='#videochat'>Click here to join</a></button></div>");
        //$("body").append(invite);
    });
    socket.on('accepted', function(data){
        $scope.acceptedFunction();
    });
    socket.on('unavailable', function(data){
        $scope.unavailable = !scope.unavailable;
    });
    socket.on('exit', function (data){
        //console.log('someone has left');
    });
    //Functions
    $scope.soundFunction = function(){
        $scope.i++;
        $scope.audio = ngAudio.load('http://www.soundjay.com/phone/sounds/telephone-ring-03a.mp3');
        $scope.audio.play();
        console.log('ring ' + $scope.i);
        if ($scope.i < 4 && $scope.answered == false){
            setTimeout($scope.soundFunction, 6000);
        }
        else if($scope.i>=4 && $scope.answered == false){
            console.log($scope.option);
            socket.emit('noAnswer', {option: $scope.option});
            $scope.i = 0;
            $scope.link = false;
        }
    };
    $scope.incomingCall = function(soundFunction){
        $scope.link = true;
    };
    $scope.receivingCall = function(){
        console.log('i am taking the call');
        socket.emit('callAccepted');
    };
    $scope.kioskLogin = function(){
        $scope.getOptions();
        $scope.kiosk = !$scope.kiosk;
    };
    $scope.acceptedFunction = function(){
        $scope.link=false;
        $scope.answered = true;
    };
    $scope.getOptions = function(){
        socket.emit('getOptions');
    };

    $scope.callFunction = function(){
        socket.emit('call', {call: $scope.option});
    };
    $scope.loginFunction = function(option){
        console.log(option);
        $scope.loggedIn = !$scope.loggedIn;
        socket.emit('login', {option: option});
        if (option == "visitor"){
            $scope.kiosk = !$scope.kiosk;
        } else{
            $scope.user = !$scope.user;
        }

    };

    //Functions ran on page load
    $scope.getOptions();





}]);
myApp.controller('VideoChatController', ['$scope', 'VideoSetup', function($scope,VideoSetup){
    //var socket = io.connect('http://localhost:5000');
    //socket.on('entrance', function(data){
    //    console.log('we see the entrance here as well');
    //})
    console.log('videochat controller');
    VideoSetup.videoFunction();

}]);

myApp.factory('VideoSetup', function(){

    var videoFunction = function(){
        var rtcOpts = {
            room: 'test-room',
            signaller: 'ws://localhost:5000'
        };
// call RTC module
        var rtc = RTC(rtcOpts);
// A div element to show our local video stream
        var localVideo = document.getElementById('l-video');
// A div element to show our remote video streams
        var remoteVideo = document.getElementById('r-video');
// A contenteditable element to show our messages
//        var messageWindow = document.getElementById('messages');

// Bind to events happening on the data channel
        function bindDataChannelEvents(id, channel, attributes, connection) {

            // Receive message
            //channel.onmessage = function (evt) {
            //    messageWindow.innerHTML = evt.data;
            //};
            //
            //// Send message
            //messageWindow.onkeyup = function () {
            //    channel.send(this.innerHTML);
            //};
        }

// Start working with the established session
//        function init(session) {
//            session.createDataChannel('chat');
//            session.on('channel:opened:chat', bindDataChannelEvents);
//        }

// Display local and remote video streams
        console.log(localVideo);
        console.log(remoteVideo);
        console.log(rtc.local);
        console.log(rtc.remote);
        localVideo.appendChild(rtc.local);
        remoteVideo.appendChild(rtc.remote);

// Detect when RTC has established a session
        rtc.on('ready', init);
    };
    return {
        videoFunction: videoFunction
    }

});
