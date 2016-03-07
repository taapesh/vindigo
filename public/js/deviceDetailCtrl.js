var deviceDetailCtrl = angular.module('deviceDetailCtrl', []);

deviceDetailCtrl.controller('deviceDetailCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    $scope.staticBase = 
    $scope.accessToken = 'pk.eyJ1IjoidGFhcGVzaCIsImEiOiJjaWt4eW9iNXgwMHo4dnltM2x4eTJ4eHE3In0.04-WgulwzLNQTZLRinDiJw';

    $http.get('/api/devices/' + $routeParams.device_id)
        .success(function(data) {
            $scope.device = data;
        })
        .error(function(data) {
            console.log('error: ' + data);
            // Handle device not found
        });

    $http.get('/api/devices/' + $routeParams.device_id + '/trips')
        .success(function(data) {
            $scope.trips = data;
        })
        .error(function(data) {
            console.log('error: ' + data);
        })
}]);
