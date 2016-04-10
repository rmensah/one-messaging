/**
 * Created by alemjc on 3/30/16.
 */
var app = angular.module('messagingApp', ['ngRoute','ngCookies','ui.router','doowb.angular-pusher']);

app.config(['$stateProvider','$locationProvider', '$urlRouterProvider','PusherServiceProvider',
  function($stateProvider, $locationProvider, $urlRouterProvider, PusherServiceProvider){

    PusherServiceProvider
      .setToken('4321')
      .setOptions({cluster:'APPS'});

    $urlRouterProvider.otherwise("/login");

    //console.log($cookies.getAll());

    $stateProvider
      .state('login',{
      url:'/login',
      templateUrl:'view/login.html',
      controller:'loginController as loginC'
      })
      .state('signup',{
        url:'/register',
        templateUrl:'view/register.html',
        controller:'registrationController as regC'
      })
      .state('loggedin',{
        url:'/user/:username',

        views:{
          '':{
            templateUrl:'view/user.html',
            controller:'loginButtonsController as lBC'
          },
          'slack@loggedin':{
            templateUrl:"view/slackPanel.html",
            controller:'slackController as slackC'
          },
          'facebook@loggedin':{
            templateUrl:"view/facebookPanel.html",
            controller:'fbController as fbC'
          },
          'gmail@loggedin':{
            templateUrl:"view/gmailPanel.html",
            controller:'gmailController as gC'
          }

        }
      });

    $locationProvider.html5Mode(true);

}]);

app.run(['$http','$rootScope','$location','$userService', function($http, $rootScope, $location, $userService){
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
    $http({
      method:"GET",
      url:"/loginStatus"

    })
      .then(
        function successCallBack(response){
          console.log("checking if user is logged in");


          var user = response.data;
          console.log(user);
          console.log("toState: "+JSON.stringify(toState));

          if(user.username !== undefined && toState.name === 'login'){
            event.preventDefault();
            $userService.user = user;
            $location.path("/user/"+$userService.user.username);
          }

        },
        function errorCallBack(response){
          console.log(response);
        }
      );
  });
}]);