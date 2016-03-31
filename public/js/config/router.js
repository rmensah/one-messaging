/**
 * Created by alemjc on 3/30/16.
 */
var app = angular.module('messagingApp', ['ngRoute','ui.router']);

app.config(['$stateProvider','$locationProvider', '$urlRouterProvider',
  function($stateProvider, $locationProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise("/login");

    $stateProvider.state('login',{
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
        templateUrl:'view/user.html'
      })
    ;

    $locationProvider.html5Mode(true);

}]);