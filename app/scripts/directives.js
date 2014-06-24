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


})(window, window.angular);
