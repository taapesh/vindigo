var deviceDetailCtrl = angular.module('deviceDetailCtrl', []);

deviceDetailCtrl.controller('deviceDetailCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    $http.get('/api/devices/' + $routeParams.device_id)
        .success(function(data) {
            $scope.device = data;
        })
        .error(function(data) {
            console.log('error: ' + data);
            // Handle device not found
        });
}]);
