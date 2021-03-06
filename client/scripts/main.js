var myApp = angular.module('myApp', ['ngRoute', 'appControllers', 'ngAudio','ui.bootstrap' ]);

var appControllers= angular.module('appControllers', []);

myApp.config(['$routeProvider', function($routeProvider){
    $routeProvider.
    when('/home', {
        templateUrl: "/assets/views/routes/home.html",
        controller: "HomeController"
    }).
    when('/about', {
        templateUrl: "/assets/views/routes/about.html",
        controller: "AboutController"
    }).
    when('/projects', {
        templateUrl: "/assets/views/routes/projects.html",
        controller: "ProjectsController"
    }).
    when('/locations', {
        templateUrl: "/assets/views/routes/locations.html",
        controller: "LocationsController"
    }).
    when('/user', {
        templateUrl: "/assets/views/routes/user.html",
        controller: "UserController"
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

