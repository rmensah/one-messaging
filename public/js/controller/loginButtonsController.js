/**
 * Created by alemjc on 4/2/16.
 */
var app = angular.module('messagingApp');

app.controller('loginButtonsController', ['$userService','$http','$window', function($userService, $http, $window){

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

      //TODO: login the user to slack
      $window.open("https://slack.com/oauth/authorize?client_id="+"9328545702.31568401990"+"&state="+$userService.user.username+"&scope=read"
      ,"_self");

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
      $window.open("https://accounts.google.com/o/oauth2/auth?access_type=offline&scope=https://www.googleapis.com/auth/gmail.readonly&response_type=code&client_id="+"984356963831-0pfq9l1t3mnnlr0i2lec28pmvdhdmm2k.apps.googleusercontent.com&state="+$userService.user.username+"&redirect_uri=https://fast-gorge-90415.herokuapp.com/gmailAuth"
        ,"_self");


    }

  }




}]);