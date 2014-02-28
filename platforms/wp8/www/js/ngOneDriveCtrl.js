(function () {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'ngOneDriveCtrl';

    var APP_NAME = 'skyApp',
        CONTROLLER_NAME = 'SkyListCtrl',
        ROOT_TITLE = 'Root',
        CLIENT_ID = "0000000048113444",
        REDIRECT_URI = "https://login.live.com/oauth20_desktop.srf";

    // Define the controller on the module.
    // Inject the dependencies.
    // Point to the controller definition function.
    angular.module('app', []).controller(controllerId, ['$scope', '$http', '$q', function ($scope, $http, $q) {

        function getFilesByName(name){
            return $scope.filesAndFolders.filter(
                function (obj) {
                    return obj.name === name;
                })[0];
        }

        var skyDriveManager = new SkyDriveManager();
        skyDriveManager.setClientId(CLIENT_ID);
        skyDriveManager.setRedirectUri(REDIRECT_URI);
        
        skyDriveManager.onControllerCreated($http, $q);

        var directoryId = [];

        $scope.directory = ROOT_TITLE;

        $scope.displayFolder = function (folderName) {
            var folderId = getFilesByName(folderName).id;

            skyDriveManager.loadFilesData(folderId + '/files')
                .then(
                function (data) {
                    $scope.filesAndFolders = data;
                    $scope.directory += '/' + folderName;
                    directoryId.push(folderId);
                }
            );
        };

        $scope.toPreFolder = function () {
            var dirArr = $scope.directory.split('/'),
                directoryToLoad = directoryId.length - 2 >= 0 ? directoryId[directoryId.length - 2] + '/files' : null;

            skyDriveManager.loadFilesData(directoryToLoad).then(
                function (data) {
                    $scope.filesAndFolders = data;

                    directoryId.splice(directoryId.length - 1, 1);

                    dirArr.splice(dirArr.length - 1, 1);
                    $scope.directory = dirArr.join("/");
                }
            );
        };

        $scope.downloadFile = function(name){
            /*var onSuccess = function(res){
             //window.location=targetFile.fullPath;
             console.log(targetFile.fullPath);
             //cordova.exec(null, null, 'FileOpening', 'open', [targetFile.fullPath]);
             //console.log('end');
             //console.log( fileSystem.root.fullPath);
             },
             onError = function(res){
             console.log('onError ');
             },
             onProgress = function(res){
             console.log('progress ' + res);
             };*/

            skyDriveManager.downloadFile(getFilesByName(name).source, name , $scope.directory);

        }

        skyDriveManager.loadUserInfo().then(
            function (userInfo) {
                $scope.userName = userInfo.name;
            }
        );

        skyDriveManager.loadFilesData().then(
            function (data) {
                $scope.filesAndFolders = data;
            }
        );
    }]);
})();