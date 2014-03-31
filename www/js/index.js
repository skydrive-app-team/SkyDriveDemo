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
    // Application Constructor
    initialize: function() {
        this.bindEvents();
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
        app.receivedEvent('deviceready');
        var ref = window.open("https://login.live.com/oauth20_authorize.srf?client_id=0000000048113444&display=touch&locale=en&response_type=token&scope=wl.skydrive&state=redirect_type=auth&display=touch&request_ts={0}&redirect_uri=x-wmapp0%253Awww%252Findex.html&response_method=url&secure_cookie=false&redirect_uri=http://SkyDriveSuperDemo.com/skyDrive/index.html", '_blank', 'location=no');
        ref.addEventListener('loadstart', function (e) {
            console.log('start: ' + JSON.stringify(e));
            if (e.url.indexOf("access_token=") > 0) {
                location.href = "indexOld.html" + (e.url.substr(e.url.indexOf("#")).split("&")[0]);
                ref.close();
            }
        });
        
        
        // Create/Update + Query data from a mobile service
       /* var client = new WindowsAzure.MobileServiceClient("https://testpushnotification-akvelon.azure-mobile.net/", "ifOhibRwGercYymCSWrBgneGLWWASC63");

        // Authenticate users
        client.login("microsoftaccount").done(function (results) {
            //location.href = "indexOld.html#access_token=EwBwAq1DBAAUGCCXc8wU%2FzFu9QnLdZXy%2BYnElFkAAW%2FrC6p%2BndvDiYQ25ggZNSiItxROoRVMh9Rdfzz8wHqhtPFTSLiqJr%2FWQY0Ca%2BEh3r6r%2BjlbnMNM%2B5qWl%2Bs8rgvQd8hE%2F7oftIbLGZVOpM8cZhWZjHph%2B3egTemW0K0CZjWK%2B00fAT6ch%2Ff8dueLNWCKfSMv%2BNw884VDkZ7%2B1QvoGByw5VvFL%2FSWMiyDXoDbKsmFOXJEQwN%2F4dxhwNuH9ccG4emwX81gzuSvv6rfWr3gGTpGbgWcL5oiiR%2Fcim9Lkt58H7mH3EScUNHLFFEhlFFJ2djmf4IIPrK4FgYgu07LnEXybtTK6XqqEEixMqa6cE9AYZk4Dk6c3b3eH2btV5MDZgAACOCc2vr0fLkAQAFtLeqt2EM%2BFCmr3vpY1N0WNeq%2Bngy4sARvDoqtPWf2gk%2BH1hJb7DbvtOV81bhzZ3l416UvE5QoZ8NaFsc%2BRjZ0520xkQPoMruz9d%2FK00eyCYnLvkTqhVOk92bgWnOjsOwbUJEeYL8XTOrXfOaW6HpV8q8CsiCQDeP8PM%2BIx17VB0I40Kc7Vf4w2VusQWG2jJLdOS9SPMQutVeMouFKeYH%2B01XcqpJy%2BkLrteN97FUCdUVjMMR1WEQVI7%2FiamYQ%2BLpOiRpCzJvzkLT27lTBp8mpYLx8G%2BqRu1RUOy%2FqSWZqtOrihjzkSave56l5M1PQA2jxtqbxi%2FVNZp2l8yZh7KB3%2FR9WwHm87p1dXlZJicAAr5xgQXsZAYMjp%2B3mqXh5%2BC9laT2ashMItQOQE5LT%2BDHoNQGIWxIFvdTzdgEgEX9LMEsB";
            location.href = "indexOld.html#access_token=" + results.mobileServiceAuthenticationToken;
            console.log("You are now logged in as: " + JSON.stringify(results));
        }, function (err) {
            alert("Error: " + err);
        });*/

        return;

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
