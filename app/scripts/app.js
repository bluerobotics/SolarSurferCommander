(function(window, angular, undefined) {

'use strict';

// declare app level module
var app = angular.module('app', [
    // angular modules
    'ngRoute',
    // third-party modules
    'ui.bootstrap',
    'google-maps',
    'highcharts-ng',
    // app modules
    'app.filters',
    'app.services',
    'app.directives',
    'app.controllers'
]);

app.value('version', '0.1.0');

app.config(['$routeProvider', '$httpProvider', '$locationProvider',
        function($routeProvider, $httpProvider, $locationProvider) {
    // html5mode
    $locationProvider.html5Mode(true);

    // routes
    $routeProvider.when('/home', {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl',
        reloadOnSearch: false
    });
    $routeProvider.when('/trade/timeofyear', {
        templateUrl: 'templates/trade.html',
        controller: 'TradeCtrl',
        reloadOnSearch: false
    });
    $routeProvider.when('/trade/seastate', {
        templateUrl: 'templates/trade.html',
        controller: 'SeaStateTradeCtrl',
        reloadOnSearch: false
    });
    $routeProvider.when('/help', {
        templateUrl: 'templates/help.html',
        controller: 'StaticCtrl',
        reloadOnSearch: false
    });
    $routeProvider.otherwise({redirectTo: '/home'});
}]);

// hide moment Date() fallback warning
window.moment.suppressDeprecationWarnings = true;

})(window, window.angular);
