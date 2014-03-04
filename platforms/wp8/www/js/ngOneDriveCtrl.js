(function () {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'ngOneDriveCtrl';

    var APP_NAME = 'skyApp',
        CONTROLLER_NAME = 'SkyListCtrl',
        ROOT_TITLE = 'Root',
        CLIENT_ID = "0000000048113444",
        REDIRECT_URI = "https://login.live.com/oauth20_desktop.srf",
        NAME_DB = 'oneDrivePhoneDB',
        DOWNLOADED_STATE = 'downloaded',
        NOT_DOWNLOADED_STATE = 'notDownloaded',
        PROGRESS = 'progress';
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
                            console.log(JSON.stringify(fileData));
                            var file = getFilesById(fileData.idFile);
                            file.state = fileData.state;
                            file.openPath = fileData.openPath;
                            console.log('asdasdasdasd');
                            if(file.state == PROGRESS){
                                console.log('mmmmmmmmmmmmmm ');
                                $scope.downloadFile(file);
                            }
                            //console.log('apply ' + getFilesById(fileData.idFile).state );
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
            cordova.exec(null, null, 'FileOpening', 'open', [file.openPath]);
        };

        $scope.downloadFile = function(file){
           // $scope.display();
            file.state = PROGRESS;

            dbManager.add({
                idFile: file.id,
                state: PROGRESS,
                url: file.source,
                openPath: file.openPath
            });

            file.progress = "0";
            var onSuccess = function(filePath){
                    console.log('downloaded');
                    console.log('onSuccess ' + file.name);
                    file.openPath = filePath;
                    file.state = DOWNLOADED_STATE;

                    dbManager.add({
                        idFile: file.id,
                        state: DOWNLOADED_STATE,
                        url: file.source,
                        openPath: file.openPath
                    });
                    $scope.$apply();
                },
                onError = function(res){
                    console.log('onError '+res);
                    obj.state = NOT_DOWNLOADED_STATE;
                    dbManager.add({
                        idFile: file.id,
                        state: NOT_DOWNLOADED_STATE,
                        url: file.source,
                        openPath: file.openPath
                    });
                    $scope.apply();
                },
                onProgress = function(res){
                    console.log('onProgress ' + file.name);
                    var file2 = getFilesByName(file.name);
                    console.log(file);
                    file.state = PROGRESS;
                    /*dbManager.add({
                        idFile: file.id,
                        state: PROGRESS,
                        url: file.source//,
                        //openPath: file.openPath
                    });*/
                    file.progress = res;
                    console.log('progress ' + file.progress);
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