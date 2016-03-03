'use strict';

angular.module('vindigoMap', [])
    .factory('vindigoMap', function($rootScope, $http) {
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

        var mapService = {};
        var map = {};

        // Intialize mapbox map
        L.mapbox.accessToken = accessToken;
        map = L.mapbox.map('map', 'mapbox.streets', { zoomControl: false }) 
            .setView([32.78194730000001, -96.79070819999998], 17);
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();

        mapService.initiateTrip = function() {

        }

        function getCoordinates() {

        }

        function displayRoute() {

        }

        function startTrip() {

        }

        return mapService;
    });