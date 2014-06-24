(function(window, angular, Planner, undefined) {

'use strict';

var controllers = angular.module('app.controllers', []);

controllers.controller('HomeCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
        // SolarSurfer mission planner
        var planner = new Planner();
        planner.start();

        // map config
        $scope.map = {
            center: {
                latitude: 26.0925675,
                longitude: -138.2964353
            },
            zoom: 4
        };

        // construct the ideal path
        $scope.ideal_path = {
            path: [{
                latitude: planner.options.loc_start.lat(),
                longitude: planner.options.loc_start.lng()
            }, {
                latitude: planner.options.loc_end.lat(),
                longitude: planner.options.loc_end.lng()
            }]
        };

        // construct a path from the sim
        $scope.sim_path = {
            path: [],
            stroke: {
                color: "#FF0000"
            }
        };
        angular.forEach(planner.data, function(step){
            $scope.sim_path.path.push({
                latitude: step.loc.lat(),
                longitude: step.loc.lng()
            });
        });

        // console debug
        window.planner = planner;
        window.scope = $scope;
    }]);

controllers.controller('StaticCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
        // a generic static content controller
    }]);

})(window, window.angular, window.SolarSuferPlanner);
