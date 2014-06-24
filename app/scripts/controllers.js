(function(window, angular, undefined) {

'use strict';

var controllers = angular.module('app.controllers', []);

controllers.controller('StaticCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
        // a generic static content controller

        // the homepage uses this
        $scope.showSearch = $rootScope.showSearch;
    }]);


})(window, window.angular);
