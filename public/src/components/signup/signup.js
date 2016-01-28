"use strict";

moviePitchApp.directive('signup', function(){
  return {
    controller: function($scope, $timeout, $state, $rootScope, userFactory, emailFactory){
      // $scope.generalError = "show-alert";
      // $scope.usernameError = "show-alert";
      // $scope.emailError = "show-alert";
      // $scope.passwordError = "";

      $scope.validateEmail = function(){
        var email = angular.element(document.getElementById('register-email')).val();

        emailFactory.validateEmail(email)
          .then(
            function(resp){
              $scope.emailError = "";
            },
            function(err){
              $scope.emailErrorText = "Please enter a valid email address.";
              $scope.emailError = "show-alert";
            }
          );
      }

      $scope.signupUser = function(){
        var username, email, pwd, confirmPwd;
        var testArray = [];

        username = angular.element(document.getElementById('register-username')).val();
        email = angular.element(document.getElementById('register-email')).val();
        pwd = angular.element(document.getElementById('register-password')).val();
        confirmPwd = angular.element(document.getElementById('register-confirm-password')).val();

        // Make sure entries exist for all three primary fields
        if(username === "" || email === "" || pwd === ""){
          $scope.generalError = "show-alert";
          testArray.push(false);
        } else {
          $scope.generalError = "";
        }

        if (pwd !== confirmPwd){
          $scope.passwordError = "show-alert";
          testArray.push(false);
        } else {
          $scope.passwordError = "";
        }

        if(testArray.length === 0){
          userFactory.signUp(username, email, pwd)
            .then(
              function(resp){
                $rootScope.$broadcast('login-update');
                $scope.signupSuccess = "show-alert";

                // login the user after a successful signup and navigate to submit-pitch
                userFactory.loginUser(username, pwd)
                  .then(
                    function(resp){
                      $timeout(function(){
                        $state.go('submit-pitch');
                      }, 550);
                    },
                    function(err){
                      console.log(err);
                    }
                  );
              },
              function(err){
                switch(err.error.code){
                  case -1:
                    $scope.usernameErrorText = "The username field is empty."
                    $scope.usernameError = "show-alert";
                    break;

                  case 202:
                    $scope.usernameErrorText = "The desired username is already taken."
                    $scope.usernameError = "show-alert";
                    break;

                  case 203:
                    $scope.emailErrorText = "An account has already been created at " + email + ".";
                    $scope.emailError = "show-alert";

                  default:
                    console.log('uncaught error');
                }
              }
          );
        }
      }
    },
    restrict: "E",
    templateUrl: "src/components/signup/signup.html"
  }
});
