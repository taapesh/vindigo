var deviceDetailCtrl = angular.module('deviceDetailCtrl', []);

deviceDetailCtrl.controller('deviceDetailCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    if ($routeParams) {
        console.log('there are params');
    } else console.log('no params');
    console.log($routeParams.length);
    console.log('hello from device detail');
}]);