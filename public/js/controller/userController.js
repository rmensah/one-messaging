/**
 * Created by alemjc on 4/2/16.
 */
var app = angular.module('messagingApp');

app.controller('userController', ['$userService','$http','$window','$location', function($userService, $http, $window, $location){

  var uC = this;

  uC.logOut = function(){
    $userService.logout(function(){
      $location.path("/");
    });
  };

}]);