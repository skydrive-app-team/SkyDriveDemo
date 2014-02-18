/**
 * Created by sergey.vlasov on 2/18/14.
 */




(function(global){

    var clientId = '0000000048113444',
        redirectUri = 'http://SkyDriveSuperDemo.com/skyDrive/index.html',
        skyApp = angular.module('skyApp', []);

    skyApp.controller('SkyListCtrl', function ($scope){});

    WL.init({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "wl.skydrive"
    }).then(function(res){
            WL.ui({
                name: "signin",
                element: "signin",
                onloggedin: loggedinSuccessHandler,
                onerror: loggedinErrorHandler
            });
        }, function(res){
            console.log('error '+res);
        });


    function getFiles(){
        WL.api({
            path: "me/skydrive/search?q=*",
            method: "GET"
        }).then( function(response){
                showFiles(response.data);},
            function (responseFailed) {
                console.log('error api ', responseFailed);
            }
        );
    }
    function showFiles(filesArray){
        var scope = angular.element('[ng-controller="SkyListCtrl"]').scope();

        scope.$apply( function(){
            if (!filesArray && filesArray.length > 0){
                console.log('Files not found');
                return;
            }

            var fileList = filesArray.filter( function (obj){
                    return obj.type !== 'folder';
                }),
                folderList = filesArray.filter( function (obj){
                    return obj.type === 'folder';
                });
            folderList.forEach( function(folder){
                folder.child = fileList.filter( function (file){
                    return file.parent_id == folder.id;
                });
            });

            if (fileList.length > 0) {
                var rootSkyDriveId = fileList[0].parent_id.split('.'),
                    rootFile = fileList.filter(function (file){
                        return ((rootSkyDriveId[0] + '.' + rootSkyDriveId[1]) == file.parent_id);
                    });
            }

            scope.rootFiles = rootFile;
            scope.folderList = folderList;
        });
    }

    function loggedinSuccessHandler(){
        getFiles();
    }

    function loggedinErrorHandler(response){
        console.log('error ui ', response);
    }

    WL.getLoginStatus(function (res){
        if (res.status == 'connected'){
            getFiles();
        }
    });

}(window));

