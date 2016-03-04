var driveCtrl = angular.module('driveCtrl', ['mapService']);

driveCtrl.controller('driveCtrl', ['$scope', '$http', 'mapService', '$interval', function($scope, $http, mapService, $interval) {
    $scope.tripStarted = false;
    $scope.tripEvents = [];
    $scope.tripDuration = 0;
    $scope.tripDistance = 0;

    var tripTracker;
    var distanceTracker;

     $http.get('/api/devices')
        .success(function(data) {
            $scope.devices = data;
        })
        .error(function(data) {
            console.log('error: ' + data);
        });

    $scope.startTrip = function() {
        $scope.tripStarted = true;
        var deviceId = $scope.selectedDevice ? $scope.selectedDevice._id : null;
        mapService.initiateTrip($scope.tripForm.start, $scope.tripForm.end, deviceId);
        track();
        tripTracker = $interval(track, 1000);
        distanceTracker = $interval(trackDistance, 100);

        $scope.tripEvents.push({
            title: 'Trip Started',
            message: 'Sit back and enjoy the ride!'
        });
    }

    function trackDistance() {
        $scope.tripDistance = parseInt(mapService.getDistanceTraveled());
    }

    function track() {
        if (mapService.tripStarted && !mapService.isTripEnded()) {
            $scope.tripDuration += 1;
            var coords = mapService.getCurrentLocation();

            for (var i = 0; i < mapService.geofences.length; i++) {
                var geo = mapService.geofences[i];
                var distance = mapService.distanceBetween(geo.centerLat, geo.centerLng, coords.lat, coords.lng);
                if (distance > geo.radius && geo.inside) {
                    geo.inside = false;
                    // Add geofence exit event
                    $scope.tripEvents.push({
                        title: 'Exiting Geofence',
                        message: geo.exitMsg
                    });
                } else if (distance <= geo.radius && !geo.inside) {
                    geo.inside = true;
                    // Add geofence enter event                    
                    $scope.tripEvents.push({
                        title: 'Entering Geofence',
                        message: geo.enterMsg
                    });
                }
            }
        } else if (mapService.tripStarted) {
            $scope.tripDuration += 1;

            // Add trip ended event
            $scope.tripEvents.push({
                title: 'Trip Ended',
                message: 'You have arrived at your destination'
            });
            $interval.cancel(tripTracker);
            $interval.cancel(distanceTracker);
        }
    }
}]);
