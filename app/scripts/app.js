(function(window, angular, undefined) {

'use strict';

// declare app level module
var app = angular.module('app', [
    // angular modules
    'ngRoute',
    'ngCookies',
    'ngResource',
    // third-party modules
    'ui.bootstrap',
    'google-maps',
    'highcharts-ng',
    'angularMoment',
    'geolocation',
    // app modules
    'app.filters',
    'app.services',
    'app.directives',
    'app.controllers',
    // components
    'tlmStatus',
]);

app.value('version', '0.2.4');

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
        controller: 'CommandCtrl',
        reloadOnSearch: false
    });
    $routeProvider.when('/settings', {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl',
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
    $routeProvider.otherwise({redirectTo: '/map'});
}]);

// hide moment Date() fallback warning
window.moment.suppressDeprecationWarnings = true;

})(window, window.angular);
