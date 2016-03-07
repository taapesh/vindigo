'use strict';

angular.module('mapService', [])
    .factory('mapService', ['$interval', '$http', function($interval, $http) {
        // Mapbox API
        const accessToken = 'pk.eyJ1IjoidGFhcGVzaCIsImEiOiJjaWt4eW9iNXgwMHo4dnltM2x4eTJ4eHE3In0.04-WgulwzLNQTZLRinDiJw';
        const mapboxBase = 'https://api.mapbox.com/';
        const baseGeocoding = mapboxBase + 'geocoding/v5/mapbox.places/';
        const baseDirections = mapboxBase + 'v4/directions/mapbox.driving/';
        const requestTail = '.json?access_token=' + accessToken;

        // Static map generation
        const staticBase = 'https://api.mapbox.com/v4/mapbox.streets-basic/';
        const startPin = 'pin-s-star+1F3A93';
        const endPin = 'pin-s-embassy+1F3A93';

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

        // Geofences
        mapService.geofences = [];

        // Has the trip started?
        mapService.tripStarted = false;

        // Main map object
        var map = {};

        // Moving marker that represents the car driving
        var trip = {};

        // Start and end coordinates of the trip
        var startLat, startLng, endLat, endLng;

        // Last known LatLng of the trip
        var lastLat, lastLng;

        // Total distance and duration for the trip
        var distance, duration;

        // Distance traveled so far in the trip
        var distanceTraveled = 0;

        // Interval to track distance
        var distanceTracker;

        // Device ID, will save the trip if not null
        var selectedDevice;

        // Coordinates obtained from the mapbox directions API
        var directionsGeoJson = {};
        
        // Intialize mapbox map
        L.mapbox.accessToken = accessToken;
        map = L.mapbox.map('map', 'mapbox.streets', { zoomControl: false }) 
            .setView([32.78194730000001, -96.79070819999998], 17);
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();

        // Mapbox layers
        var markerLayer = L.mapbox.featureLayer().addTo(map);
        var geofenceLayer = L.mapbox.featureLayer().addTo(map);
        var directionsLayer = L.mapbox.featureLayer().addTo(map);

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

                var geofenceCircle = L.circle([centerLat, centerLng], radius, circleOptions).addTo(geofenceLayer);
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

            markerLayer.setGeoJSON(markerGeoJson);
        }

        function getDirectionsAndDisplayRoute() {
            var directionsQuery = baseDirections + getLatLngString(startLng, startLat, endLng, endLat) + requestTail;
            
            $.getJSON(directionsQuery, function(data) {
                directionsGeoJson = data.routes[0].geometry;

                L.geoJson(directionsGeoJson, { style: lineStyle }).addTo(map);

                distance = data.routes[0].distance;
                duration = data.routes[0].duration;

                var numCoords = directionsGeoJson.coordinates.length;
                for (var i = 0; i < numCoords; i++) {
                    var tmp = directionsGeoJson.coordinates[i][0];
                    directionsGeoJson.coordinates[i][0] = directionsGeoJson.coordinates[i][1];
                    directionsGeoJson.coordinates[i][1] = tmp;
                }
                var bounds = L.latLngBounds(directionsGeoJson.coordinates);
                map.fitBounds(bounds.pad(0.1));
                simulateDrive();
            });
        }

        function simulateDrive() {
            trip = L.Marker.movingMarker(directionsGeoJson.coordinates,
                duration*1000, {icon: carIcon}).addTo(map);
            trip.start();
            mapService.tripStarted = true;
            trackDistance();
            distanceTracker = $interval(trackDistance, 100);

            // Save trip if a device was chosen
            if (selectedDevice) {
                saveTrip();
            } else {
                console.log('No device selected');
            }
        }

        function createStaticMapUrl() {
            // Encode polyline using directions coordinates
            var polylineString = encodeURIComponent(polyline.encode(directionsGeoJson.coordinates));

            // Get bounds of map using driving route
            var numCoords = directionsGeoJson.coordinates.length;
            for (var i = 0; i < numCoords; i++) {
                var tmp = directionsGeoJson.coordinates[i][0];
                directionsGeoJson.coordinates[i][0] = directionsGeoJson.coordinates[i][1];
                directionsGeoJson.coordinates[i][1] = tmp;
            }
            //var bounds = geojsonExtent(directionsGeoJson);
            var _bounds = L.latLngBounds(directionsGeoJson.coordinates).pad(0.1);

            var bounds = [
                _bounds._southWest.lat,
                _bounds._southWest.lng,
                _bounds._northEast.lat,
                _bounds._northEast.lng
            ];

            // The size of the desired map
            var size = [135, 135];

            // Calculate a zoom level and centerpoint for this map
            var vp = geoViewport.viewport(bounds, size);

            var url = staticBase;
            url += startPin + '(' + startLng + ',' + startLat + '),';
            url += endPin + '(' + endLng + ',' + endLat + '),';
            url += 'path+1FBAD6(' + polylineString + ')/'
            url += vp.center.join(',') + ',' + vp.zoom + '/' + size.join('x') + '@2x.png';
            url += '?access_token=' + L.mapbox.accessToken;
            console.log('static map url: ' + url);
            return url;
        }

        function saveTrip() {
            var url = createStaticMapUrl();

            $http.post('/api/trips', {
                distance: distance,
                duration: duration,
                start_address: null,
                end_address: null,
                start_lat: startLat,
                start_lng: startLng,
                end_lat: endLat,
                end_lng: endLng,
                device_id: selectedDevice,
                static_url: url
            })
            .success(function(data) {
                console.log('trip saved');
            })
            .error(function(data) {
                console.log('error: ' + data);
            });

            $http.post('/api/devices/' + selectedDevice + '/log_trip', {
                distance: distance,
                duration: duration,
                end_lat: endLat,
                end_lng: endLng
            })
            .success(function(data) {
                console.log('device updated');
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
