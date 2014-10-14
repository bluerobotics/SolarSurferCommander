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

directives.directive('hideFromPublic', ['$location',
    function($location) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if($location.host() == 'surfer.bluerobotics.com')
                    element.addClass('hide-from-public');
            }
        };
    }]);

directives.directive('encoding', function(){
    if(typeof String.prototype.startsWith != 'function') {
        // see below for better implementation!
        String.prototype.startsWith = function (str){
            return this.indexOf(str) === 0;
        };
    }

    var parsePartialFloat = function(viewValue) {
        if(viewValue == '-' || viewValue == '.' || viewValue == '-.') return viewValue;
        else return parseFloat(viewValue);
    };

    return {
        require: 'ngModel',
        scope: {
            encoding: '='
        },
        link: function(scope, ele, attr, ctrl){
            ctrl.$parsers.unshift(function(viewValue){
                if(scope.encoding.startsWith('int') || scope.encoding.startsWith('uint')) {
                    // unsigned int
                    if(viewValue == '-') return viewValue;
                    else return parseInt(viewValue);
                }
                else if(scope.encoding == 'float' || scope.encoding == 'double') {
                    if(Array.isArray(viewValue)) {
                        // this is being used with ng-list
                        for(var i = 0; i < viewValue.length; i++) 
                            viewValue[i] = parsePartialFloat(viewValue[i]);
                        return viewValue;
                    }
                    else {
                        // single value
                        return parsePartialFloat(viewValue);
                    }
                }
            });
        }
    };
});

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
                            latitude: 35.173808,
                            longitude: -121
                        },
                        zoom: 7,
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
                        path: [],
                        // stroke: {
                        //     color: '#2C99CE'
                        // }
                    };
                    for(var i = 0; i < planner.config.route.length; i++) {
                        $scope.ideal_path.path.push({
                            latitude: planner.config.route[i].lat(),
                            longitude: planner.config.route[i].lng()
                        });
                    }

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
                    var timezone_offset =  (new Date()).getTimezoneOffset() * 60000;
                    var dx_series = {
                        name: 'Total Distance Traveled (km)',
                        marker: {
                            enabled: false
                        },
                        data: []
                    };
                    var pthruster_series = {
                        name: 'Thruster Power (W)',
                        yAxis: 1,
                        marker: {
                            enabled: false
                        },
                        data: []
                    };
                    var waypoint_series = {
                        name: 'Waypoint Index',
                        yAxis: 2,
                        marker: {
                            enabled: false
                        },
                        data: []
                    };
                    var velocity_series = {
                        name: 'Velocity (m/s)',
                        yAxis: 3,
                        marker: {
                            enabled: false
                        },
                        data: []
                    };
                    angular.forEach(planner.data, function(step){
                        var d = step.date.toDate().getTime() + timezone_offset;
                        dx_series.data.push([
                            d,
                            step.dx_home.to('km').scalar
                        ]);
                        pthruster_series.data.push([
                            d,
                            step.p_thruster.to('W').scalar
                        ]);
                        waypoint_series.data.push([
                            d,
                            step.route_index
                        ]);
                        velocity_series.data.push([
                            d,
                            step.v.mag.to('m/s').scalar
                        ]);
                    });

                    // construct a chart from the sim
                    $scope.chart = {
                        options: {
                            chart: {
                                type: 'line',
                                zoomType: 'x'
                            },
                            tooltip: {
                                shared: true
                            },
                            exporting: {
                                enabled: false
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
                                text: 'Thruster Power (W)',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            opposite: true
                        }, {
                            gridLineWidth: 0,
                            title: {
                                text: 'Waypoint Index',
                                style: {
                                    color: Highcharts.getOptions().colors[2]
                                }
                            }
                        }, {
                            gridLineWidth: 0,
                            title: {
                                text: 'Velocity (m/s)',
                                style: {
                                    color: Highcharts.getOptions().colors[3]
                                }
                            },
                            opposite: true
                        }],
                        series: [dx_series, pthruster_series, waypoint_series, velocity_series],
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
