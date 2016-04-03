/**
 * Created by alemjc on 4/2/16.
 */
var app = angular.module('messagingApp');

app.controller('loginButtonsController', ['$userService', function($userService){

  var lBC = this;
  lBC.user = $userService.user;
  console.log("in login controller");

  lBC.facebookLoginStatus = "facebook log in";
  lBC.slackLoginStatus = "slack log in";
  lBC.gmailLoginStatus = "gmail log in";

  if($userService.user !== undefined){
    if($userService.user.faceBookToken !== ""){
      lBC.facebookLoginStatus = "facebook log out";
    }

    if($userService.user.gmailToken !== ""){
      lBC.gmailLoginStatus = "gmail log out";
    }

    if($userService.user.slackToken !== ""){
      lBC.slackLoginStatus = "slack log out";
    }

  }

  lBC.changeFacebookStatus = function(){

    if(lBC.facebookLoginStatus === "facebook log out"){

      var user = $userService;
      user.faceBookToken = "";

      $userService.updateUser(user, function(user){
        lBC.facebookLoginStatus = "facebook log in";
      });

    }

    else{

      //TODO: login the user to facebook and save the token to the userservice

    }


  };

  lBC.changeSlackStatus = function(){

    if(lBC.slackLoginStatus === "slack log out"){

      var user = $userService;
      user.slackToken = "";

      $userService.updateUser(user, function(user){
        lBC.slackLoginStatus = "slack log in";
      });

    }

    else{

      //TODO: login the user to slack and save the token to the userservice

    }

  };

  lBC.changeGmailStatus = function(){

    if(lBC.gmailLoginStatus === "gmail log out"){

      var user = $userService;
      user.gmailToken = "";

      $userService.updateUser(user, function(user){
        lBC.gmailLoginStatus = "gmail log in";
      });

    }

    else{

      //TODO: login the user to gmail and save the token to the userservice

    }

  }




}]);