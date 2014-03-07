(function () {
    'use strict';

    var controllerId = 'ngOneDriveCtrl', // Controller name is handy for logging
        ROOT_TITLE = 'OneDrive',
        CLIENT_ID = "0000000048113444",
        REDIRECT_URI = "https://login.live.com/oauth20_desktop.srf",
        DOWNLOADED_STATE = 'downloaded',
        NOT_DOWNLOADED_STATE = 'notDownloaded',
        PROGRESS_STATE = 'progress';
    // Define the controller on the module.
    // Inject the dependencies.
    // Point to the controller definition function.
    angular.module('app', []).controller(controllerId, ['$scope', '$http', '$q' , function ($scope, $http, $q) {
        document.addEventListener("backbutton", onBackKeyDown, true);
        function onBackKeyDown() {
            toPreFolder();
        }
        var oneDriveManager = new OneDriveManager(),
            dataBase,
            directoryId = [],

            getFilesByParameter =  function(parameter ,value){
                return $scope.filesAndFolders.filter(
                    function (obj) {
                        return obj[parameter] === value;
                    })[0];
            },

            addDownloadState = function(data){
                data.forEach(function(obj){
                    if(obj.type !== 'folder'){
                        obj.state = NOT_DOWNLOADED_STATE;
                    }
                });
            },

            toPreFolder = function () {
                if(ROOT_TITLE == $scope.directory)
                {
                    navigator.app.exitApp();
                    return;
                }
                var dirArr = $scope.directory.split('/'),
                    directoryToLoad = directoryId.length - 2 >= 0 ? directoryId[directoryId.length - 2] + '/files' : null;

                oneDriveManager.loadFilesData(directoryToLoad).then(
                    function (data) {
                        addDownloadState(data);

                        $scope.filesAndFolders = data;

                        directoryId.splice(directoryId.length - 1, 1);

                        dirArr.splice(dirArr.length - 1, 1);
                        $scope.directory = dirArr.join("/");

                        updateStateOfDb();
                    }
                );
            },

            updateStateOfDb = function(){
                $scope.filesAndFolders.forEach(function(obj){
                    if (obj.type != 'folder'){
                        dataBase.readItem(obj.id, function(fileData){
                            if (!fileData) return;
                            console.log(JSON.stringify(fileData));
                            var file = getFilesByParameter('id', fileData.id);
                            file.state = fileData.state;
                            file.localPath = fileData.localPath;
                            console.log(file.name+'  ' +file.startProgress+'    '+file.state);
                            if (!file.startProgress && file.state == PROGRESS_STATE){
                                $scope.downloadFile(file);
                            }
                            $scope.$apply();
                        });
                    }
                });
            };

        oneDriveManager.setClientId(CLIENT_ID);
        oneDriveManager.setRedirectUri(REDIRECT_URI);
        oneDriveManager.onControllerCreated($http, $q);

        $scope.directory = ROOT_TITLE;

        $scope.displayFolder = function (folderName) {
            var folderId = getFilesByParameter('name', folderName).id;

            oneDriveManager.loadFilesData(folderId + '/files')
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
        $scope.signOut = oneDriveManager.signOut;

        $scope.openFile = function(file){
            cordova.exec(null, null, 'FileOpening', 'open', [file.localPath]);
        };

        $scope.downloadFile = function(file){
            file.state = PROGRESS_STATE;
            file.startProgress = true;
            file.progress = "0";
            dataBase.addItem({
                id: file.id,
                state: PROGRESS_STATE,
                url: file.source,
                localPath:file.localPath
            });

            var onSuccess = function(filePath){
                    var fileNew = getFilesByParameter('name', file.name);
                    console.log('onSuccess ' + fileNew.name);
                    fileNew.startProgress = false;
                    fileNew.localPath = filePath;
                    fileNew.state = DOWNLOADED_STATE;
                    dataBase.addItem({
                        id: fileNew.id,
                        state: DOWNLOADED_STATE,
                        url: fileNew.source,
                        localPath: fileNew.localPath
                    });
                    $scope.$apply();
                },
                onError = function(res){
                    console.log('onError>>>>>>>>>> '+res);
                    var fileNew = getFilesByParameter('name', file.name);

                    fileNew.startProgress = false;
                    fileNew.state = NOT_DOWNLOADED_STATE;
                    dataBase.removeItem(fileNew.id);
                    $scope.$apply();
                },
                onProgress = function(res){
                    console.log('onProgress ' + file.name);

                    var fileNew = getFilesByParameter('id', file.id);

                    fileNew.state = PROGRESS_STATE;
                    fileNew.progress = res;

                    $scope.$apply();
                };

            oneDriveManager.downloadFile(file.source, $scope.directory + '/' + file.name, onSuccess, onError, onProgress);
        };

        oneDriveManager.loadUserInfo().then(
            function (userInfo) {

                DbManager.createDB(userInfo.id, "loadState",'id',['state', 'url', 'localPath'], function(db){
                    dataBase = db;
                });

                $scope.userName = userInfo.name;
            }
        );

        oneDriveManager.loadFilesData().then(
            function (data) {
                addDownloadState(data);
                $scope.filesAndFolders = data;

                updateStateOfDb();
            }
        );
    }]);
})();