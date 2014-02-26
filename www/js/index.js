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
var app;
app = {
    // Application Constructor
    initialize: function () {
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
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function () {
    },

    init: function () {
        var APP_NAME = 'skyApp',
            CONTROLLER_NAME = 'SkyListCtrl',
            ROOT_TITLE = 'Root',
            CLIENT_ID = "0000000048113444",
            REDIRECT_URI = "https://login.live.com/oauth20_desktop.srf",

            skyApp = angular.module(APP_NAME, []),
            skyDriveManager = new SkyDriveManager();

        skyDriveManager.setClientId(CLIENT_ID);
        skyDriveManager.setRedirectUri(REDIRECT_URI);

        skyApp.controller(CONTROLLER_NAME, function ($scope, $http, $q) {
                skyDriveManager.onControllerCreated($http, $q);

                var directoryId = [];

                $scope.directory = ROOT_TITLE;

                $scope.displayFolder = function (folderName) {
                    var folderId = $scope.filesAndFolders.filter(
                        function (obj) {
                            return obj.name === folderName;
                        })[0].id;

                    skyDriveManager.loadFilesData(folderId + '/files')
                        .then(
                        function (data) {
                            $scope.filesAndFolders = data;
                            $scope.directory += '/ ' + folderName;
                            directoryId.push(folderId);
                        }
                    );
                };

                $scope.toPreFolder = function () {
                    var dirArr = $scope.directory.split('/'),
                        directoryToLoad = directoryId.length - 2 >= 0 ? directoryId[directoryId.length - 2] + '/files': null;

                        skyDriveManager.loadFilesData(directoryToLoad).then(
                            function (data) {
                                $scope.filesAndFolders = data;

                                directoryId.splice(directoryId.length - 1, 1);

                                dirArr.splice(dirArr.length - 1, 1);
                                $scope.directory = dirArr.join("/ ");
                            }
                        );
                };

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
            }
        );
    }
};
