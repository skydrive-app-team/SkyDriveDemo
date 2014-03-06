(function () {
    'use strict';

    var controllerId = 'ngOneDriveCtrl', // Controller name is handy for logging
        ROOT_TITLE = 'Root',
        CLIENT_ID = "0000000048113444",
        REDIRECT_URI = "https://login.live.com/oauth20_desktop.srf",
        NAME_DB = 'oneDrivePhoneDB',
        DOWNLOADED_STATE = 'downloaded',
        NOT_DOWNLOADED_STATE = 'notDownloaded',
        PROGRESS_STATE = 'progress';
    // Define the controller on the module.
    // Inject the dependencies.
    // Point to the controller definition function.
    angular.module('app', []).controller(controllerId, ['$scope', '$http', '$q' , function ($scope, $http, $q) {

        var skyDriveManager = new SkyDriveManager(),
            dbManager = new DbManager(NAME_DB),
            directoryId = [],

            getFilesByName =  function(name){
                return $scope.filesAndFolders.filter(
                    function (obj) {
                        return obj.name === name;
                    })[0];
            },

            getFilesById =  function(id){
                return $scope.filesAndFolders.filter(
                    function (obj) {
                        return obj.id === id;
                    })[0];
            },

            addDownloadState = function(data){
                data.forEach(function(obj){
                if(obj.type !== 'folder'){
                    obj.state = NOT_DOWNLOADED_STATE;
                }
                });
            },

            updateStateOfDb = function(){
                $scope.filesAndFolders.forEach(function(obj){
                    if (obj.type != 'folder'){
                        dbManager.read(obj.id,function(fileData){
                            if (!fileData) return;
                            console.log(JSON.stringify(fileData));
                            var file = getFilesById(fileData.id);
                            file.state = fileData.state;
                            file.localPath = fileData.localPath;
                            $scope.$apply();
                        });
                    }
                });
            }

        skyDriveManager.setClientId(CLIENT_ID);
        skyDriveManager.setRedirectUri(REDIRECT_URI);
        skyDriveManager.onControllerCreated($http, $q);

        dbManager.create();

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

                    updateStateOfDb();
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

                    updateStateOfDb();
                }
            );
        };

        $scope.openFile = function(file){
            cordova.exec(null, null, 'FileOpening', 'open', [file.localPath]);
        };

        $scope.downloadFile = function(file){
            // $scope.display();
            file.state = PROGRESS_STATE;

            console.log('>>>>>>>>>>>>>>download');
            dbManager.add({
                id: file.id,
                state: PROGRESS_STATE,
                url: file.source,
                localPath: file.localPath
            });

            console.log(JSON.stringify({
                id: file.id,
                state: PROGRESS_STATE,
                url: file.source,
                localPath: file.localPath
            }));

            file.progress = "0";
            var onSuccess = function(filePath){
                    file = getFilesByName(file.name);
                    console.log('onSuccess ' + file.name);
                    file.localPath = filePath;
                    file.state = DOWNLOADED_STATE;

                    dbManager.add({
                        id: file.id,
                        state: DOWNLOADED_STATE,
                        url: file.source,
                        localPath: file.localPath
                    });
                    $scope.$apply();
                },
                onError = function(res){
                    console.log('onError '+res);
                    file.state = NOT_DOWNLOADED_STATE;
                    dbManager.remove(file.id);
                    $scope.apply();
                },
                onProgress = function(res){
                    console.log('onProgress ' + file.name);

                    var fileNew = getFilesById(file.id);

                    fileNew.state = PROGRESS_STATE;
                    fileNew.progress = res;

                    $scope.$apply();
                };

            skyDriveManager.downloadFile(file.source, file.name, $scope.directory,onSuccess,onError,onProgress);
        };

        $scope.reload = function(file){
            $scope.downloadFile(file);
        };

        skyDriveManager.loadUserInfo().then(
            function (userInfo) {
                $scope.userName = userInfo.name;
            }
        );

        skyDriveManager.loadFilesData().then(
            function (data) {
                addDownloadState(data);
                $scope.filesAndFolders = data;

                updateStateOfDb();
            }
        );
    }]);
})();