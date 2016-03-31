/**
 * Created by alemjc on 3/30/16.
 */
var app = angular.module('messagingApp');

app.controller('loginController', ['$userService','$location', function($userService,$location){

  console.log("in loginController");
  var loginC = this;
  loginC.username="";
  loginC.password="";
  loginC.showLoginErrs = false;

  loginC.login = function(){
    $userService.login(loginC.username,loginC.password, function(response){

      var user = response;
      if(!user){
        loginC.showLoginErrs = true;
      }

      else{
        var username = loginC.username;

        loginC.username="";
        loginC.password="";

        $location.path("/user/"+username);
      }

    });

  }

}]);