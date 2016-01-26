var myApp = angular.module('myApp', ['ngRoute', 'appControllers']);

var appControllers= angular.module('appControllers', []);

myApp.config(['$routeProvider', function($routeProvider){
    $routeProvider.
    when('/home', {
        templateUrl: "/assets/views/routes/home.html",
        controller: "HomeController"
    }).
    when('/lobby', {
        templateUrl: "/assets/views/routes/lobby.html",
        controller: "LobbyController"
    }).
    when('/videochat', {
        templateUrl: "/assets/views/routes/videochat.html",
        controller: "VideoChatController"
    }).
    otherwise({
        redirectTo: "/home"
    });

}]);

