(function(window, angular, undefined) {
'use strict';

var module = angular.module('tlmMap', ['solarSurferApi', 'google-maps', 'geolocation']);

module.directive('tlmMap', ['$interval', 'LiveTelemetry', 'geolocation',
  function($interval, LiveTelemetry, geolocation) {
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
          center: {
            latitude: 33.87,
            longitude: -118.36
          },
          zoom: 13,
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
        $scope.surfer_marker = {
          id: 'surfer',
          icon: '/img/green-marker.png',
          coords: {},
          options: { draggable: false },
          events: {
            // dragend: function (marker, eventName, args) {
            //   $log.log('marker dragend');
            //   $log.log(marker.getPosition().lat());
            //   $log.log(marker.getPosition().lng());
            // }
          }
        };
        $scope.waypoint_marker = {
          id: 'waypoint',
          icon: '/img/pink-marker.png',
          coords: {},
          options: { draggable: false },
        };

        // user location
        if($scope.tlmMapUserMarker) {
          $scope.user_marker = {
            id: 'user',
            icon: '/img/blue-marker.png',
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
          if(items.length > 0) {
            angular.extend($scope.surfer_marker.coords, $scope.actual_path.path[0]);

            var lastItem = items[items.length - 1];
            if(lastItem.data._version >= 2) {
              $scope.waypoint_marker.coords = {
                latitude: lastItem.data.currentWaypointLatitude,
                longitude: lastItem.data.currentWaypointLongitude
              };
            }
              //  
          }
        });
      },
      template:
        '<div class="tlm-map">' +
          '<google-map center="map.center" zoom="map.zoom" options="map.options" draggable="true" events="map.events" ng-if="actual_path.path.length > 0">' +
            '<polyline path="actual_path.path" stroke="actual_path.stroke" icons="actual_path.icons"></polyline>' +
            '<markers models="actual_path.path" coords="\'self\'" fit="true" icon="\'icon\'">' +
            '</markers>' +
            '<marker coords="surfer_marker.coords" options="surfer_marker.options" icon="surfer_marker.icon" events="surfer_marker.events" idkey="marker.id"></marker>' +
            '<marker coords="waypoint_marker.coords" options="waypoint_marker.options" icon="waypoint_marker.icon" idkey="waypoint_marker.id"></marker>' +
            '<marker coords="user_marker.coords" options="user_marker.options" icon="user_marker.icon" idkey="user_marker.id" ng-if="tlmMapUserMarker"></marker>' +
          '</google-map>' +
        '</div>',
      replace: true
    };
  }]);

})(window, window.angular);
