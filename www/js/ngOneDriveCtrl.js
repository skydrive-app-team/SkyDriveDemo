function ngOneDriveCtrl() {
    'use strict';
    var controllerId = 'ngOneDriveCtrl', // Controller name is handy for logging
        ROOT_TITLE = 'OneDrive',
        SKYDRIVE_CLIENT_ID = "0000000048113444",
        SKYDRIVE_REDIRECT_URI = "http://skydrivesuperdemo.com/skyDrive/index.html",
        GOOGLEDRIVE_CLIENT_ID = "608994791757-mnhak64khir5gggp6328bbn6tovclmc9.apps.googleusercontent.com",
        GOOGLEDRIVE_REDIRECT_URI = "https://www.example.com/oauth2callback",
        DOWNLOADED_STATE = 1,
        NOT_DOWNLOADED_STATE = 0,
        PROGRESS_STATE = 2,
        scope,
        http,
        q,
        app,
        driveManager,
        dataBase,
        directoryIds = [],

        getFilesByParameter = function(parameter, value) {
            return scope.filesAndFolders.filter(
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
            if (scope.directory == ROOT_TITLE) {
                navigator.app.exitApp();
            }
            ProgressIndicator.show(true);
            var dirArr = scope.directory.split('/'),
                directoryToLoad = directoryIds.length - 2 >= 0 ? directoryIds[directoryIds.length - 2] + '/files' : null;

            driveManager.loadFilesData(directoryToLoad).then(
                function (data) {
                    addDownloadState(data);

                    scope.filesAndFolders = data;

                    directoryIds.splice(directoryIds.length - 1, 1);

                    dirArr.splice(dirArr.length - 1, 1);
                    scope.directory = dirArr.join("/");

                    updateStateOfDb();
                    ProgressIndicator.hide();
                }
            );
        },

        updateStateOfDb = function() {
            scope.filesAndFolders.forEach(function(fileInfo){
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
                        scope.$apply();
                    });
                }
            });
        },

        downloadFile = function (file) {
            var onSuccess = function (filePath) {
                var fileNew = getFilesByParameter('name', file.name)[0];
                    fileNew = fileNew?fileNew:file;
                    fileNew.startProgress = false;
                    fileNew.localPath = filePath;
                    fileNew.state = DOWNLOADED_STATE;
                    dataBase.addItem({
                        id: fileNew.id,
                        state: DOWNLOADED_STATE,
                        url: fileNew.source,
                        localPath: fileNew.localPath
                    });
                    scope.$apply();
                },
                onError = function (res) {
                    console.log("Error download: "+res);
                    var fileNew = getFilesByParameter('name', file.name)[0];
                    fileNew.startProgress = false;
                    fileNew.state = NOT_DOWNLOADED_STATE;
                    dataBase.removeItem(fileNew.id);
                    scope.$apply();
                },
                onProgress = function(res){
                    var fileNew = getFilesByParameter('id', file.id)[0];
                    fileNew.state = PROGRESS_STATE;
                    fileNew.progress = res;
                    scope.$apply();
                };
            driveManager.downloadFile(file.source, scope.directory + '/' + file.name, onSuccess, onError, onProgress);
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
        },

        run = function (storage) {

            switch (storage) {
                case 'onedrive':
                    driveManager = new OneDriveManager(SKYDRIVE_CLIENT_ID, SKYDRIVE_REDIRECT_URI);
                    break;

                case 'googledrive':
                    driveManager = new GoogleDriveManager(GOOGLEDRIVE_CLIENT_ID, GOOGLEDRIVE_REDIRECT_URI);
                    break;
            }

            driveManager.onControllerCreated(http, q);
            scope.showSignInButton = false;
            driveManager.signIn().then(
                function () {
                    ProgressIndicator.show();
                    driveManager.loadUserInfo().then(
                        function (userInfo) {
                            DbManager.createDB(userInfo.id, "loadState",'id',['state', 'url', 'localPath'], function(db){
                                dataBase = db;
                            });
                            scope.userName = userInfo.name;
                            driveManager.loadFilesData().then(
                                function (data) {
                                    addDownloadState(data);
                                    scope.filesAndFolders = data;
                                    updateStateOfDb();
                                    ProgressIndicator.hide();
                                }
                            );
                        }
                    );
                },
                function (){
                    if(navigator.app){
                        navigator.app.exitApp();
                    }
                    ProgressIndicator.hide();
                    scope.showSignInButton = true;
                }
            );
        },
        
        onControllerCreated = function ($scope, $http, $q) {
            scope = $scope;
            http=$http;
            q=$q;
            document.addEventListener("backbutton", toPreFolder, true);
            scope.directory = ROOT_TITLE;
            scope.showSignInButton = true;

            scope.displayFolder = function (folder) {
                if (folder.count === undefined) return;
                ProgressIndicator.show(true);
                var folderId = folder.id;

                oneDriveManager.loadFilesData(folderId + '/files')
                    .then(
                    function (data) {
                        addDownloadState(data);
                        scope.filesAndFolders = data;
                        scope.directory += '/' + folder.name;
                        directoryIds.push(folderId);
                        updateStateOfDb();
                        ProgressIndicator.hide();
                    }
                );
            };

            scope.StartLogin = function(storage) {
                run(storage);
            };

            scope.signOut = function () {
                driveManager.signOut();
            };

            scope.openFile = function (file) {

                if (file.state == 1) {
                    window.plugins.fileOpener.open(file.localPath);
                    return;
                }

                if (file.embedLink) {
                    window.open(file.embedLink + '?' + driveManager.getAccessToken(), '_blank', 'location=no');
                    return;
                }
            };

            scope.onClickDownloadButton = function (file) {
                saveStageToDataBase(file);
                downloadFile(file);
            };
            
            scope.toPreFolder = function(){
                toPreFolder();
            };

            scope.getStyleForType = function (obj){
                switch (obj.type) {
                    case "album": return {'background': "#3e4bff"};
                    case "audio":
                        return {
                            'background-image': obj.picture?"url(" + obj.picture + ")":'url("img/audio.png")',
                            'background-size': '100%'
                        };
                    case "file": return {
                        'background-image': 'url("img/file.png")',
                        'background-size': '100%'
                    };
                    case "folder": return {'background': "#3e4bff"};
                    case "photo":
                        return {
                            'background-image': "url(" + obj.images[2].source + ")",
                            'background-size': '100%',
                            'background-repeat': 'no-repeat'
                        };
                    case "video":
                        return {
                            'background-image': "url(" + obj.picture + ")",
                            'background-size': '100%'
                        };
                    case "notebook": return {
                        'background-image': 'url("img/oneNote.png")',
                        'background-size': '100%'
                    };
                }
            };

            scope.generateDateTime = function(date){
                var strAr = date.split('T');
                return strAr[0] + ' ' + strAr[1].split('+',1);
            };
            console.log('ennnnn');
        };
    return {
        initialize: function() {
            // Define the controller on the module.
            // Inject the dependencies.
            // Point to the controller definition function.
            app = angular.module('app', []).controller(controllerId, ['$scope', '$http', '$q', onControllerCreated]);
        },

        run: run
    };
}