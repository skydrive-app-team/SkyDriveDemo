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
    angular.module('app', []).controller(controllerId, ['$scope', '$http', '$q' , function ($scope, $http, $q) {

        var skyDriveManager = new SkyDriveManager(),
            directoryId = [],

            getFilesByName =  function(name){
                return $scope.filesAndFolders.filter(
                    function (obj) {
                        return obj.name === name;
                    })[0];
            },

            addDownloadState = function(data){
                data.forEach(function(obj){
                if(obj.type !== 'folder'){
                    obj.state='notDownloaded';
                }
                });
            };

        skyDriveManager.setClientId(CLIENT_ID);
        skyDriveManager.setRedirectUri(REDIRECT_URI);
        
        skyDriveManager.onControllerCreated($http, $q);

        $scope.directory = ROOT_TITLE;

        $scope.displayFolder = function (folderName) {
            var folderId = getFilesByName(folderName).id;

            skyDriveManager.loadFilesData(folderId + '/files')
                .then(
                function (data) {
                    addDownloadState(data);
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
                    addDownloadState(data);
                    $scope.filesAndFolders = data;

                    directoryId.splice(directoryId.length - 1, 1);

                    dirArr.splice(dirArr.length - 1, 1);
                    $scope.directory = dirArr.join("/");
                }
            );
        };

        $scope.openFile = function(file){
            cordova.exec(null, null, 'FileOpening', 'open', [file.localPath]);
        };

        $scope.downloadFile = function(file){
           // $scope.display();
            file.state = 'progress';
            file.progress = "0";
            var onSuccess = function(filePath){
                    console.log('onSuccess ' + file.name);
                    file.localPath = filePath;
                    file.state = 'downloaded';
                    $scope.$apply();
                },
                onError = function(res){
                    console.log('onError '+res);
                    obj.state = 'notDownloaded';
                    $scope.apply();
                },
                onProgress = function(res){
                    console.log('onProgress ' + file.name);
                    file.state = 'progress';
                    file.progress = res ;
                    console.log('progress ' + file.progress);
                    $scope.$apply();
                };
            skyDriveManager.downloadFile(file.source, file.name, $scope.directory,onSuccess,onError,onProgress);
        }

        skyDriveManager.loadUserInfo().then(
            function (userInfo) {
                $scope.userName = userInfo.name;
            }
        );

        skyDriveManager.loadFilesData().then(
            function (data) {
                addDownloadState(data);
                $scope.filesAndFolders = data;
            }
        );
    }]);
})();