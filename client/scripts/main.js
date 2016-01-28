var myApp = angular.module('myApp', ['ngRoute', 'appControllers', 'ngAudio']);

var appControllers= angular.module('appControllers', []);

myApp.config(['$routeProvider', function($routeProvider){
    $routeProvider.
    when('/lobby', {
        templateUrl: "/assets/views/routes/lobby.html",
        controller: "LobbyController"
    }).
    when('/videochat', {
        templateUrl: "/assets/views/routes/videochat.html",
        controller: "VideoChatController"
    }).
    otherwise({
        redirectTo: "/lobby"
    });

}]);

