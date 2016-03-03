var vindigo = angular.module('vindigo', ['vindigoMap']);

// Device controller =============================================================
vindigo.controller('deviceController', ['$scope', '$http', function($scope, $http) {
    $http.get('./api/devices')
        .success(function(data) {
            $scope.devices = data;
            console.log(data);
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

// Drive Controller ==========================================================
vindigo.controller('driveController', ['$scope', '$http', vindigoMap, function($scope, $http) {
    $scope.startTrip = function() {
        initiateTrip($scope.tripForm.start, $scope.tripForm.end);
    }
}]);


// Directives =================================================================

// Clear input field and unfocus it on enter pressed
vindigo.directive('resetOnEnter', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind("keypress", function (event) {
                if(event.which === 13) {
                    element.val(null);
                    element.blur();
                }
            });
        }
    }
});
