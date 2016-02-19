var myApp = angular.module('myApp');

myApp.controller('HomeController', ['$scope', function($scope) {
    console.log('home controller');
}]);

myApp.controller('AboutController', ['$scope', function($scope) {
    console.log('about controller');
}]);

myApp.controller('ProjectsController', ['$scope', function($scope) {
    console.log('projects controller');
    $scope.myInterval = 8000;
    $scope.slides = [
        {
            image: 'assets/styles/images/aviConferenceRoom.jpg'
        },
        {
            image: 'assets/styles/images/aviCorona.jpg'
        },
        {
            image: 'assets/styles/images/aviNetsmart.jpg'
        },
        {
            image: 'assets/styles/images/aviDigitalMenu.jpeg'
        }
    ];
}]);

myApp.controller('LocationsController', ['$scope', function($scope) {
    console.log('locations controller');

}]);
myApp.controller('UserController', ['$scope','$location','ngAudio','reloader','$window','fromKiosk', function($scope,$location,ngAudio,reloader,$window,fromKiosk) {
    console.log('user controller');
    //variables
    $scope.option = '';
    $scope.options=['option1', 'option2', 'option3', 'option4', 'option5', 'option6'];
    $scope.i = 0;
    $scope.link = false;
    $scope.answered = false;
    $scope.loggedIn = false;
    $scope.reloadCount = reloader.userReloader;
    $scope.audio = ngAudio.load('http://www.soundjay.com/phone/sounds/telephone-ring-03a.mp3');




    console.log('reload count on page load' + $scope.reloadCount);



    //socket events
    var socket = io.connect('https://AVI9CSJWW1', {secure: true});

    socket.on('entrance', function (data) {
        //console.log('option value at entrance' + $scope.option);
        //if ($scope.option !== '' && $scope.answered==false){
        //    $scope.loginFunction($scope.option);
        //}
    });
    socket.on('tookCall', function(data){
        console.log(data.option);
        $scope.option = data.option;
        $scope.loginFunction(data.option);
    });
    socket.on('optionArray', function(data){
        $scope.options=['option1', 'option2', 'option3', 'option4', 'option5', 'option6'];
        var tempArray = data.array;
        console.log(tempArray);
        if (tempArray.length > 0) {
            for (var j = 0; j < tempArray.length; j++) {
                $scope.listChecker(tempArray[j], $scope.options)
            }
        }
    });

    socket.on('keepConnected', function(data){
        console.log('keeping connection');
        setTimeout(function(){socket.emit('stayConnected')},30000);
    });

    socket.on('invite', function(data){
        console.log('you have been invited' + data.link);

        $scope.incomingCall();
        $scope.soundFunction();

    });


    socket.on('exit', function (data){
        console.log('this id was disconnceted' + data.who);
    });

    //functions
    $scope.reloadFunction = function(value){
        if (value == 1){
            console.log('reloading route');
            $window.location.reload();
        } else {
            console.log('didnt run');
        }
        reloader.userReloader = 0;
    };
    $scope.relogIn = function(){
        socket.emit('relogIn');
    };

    $scope.loginFunction = function(option){
        //console.log($scope.kiosk, $scope.user);
        console.log(option);
        $scope.loggedIn = true;
        socket.emit('login', {option: option});
    };
    $scope.soundFunction = function(){
        if ($scope.answered == false){
            $scope.audio.play();
            $scope.i++;
        }
        console.log('ring ' + $scope.i);
        if ($scope.i < 4 && $scope.answered == false){
            setTimeout($scope.soundFunction, 6000);
        }
        else if($scope.i>=4 && $scope.answered == false){
            socket.emit('noAnswer', {option: $scope.option});
            $scope.i = 0;
            $scope.link = false;
        }
    };
    $scope.incomingCall = function(){
        $scope.link = true;
    };

    $scope.getOptions = function(){
        socket.emit('getOptions');
    };

    $scope.receivingCall = function(){
        $scope.link = false;
        $scope.answered = true;
        fromKiosk.fromKiosk = false;
        reloader.userReloader = 1;
        reloader.lobbyReloader = 1;
        console.log('i am taking the call');
        socket.emit('callAccepted', {option: $scope.option});
    };

    $scope.listChecker = function(option,array){
        console.log(option);
        console.log(array);
        for (var l=0; l<array.length;l++){
            if (option == array[l]){
                array.splice(l,1);
            }
        }
    };
    $scope.connectionKeeper = function(){

    };

    //functions ran on page load
    $scope.reloadFunction($scope.reloadCount);
    $scope.relogIn();
    $scope.getOptions();


}]);



myApp.controller('LobbyController', ['$scope','$location','fromKiosk','reloader','$window','$route', function($scope,$location,fromKiosk,reloader,$window,$route){
    console.log('lobby controller');
    //Variables
    var socket = io.connect('https://AVI9CSJWW1', {secure: true});
    $scope.yo = false;
    $scope.reloadCount = reloader.lobbyReloader;


    console.log('reload count on page load' + $scope.reloadCount);
    $scope.reloadFunction = function(value){
        if (value == 1){
            console.log('reloading route');
            $window.location.reload();
        } else {
            console.log('didnt run');
        }
        reloader.lobbyReloader = 0;
    };
    $scope.reloadFunction($scope.reloadCount);

    //Socket Events

    socket.on('call', function (data){
        console.log('call has been made');
    });

    //Functions
    $scope.callFunction = function(){
        //reloader.reloader = 1;
        fromKiosk.fromKiosk = true;
        reloader.lobbyReloader = 1;
        console.log(fromKiosk.fromKiosk, reloader.lobbyReloader);
        socket.emit('call', {call: $scope.option});
    };


    //Functions ran on page load






}]);
myApp.controller('VideoChatController', ['$scope','fromKiosk','$route', 'reloader','$window', function($scope,fromKiosk,$route,reloader,$window){

    //$route.reload();
    console.log('videochat controller');
    console.log('from kiosk indicator ' + fromKiosk.fromKiosk);

    $scope.kiosk = fromKiosk.fromKiosk;
    $scope.unavailable = false;
    $scope.counter = 0;

    $('#remoteVideo').hide();
    $('#localVideo').hide();
    var div;

    var localuser;
    var remoteuser;

    var isChannelReady;
    var isInitiator = false;
    var isStarted = false;

    $scope.localVideoStream;
    $scope.remoteVideoStream;



    var isFirefox = false;
    var dataChannel;
    var turnReady;

//Ice Servers Added
    var pc_config = {
        'iceServers': [{
            'url': 'stun:stun.acrobits.cz:3478'
        }]
    };


// Set up audio and video regardless of what devices are present.
    var sdpConstraints = {
        'mandatory': {
            'OfferToReceiveAudio': true,
            'OfferToReceiveVideo': true
        }
    };

    var localVideo = document.querySelector('#localVideo');
    var remoteVideo = document.querySelector('#remoteVideo');

    $scope.room;

    var socket = io.connect('https://AVI9CSJWW1', {secure: true});

    var constraints = {
        audio: true,
        video: true
    };
    $scope.endCall = function(){
        var tracks = $scope.localVideoStream.getTracks();
        for (var i=0;i<tracks.length;i++) {
            tracks[i].stop();
        }
        $scope.pc.close();
        reloader.lobbyReloader = 1;
        reloader.userReloader = 1;
        socket.emit('endCall', {user: 'whatever for now'});
        window.location.href=('#/user');

    };

    $scope.createConnection = function(){

        $scope.room = '1';
        socket.emit('create or join', $scope.room);
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
        if(navigator.mozGetUserMedia) {
            isFirefox = true;
        }
        if (location.hostname != "localhost") {
            requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
        }
    };

    socket.on('created', function(room) {
        console.log('Created room ' + room);
        isInitiator = true;
    });

    socket.on('full', function(room) {
        console.log('Room' + room + " is full.");
        $scope.yo=false
    });

    socket.on('redirect', function(data){
        var tracks = $scope.localVideoStream.getTracks();
        for (var i=0;i<tracks.length;i++){
            tracks[i].stop();
        }
        //$scope.pc.removeStream($scope.localVideoStream);
        //$scope.pc.removeStream($scope.remoteVideoStream);
        $scope.pc.close();
        reloader.lobbyReloader = 1;
        console.log('bye');
        window.location.href=('#/home');


    });

    socket.on('unavailable', function(data){
        console.log('this aint happening');
        $scope.$apply(function(){
            $scope.kiosk=false;
            $scope.unavailable = true;
            console.log($scope.unavailable);
        });

        reloader.lobbyReloader = 1;
        setTimeout(function(){$window.location.href=('/#lobby')}, 8000);
    });

    socket.on('join', function(room) {
        console.log('Another peer made a request to join room ' + room);
        console.log('This peer is the initiator of room ' + room + '!');
        isChannelReady = true;
    });

    socket.on('joined', function(room) {
        console.log('Room ' + room + ' Successsfully joined.');
        isChannelReady = true;
    });
    socket.on('sendSomething', function(data){
        console.log('sendSomething');
        $scope.$apply(function(){
            $scope.kiosk = false;
        });
    });


    function sendMessage(message) {
        socket.emit('message', message);
    }

    socket.on('message', function(message) {
        if (message === 'Got user media') {
            maybeStart();
        } else if (message.type === 'offer') {
            if (!isInitiator && !isStarted) {
                maybeStart();
            }
            $scope.pc.setRemoteDescription(new getSessionDescription(message));
            if ($scope.counter <1) {
                doAnswer();
            }
        } else if (message.type === 'answer' && isStarted) {
            $scope.pc.setRemoteDescription(new getSessionDescription(message));
        } else if (message.type === 'candidate' && isStarted) {
            var candidate = getIceCandidate({
                sdpMLineIndex: message.label,
                candidate: message.candidate
            });
            $scope.pc.addIceCandidate(candidate);
        } else if (message === 'bye' && isStarted) {
            handleRemoteHangup();
        }


    });
//set up video streams

    function trace(text) {
        console.log((performance.now() / 1000).toFixed(3) + ": " + text);
    }

    function handleUserMedia(stream) {

        console.log('Adding local stream.');
        localVideo.src = window.URL.createObjectURL(stream);
        $scope.localVideoStream = stream;
        sendMessage('Got user media');
        $('#localimg').hide();
        $('#localVideo').show();
        if (isInitiator) {
            maybeStart();
        }
    }

    function handleUserMediaError(error) {
        console.log('navigator.getUserMedia error: ', error);
    }

    function maybeStart() {
        if (!isStarted && typeof $scope.localVideoStream != 'undefined' && isChannelReady) {
            createPeerConnection();
            $scope.pc.addStream($scope.localVideoStream);
            // Add data channels
            //createDataConnection();
            isStarted = true;
            //   console.log('isInitiator', isInitiator);
            if (isInitiator) {
                doCall();
            }
        }
    }

    window.onbeforeunload = function(e) {
        sendMessage('bye');
    };



//setup channel

    function createPeerConnection() {
        try {
            var servers = null;
            $scope.pc = new getRTCPeerConnection(servers, {
                optional: [{
                    RtpDataChannels: true
                }]
            });
            console.log('socket message createPeerConnection begginning ' +$scope.pc.signalingState);

            $scope.pc.onicecandidate = handleIceCandidate;
            $scope.pc.onaddstream = handleRemoteStreamAdded;
            $scope.pc.onremovestream = handleRemoteStreamRemoved;

        } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object.');
            return;
        }
    }

    function getSessionDescription(message) {
        if(isFirefox){
            return new mozRTCSessionDescription(message);
        }
        else{
            return new RTCSessionDescription(message);
        }
    }

    function getIceCandidate(params) {
        if(isFirefox){
            return new mozRTCIceCandidate(params);
        }
        else{
            return new RTCIceCandidate(params);
        }
    }

    function getRTCPeerConnection(params) {
        if(isFirefox){
            return new mozRTCPeerConnection(params);
        }
        else{
            return new webkitRTCPeerConnection(params);
        }
    }


    function handleIceCandidate(event) {
        if (event.candidate) {
            sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } else {
            console.log('End of candidates.');
            $('#remoteimg').hide();
            $('#remoteVideo').show();
        }
    }

    //function handleRemoteStreamAdded(event) {
    //    console.log('Remote stream added.');
    //    remoteVideo.src = window.URL.createObjectURL(event.stream);
    //    $scope.remoteVideoStream = event.stream;
    //}

    function handleCreateOfferError(event) {
        console.log('createOffer() error: ', e);
    }

    function doCall() {
        console.log('Sending offer to peer');
        $scope.pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
    }

    function doAnswer() {
        console.log('begginning of do answer' + $scope.counter);
        //if ($scope.counter < 1){
        console.log('Sending answer to peer.');
            if(isFirefox) {
                $scope.pc.createAnswer(setLocalAndSendMessage, handleCreateAnswerError, sdpConstraints);
            }
            else {
                $scope.pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);

            }
        $scope.counter++;
        console.log('end of do answer' + $scope.counter);

    }

    function setLocalAndSendMessage(sessionDescription) {
        // Set Opus as the preferred codec in SDP if Opus is present.
        //sessionDescription.sdp = preferOpus(sessionDescription.sdp);
        $scope.pc.setLocalDescription(sessionDescription);
        sendMessage(sessionDescription);
    }

    function handleCreateAnswerError(error) {
        console.log('createAnswer() error: ', e);
    }

    function requestTurn(turn_url) {
        var turnExists = false;
        for (var i in pc_config.iceServers) {
            if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
                turnExists = true;
                turnReady = true;
                break;
            }
        }
        if (!turnExists) {
            console.log('Getting TURN server from ', turn_url);
            // No TURN server. Get one from computeengineondemand.appspot.com:
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var turnServer = JSON.parse(xhr.responseText);
                    console.log('Got TURN server: ', turnServer);
                    pc_config.iceServers.push({
                        'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
                        'credential': turnServer.password
                    });
                    turnReady = true;
                }
            };
            xhr.open('GET', turn_url, true);
            xhr.send();
        }
    }

    function handleRemoteStreamAdded(event) {
        console.log('Remote stream added.');
        remoteVideo.src = window.URL.createObjectURL(event.stream);
        $scope.remoteVideoStream = event.stream;
    }

    function handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
    }



    function handleRemoteHangup() {
        console.log('Session terminated.');
        //stop();
        isInitiator = false;
        //$scope.redirect();
    }


    $scope.createConnection();
}]);

myApp.factory('fromKiosk', function(){
    var fromKiosk = false;

    return {
        fromKiosk : fromKiosk
    }
});

myApp.factory('reloader', function(){
    var userReloader;
    var lobbyReloader;

    return {
        reloader : userReloader,
        reloader : lobbyReloader
    }
});