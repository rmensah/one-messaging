/**
 * Created by alemjc on 3/30/16.
 */
var app = angular.module('messagingApp');

app.controller('registrationController', ['$userService','$location', function($userService,$location){

  console.log("in loginController");
  var regC = this;
  regC.username="";
  regC.password="";
  regC.verifyPassword="";
  regC.showRegErrs = false;

  regC.register = function(){
    if(regC.password !== regC.verifyPassword || regC.username.length === 0){
      regC.showRegErrs = true;
    }

    else{
      $userService.register(regC.username,regC.password, function(response){

        var user = response;
        console.log("register callback");
        console.log(user);
        if(!user){

          console.log("here!!");
          regC.showRegErrs = true;
        }

        else{
          var username = regC.username;

          regC.username="";
          regC.password="";

          $location.path("/user/"+username);
        }

      });
    }

  }

}]);
