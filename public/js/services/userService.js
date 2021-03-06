/**
 * Created by alemjc on 3/30/16.
 */
var app = angular.module('messagingApp');

app.factory('$userService',['$http','$location', function($http,$location){
  return{
    login: function(username, password, callback){
      var self = this;
      console.log("userLogin service getting call automatically");

      $http({
        url:"/login",
        method:"POST",
        data: {
          username:username,
          password:password
        }
      })
        .then(
          function successCallBack(response){

            console.log(response);

            self.user = response.data;
            callback(self.user);

          },
          function errorCallBack(response){
            console.log(response);
            callback(undefined);
          }
        );


    },

    register: function(username, password, callback){

      var self = this;

      $http({
        url:"/register",
        method:"POST",
        data: {
          username:username,
          password:password
        }
      })
        .then(
          function successCallBack(response){

            console.log("on success");
            console.log(response);
            self.user = response.data;
            console.log(self.user);
            callback(self.user);
          }
          ,
          function errorCallBack(response){
            console.log("on error");
            console.log(response);
            callback(undefined);
          }
        )

    },


    logout: function(){
      $http({
        url:"/logout",
        method:"POST"
      })
        .then(
          function successCallBack(response){
            if(response.data === "logout success"){
              $location.path("/");
            }
          },
          function errorCallBack(response){
            console.log("error: ",response.data);
            $location.path("/");
          }
        )
    }


  }
}]);
