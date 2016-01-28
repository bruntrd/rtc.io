myApp.controller('HomeController', ['$scope', function($scope,ngAudio){
    console.log('home controller');
    $scope.sound = function() {
        var audio = ngAudio.load("http://static1.grsites.com/archive/sounds/birds/birds007.wav");
        audio.play();
    }

}]);
myApp.controller('LobbyController', ['$scope', function($scope){
    console.log('lobby controller');
    //Variables
    var socket = io.connect('http://localhost:5000');
    $scope.option = '';
    $scope.kiosk = false;
    $scope.user = false;
    $scope.options=['kiosk', 'option1', 'option2', 'option3', 'option4', 'option5', 'option6'];
    $scope.newArray=[];
    $scope.loggedIn = false;
    $scope.quickFunction = function(){
        console.log('before this?');
    };
    //Socket Events
    socket.on('optionArray', function(data){
        console.log(data);
        $scope.newArray =[];
        $scope.newArray = data.array;
        //console.log($scope.newArray);
        for(var i=0; i < $scope.options.length;i++){
            for(var j=0; j < $scope.newArray.length; j++){
                if ($scope.options[i] == $scope.newArray[j]){
                    //console.log('newarray at j ' +$scope.newArray[j]);
                    $scope.options.splice(i,1);
                }
            }
        }
        console.log('does it happen to late');
    });
    socket.on('entrance', function (data) {
        //console.log('person has entered');
    });
    socket.on('exit', function (data){
        //console.log('someone has left');
    });
    socket.on('call', function (data){
        console.log('a call has been made');
        var whatevs = $("<div>").css("color", "black").text(data.message);
        $("body").append
    });
    socket.on('invite', function(data){
        console.log('you have been invited' + data.link);
        var invite = $("<div><a href ='#videochat'>Click here to join</a></div>");
        $("body").append(invite);

    });

    //Functions
    $scope.kioskLogin = function(){
        $scope.getOptions();
        $scope.kiosk = !$scope.kiosk;
    };
    $scope.getOptions = function(){
        socket.emit('getOptions');
    };

    $scope.callFunction = function(){
        socket.emit('call', {call: 'call has been made'});
    };
    $scope.loginFunction = function(option){
        console.log(option);
        $scope.loggedIn = !$scope.loggedIn;
        socket.emit('login', {option: option});
        if (option == "kiosk"){
            $scope.kiosk = !$scope.kiosk;
        } else{
            $scope.user = !$scope.user;
        }

    };

    //Functions ran on page load
    $scope.getOptions();





}]);
myApp.controller('VideoChatController', ['$scope', function($scope){
    console.log('videochat controller');
    //Set RTC options.
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
