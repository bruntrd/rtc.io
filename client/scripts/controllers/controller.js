
myApp.controller('HomeController', ['$scope', function($scope){
    console.log('home controller');

}]);
myApp.controller('LobbyController', ['$scope', function($scope){
    console.log('lobby controller');
    $scope.whatever = [];
    $scope.callFunction = function(){
        socket.emit('call', {call: 'call has been made'});
    };
    $scope.loginFunction = function(){
        socket.emit('login', {option: 'option1'});
    };
    var socket = io.connect('http://localhost:5000');
    socket.on('entrance', function (data) {
        console.log('person has entered');
    });
    socket.on('exit', function (data){
        console.log('someone has left');
    });
    socket.on('call', function (data){
        console.log('a call has been made');
        var whatevs = $("<div>").css("color", "black").text(data.message);
    });
    socket.on('invite', function(data){
        console.log('you have been invited' + data.link);
        var invite = $("<div><a href ='#videochat'>Click here to join</a></div>");
        $("body").append(invite);

    });




}]);
myApp.controller('VideoChatController', ['$scope', function($scope){
    console.log('videochat controller');
    //Set RTC options.
    var rtcOpts = {
        room: 'test-room',
        signaller: 'https://switchboard.rtc.io'
    };
// call RTC module
    var rtc = RTC(rtcOpts);
// A div element to show our local video stream
    var localVideo = document.getElementById('l-video');
// A div element to show our remote video streams
    var remoteVideo = document.getElementById('r-video');
// A contenteditable element to show our messages
    var messageWindow = document.getElementById('messages');

// Bind to events happening on the data channel
    function bindDataChannelEvents(id, channel, attributes, connection) {

        // Receive message
        channel.onmessage = function (evt) {
            messageWindow.innerHTML = evt.data;
        };

        // Send message
        messageWindow.onkeyup = function () {
            channel.send(this.innerHTML);
        };
    }

// Start working with the established session
    function init(session) {
        session.createDataChannel('chat');
        session.on('channel:opened:chat', bindDataChannelEvents);
    }

// Display local and remote video streams
    localVideo.appendChild(rtc.local);
    remoteVideo.appendChild(rtc.remote);

// Detect when RTC has established a session
    rtc.on('ready', init);
}]);
