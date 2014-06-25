(function(window, angular, Planner, undefined) {

'use strict';

var controllers = angular.module('app.controllers', []);

controllers.controller('HomeCtrl', ['$scope', '$rootScope', '$timeout',
    function ($scope, $rootScope, $timeout) {
        // SolarSurfer mission planner
        $scope.planner = new Planner();

        // start planner after callback has been linked
        // this also lets the template render once
        $timeout(function(){
            $scope.planner.start();
        }, 0);

        // console debug
        window.scope = $scope;
    }]);

controllers.controller('TradeCtrl', ['$scope', '$rootScope', '$timeout',
    function ($scope, $rootScope, $timeout) {
        // define the scenarios to run
        $scope.configs = [{
            title: 'each thruster as 20W',
            planner: new Planner({
                p_thruster: new Qty('20 W')
            })
        },{
            title: 'each thruster as 40W',
            planner: new Planner({
                p_thruster: new Qty('40 W')
            })
        },{
            title: 'each thruster as 60W',
            planner: new Planner({
                p_thruster: new Qty('60 W')
            })
        },{
            title: 'each thruster as 80W',
            planner: new Planner({
                p_thruster: new Qty('80 W')
            })
        },{
            title: 'each thruster as 100W',
            planner: new Planner({
                p_thruster: new Qty('80 W')
            })
        },{
            title: 'each thruster as 120W',
            planner: new Planner({
                p_thruster: new Qty('80 W')
            })
        }];

        // console debug
        window.scope = $scope;
    }]);

controllers.controller('StaticCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
        // a generic static content controller
    }]);

})(window, window.angular, window.SolarSuferPlanner);
