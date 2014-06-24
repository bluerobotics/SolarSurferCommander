(function(window, angular, undefined) {

'use strict';

/* Filters */

var filters = angular.module('app.filters', []);

filters.filter('slugify', [
    function() {
        return function(input) {
            return input.replace(/[^\w\s-]/g, "").trim().toLowerCase().replace(/[-\s]+/g, "-");
        };
    }]);

filters.filter('reverse', [
    function() {
        return function(items) {
            return items.slice().reverse();
        };
    }]);

filters.filter('object2Array', [
    function() {
        return function(input) {
            var out = [];
            angular.forEach(input, function(value, key){
                if(key.charAt(0) != '$') out.push(value);
            });
            return out;
        };
    }]);

filters.filter('keys', [
    function() {
        return function(input) {
            if(typeof input !== 'object') return [];
            // console.log(input)
            else return Object.keys(input);
        };
    }]);

filters.filter('unique', [
    function() {
        return function(input, key) {
            var unique = {};
            var uniqueList = [];
            for(var i = 0; i < input.length; i++){
                if(typeof unique[input[i][key]] == "undefined"){
                    unique[input[i][key]] = "";
                    uniqueList.push(input[i]);
                }
            }
            return uniqueList;
        };
    }]);

})(window, window.angular);
