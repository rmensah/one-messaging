/**
 * Created by alemjc on 4/2/16.
 */
var app = angular.module('messagingApp');

app.controller('loginButtonsController', ['$userService','$http','$window','$location', function($userService, $http, $window, $location){

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
      $window.open("https://www.facebook.com/dialog/oauth?client_id="+"597182890448198&response_type=code"+"&state="+$userService.user.username+"&redirect_uri=https://fast-gorge-90415.herokuapp.com/faceBookAuth"
      ,"_self");

    }


  };

  lBC.changeSlackStatus = function(){

    if(lBC.slackLoginStatus === "slack log out"){

      $userService.logoutSlack(function(){
        lBC.slackLoginStatus = "slack log in";
        lBC.user = $userService.user;
      });

    }

    else{

      //TODO: login the user to slack

      $window.open("https://slack.com/oauth/authorize?client_id="+"9328545702.31568401990"+"&state="+$userService.user.username+"&scope=client"
      ,"_self");

    }

  };

  lBC.changeGmailStatus = function(){

    if(lBC.gmailLoginStatus === "gmail log out"){
      $userService.updateUser(user, function(user){
        lBC.gmailLoginStatus = "gmail log in";
      });

    }

    else{

      $http({

        url:"/gmailAuth",
        method:"GET"
      }).then(function successCallBack(response){
        console.log("BACK");

        console.log(response);
        //TODO: login the user to gmail and save the token to the userservice
        $window.open(response.data,"_self");
      })
    }

  };

  lBC.logOut = function(){
    $userService.logout(function(){
      $location.path("/");
    });
  };

}]);