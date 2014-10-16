(function(window, angular, undefined) {
'use strict';

var module = angular.module('tlmMap', ['solarSurferApi', 'google-maps', 'geolocation']);

module.directive('tlmMap', ['$interval', 'LiveTelemetry', 'geolocation', '$timeout',
  function($interval, LiveTelemetry, geolocation, $timeout) {
    return {
      restrict: 'E',
      transclude: false,
      scope: {
        tlmMapUserMarker: '='
      },
      compile: function(element, attrs){
        if(!attrs.tlmMapUserMarker) attrs.tlmMapUserMarker = 'true';
      },
      controller: function($scope, $element){
        // map config
        $scope.map = {
          center: undefined,
          zoom: 11,
          options: {
            panControl: false,
            zoomControl: true,
            mapTypeControl: true,
            mapTypeId: google.maps.MapTypeId.HYBRID,
            scaleControl: false,
            streetViewControl: false,
            overviewMapControl: false,
            scrollwheel: false
          }
        };
        $scope.waypoint_marker = {
          id: 'waypoint',
          icon: '/img/purple-marker.png',
          coords: {},
          options: { draggable: false },
        };

        // user location
        if($scope.tlmMapUserMarker) {
          $scope.user_marker = {
            id: 'user',
            icon: '/img/cyan-marker.png',
            coords: {},
            options: {},
            events: {}
          };
          var update_user_location = function() {
            geolocation.getLocation().then(function(data) {
              $scope.user_marker.coords = data.coords;
            });
          };
          update_user_location();
          $interval(update_user_location, 2500); // 2.5 seconds
        }

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
              path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
            },
            offset: '25px',
            repeat: '50px'
          }]
        };

        // process path markers
        var update_data = function(items) {
          if(items.length > 0) {
            var new_paths = [];
            for(var i = 0; i < items.length; i++) {
              new_paths.push({
                id: items[i]._id,
                latitude: items[i].data.latitude,
                longitude: items[i].data.longitude,
                icon: (items[i].data.rpm_left+items[i].data.rpm_right > 0) ? '/img/green-marker-small.png' : '/img/black-marker-small.png',
                options: {
                  title: items[i]._date
                }
              });
            }

            // change actual_path
            if($scope.map.center === undefined) {
              $scope.map.center = {
                latitude: new_paths[new_paths.length-1].latitude,
                longitude: new_paths[new_paths.length-1].longitude
              };
              new_paths[0].icon = '/img/green-marker.png';
            }
            if($scope.actual_path.path.length  > 0)
              $scope.actual_path.path[$scope.actual_path.path.length - 1].icon = '/img/black-marker.png';
            $scope.actual_path.path = $scope.actual_path.path.concat(new_paths);
            $scope.actual_path.path[$scope.actual_path.path.length - 1].icon = '/img/red-marker.png';

            // update waypoint marker
            var lastItem = items[items.length - 1];
            if(lastItem.data._version >= 2) {
              $scope.waypoint_marker.coords = {
                latitude: lastItem.data.currentWaypointLatitude,
                longitude: lastItem.data.currentWaypointLongitude
              };
            }
          }
        };

        // initial LiveTelemetry
        update_data(LiveTelemetry.items());

        // respond to LiveTelemetry updates
        $scope.$on('telemetry-update', function(event, items) {
          update_data(items);
        });
      },
      template:
        '<div class="tlm-map">' +
          '<google-map center="map.center" zoom="map.zoom" options="map.options" draggable="true" events="map.events" ng-if="actual_path.path.length > 0">' +
            '<polyline path="actual_path.path" stroke="actual_path.stroke" icons="actual_path.icons"></polyline>' +
            '<markers models="actual_path.path" coords="\'self\'" icon="\'icon\'" options="\'options\'">' +
            '</markers>' +
            '<marker coords="waypoint_marker.coords" options="waypoint_marker.options" icon="waypoint_marker.icon" idkey="waypoint_marker.id"></marker>' +
            '<marker coords="user_marker.coords" options="user_marker.options" icon="user_marker.icon" idkey="user_marker.id" ng-if="tlmMapUserMarker"></marker>' +
          '</google-map>' +
        '</div>',
      replace: true
    };
  }]);

})(window, window.angular);
