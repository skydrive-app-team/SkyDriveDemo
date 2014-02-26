(function () {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'ngOneDriveCtrl';

    // Define the controller on the module.
    // Inject the dependencies.
    // Point to the controller definition function.
    angular.module('app', []).controller(controllerId, ['$scope', function($scope) {
        
        function initialize() {
            $scope.userName = 'John Smith';

        };

        function waitForDeviceReady() {
            document.addEventListener('deviceready', initialize, false);
        };

        $scope.userName = 'Loading..';

        waitForDeviceReady();
    }]);
})();