'use strict';

// Mapbox API
const accessToken = 'pk.eyJ1IjoidGFhcGVzaCIsImEiOiJjaWt4eW9iNXgwMHo4dnltM2x4eTJ4eHE3In0.04-WgulwzLNQTZLRinDiJw';
const mapboxBase = 'https://api.mapbox.com/';
const baseGeocoding = mapboxBase + 'geocoding/v5/mapbox.places/';
const baseDirections = mapboxBase + 'v4/directions/mapbox.driving/';
const requestTail = '.json?access_token=' + accessToken;

const lineStyle = {
    'color': '#1FBAD6',
    'weight': 5,
    'opacity': 0.60
};

const carIcon = L.icon({
    iconUrl: 'img/car.svg',
    iconSize: L.point(32, 32)
});

$(function() {
    mapboxInit();
});

function mapboxInit() {
    var map = {};

    // Intialize mapbox map
    L.mapbox.accessToken = accessToken;
    map = L.mapbox.map('map', 'mapbox.streets', { zoomControl: false }) 
        .setView([32.78194730000001, -96.79070819999998], 17);
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
}

function initiateTrip(start, end) {
    var queryStart = baseGeocoding + start.replace(' ', '+') + requestTail;
    var queryEnd = baseGeocoding + end.replace(' ', '+') + requestTail;

    var startLat, startLng, endLat, endLng;

    $.when(
         $.getJSON(queryStart, function(response) {
            startLat = response.features[0].center[1];
            startLng = response.features[0].center[0];
         }),

         $.getJSON(queryEnd, function(response) {
            endLat = response.features[0].center[1];
            endLng = response.features[0].center[0];
        })
     ).then(function() {
        console.log(startLat + ' ' + startLng);
        console.log(endLat + ' ' + endLng);
        displayRoute(startLat, startLng, endLat, endLng);
     });
}

function displayRoute(startLat, startLng, endLat, endLng) {
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

    var directionsQuery = baseDirections + getLatLngString(startLng, startLat, endLng, endLat) + requestTail;
    $.getJSON(directionsQuery, function(data) {
        var geojson = data.routes[0].geometry;
        L.geoJson(geojson, { style: lineStyle }).addTo(map);

        var distance = data.routes[0].distance;
        var duration = data.routes[0].duration;

        simulateDrive(startLat, startLng, geojson, duration);
    });
}

function simulateDrive(startLat, startLng, geojson, duration) {
    // Reverse lat lng for each coordinate
    var coords = geojson.coordinates;
    var numCoords = coords.length;
    for (var i = 0; i < numCoords; i++) {
        var tmp = coords[i][0];
        coords[i][0] = coords[i][1];
        coords[i][1] = tmp;
    }

    // Duration is in seconds; convert to milliseconds
    var trip = L.Marker.movingMarker(coords,
        duration*1000, {icon: carIcon}).addTo(map);
    trip.start();
}

/**
 * Format two coordinates into a request string to use with Mapbox API
 */
function getLatLngString(startLat, startLng, endLat, endLng) {
    return startLat + ',' + startLng + ';' + endLat + ',' + endLng;
}
