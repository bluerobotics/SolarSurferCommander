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

        // build charts series
        var dx_series = {
            name: 'Distance from Manhattan Beach (km)',
            marker: {
                enabled: false
            },
            data: []
        };
        angular.forEach(planner.data, function(step){
            dx_series.data.push([
                step.date.toDate(),
                step.dx_home.to('km').scalar
            ]);
        });
        var psolar_series = {
            name: 'Solar Power (W)',
            yAxis: 1,
            marker: {
                enabled: false
            },
            data: []
        };
        angular.forEach(planner.data, function(step){
            psolar_series.data.push([
                step.date.toDate(),
                step.p_solar.to('W').scalar
            ]);
        });

        // construct a chart from the sim
        $scope.chart = {
            options: {
                chart: {
                    type: 'line',
                    zoomType: 'x'
                }
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    month: '%e. %b',
                    year: '%b'
                },
                title: {
                    text: 'Date'
                }
            },
            yAxis: [{ // Primary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Distance (km)',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }
            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Solar Power (W)',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                opposite: true
            }],
            series: [dx_series, psolar_series],
            title: {
                text: ''
            },
            loading: false
        };

        // console debug
        window.planner = planner;
        window.scope = $scope;
    }]);

controllers.controller('StaticCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
        // a generic static content controller
    }]);

})(window, window.angular, window.SolarSuferPlanner);
