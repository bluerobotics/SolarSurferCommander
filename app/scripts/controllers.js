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
    }]);

controllers.controller('TradeCtrl', ['$scope', '$routeParams',
    function ($scope, $routeParams) {
        // set title
        $scope.title = $routeParams.id;

        // helper
        var numOfDays = function(planner) {
            var last_step = planner.data[planner.data.length-1];
            return last_step.date.diff(planner.config.date_start, 'days');
        };

        // construct a chart from the trade
        $scope.chart = {
            config: {
                chart: {
                    type: 'scatter',
                    zoomType: 'xy'
                }
            },
            xAxis: {
                title: {
                    text: 'x'
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                gridLineWidth: 0,
                title: {
                    text: 'y'
                }
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: '{point.x}, {point.y}'
                    }
                }
            },
            series: [],
            title: {
                text: ''
            },
            loading: false
        };

        // default chart callback
        $scope.chart_callback = undefined;

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

            $scope.chart_callback = function() {
                var data = [], planner;
                for(var i = 0; i < $scope.configs.length; i++) {
                    planner = $scope.configs[i].planner;
                    data.push([
                        planner.config.p_thruster.scalar,
                        numOfDays(planner)
                    ]);
                }
                $scope.chart.xAxis.title.text = 'throttle setting (W)';
                $scope.chart.yAxis.title.text = 'days at sea';
                $scope.chart.series = [{
                    name: 'throttle setting (W)',
                    data: data
                }];
            };
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
                    date_delta: moment.duration(60, 'minutes')
                })
            },{
                title: '30 min resolution',
                planner: new Planner({
                    date_delta: moment.duration(30, 'minutes')
                })
            },{
                title: '10 min resolution',
                planner: new Planner({
                    date_delta: moment.duration(10, 'minutes')
                })
            }];

            $scope.chart_callback = function() {
                var data = [], planner;
                for(var i = 0; i < $scope.configs.length; i++) {
                    planner = $scope.configs[i].planner;
                    data.push([
                        planner.config.date_delta.asMinutes(),
                        planner.data.length
                    ]);
                }
                $scope.chart.xAxis.title.text = 'sim resolution (mins)';
                $scope.chart.yAxis.title.text = 'sim total iterations';
                $scope.chart.series = [{
                    name: 'sim resolution',
                    data: data
                }];
            };
        }
    }]);

controllers.controller('StaticCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
        // a generic static content controller
    }]);

})(window, window.angular, window.SolarSuferPlanner);
