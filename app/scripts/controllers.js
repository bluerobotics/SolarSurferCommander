(function(window, angular, Planner, undefined) {

'use strict';

var controllers = angular.module('app.controllers', []);

controllers.controller('LayoutCtrl', ['$scope', '$rootScope', '$location', 'LiveTelemetry', 'LiveCommand',
  function ($scope, $rootScope, $location, LiveTelemetry, LiveCommand) {
    $scope.isActive = function (navBarPath) {
      return navBarPath === $location.path().split('/')[1];
    };
    $rootScope.$on('$routeChangeStart', function(){
      $scope.navCollapsed = true;
    });

    // init the LiveTelemetry process for the app
    LiveTelemetry.init();
    LiveCommand.init();
  }]);

controllers.controller('GraphCtrl', ['$scope', 'LiveTelemetry',
  function ($scope, LiveTelemetry) {
    // chart config
    var chart_defaults = {
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
      title: {
        text: ''
      },
      loading: false
    };

    // power chart
    $scope.power_chart = angular.copy(chart_defaults);
    angular.extend($scope.power_chart, {
      yAxis: [{
        gridLineWidth: 0,
        title: {
          text: 'Power (W)',
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        }
      },{
      //   gridLineWidth: 0,
      //   title: {
      //     text: 'Power (W)',
      //     style: {
      //       color: Highcharts.getOptions().colors[1]
      //     }
      //   }
      // },{
        gridLineWidth: 0,
        title: {
          text: 'Voltage (V)',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        opposite: true
      },{
        gridLineWidth: 0,
        title: {
          text: 'Velocity (m/s)',
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        },
        opposite: false
      }],
      series: [{
      //   name: 'Solar Power (W)',
      //   marker: {
      //     enabled: true
      //   },
      //   data: []
      // },{
        name: 'Load Power (W)',
        marker: {
          enabled: true
        },
        data: []
      },{
      //   name: 'Thruster Power (W)',
      //   marker: {
      //     enabled: true
      //   },
      //   data: []
      // },{
        yAxis: 1,
        name: 'Load Voltage (V)',
        marker: {
          enabled: true
        },
        data: []
      },{
        yAxis: 2,
        name: 'Velocity (m/s)',
        marker: {
          enabled: true
        },
        data: []
      }]
    });

    // nav chart
    $scope.nav_chart = angular.copy(chart_defaults);
    angular.extend($scope.nav_chart, {
      yAxis: [{
        gridLineWidth: 0,
        title: {
          text: 'Waypoint Index',
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        }
      },{
        gridLineWidth: 0,
        title: {
          text: 'Heading (°)',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        opposite: true
      },{
        gridLineWidth: 0,
        title: {
          text: 'Waypoint heading (°)',
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        },
        opposite: true
      },{
        gridLineWidth: 0,
        title: {
          text: 'Distance (m)',
          style: {
            color: Highcharts.getOptions().colors[3]
          }
        },
        opposite: false
      }],
      series: [{
        name: 'Waypoint Index',
        marker: {
          enabled: true
        },
        data: []
      },{
        yAxis: 1,
        name: 'Heading (°)',
        marker: {
          enabled: true
        },
        data: []
      },{
        yAxis: 2,
        name: 'Waypoint heading (°)',
        marker: {
          enabled: true
        },
        data: []
      },{
        yAxis: 3,
        name: 'Distance to waypoint (m)',
        marker: {
          enabled: true
        },
        data: []
      }]
    });

    // thruster chart
    $scope.thruster_chart = angular.copy(chart_defaults);
    angular.extend($scope.thruster_chart, {
      yAxis: [{
        gridLineWidth: 0,
        title: {
          text: 'Power (W)',
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        }
      },{
        gridLineWidth: 0,
        title: {
          text: 'Speed (rpm)',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        }
      },{
        gridLineWidth: 0,
        title: {
          text: 'Status (1=good, 0=bad)',
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        },
        opposite: true
      }],
      series: [{
        name: 'Left Thruster (W)',
        marker: {
          enabled: true
        },
        data: []
      },{
        name: 'Right Thruster (W)',
        marker: {
          enabled: true
        },
        data: []
      },{
        yAxis: 1,
        name: 'Left Thruster (rpm)',
        marker: {
          enabled: true
        },
        data: []
      },{
        yAxis: 1,
        name: 'Right Thruster (rpm)',
        marker: {
          enabled: true
        },
        data: []
      },{
        yAxis: 2,
        name: 'Left Thruster',
        marker: {
          enabled: true
        },
        data: []
      },{
        yAxis: 2,
        name: 'Right Thruster',
        marker: {
          enabled: true
        },
        data: []
      }]
    });

    // status chart
    $scope.status_chart = angular.copy(chart_defaults);
    angular.extend($scope.status_chart, {
      yAxis: [{
        gridLineWidth: 0,
        title: {
          text: 'Status (1=good, 0=bad)',
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        }
      }],
      series: [{
        name: 'GPS',
        marker: {
          enabled: true
        },
        data: []
      },{
        name: 'IMU',
        marker: {
          enabled: true
        },
        data: []
      },{
        name: 'Compass',
        marker: {
          enabled: true
        },
        data: []
      },{
        name: 'BLDC Monitor',
        marker: {
          enabled: true
        },
        data: []
      },{
        name: 'Satcom',
        marker: {
          enabled: true
        },
        data: []
      },{
        name: 'RC Radio',
        marker: {
          enabled: true
        },
        data: []
      },{
        name: 'Nav box dry',
        marker: {
          enabled: true
        },
        data: []
      },{
        name: 'Battery box dry',
        marker: {
          enabled: true
        },
        data: []
      }]
    });

    // environment chart
    $scope.environment_chart = angular.copy(chart_defaults);
    angular.extend($scope.environment_chart, {
      yAxis: [{
        gridLineWidth: 0,
        title: {
          text: 'Temperature (°C)',
          style: {
            color: Highcharts.getOptions().colors[2]
          }
        }
      },{
        gridLineWidth: 0,
        title: {
          text: 'Instability (°)',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        opposite: true
      }],
      series: [{
        name: 'Water temp (°C)',
        marker: {
          enabled: true
        },
        data: []
      },{
        yAxis: 1,
        name: 'Instability (°)',
        marker: {
          enabled: true
        },
        data: []
      }]
    });

    // telem chart
    $scope.telem_chart = angular.copy(chart_defaults);
    angular.extend($scope.telem_chart, {
      yAxis: [{
        gridLineWidth: 0,
        title: {
          text: 'Telemetry Counts',
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        }
      },{
        gridLineWidth: 0,
        title: {
          text: 'Command Counts',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        opposite: true
      }],
      series: [{
        name: 'Telemetry Counts',
        marker: {
          enabled: true
        },
        data: []
      },{
        yAxis: 1,
        name: 'Command Counts',
        marker: {
          enabled: true
        },
        data: []
      }]
    });

    var add_data = function(items) {
      for(var i = 0; i < items.length; i++) {
        var time = items[i].derived.time; // milliseconds since epoch

        // power chart
        // $scope.power_chart.series[0].data.push([time, items[i].data.p_solar]);
        $scope.power_chart.series[0].data.push([time, items[i].data.p_load]);
        // $scope.power_chart.series[1].data.push([time, items[i].derived.p_thrusters]);
        $scope.power_chart.series[1].data.push([time, items[i].data.v_load]);
        $scope.power_chart.series[2].data.push([time, items[i].derived.v]);

        // nav chart
        $scope.nav_chart.series[0].data.push([time, items[i].data.currentWaypointIndex]);
        $scope.nav_chart.series[1].data.push([time, items[i].data.heading]);
        if(items[i].derived.waypointHeading !== undefined) {
          $scope.nav_chart.series[2].data.push([time, items[i].derived.waypointHeading]);
          $scope.nav_chart.series[3].data.push([time, items[i].derived.waypointDistance]);
        }

        // thruster chart
        $scope.thruster_chart.series[0].data.push([time, items[i].data.p_left]);
        $scope.thruster_chart.series[1].data.push([time, items[i].data.p_right]);
        $scope.thruster_chart.series[2].data.push([time, items[i].data.rpm_left]);
        $scope.thruster_chart.series[3].data.push([time, items[i].data.rpm_right]);
        $scope.thruster_chart.series[4].data.push([time, items[i].data.status2['Left Thruster Okay']?1:0]);
        $scope.thruster_chart.series[5].data.push([time, items[i].data.status2['Right Thruster Okay']?1:0]);

        // status chart
        $scope.status_chart.series[0].data.push([time, items[i].data.status1['GPS Okay']?1:0]);
        $scope.status_chart.series[1].data.push([time, items[i].data.status1['IMU Okay']?1:0]);
        $scope.status_chart.series[2].data.push([time, items[i].data.status1['Compass Okay']?1:0]);
        $scope.status_chart.series[3].data.push([time, items[i].data.status1['BLDC Monitor Okay']?1:0]);
        $scope.status_chart.series[4].data.push([time, items[i].data.status1['Satcom Okay']?1:0]);
        $scope.status_chart.series[5].data.push([time, items[i].data.status1['RC Radio Okay']?1:0]);
        $scope.status_chart.series[6].data.push([time, items[i].data.status2['Navigation Box Dry']?1:0]);
        $scope.status_chart.series[7].data.push([time, items[i].data.status2['Battery Box Dry']?1:0]);

        // environment chart
        $scope.environment_chart.series[0].data.push([time, items[i].data.tempWater]);
        $scope.environment_chart.series[1].data.push([time, items[i].data.rollPitchRange]);

        // telem chart
        $scope.telem_chart.series[0].data.push([time, items[i].data.telemetryCount]);
        $scope.telem_chart.series[1].data.push([time, items[i].data.commandCount]);
      }
    };

    // initial data
    add_data(LiveTelemetry.items());

    // respond to LiveTelemetry updates
    $scope.$on('telemetry-update', function(event, items) {
      add_data(items);
    });
  }]);

controllers.controller('TelemetryCtrl', ['$scope', 'LiveTelemetry',
  function ($scope, LiveTelemetry) {
    // respond to LiveTelemetry updates
    $scope.telemetry = LiveTelemetry.items();
    $scope.$on('telemetry-update', function(event, items) {
      $scope.telemetry = $scope.telemetry.concat(items);
    });
  }]);

controllers.controller('CommandCtrl', ['$scope', '$http', 'LiveCommand', 'Settings', 'Command', 'Mission',
  function ($scope, $http, LiveCommand, Settings, Command, Mission) {
    // respond to LiveCommand updates
    $scope.commands = LiveCommand.items();
    $scope.$on('command-update', function(event, items) {
      $scope.commands = $scope.commands.concat(items);
    });

    // load current mission
    $scope.$watch(function(){
      return Settings.mission;
    }, function(mission){
      $scope.mission = Mission.query({
        id: mission,
        limit: 1
      });
    });

    // prepare Message library
    $scope.type = undefined;
    $http.get('/formats.json').
    success(function(data, status, headers, config) {
      // configure Message formats
      window.Message.configure(data);
      $scope.formats = window.Message.formats;

      // temporary hack to save clicks
      // $scope.type = '4';
    });

    // init message when a new message type is selected
    $scope.$watch('type', function(type){
      // init message
      $scope.message = {};
      if($scope.formats) {
        angular.forEach($scope.formats[type].payload, function(field){
          if(field.type == 'bitmap') {
            $scope.message[field.name] = {};
            angular.forEach(field.bitmap, function(value, key){
              $scope.message[field.name][value] = false;
            });
          }
          else $scope.message[field.name] = field.ignore !== undefined ? field.ignore : '';
        });
      }

      // known defaults
      $scope.message._version = window.Message.version;
      $scope.message._format = type;
    });

    // send command
    $scope.sendCommand = function() {
      Command.create({token: Settings.token}, {
        mission: Settings.mission,
        data: $scope.message
      }).$promise.then(
          function(){
            $scope.message.$status = 200;
            $scope.message.$errors = undefined;
          },
          function(response){
            $scope.message.$status = response.status;
            $scope.message.$errors = response.data.errors;
          }
        );
    };
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
      for(var i = 20; i <= 80; i = i + 10) {
        $scope.configs.push({
          title: 'each thruster set to ' + i + 'W',
          planner: new Planner({
            p_solar_max: new Qty((2*i+4)+' W'),
            p_thruster: new Qty(2*i+' W')
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

      $scope.chart_callback = function() {
        var data = [], planner;
        for(var i = 0; i < $scope.configs.length; i++) {
          planner = $scope.configs[i].planner;
          data.push([
            planner.data[0].sea_current.mag.scalar,
            numOfDays(planner)
          ]);
        }
        $scope.chart.xAxis.title.text = 'Ocean Current (m/s)';
        $scope.chart.yAxis.title.text = 'days at sea';
        $scope.chart.series = [{
          name: 'Ocean Current (m/s)',
          data: data
        }];
      };
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

controllers.controller('SettingsCtrl', ['$scope', '$rootScope', 'Vehicle', 'Mission', 'Settings',
  function ($scope, $rootScope, Vehicle, Mission, Settings) {
    $scope.vehicles = Vehicle.query();
    $scope.missions = Mission.query({sort: '-_date'});
    $scope.settings = Settings;
    $scope.addMission = function(vehicle){
      var m = new Mission();
      m.vehicle = vehicle._id;
      $scope.missions.items.push(m);
    };
    $scope.saveMission = function(m) {
      if(m._id === undefined) {
        // must be new, let's POST
        m.$create({token: Settings.token}).then(
          function(){
            m.$status = 200;
          },
          function(response){
            m.$status = response.status;
          }
        );
      }
      else {
        // must be old, let's PUT
        Mission.update({id: m._id, token: Settings.token}, m).$promise.then(
          function(){
            m.$status = 200;
          },
          function(response){
            m.$status = response.status;
          }
        );
      }
    };
    $scope.saveVehicle = function(v) {
      Vehicle.update({id: v._id, token: Settings.token}, v).$promise.then(
          function(){
            v.$status = 200;
          },
          function(response){
            v.$status = response.status;
          }
        );
    };
  }]);

controllers.controller('StaticCtrl', ['$scope', '$location',
  function ($scope, $location) {
    // a generic static content controller
    $scope.userMarker = ($location.host() != 'surfer.bluerobotics.com');
  }]);

})(window, window.angular, window.SolarSuferPlanner);
