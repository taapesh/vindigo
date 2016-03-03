// Declares the initial angular module and grabs other controllers and services.
var app = angular.module('vindigo', ['ngRoute', 'deviceCtrl', 'driveCtrl', 'vindigoMap']);

// Clear input field and unfocus it on enter pressed
app.directive('resetOnEnter', function() {
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