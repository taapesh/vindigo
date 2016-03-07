var tripDetailCtrl = angular.module('tripDetailCtrl', []);

tripDetailCtrl.controller('tripDetailCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    
    $http.get('/api/trips/' + $routeParams.trip_id)
        .success(function(data) {
            $scope.trip = data;
        })
        .error(function(data) {
            $scope.error = true;
        });
}]);