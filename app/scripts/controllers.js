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

controllers.controller('TradeCtrl', ['$scope', '$routeParams',
    function ($scope, $routeParams) {
        // define the scenarios to run
        $scope.configs = [];

        if($routeParams.id == 'throttlesetting') {
            for(var i = 20; i <= 120; i = i + 20) {
                $scope.configs.push({
                    title: 'each thruster set to ' + i + 'W',
                    planner: new Planner({
                        p_thruster: new Qty(i+'W')
                    })
                });
            }
        }
        else if($routeParams.id == 'seastate') {
            for(var i = 0; i <= 5; i++) {
                $scope.configs.push({
                    title: 'OSCAR currents * ' + i,
                    planner: new Planner({
                        sea_mult: new Qty(String(i))
                    })
                });
            }
        }
        else if($routeParams.id == 'simresolution') {
            $scope.configs = [{
                title: '60 min resolution',
                planner: new Planner({
                    date_delta: moment.duration(1, 'hour')
                })
            },{
                title: '30 min resolution',
                planner: new Planner({
                    date_delta: moment.duration(30, 'minute')
                })
            },{
                title: '10 min resolution',
                planner: new Planner({
                    date_delta: moment.duration(10, 'minute')
                })
            }];
        }

        // console debug
        window.scope = $scope;
    }]);

controllers.controller('StaticCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
        // a generic static content controller
    }]);

})(window, window.angular, window.SolarSuferPlanner);
