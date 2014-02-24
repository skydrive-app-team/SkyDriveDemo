/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    skyDriveManager: null,
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        /*console.log = function(msg) {
            window.external.notify(msg);
        }*/
        this.init();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    },

    init: function(){
        var ROOT_DIRECTORY = "me/skydrive/files",
            NAME_APP = 'skyApp',
            NAME_CONTROL = 'SkyListCtrl',
            TYPE_FOLDER = 'folder',
            ROOT = 'Root',

            skyApp = angular.module(NAME_APP, []),
            skyDriveManager = new SkyDriveManager(),

            filterFolderData = function(data){
                var returnData = {files: [], folders: []};
                data.forEach(
                    function(obj){
                        if (obj.type === TYPE_FOLDER){
                            returnData.folders.push(obj);
                        } else{
                            returnData.files.push(obj);
                        }
                    });
                return returnData;
            };

        skyApp.controller(NAME_CONTROL, function ($scope, $http, $q){
            var directoryId = [];

            $scope.directory = ROOT;

            var loadFolder = function(request){
                var deferred = $q.defer();

                $http({
                        method: 'GET',
                        url: skyDriveManager.getFilesUrlForDirectory(request)}
                ).success( function (response) {
                        deferred.resolve( filterFolderData(response.data));
                    });
                return deferred.promise;
            };

            $http({
                    method: 'GET',
                    url: skyDriveManager.userInfoURL }
            ).success(
                function (userInfo) {
                    $scope.userName = userInfo.name;
                }
            );

            $scope.displayFolder =  function (folderName){
                var folderId = $scope.filesAndFolders.folders.filter(
                    function(obj) {
                        return obj.name == folderName
                    })[0].id;

                loadFolder(folderId+'/files')
                    .then(
                        function(data){
                            $scope.filesAndFolders = data;
                            $scope.directory += '/ '+folderName;
                            directoryId.push(folderId);
                        }
                    );
            };

            $scope.toPreFolder = function(){
                var dirArr = $scope.directory.split('/');

                if(directoryId.length - 2 >= 0){
                    loadFolder(directoryId[directoryId.length - 2] + '/files').then(
                        function(data){
                            $scope.filesAndFolders = data;
                            directoryId.splice(directoryId.length - 1, 1);
                            dirArr.splice(dirArr.length - 1, 1);
                            $scope.directory = dirArr.join("/ ");
                        }
                    );
                } else {
                    loadFolder(ROOT_DIRECTORY).then(
                        function(data){
                            $scope.filesAndFolders = data;
                            directoryId.splice(directoryId.length - 1, 1);
                            dirArr.splice(dirArr.length - 1, 1);
                            $scope.directory=dirArr.join("/ ");
                        }
                    );
                }
            };

            loadFolder(ROOT_DIRECTORY).then(
                function(data){
                    $scope.filesAndFolders = data;
                }
            );
        });
    }
};
