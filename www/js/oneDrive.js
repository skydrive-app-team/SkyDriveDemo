/**
 * Created by sergey.vlasov on 2/18/14.
 *
 * {http://skydrivesuperdemo.com/skyDrive/index.html#access_token=EwA4Aq1DBAAUGCCXc8wU/zFu9QnLdZXy+YnElFkAAdqlexTU7ZSo4VEOw1AG0+qq5werlglXA9MPwniDH8AUgjFwDmDDXsKHW04ZBuGbpaKqe7QCY/+4MHsDpvPKASiG1tkk1nz9fPKKBu0GuEgnI9QagBFKyFwFPbLTKjEh+qeRt40BA0mqTbvDjnDV2VOFc2s4eqvm1jZIV5zsuPcKBXIs2r0uNH6BhCOppK1F6+AqWrjCuKFBRQY3JInxB7XY/QJ1Mn/0G+wUIA1RFAQjCC5/uKzRVwsL+fdQpnjBp7v9PNZsV0oyj0fMO1OMheWRIS2Al7hNfyFEqVaKU1cvybBMcaTj/c5cJ46B7EsGsW3y31hDE48Lz2pwpI2djjgDZgAACHmiR3MWltDhCAHDp7gHzM2oTZ7HbW/7YvVEH8O/BQ19vhbQuIqEv5XsvIKSas18AMgeN3XmFjI9xyJusa+bWDsYsT0gv4ihUteYTu6+8RHVu2jpv/DOpd3K0VCeWnMmffkzHrSDwPXq3WA+a5wnSJAg9zQ+vXv/d6lUs9mUo4WCADXP+WS8wK7RwyTwCG298pO6SM9mJGZtaRZIiIGYAf5Mu0B4aYrxotrWgBDOBwtLQcQEgYN4dGn+1QEmd1nuhMeD0HK0Qr0xe1iAbnidkyQY6MZIhWd+y9QAFrMJzEjAmJn1gRm7BmaxCQiYCw6YvMxYvxVS25fbqT3Da1nzdAMnEg/REqfYalv65W85uJmxKIMAAA==&authentication_token=eyJhbGciOiJIUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJ2ZXIiOjEsImlzcyI6InVybjp3aW5kb3dzOmxpdmVpZCIsImV4cCI6MTM5MjgyNjc1NywidWlkIjoiZGM2ZWI0YjA1M2FlNDc5ZTBhNzgxN2RjYmFkODNhZmUiLCJhdWQiOiJza3lkcml2ZXN1cGVyZGVtby5jb20iLCJ1cm46bWljcm9zb2Z0OmFwcHVyaSI6ImFwcGlkOi8vMDAwMDAwMDA0ODExMzQ0NCIsInVybjptaWNyb3NvZnQ6YXBwaWQiOiIwMDAwMDAwMDQ4MTEzNDQ0In0.HJe2GRNhnjvisIE-RDPwepuPu6vWbwGzXlUa_7ppj_A&token_type=bearer&expires_in=3600&scope=wl.skydrive wl.signin wl.skydrive_update wl.basic wl.share&state=redirect_type=auth&display=touch&request_ts=1392740288950&redirect_uri=x-wmapp0%253Awww%252Findex.html&response_method=url&secure_cookie=false}
 */
function OneDriveManager() {
    var ROOT_DIRECTORY = "me/skydrive/files",
        accessToken,
        userInfoUrl ,
        filesUrlForDirectory,
        singOutUrl ,
        clientId ,
        redirectUri,
        http,
        q,

        getAccessTokenFromURL = function() {
            var hash = window.location.hash;

            hash = hash.substr(hash.indexOf('access_token='));

            if (hash.length === 0) {
                return null;
            }

            if (hash.indexOf('&') !== -1) {
                return hash.substr(0, hash.indexOf('&') - 1);
            } else {
                return hash;
            }
        },

        createDirectoryForPath= function(path, fileSystem){
            var dirArgs = path.split('/'),
                tmpPath = dirArgs[0],
                deferred = q.defer(),
                createDir = function(i) {
                    if (i < dirArgs.length) {
                        fileSystem.root.getDirectory(tmpPath , {create: true}, function(){
                            console.log(tmpPath + ' create');
                            if (i < dirArgs.length - 2){
                                tmpPath += '/' + dirArgs[i + 1];
                                createDir(i + 1);
                            } else {
                                deferred.resolve();
                            }
                        });
                    }
                };

            createDir(0);

            return deferred.promise;
        },

        generateURLs = function() {
            userInfoUrl = "https://apis.live.net/v5.0/me/?method=GET&interface_method=undefined&pretty=false&return_ssl_resources=false&x_http_live_library=Web%2Fchrome_5.5&suppress_redirects=true&"+accessToken;
            filesUrlForDirectory = "https://apis.live.net/v5.0/%folderID%?method=GET&interface_method=undefined&pretty=false&return_ssl_resources=false&x_http_live_library=Web%2Fchrome_5.5&suppress_redirects=true&"+accessToken;
            singOutUrl = "http://login.live.com/oauth20_logout.srf?" + accessToken + "&client_id=" + clientId + "&display=touch&locale=en&response_type=token&scope=wl.skydrive&state=redirect_type=auth&display=touch&request_ts=1392886026466&redirect_uri=x-wmapp0%253Awww%252Findex.html&response_method=url&secure_cookie=false&redirect_uri=" + redirectUri;
        };

    accessToken = getAccessTokenFromURL();
    console.log(accessToken);
    generateURLs();

    return {
        setAccessToken: function(aToken){
            accessToken = aToken;
            generateURLs();
        },

        getAccessToken:function(){
            return accessToken;
        },

        getUserInfoURL: function(){
            return userInfoUrl;
        },

        getClientId: function(){
            return clientId;
        },

        setClientId: function(cliId){
            clientId = cliId;
            generateURLs();
        },

        getRedirectUri: function(){
            return redirectUri;
        },

        setRedirectUri: function(redUri){
            redirectUri = redUri;
            generateURLs();
        },

        signOut: function(){
            location.href=singOutUrl;
            //location.href="https://login.live.com/oauth20_authorize.srf?client_id=0000000048113444&display=touch&locale=en&response_type=token&scope=wl.skydrive&state=redirect_type=auth&display=touch&request_ts=1392886026466&redirect_uri=x-wmapp0%253Awww%252Findex.html&response_method=url&secure_cookie=false&redirect_uri=http://SkyDriveSuperDemo.com/skyDrive/index.html";
        },

        onControllerCreated: function ($http, $q){
            http = $http;
            q = $q;
        },

        loadFilesData : function(request){
            var deferred = q.defer();
            //window.external.Notify('progressbar_on');
            http({
                method: 'GET',
                url:  filesUrlForDirectory.replace("%folderID%", request||ROOT_DIRECTORY)}
            ).success(
                function (response) {
                    //window.external.Notify('progressbar_off');

                    response.data.forEach(function(item) {
                        if (item.type == 'album') {
                            item.type = 'folder';
                        }
                    });

                    deferred.resolve(response.data);
                });

            return deferred.promise;
        },

        loadUserInfo: function(){
            var deferred = q.defer();
            //window.external.Notify('progressbar_on');
            http({
                method: 'GET',
                url: userInfoUrl }
            ).success(
                function (userInfo) { 
                    //window.external.Notify('progressbar_off');
                    deferred.resolve(userInfo);
                }
            );
            return deferred.promise;
        },

        downloadFile: function (uriString, fileName,onSuccess , onError, onProgress) {
            // open target file for download
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {

                createDirectoryForPath(fileName, fileSystem).then( function() {

                    fileSystem.root.getFile(fileName, { create: true }, function (targetFile){
                        var onSuccessThis = function(res){
                                onSuccess(targetFile.fullPath);
                            },
                            downloader = new BackgroundTransfer.BackgroundDownloader(),
                            // Create a new download operation.
                            download = downloader.createDownload(uriString, targetFile);
                        // Start the download and persist the promise to be able to cancel the download.
                        download.startAsync().then(onSuccessThis, onError, onProgress);
                    });
                });
            });
        }
    }
};

