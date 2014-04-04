(function () {
    'use strict';

    var controllerId = 'ngOneDriveCtrl', // Controller name is handy for logging
        ROOT_TITLE = 'OneDrive',
        CLIENT_ID = "0000000048113444",
        REDIRECT_URI = "https://login.live.com/oauth20_desktop.srf",
        DOWNLOADED_STATE = 1,
        NOT_DOWNLOADED_STATE = 0,
        PROGRESS_STATE = 2;
    // Define the controller on the module.
    // Inject the dependencies.
    // Point to the controller definition function.
    angular.module('app', []).controller(controllerId, ['$scope', '$http', '$q' , function ($scope, $http, $q) {
        var oneDriveManager = new OneDriveManager(),
            dataBase,
            directoryIds = [],

            getFilesByParameter = function(parameter ,value){
                return $scope.filesAndFolders.filter(
                    function (obj) {
                        return obj[parameter] === value;
                    });
            },

            addDownloadState = function(fileList){
                fileList.forEach(function(fileInfo){
                    if(fileInfo.type !== 'folder'){
                        setFileState(fileInfo, NOT_DOWNLOADED_STATE);
                    }
                });
            },

            setFileState = function(file, state) {
                file.state = state;
            },

            toPreFolder = function () {
                if ($scope.directory == ROOT_TITLE) {
                    navigator.app.exitApp();
                    //return;
                }
                var dirArr = $scope.directory.split('/'),
                    directoryToLoad = directoryIds.length - 2 >= 0 ? directoryIds[directoryIds.length - 2] + '/files' : null;

                oneDriveManager.loadFilesData(directoryToLoad).then(
                    function (data) {
                        addDownloadState(data);

                        $scope.filesAndFolders = data;

                        directoryIds.splice(directoryIds.length - 1, 1);

                        dirArr.splice(dirArr.length - 1, 1);
                        $scope.directory = dirArr.join("/");

                        updateStateOfDb();
                    }
                );
            },

            updateStateOfDb = function(){
                $scope.filesAndFolders.forEach(function(fileInfo){
                    if (fileInfo.type != 'folder'){
                        dataBase.readItem(fileInfo.id, function(fileData){
                            if (!fileData) return;
                            var file = getFilesByParameter('id', fileData.id)[0];
                            setFileState(file, fileData.state);
                            file.localPath = fileData.localPath;
                            file.source = fileData.url;
                            if (!file.startProgress && file.state == PROGRESS_STATE){
                                downloadFile(file);
                            }
                            $scope.$apply();
                        });
                    }
                });
            },

            downloadFile=function(file){
                var onSuccess = function(filePath){
                        var fileNew = getFilesByParameter('name', file.name)[0];
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
                        var fileNew = getFilesByParameter('name', file.name)[0];
                        fileNew.startProgress = false;
                        fileNew.state = NOT_DOWNLOADED_STATE;
                        dataBase.removeItem(fileNew.id);
                        $scope.$apply();
                    },
                    onProgress = function(res){
                        var fileNew = getFilesByParameter('id', file.id)[0];
                        fileNew.state = PROGRESS_STATE;
                        fileNew.progress = res;
                        $scope.$apply();
                    };

                oneDriveManager.downloadFile(file.source, $scope.directory + '/' + file.name, onSuccess, onError, onProgress);
            },

            saveStageToDataBase = function(file){
                file.state = PROGRESS_STATE;
                file.startProgress = true;
                file.progress = "0";
                dataBase.addItem({
                    id: file.id,
                    state: PROGRESS_STATE,
                    url: file.source,
                    localPath:file.localPath
                });
            };
        document.addEventListener("backbutton", toPreFolder, true);
        oneDriveManager.setClientId(CLIENT_ID);
        oneDriveManager.setRedirectUri(REDIRECT_URI);
        oneDriveManager.onControllerCreated($http, $q);

        $scope.directory = ROOT_TITLE;

        $scope.displayFolder = function (folderName) {
            var folderId = getFilesByParameter('name', folderName)[0].id;

            oneDriveManager.loadFilesData(folderId + '/files')
                .then(
                function (data) {
                    addDownloadState(data);
                    $scope.filesAndFolders = data;
                    $scope.directory += '/' + folderName;
                    directoryIds.push(folderId);
                    updateStateOfDb();
                }
            );
        };
        $scope.signOut = oneDriveManager.signOut;

        $scope.openFile = function(file){
            window.plugins.fileOpener.open(file.localPath);
        };

        $scope.onClickDownloadButton = function(file){
            saveStageToDataBase(file);
            downloadFile(file);
        };

        $scope.generateDateTime = function(date){
            var strAr = date.split('T');
            return strAr[0] + ' ' + strAr[1].split('+',1);
        };

        oneDriveManager.loadUserInfo().then(
            function (userInfo) {
                DbManager.createDB(userInfo.id, "loadState",'id',['state', 'url', 'localPath'], function(db){
                    dataBase = db;
                });
                $scope.userName = userInfo.name;

                oneDriveManager.loadFilesData().then(
                    function (data) {
                        addDownloadState(data);
                        $scope.filesAndFolders = data;
                        updateStateOfDb();
                    }
                );
            }
        );


    }]);
})();