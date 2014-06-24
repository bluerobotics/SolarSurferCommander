(function(window, angular, Planner, undefined) {

'use strict';

var controllers = angular.module('app.controllers', []);

controllers.controller('HomeCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
        // custom angular logger
        $scope.log = [];
        $scope.logger = function(data) {
            console.log(data);
            // $scope.log.push(data);
        };

        // SolarSurfer mission planner
        var planner = new Planner();
        planner.logger = $scope.logger;
        planner.start();

        // console debug
        window.planner = planner;
    }]);

controllers.controller('StaticCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
        // a generic static content controller
    }]);

})(window, window.angular, window.SolarSuferPlanner);
