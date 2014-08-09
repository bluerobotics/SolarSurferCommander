(function(window, angular, undefined) {

'use strict';

// declare app level module
var app = angular.module('app', [
    // angular modules
    'ngRoute',
    'ngResource',
    // third-party modules
    'ui.bootstrap',
    'google-maps',
    'highcharts-ng',
    'angularMoment',
    // app modules
    'app.filters',
    'app.services',
    'app.directives',
    'app.controllers'
]);

app.value('version', '0.2.1');
app.value('mission', '53e4e46ed824e81700b9014e');
app.value('pollrate', 10000); // milliseconds

app.config(['$routeProvider', '$httpProvider', '$locationProvider',
        function($routeProvider, $httpProvider, $locationProvider) {
    // html5mode
    $locationProvider.html5Mode(true);

    // routes
    $routeProvider.when('/map', {
        templateUrl: 'templates/map.html',
        controller: 'MapCtrl',
        reloadOnSearch: false
    });
    $routeProvider.when('/graph', {
        templateUrl: 'templates/graph.html',
        controller: 'GraphCtrl',
        reloadOnSearch: false
    });
    $routeProvider.when('/telemetry', {
        templateUrl: 'templates/telemetry.html',
        controller: 'TelemetryCtrl',
        reloadOnSearch: false
    });
    $routeProvider.when('/commanding', {
        templateUrl: 'templates/commanding.html',
        controller: 'StaticCtrl',
        reloadOnSearch: false
    });
    $routeProvider.when('/settings', {
        templateUrl: 'templates/settings.html',
        controller: 'StaticCtrl',
        reloadOnSearch: false
    });
    $routeProvider.when('/planning/nominal', {
        templateUrl: 'templates/nominal.html',
        controller: 'NominalCtrl',
        reloadOnSearch: false
    });
    $routeProvider.when('/planning/:id', {
        templateUrl: 'templates/trade.html',
        controller: 'TradeCtrl',
        reloadOnSearch: false
    });
    $routeProvider.when('/help', {
        templateUrl: 'templates/help.html',
        controller: 'StaticCtrl',
        reloadOnSearch: false
    });
    $routeProvider.otherwise({redirectTo: '/map'});
}]);

// hide moment Date() fallback warning
window.moment.suppressDeprecationWarnings = true;

})(window, window.angular);
