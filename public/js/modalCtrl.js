var modalCtrl = angular.module('modalCtrl', ['ngAnimate', 'ui.bootstrap', 'mapService']);

modalCtrl.controller('modalCtrl', ['$scope', '$uibModal', 'mapService', function($scope, $uibModal, mapService) {
    $scope.formData = {};

    $scope.open = function(size) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'views/modal.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {

            }
        });

        modalInstance.result.then(function(data) {
            mapService.createGeofence(data);
        });
    };
}]);

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.
modalCtrl.controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
    $scope.ok = function () {
        // Pass form data to the result handler
        $uibModalInstance.close($scope.formData);
    };

    $scope.cancel = function () {
        // Dismiss the modal
        $uibModalInstance.dismiss('cancel');
    };
}]);

