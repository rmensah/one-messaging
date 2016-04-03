/**
 * Created by alemjc on 3/30/16.
 */
var app = angular.module('messagingApp', ['ngRoute','ui.router']);

app.config(['$stateProvider','$locationProvider', '$urlRouterProvider',
  function($stateProvider, $locationProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise("/login");

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