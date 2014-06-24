(function(window, angular, undefined) {

'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('app', [
    'ngRoute',
    'app.filters',
    'app.services',
    'app.directives',
    'app.controllers',
    'angularMoment'
]);

app.value('version', '0.1.0');

app.config(['$routeProvider', '$httpProvider', '$locationProvider',
        function($routeProvider, $httpProvider, $locationProvider) {
    // html5mode
    $locationProvider.html5Mode(true);

    // routes
    $routeProvider.when('/home', {
        templateUrl: 'templates/home.html',
        controller: 'StaticCtrl',
        reloadOnSearch: false
    });
    $routeProvider.otherwise({redirectTo: '/home'});
}]);

// hide moment Date() fallback warning
window.moment.suppressDeprecationWarnings = true;

})(window, window.angular);
