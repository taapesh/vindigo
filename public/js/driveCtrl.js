var driveCtrl = angular.module('driveCtrl', []);

driveCtrl.controller('driveCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.startTrip = function() {
        initiateTrip($scope.tripForm.start, $scope.tripForm.end);
    }
}]);