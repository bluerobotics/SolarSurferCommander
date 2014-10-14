(function(window, angular, undefined) {

'use strict';

// declare app level module
var app = angular.module('app', [
    // angular modules
    'ngRoute',
    // third-party modules
    'ui.bootstrap',
    'highcharts-ng',
    // app modules
    'app.filters',
    'app.directives',
    'app.controllers',
    // components
    'solarSurferApi',
    'tlmStatus',
    'tlmMap',
]);

app.value('version', '0.2.4');

app.config(['$routeProvider', '$httpProvider', '$locationProvider',
        function($routeProvider, $httpProvider, $locationProvider) {
    // html5mode
    $locationProvider.html5Mode(true);

    // routes
    $routeProvider.when('/map', {
        templateUrl: 'templates/map.html',
        controller: 'StaticCtrl',
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
