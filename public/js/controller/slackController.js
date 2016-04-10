/**
 * Created by alemjc on 4/2/16.
 */
var app = angular.module('messagingApp');


/*
 * userService is a service that is available to all controller. The service keeps user information and contains
 * login and registration functions for the user. for more info look at userService.js
 */
app.controller('slackController', ['$userService','Pusher','$window', function($userService, Pusher, $window){
    var slackC = this;
    slackC.messages = [];
    slackC.user = $userService.user;

    slackC.slackLogin = function(){
      $window.open("https://slack.com/oauth/authorize?client_id="+"9328545702.31568401990"+"&state="+$userService.user.username+"&scope=client"
        ,"_self");
    };

    slackC.slackLogout = function(){

      $http({
        url:"/logoutSlack",
        method:"POST",
        data:{user:slackC.user}
      })
        .then(function successCallBack(response){
            slackC.user = response.data;
            $userService.user = response.data;
          }
          ,
          function errorCallBack(response){
            console.log(response);

          }
        )
    };

    Pusher.subscribe('slack','message', function(message){
      console.log("received message");
      console.log(message);
      slackC.messages.push(message);
    });

}]);