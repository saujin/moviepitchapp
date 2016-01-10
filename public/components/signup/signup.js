"use strict";

moviePitchApp.directive('signup', function(){
  return {
    controller: function($scope, userFactory){
      console.log(userFactory);

      $scope.signupUser = function(){
        var username, email, pwd, confirmPwd;

        username = angular.element(document.getElementById('username')).val();
        email = angular.element(document.getElementById('email')).val();
        pwd = angular.element(document.getElementById('pwd')).val();
        confirmPwd = angular.element(document.getElementById('confirm-pwd')).val();

        if(pwd === confirmPwd){
          userFactory.signUp(username, email, pwd);
        } else {
          console.log('passwords do not match')
        }
      }
    },
    restrict: "E",
    templateUrl: "components/signup/signup.html"
  }
});
