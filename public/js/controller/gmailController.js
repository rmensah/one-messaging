/**
 * Created by alemjc on 4/2/16.
 */
var app = angular.module('messagingApp');


/*
 * userService is a service that is available to all controller. The service keeps user information and contains
 * login and registration functions for the user. for more info look at userService.js
 */
app.controller('gmailController', ['$userService','$http','$window','Pusher', function($userService,$http, $window, Pusher){
    var gC = this;
    gC.user = $userService.user;

    gC.gmailLogin = function(){
        $http({
            url:"/gmailAuth",
            method:"GET"
        }).then(function successCallBack(response){
            console.log("BACK");

            console.log(response);
            //TODO: login the user to gmail and save the token to the userservice
            $window.open(response.data,"_self");
        })
    };

    gC.gmailLogout = function(){

    }

}]);
