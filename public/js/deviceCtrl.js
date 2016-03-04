var deviceCtrl = angular.module('deviceCtrl', []);

deviceCtrl.controller('deviceCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get('./api/devices')
        .success(function(data) {
            $scope.devices = data;
        })
        .error(function(data) {
            console.log('error: ' + data);
        });

    $scope.createDevice = function() {
        $http.post('./api/devices', $scope.newDeviceForm)
            .success(function(data) {
                $scope.devices.push(data);
                console.log(data);
            })
            .error(function(data) {
                console.log('error: ' + data);
            });
    };

    $scope.deleteDevice = function(id, index) {
        $http.delete('./api/devices/' + id)
            .success(function(data) {
                $scope.devices.splice(index, 1);
                console.log(data);
            })
            .error(function(data) {
                console.log('error: ' + data);
            });
    };

    $scope.resetDevice = function(id, index) {
        $http.post('./api/devices/' + id + '/reset')
            .success(function(data) {
                $scope.devices[index] = data;
                //device = data;
            })
            .error(function(data) {
                console.log('error: ' + data);
            });
    }
}]);