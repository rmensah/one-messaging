/**
 * Created by alemjc on 4/2/16.
 */
var app = angular.module('messagingApp');


/*
 * userService is a service that is available to all controller. The service keeps user information and contains
 * login and registration functions for the user. for more info look at userService.js
 */
app.controller('slackController', ['$userService','Pusher', function($userService, Pusher){
    var slackC = this;
    slackC.messages = [];
    slackC.user = $userService.user;
    Pusher.subscribe('slack','message', function(message){
      console.log("received message");
      console.log(message);
      slackC.messages.push(message);
    });


}]);