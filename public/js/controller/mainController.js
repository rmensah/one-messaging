/**
 * Created by Ale on 4/9/16.
 */
var app = angular.module('messagingApp');

app.controller('mainController', ['$userService','$location','$cookies', function($userService,$location, $cookies){

  console.log("in mainController");
  var mainC = this;

  mainC.loggedIn = ($userService.user !== null);

}]);