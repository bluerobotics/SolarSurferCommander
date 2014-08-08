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
                    method: 'GET',
                    // params: {id: '@id'},
                    // transformResponse: function(data) {
                    //     return angular.fromJson(data).items;
                    // },
                    // isArray: true
                }
            }
        );
    }
]);

})(window, window.angular);
