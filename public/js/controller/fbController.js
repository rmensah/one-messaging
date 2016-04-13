/**
 * Created by alemjc on 4/2/16.
 */
var app = angular.module('messagingApp');


/*
 * userService is a service that is available to all controller. The service keeps user information and contains
 * login and registration functions for the user. for more info look at userService.js
 */
app.controller('fbController', ['$userService','$window', function($userService, $window){
    var fbC = this;
    fbC.user = $userService.user;
    fbC.facebookLogin = function(){
      $window.open("https://www.facebook.com/dialog/oauth?client_id="+"597182890448198&response_type=code"+"&state="+$userService.user.username+"&redirect_uri=https://fast-gorge-90415.herokuapp.com/faceBookAuth"
        ,"_self");
    };

    fbC.facebookLogout = function(){

    	var _self = this;

  FB.logout(function(response) {

    $rootScope.$apply(function() { 

      $rootScope.user = _self.user = {}; 

    }); 

  });


  };


}]);