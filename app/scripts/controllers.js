(function(window, angular, Planner, undefined) {

'use strict';

var controllers = angular.module('app.controllers', []);

controllers.controller('LayoutCtrl', ['$scope', '$location', 'LiveTelemetry', 'mission',
    function ($scope, $location, LiveTelemetry, mission) {
        $scope.isActive = function (navBarPath) {
            return navBarPath === $location.path().split('/')[1];
        };

        LiveTelemetry.init(mission);
        $scope.last_update = {};

        $scope.$on('telemetry-init', function(event, items) {
            if(items.length > 0)
                angular.extend($scope.last_update, items[0]);
        });
        $scope.$on('telemetry-update', function(event, items) {
            if(items.length > 0)
                angular.extend($scope.last_update, items[0]);
        });
    }]);

controllers.controller('MapCtrl', ['$scope', '$interval', 'LiveTelemetry', 'pollrate', 'geolocation',
    function ($scope, $interval, LiveTelemetry, pollrate, geolocation) {
        // map config
        var map_instance, surfer_marker, user_marker;
        $scope.map = {
            center: {
                latitude: 33.87,
                longitude: -118.36
            },
            zoom: 13,
            options: {
                panControl: false,
                zoomControl: true,
                mapTypeControl: true,
                scaleControl: false,
                streetViewControl: false,
                overviewMapControl: false,
                scrollWheel: false
            }
        };
        $scope.surfer_marker = {
            id: 'surfer',
            coords: {},
            options: { draggable: false },
            events: {
                // dragend: function (marker, eventName, args) {
                //     $log.log('marker dragend');
                //     $log.log(marker.getPosition().lat());
                //     $log.log(marker.getPosition().lng());
                // }
            }
        };
        $scope.user_marker = {
            id: 'user',
            icon: '/img/green-marker.png',
            coords: {},
            options: {},
            events: {}
        };

        // user location
        var update_user_location = function() {
            geolocation.getLocation().then(function(data) {
                $scope.user_marker.coords = data.coords;
            });
        };
        update_user_location();
        $interval(update_user_location, pollrate);

        // build GPS path
        $scope.actual_path = {
            path: [],
            stroke: {
                color: '#FF0000',
                opacity: 0.5,
                weight: 2
            },
            icons: [{
                icon: {
                    path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
                },
                offset: '25px',
                repeat: '50px'
            }]
        };

        // initial data
        var items = LiveTelemetry.items();

        // process line and marker positions
        for(var i = 0; i < items.length; i++) {
            $scope.actual_path.path.push({
                id: items[i]._id,
                latitude: items[i].data.latitude,
                longitude: items[i].data.longitude,
                icon: '/img/black-marker.png'
            });
        }

        // process current marker position
        if(items.length > 0)
            $scope.surfer_marker.coords = $scope.actual_path.path[0];

        // respond to LiveTelemetry updates
        $scope.$on('telemetry-update', function(event, items) {
            // process line and marker positions
            var new_paths = [];
            for(var i = 0; i < items.length; i++) {
                new_paths.push({
                    id: items[i]._id,
                    latitude: items[i].data.latitude,
                    longitude: items[i].data.longitude,
                    icon: '/img/black-marker.png'
                });
            }
            $scope.actual_path.path = new_paths.concat($scope.actual_path.path);

            // process current marker position
            if(items.length > 0)
                angular.extend($scope.surfer_marker.coords, $scope.actual_path.path[0]);
        });
    }]);

controllers.controller('GraphCtrl', ['$scope', 'Telemetry',
    function ($scope, Telemetry) {
        // get latest message
        $scope.last_update = Telemetry.query({
            limit: 1,
            sort: '-_date',
            where: {"mission":"53e4e46ed824e81700b9014e"}
        });

        // chart data
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
            yAxis: {
                gridLineWidth: 0,
                title: {
                    text: 'Power (W)',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                }
            },
            series: [{
                name: 'Solar Power (W)',
                marker: {
                    enabled: true
                },
                data: []
            },{
                name: 'Thruster Power (W)',
                marker: {
                    enabled: true
                },
                data: []
            }],
            title: {
                text: ''
            },
            loading: false
        };

        // populate map and chart data
        Telemetry.query({
            // fields: 'data.latitude,data.longitude',
            sort: '_date',
            limit: 500,
            where: {"mission":"53e4e46ed824e81700b9014e"}
        }, function(data){
            var msg;
            for(var i = 0; i < data.items.length; i++) {
                msg = data.items[i];

                // power data
                var date = new Date(msg._date);
                $scope.chart.series[0].data.push([date, msg.data.p_solar]);
                $scope.chart.series[1].data.push([date, msg.data.p_load]);
            }
        });
    }]);

controllers.controller('TelemetryCtrl', ['$scope', 'LiveTelemetry',
    function ($scope, LiveTelemetry) {
        // initial data
        $scope.data = {};
        var items = LiveTelemetry.items();
        if(items.length > 0)
            angular.extend($scope.data, items[0]);

        // respond to LiveTelemetry updates
        $scope.$on('telemetry-update', function(event, items) {
            if(items.length > 0)
                angular.extend($scope.data, items[0]);
        });
    }]);

controllers.controller('NominalCtrl', ['$scope', '$rootScope', '$timeout',
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
