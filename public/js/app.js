// Declares the initial angular module and grabs other controllers and services.
var app = angular.module('vindigo', ['ngRoute', 'deviceCtrl', 'deviceDetailCtrl', 'driveCtrl', 'tripDetailCtrl', 'mapService', 'modalCtrl']);

// Clear input field and unfocus it on enter pressed
app.directive('resetOnEnter', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('keypress', function(event) {
                if(event.which === 13) {
                    element.val(null);
                    element.blur();
                }
            });
        }
    }
});

// Keeps an element in the viewport by setting the margin-top
// to be the scroll amount
app.directive('keepInView', function($window) {
    return {
        link: function(scope, element, attrs) {
            var windowEl = angular.element($window);

            var handler = function() {
                element.css('margin-top', windowEl.scrollTop() + 'px');
            }
            windowEl.on('scroll', scope.$apply.bind(scope, handler));
            handler();
        }
    };
});

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $routeProvider
        .when('/', {
            templateUrl: '/views/home.html'
        })
        .when('/devices', {
            templateUrl: '/views/devices.html',
            controller: 'deviceCtrl'
        })
        .when('/devices/:device_id', {
            templateUrl: '/views/device_detail.html',
            controller: 'deviceDetailCtrl'
        })
        .when('/drive', {
            templateUrl: '/views/drive.html',
            controller: 'driveCtrl'
        })
        .when('/trips/:trip_id', {
            templateUrl: '/views/trip_detail.html',
            controller: 'tripDetailCtrl'
        })
        .otherwise({
            templateUrl: '/404.html'
        });  
}]);
