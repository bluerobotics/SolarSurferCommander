(function(window, angular, undefined) {

'use strict';

/* Directives */

var directives = angular.module('app.directives', []);

directives.directive('appVersion', ['version',
    function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
    }]);

directives.directive('resultSet', ['$timeout',
    function($timeout) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                configs: '=',
                chart: '=',
                callback: '='
            },
            controller: function($scope, $element) {
            },
            link: function(scope, element, attrs) {
                scope.completed = 0;

                // run all of the sims
                var startNextPlanner = function() {
                    if(scope.completed < scope.configs.length) {
                        // start each chart
                        // wrap in a timeout to let the view update
                        $timeout(function(){
                            scope.configs[scope.completed].planner.start();
                            scope.completed = scope.completed + 1;
                            startNextPlanner();
                        }, 0);
                    }
                    else {
                        // build the trade chart via callback
                        if(scope.callback !== undefined) scope.callback();
                    }
                };
                startNextPlanner();
            },
            templateUrl: 'templates/result-set.html',
            replace: true
        };
    }]);

directives.directive('result', [
    function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                title: '=',
                planner: '=',
            },
            controller: function($scope, $element) {
            },
            link: function(scope, element, attrs) {
                var processResult = function(planner){
                    var $scope = scope;

                    // map config
                    $scope.map = {
                        center: {
                            latitude: 26.0925675,
                            longitude: -138.2964353
                        },
                        zoom: 4,
                        options: {
                            panControl: false,
                            zoomControl: true,
                            mapTypeControl: true,
                            scaleControl: false,
                            streetViewControl: false,
                            overviewMapControl: false
                        }
                    };

                    // construct the ideal path
                    $scope.ideal_path = {
                        path: [{
                            latitude: planner.config.loc_start.lat(),
                            longitude: planner.config.loc_start.lng()
                        }, {
                            latitude: planner.config.loc_end.lat(),
                            longitude: planner.config.loc_end.lng()
                        }],
                        // stroke: {
                        //     color: '#2C99CE'
                        // }
                    };

                    // construct a path from the sim
                    $scope.sim_path = {
                        path: [],
                        stroke: {
                            color: '#FF0000'
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
                        config: {
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

                    // stats window
                    var last_step = planner.data[planner.data.length-1];
                    $scope.elapsed = last_step.date.diff(
                        planner.config.date_start, 'days') + ' days';
                    $scope.energy = last_step.energy.toString();

                    // let the template know we are done
                    $scope.complete = true;
                };

                // setup local scope and callback
                scope.complete = false;
                scope.showBody = attrs.showBody=='true' ? true : false;
                scope.planner.callback = processResult;
            },
            templateUrl: 'templates/result.html',
            replace: true
        };
    }]);

})(window, window.angular);
