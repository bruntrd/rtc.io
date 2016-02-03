var myApp = angular.module('myApp');

myApp.controller('HomeController', ['$scope','$location', function($scope) {
    console.log('home controller');
}]);

myApp.controller('AboutController', ['$scope','$location', function($scope) {
    console.log('about controller');
}]);
myApp.controller('LocationsController', ['$scope','$location', function($scope) {
    console.log('locations controller');
}]);
myApp.controller('UserController', ['$scope','$location','ngAudio', function($scope,$location,ngAudio) {
    console.log('user controller');
    //variables
    $scope.option = '';
    $scope.options=['option1', 'option2', 'option3', 'option4', 'option5', 'option6'];
    $scope.i = 0;
    $scope.link = false;
    $scope.answered = false;
    $scope.loggedIn = false;



    //socket events
    var socket = io.connect('http://localhost:5000');

    socket.on('entrance', function (data) {
        //console.log('option value at entrance' + $scope.option);
        //if ($scope.option !== '' && $scope.answered==false){
        //    $scope.loginFunction($scope.option);
        //}
    });
    socket.on('optionArray', function(data){
        var tempArray = data.array;
        console.log(tempArray);
        if (tempArray.length > 0) {
            for (var j = 0; j < tempArray.length; j++) {
                $scope.listChecker(tempArray[j], $scope.options)
            }
        }
    });

    socket.on('keepConnected', function(data){
        $scope.connectionKeeper();
    });

    socket.on('invite', function(data){
        console.log('you have been invited' + data.link);

        $scope.incomingCall();
        $scope.soundFunction();

    });
    socket.on('accepted', function(data){
        $scope.acceptedFunction();
    });

    socket.on('exit', function (data){
        console.log('this id was disconnceted' + data.who);
    });

    //functions

    $scope.loginFunction = function(option){
        //console.log($scope.kiosk, $scope.user);
        console.log(option);
        $scope.loggedIn = true;
        socket.emit('login', {option: option});
        //console.log($scope.kiosk, $scope.user);
    };
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
    $scope.incomingCall = function(){
        $scope.link = true;
    };
    $scope.acceptedFunction = function(){
        $scope.link=false;
        $scope.answered = true;
    };
    $scope.getOptions = function(){
        socket.emit('getOptions');
    };

    $scope.receivingCall = function(){
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
        console.log('keeping connection');
        setTimeout($scope.connectionKeeper, 15000);
    };

    //functions ran on page load

    $scope.getOptions();

}]);



myApp.controller('LobbyController', ['$scope','$location','fromKiosk', function($scope,$location,fromKiosk){
    console.log('lobby controller');
    //Variables
    var socket = io.connect('http://localhost:5000');
    $scope.unavailable = false;

    console.log('option value at page login' + $scope.option);
    //Socket Events

    socket.on('call', function (data){
        console.log('call has been made');
    });

    socket.on('unavailable', function(data){
        $scope.unavailable = !$scope.unavailable;
    });

    //Functions
    $scope.callFunction = function(){
        fromKiosk.fromKiosk = true;
        socket.emit('call', {call: $scope.option});
    };


    //Functions ran on page load






}]);
myApp.controller('VideoChatController', ['$scope','fromKiosk','$route', function($scope,fromKiosk,$route){
    var socket = io.connect('http://localhost:5000');
    //socket.on('entrance', function(data){
    //    console.log('we see the entrance here as well');
    //});
    console.log('videochat controller');
    console.log('from kiosk indicator' + fromKiosk.fromKiosk);
    $scope.kiosk = fromKiosk.fromKiosk;
    console.log('scope.kiosk ' + $scope.kiosk);
    $('#remoteVideo').hide();
    $('#localVideo').hide();

    var localuser;
    var remoteuser;

    var isChannelReady;
    var isInitiator = false;
    var isStarted = false;

    var localVideoStream;
    var remoteVideoStream;
    var pc;

    var isFirefox = false;

    var dataChannel;

    var turnReady;
// var pc_config;
// window.turnserversDotComAPI.iceServers(function(data) {
//    pc_config = {
//  'iceServers': data
// };
// console.log(data);
// });
//Ice Servers Added
    var pc_config = {
        'iceServers': [{
            'url': 'stun:stun.acrobits.cz:3478'
        }]
    };

// pc_constraints is not currently used, but the below would allow us to enforce
// DTLS keying for SRTP rather than SDES ... which is becoming the default soon
// anyway.
    var pc_constraints = {
        'optional': [{
            'DtlsSrtpKeyAgreement': true
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

    var room;
    var user;

    var constraints = {
        audio: true,
        video: true
    };
    $scope.endCall = function(){
        console.log('End Call Fired');
        socket.emit('endCall', {user: 'whatever for now'});
        window.location.href=('#/user');
        var tracks = localVideoStream.getTracks();
        for (var i=0;i<tracks.length;i++){
            tracks[i].stop();
        };
    };
    $scope.sendSomething = function(){
        socket.emit('something');
    };

    $scope.redirect = function(){
        //var tracks = localVideoStream.getTracks();
        //for (var i=0;i<tracks.length;i++){
        //    tracks[i].stop();
        //};
        console.log('redirect?');
        window.location.href=('#/lobby');
    };

    $scope.createConnection = function(){
        user = 'kiosk';
        room = '1';
        socket.emit('create or join', room);

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
    });

    socket.on('redirect', function(data){
        var tracks = localVideoStream.getTracks();
        for (var i=0;i<tracks.length;i++){
            tracks[i].stop();
        };
        console.log('bye');
        $scope.redirect();

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
            pc.setRemoteDescription(new getSessionDescription(message));
            doAnswer();
        } else if (message.type === 'answer' && isStarted) {
            pc.setRemoteDescription(new getSessionDescription(message));
        } else if (message.type === 'candidate' && isStarted) {
            var candidate = getIceCandidate({
                sdpMLineIndex: message.label,
                candidate: message.candidate
            });
            pc.addIceCandidate(candidate);
        } else if (message === 'bye' && isStarted) {
            handleRemoteHangup();
        }
    });

////////////////////////////////////////////////////
// This next section is where we deal with setting
// up the actual components of the communication
// we are interested in using. Starting with the
// video streams
////////////////////////////////////////////////////

    function trace(text) {
        console.log((performance.now() / 1000).toFixed(3) + ": " + text);
    }

    function handleUserMedia(stream) {

        console.log('Adding local stream.');
        localVideo.src = window.URL.createObjectURL(stream);
        localVideoStream = stream;
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
        if (!isStarted && typeof localVideoStream != 'undefined' && isChannelReady) {
            createPeerConnection();
            pc.addStream(localVideoStream);
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
    }



/////////////////////////////////////////////////////////
// Next we setup the data channel between us and the far
// peer. This is bi-directional, so we use the same
// connection to send/recv data. However its modal in that
// one end of the connection needs to kick things off,
// so there is logic that varies based on if the JS
// script is acting as the initator or the far end.
/////////////////////////////////////////////////////////

    function createPeerConnection() {
        try {
            var servers = null;
            pc = new getRTCPeerConnection(servers, {
                optional: [{
                    RtpDataChannels: true
                }]
            });
            pc.onicecandidate = handleIceCandidate;
            pc.onaddstream = handleRemoteStreamAdded;
            pc.onremovestream = handleRemoteStreamRemoved;

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

    function handleRemoteStreamAdded(event) {
        console.log('Remote stream added.');
        remoteVideo.src = window.URL.createObjectURL(event.stream);
        remoteVideoStream = event.stream;
    }

    function handleCreateOfferError(event) {
        console.log('createOffer() error: ', e);
    }

    function doCall() {
        console.log('Sending offer to peer');
        pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
    }

    function doAnswer() {
        console.log('Sending answer to peer.');
        if(isFirefox) {
            pc.createAnswer(setLocalAndSendMessage, handleCreateAnswerError, sdpConstraints);
        }
        else {
            pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
        }
    }

    function setLocalAndSendMessage(sessionDescription) {
        // Set Opus as the preferred codec in SDP if Opus is present.
        sessionDescription.sdp = preferOpus(sessionDescription.sdp);
        pc.setLocalDescription(sessionDescription);
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
        remoteVideoStream = event.stream;
    }

    function handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
    }



    function handleRemoteHangup() {
        console.log('Session terminated.');
        stop();
        isInitiator = false;
    }



// Set Opus as the default audio codec if it's present.
    function preferOpus(sdp) {
        console.log('does any of this happen');

        var sdpLines = sdp.split('\r\n');
        var mLineIndex;
        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                mLineIndex = i;
                break;
            }
        }
        if (mLineIndex === null) {
            return sdp;
        }

        // If Opus is available, set it as the default in m line.
        for (i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000') !== -1) {
                var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                if (opusPayload) {
                    sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                }
                break;
            }
        }

        // Remove CN in m line and sdp.
        sdpLines = removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    function extractSdp(sdpLine, pattern) {
        var result = sdpLine.match(pattern);
        return result && result.length === 2 ? result[1] : null;
    }

// Set the selected codec to the first in m line.
    function setDefaultCodec(mLine, payload) {
        console.log('does any of this happen');

        var elements = mLine.split(' ');
        var newLine = [];
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 3) { // Format of media starts from the fourth.
                newLine[index++] = payload; // Put target payload to the first.
            }
            if (elements[i] !== payload) {
                newLine[index++] = elements[i];
            }
        }
        return newLine.join(' ');
    }
// Strip CN from sdp before CN constraints is ready.
    function removeCN(sdpLines, mLineIndex) {
        console.log('does any of this happen');

        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length - 1; i >= 0; i--) {
            var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                var cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) {
                    // Remove CN payload from m line.
                    mLineElements.splice(cnPos, 1);
                }
                // Remove CN line in sdp
                sdpLines.splice(i, 1);
            }
        }

        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
    }

    $scope.createConnection();
}]);

myApp.factory('fromKiosk', function(){
    var fromKiosk = false;

    return {
        fromKiosk : fromKiosk
    }
});
