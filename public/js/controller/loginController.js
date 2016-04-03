/**
 * Created by alemjc on 3/30/16.
 */
var app = angular.module('messagingApp');

app.controller('loginController', ['$userService','$location','$cookies', function($userService,$location, $cookies){

  console.log("in loginController");
  var loginC = this;
  loginC.username="";
  loginC.password="";
  loginC.showLoginErrs = false;

  loginC.login = function(){
    $userService.login(loginC.username,loginC.password, function(response){
      console.log("logging");


      var user = response;
      if(!user){
        loginC.showLoginErrs = true;
      }

      else{
        var username = loginC.username;
        var date = new Date();
        date.setDate(date.getDate()+1);
        $cookies.put('user', user.username, {secure:true, expires:date});
        loginC.username="";
        loginC.password="";

        $location.path("/user/"+username);
      }

    });

  }

}]);