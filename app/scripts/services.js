(function(window, angular, undefined) {

'use strict';

// define the module
var services = angular.module('app.services', []);

services.factory('Telemetry', ['$resource',
    function($resource) {
        return $resource(
            'http://data.bluerobotics.com/telemetry/:id',
            {id:'@id'},
            {
                'query': {
                    method: 'GET'
                }
            }
        );
    }
]);

services.factory('LiveTelemetry', ['$rootScope', '$interval', 'pollrate', 'Telemetry',
    function($rootScope, $interval, pollrate, Telemetry) {
        // state vars
        var promise;
        var items = [];

        // i shouldn't need these...
        var rad = function(x) {
            return x * Math.PI / 180;
        };
        var getDistance = function(p1, p2) {
            var R = 6378137; // Earth’s mean radius in meter
            var dLat = rad(p2.lat - p1.lat);
            var dLong = rad(p2.lng - p1.lng);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
                Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d; // returns the distance in meter
        };

        // calculate derived data
        var timezone_offset =  (new Date()).getTimezoneOffset() * 60000;
        var calculate_dt = function(b, a) {
            return (b.derived.time - a.derived.time) / 1000.0; // seconds
        };
        var calculate_dx = function(b, a) {
            // help! the LatLng function is returning undefined...why?!
            var from = {lat: a.data.latitude, lng: a.data.longitude};
            var to = {lat: b.data.latitude, lng: b.data.longitude};
            // var from = google.maps.LatLng(a.data.latitude, a.data.longitude);
            // var to = google.maps.LatLng(b.data.latitude, b.data.longitude);
            // help! the LatLng function is returning undefined...why?!
            // return google.maps.geometry.spherical.computeDistanceBetween(from, to);
            return getDistance(from, to); // m
        };
        var calculate_derived_data = function(new_items, old_items) {
            for(var i = 0; i < new_items.length; i++) {
                var derived = {
                    time: new Date(new_items[i]._date).getTime() - timezone_offset
                };
                new_items[i].derived = derived;

                if(i === 0) {
                    if(old_items.length > 0) {
                        derived.dx = calculate_dx(new_items[i], old_items[old_items.length-1]);
                        derived.dt = calculate_dt(new_items[i], old_items[old_items.length-1]);
                    }
                    else {
                        // there was no previous data
                        derived.dx = 0;
                        derived.dt = 1;
                    }
                }
                else {
                    derived.dx = calculate_dx(new_items[i], new_items[i-1]);
                    derived.dt = calculate_dt(new_items[i], new_items[i-1]);
                }
                derived.v = derived.dx / derived.dt;
            }
        };

        // update function
        var update = function(mission) {
            var params = {
                sort: '-_date',
                limit: 1000,
                where: { mission: mission }
            };
            if(items.length > 0)
                params.where._date = { $gt: items[items.length - 1]._date };

            // stupid angular removes $gt, so stringify it ahead of time
            params.where = JSON.stringify(params.where);

            Telemetry.query(params, function(data){
                if(data.items.length > 0) {
                    // reverse query sorting for calculating derived data
                    data.items.reverse();
                    calculate_derived_data(data.items, items);

                    // add new items to the stack and notify listeners
                    items = data.items.concat(items);
                    console.log('Telemetry update:', data.items.length, 'new items');
                    $rootScope.$broadcast('telemetry-update', data.items);
                }
            });
        };

        // public functions
        return {
            init: function(mission){
                if(promise) $interval.cancel(promise);
                items = []; // must always be sorted from news to oldest

                // create initial request
                console.log('Initiating live telemetry polling for', mission);
                update(mission);

                // periodically poll for updates
                promise = $interval(function(){
                    update(mission);
                }, pollrate);
            },
            items: function(){
                return items;
            }
        };
    }
]);

})(window, window.angular);
