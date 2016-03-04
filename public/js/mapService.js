'use strict';

angular.module('mapService', [])
    .factory('mapService', ['$interval', '$http', function($interval, $http) {
        // Mapbox API
        const accessToken = 'pk.eyJ1IjoidGFhcGVzaCIsImEiOiJjaWt4eW9iNXgwMHo4dnltM2x4eTJ4eHE3In0.04-WgulwzLNQTZLRinDiJw';
        const mapboxBase = 'https://api.mapbox.com/';
        const baseGeocoding = mapboxBase + 'geocoding/v5/mapbox.places/';
        const baseDirections = mapboxBase + 'v4/directions/mapbox.driving/';
        const requestTail = '.json?access_token=' + accessToken;

        const R = 6371000; // radius of earth in meters
        const DEFAULT_RADIUS = 50;

        const lineStyle = {
            'color': '#1FBAD6',
            'weight': 5,
            'opacity': 0.60
        };

        const carIcon = L.icon({
            iconUrl: 'img/car.svg',
            iconSize: L.point(32, 32)
        });

        const circleOptions = {
            color: '#1F3A93',     // Stroke color
            opacity: .8,          // Stroke opacity
            weight: 1.5,          // Stroke weight
            fillColor: '#1F3A93', // Fill color
            fillOpacity: 0.1      // Fill opacity
        };

        // Map service that this factory returns, allowing controller to interact with the map
        var mapService = {};
        mapService.geofences = [];
        mapService.tripStarted = false;

        // Map object that controller will interact with
        var map = {};
        var trip = {};
        var startLat, startLng, endLat, endLng;
        var lastLat, lastLng;
        var distance;
        var duration;
        var tripCoordinates = {};
        var distanceTraveled = 0;
        var distanceTracker;
        var selectedDevice;
        
        // Intialize mapbox map
        L.mapbox.accessToken = accessToken;
        map = L.mapbox.map('map', 'mapbox.streets', { zoomControl: false }) 
            .setView([32.78194730000001, -96.79070819999998], 17);
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();

        mapService.initiateTrip = function(start, end, deviceId) {
            selectedDevice = deviceId;
            var queryStart = baseGeocoding + start.trim().split(' ').join('+') + requestTail;
            var queryEnd = baseGeocoding + end.trim().split(' ').join('+') + requestTail;
    
            $.when(
                $.getJSON(queryStart, function(response) {
                    startLat = response.features[0].center[1];
                    startLng = response.features[0].center[0];
                    lastLat = startLat;
                    lastLng = startLng;
                }),

                $.getJSON(queryEnd, function(response) {
                    endLat = response.features[0].center[1];
                    endLng = response.features[0].center[0];
                })
            ).then(function() {
                displayMarkers();
                getDirectionsAndDisplayRoute();
            });
        }

        mapService.createGeofence = function(data) {
            var address = data.center.trim().split(' ').join('+');
            var query = baseGeocoding + address + requestTail;
            var radius = data.radius ? data.radius : DEFAULT_RADIUS;
            var enterMsg = data.enterMsg ? data.enterMsg : 'Hello';
            var exitMsg = data.exitMsg ? data.exitMsg : 'Goodbye';

            $.getJSON(query, function(data) {
                var center = data.features[0].center;
                var centerLat = center[1];
                var centerLng = center[0];

                var featureLayer = L.mapbox.featureLayer().addTo(map);
                var geofenceCircle = L.circle([centerLat, centerLng], radius, circleOptions).addTo(featureLayer);
                map.fitBounds(geofenceCircle.getBounds().pad(0.5));

                mapService.geofences.push({
                    radius: radius,
                    centerLat: centerLat,
                    centerLng: centerLng,
                    enterMsg: enterMsg,
                    exitMsg: exitMsg,
                    inside: false
                });
            });
        }

        mapService.isTripEnded = function() {
            return trip.isEnded();
        }

        mapService.getCurrentLocation = function() {
            return trip.getLatLng();
        }

        mapService.getDistanceTraveled = function() {
            return distanceTraveled;
        }

        /**
         * Compute linear distance in meters between two LatLng points
         * using Haversine formula
         */
        mapService.distanceBetween = function(geoLat, geoLng, lat, lng) {
            var dLat = toRad(lat - geoLat);
            var dLng = toRad(lng - geoLng);

            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(toRad(geoLat)) * Math.cos(toRad(lat)) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);

            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; 
            return d;
        }

        function displayMarkers() {
            var markerGeoJson = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                
                        properties: {
                            'title': 'Start',
                            'description': '',
                            'marker-size': 'large',
                            'marker-symbol': 'star',
                            'marker-color': '#1F3A93',             
                        },
                
                        geometry: {
                            type: 'Point',
                            coordinates: [startLng, startLat]
                        }
                    },
                    {
                        type: 'Feature',
                        
                        properties: {
                            'title': 'End',
                            'description': '',
                            'marker-size': 'large',
                            'marker-symbol': 'embassy',
                            'marker-color': '#1F3A93',   
                        },
                        
                        geometry: {
                            type: 'Point',
                            coordinates: [endLng, endLat]
                        }
                    }
                ]
            };

            var featureLayer = L.mapbox.featureLayer().addTo(map);
            featureLayer.setGeoJSON(markerGeoJson);
            map.fitBounds(featureLayer.getBounds().pad(0.5));
        }

        function getDirectionsAndDisplayRoute() {
            var directionsQuery = baseDirections + getLatLngString(startLng, startLat, endLng, endLat) + requestTail;

            $.getJSON(directionsQuery, function(data) {
                var geojson = data.routes[0].geometry;
                L.geoJson(geojson, { style: lineStyle }).addTo(map);

                distance = data.routes[0].distance;
                duration = data.routes[0].duration;
                tripCoordinates = geojson.coordinates;

                // Reverse coordinates
                var numCoords = tripCoordinates.length;
                for (var i = 0; i < numCoords; i++) {
                    var tmp = tripCoordinates[i][0];
                    tripCoordinates[i][0] = tripCoordinates[i][1];
                    tripCoordinates[i][1] = tmp;
                }

                simulateDrive();
            });
        }

        function simulateDrive() {
            trip = L.Marker.movingMarker(tripCoordinates,
                duration*1000, {icon: carIcon}).addTo(map);
            trip.start();
            mapService.tripStarted = true;
            trackDistance();
            distanceTracker = $interval(trackDistance, 300);

            // Save trip if a device was chosen
            if (selectedDevice) {
                saveTrip();
            } else {
                console.log('No device selected');
            }
        }

        function saveTrip() {
            $http.post('./api/devices/' + selectedDevice + '/log_trip', {
                distance: distance,
                duration: duration,
                endLat: endLat,
                endLng: endLng
            })
            .success(function(data) {
                console.log('trip saved');
            })
            .error(function(data) {
                console.log('error: ' + data);;
            });
        }

        function trackDistance() {
            var coords = trip.getLatLng();
            var lat = coords.lat;
            var lng = coords.lng;
            distanceTraveled += distanceBetween(lastLat, lastLng, lat, lng);
            lastLat = lat;
            lastLng = lng;

            if (trip.isEnded()) {
                $interval.cancel(distanceTracker);
            }
        }

        function distanceBetween(geoLat, geoLng, lat, lng) {
            var dLat = toRad(lat - geoLat);
            var dLng = toRad(lng - geoLng);

            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(toRad(geoLat)) * Math.cos(toRad(lat)) *
                    Math.sin(dLng/2) * Math.sin(dLng/2);

            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; 
            return d;
        }

        function toRad(x) {
            return x * Math.PI / 180;
        }

        /**
        * Format two coordinates into a request string to use with Mapbox API
        */
        function getLatLngString(startLat, startLng, endLat, endLng) {
            return startLat + ',' + startLng + ';' + endLat + ',' + endLng;
        }

        return mapService;
    }]);