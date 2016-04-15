/**
 * Created by Ale on 4/14/16.
 */
/**
 * Created by alemjc on 4/2/16.
 */
var app = angular.module('messagingApp');

/*
 * userService is a service that is available to all controller. The service keeps user information and contains
 * login and registration functions for the user. for more info look at userService.js
 */
app.controller('twController', ['$userService','$window', '$rootScope', '$http', '$interval','Pusher', function($userService, $window, $rootScope, $http, $interval, Pusher){
  var twC = this;
  twC.user = $userService.user;
  twC.tweets = [];

  console.log("This is the twitter user!!!!!");
  console.log(twC.user);



  twC.twitterLogin = function(){
    console.log("In twitter login!!!!!!!");

    $http({
      url:"/twitterAuth",
      method:"GET"
    }).then(function successCallBack(response){

      console.log("BACK from getRequestToken");
      console.log(response);
      //TODO: login the user to gmail and save the token to the userservice
      $window.open(response.data,"_self");
    })
  };

  twC.twitterLogout = function(){

    console.log("twitter logout");

    $http({
      url: "/twitterLogout",
      method: "GET"
    }).then(function successCallBack(response){
      console.log("successful twitter logout");
      $userService.user = response.data;
      twC.user = response.data;
    });
  };

  Pusher.subscribe('twitter','tweets', function(tweets){
    console.log("received tweets");
    console.log(tweets);
    twC.tweets = tweets;
  });


}]);