/**
 * Created by alemjc on 3/30/16.
 */
var app = angular.module('messagingApp', ['ngRoute','ngCookies','ui.router','doowb.angular-pusher']);

app.config(['$stateProvider','$locationProvider', '$urlRouterProvider','PusherServiceProvider',
  function($stateProvider, $locationProvider, $urlRouterProvider, PusherServiceProvider){

    PusherServiceProvider
      .setToken('0063f6e1ef990e682c3d')
      .setOptions();

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
            controller:'userController as uC'
          },
          'slack@loggedin':{
            templateUrl:"view/slackPanel.html",
            controller:'slackController as slackC'
          },
          'twitter@loggedin':{
            templateUrl:"view/twitterPanel.html",
            controller:'twController as twC'
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
    console.log("on $stateChangeStart");
    $http({
      method:"GET",
      url:"/loginStatus"

    })
      .then(
        function successCallBack(response){
          console.log("checking if user is logged in");


          var user = response.data;
          console.log("user is: ");
          console.log(user);
          console.log("state is: ");
          console.log(toState.name);

          if(toState.name === 'login'){

            if(user.username !== undefined){
              event.preventDefault();
              console.log("getting user service and routing user to user homepage.");
              $userService.user = user;
              $location.path("/user/"+$userService.user.username);
            }

          }

          else if(toState.name === 'loggedin'){
            if(user.username !== undefined){
              $userService.user = user;
            }
            else{
              event.preventDefault();
              $location.path("/login");
            }
          }


        },
        function errorCallBack(response){
          console.log(response);
        }
      );
  });
}]);