"use strict";

var controllerArray = [
  "ui.router"
];


var moviePitchApp = angular
  .module("moviePitchApp", controllerArray)
  .config(["$stateProvider", "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider){

      $urlRouterProvider.otherwise('/');

      $stateProvider
        .state('index', {
          url: "/",
          templateUrl: "views/home.html"
        })
        .state('our-team', {
          url: "/our-team",
          templateUrl: "views/our-team.html"
        })
        .state('how-it-works', {
          url: "/how-it-works",
          templateUrl: "views/how-it-works.html"
        })
        .state('success-stories', {
          url: "/success-stories",
          templateUrl: "views/success-stories.html"
        })
        .state('faq', {
          url: "/faq",
          templateUrl: "views/faq.html"
        })
        .state('submit-pitch', {
          url: "/submit-pitch",
          templateUrl: "views/submit-pitch.html"
        })
        .state('login', {
          url: "/login",
          templateUrl: "views/login.html"
        });
    }
  ])
  .run(function($rootScope){
    Parse.initialize("PR9WBHEvjSuW9us8Q7SGh2KYRVQaHLbztZjshsb1", "nyz7N9sGLUIN1hjMY9NNQneExxP5W0MJhXH3u1Qh");

    $rootScope.curUser = null;
  });

"use strict";

moviePitchApp.factory('parseFactory', function($q) {
  var factory = {
    submitPitch: function(genre, text) {
      var deferred = $q.defer();

      // Make sure the user is logged in to store the pitch
      if ($rootScope.curUser !== null) {
        var Pitch = Parse.Object.extend("Pitch");
        var pitch = new Pitch();

        pitch.set("genre", genre);
        pitch.set("pitch", text);
        // pitch.set("creater", Parse.User.current.username)
        pitch.set("reviewed", false)


        pitch.save(null, {
          success: function(pitch) {
            deferred.resolve({
              status: "success",
              data: pitch
            });
          },
          error: function(pitch, error) {
            deferred.reject({
              status: "rejected",
              data: error
            });
          }
        });
      }

      // Reject the save attempt if no current user
      else {
        deferred.reject({
          status: "rejected",
          msg: "User is not logged in"
        })
      }

      return deferred.promise;
    }
  };

  return factory;
});

"use strict";

moviePitchApp.factory('userFactory', function($q, $rootScope){
  var factory = {
    loginUser: function(username, pwd){
      var deferred = $q.defer();

      Parse.User.logIn(username, pwd).then(
        function(resp){
          deferred.resolve({
              status: "success",
              data: resp
            });
        },
        function(err){
          deferred.reject({
            status: "error",
            error: err
          })
        }
      );

      return deferred.promise;

    },

    logoutUser: function(){
      var deferred = $q.defer();
      Parse.User.logOut();

      var user = Parse.User.current();

      if(user === null){
        // Remove the user from the $rootScope
        $rootScope.curUser = null;

        deferred.resolve({
          status: "success",
          msg: "User is logged out"
        });
      } else {
        deferred.reject({
          status: "error",
          msg: "User is still logged in"
        });
      }

      return deferred.promise;
    },

    signUp: function(username, email, pwd){
      var user = new Parse.User();
      user.set("username", username);
      user.set("email", email);
      user.set("password", pwd);

      user.signUp(null, {
        success: function(user){
          console.log(user);
          return "success";
        },
        error: function(user, error){
          console.log(error);
          console.log(error.code);
          console.log(error.message);
        }
      })
    }
  };

  return factory;
})

moviePitchApp.directive('login', function(){
  return {
    controller: function($scope, userFactory){
      $scope.loginUser = function(){
        var user, pwd;

        user = angular.element(document.getElementById('user-login-username')).val();
        pwd = angular.element(document.getElementById('user-login-pwd')).val();

        userFactory
          .loginUser(user, pwd)
          .then(function(resp){
            if(resp.status === "success"){
              console.log(resp);
            }
          });
      };


      $scope.logoutUser = function(){
        userFactory
          .logoutUser()
          .then(function(resp){
            console.log(resp);
          });
      }
    },
    restrict: "E",
    templateUrl: "components/login/login.html"
  }
});

"use strict";

moviePitchApp.directive('signup', function(){
  return {
    controller: function($scope, userFactory){
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

moviePitchApp.directive('submitPitch', function(){
  return {
    controller: function($scope, parseFactory){
      $scope.submitPitch = function(){
        var genre, pitch;

        genre = angular.element(document.getElementById('genre')).val();
        pitch = angular.element(document.getElementById('pitch')).val();

        console.log(genre, pitch);
        if(pitch !== ""){
          parseFactory.submitPitch(genre, pitch);
        }
      }
    },
    restrict: "A"
  }
});

moviePitchApp.directive('appHeader', function(){
  return {
    controller: function($scope){
      $scope.menuToggleStatus = "menu-closed";

      $scope.toggleMenu = function(){
        $scope.menuToggleStatus = $scope.menuToggleStatus === "menu-closed" ? "menu-open" : "menu-closed";
      }
    },
    link: function(scope, el, attrs){
      $(el).find('a').on('click', function(){
        scope.toggleMenu();
      });
    },
    restrict: "E",
    templateUrl: "components/nav/nav.html"
  }
});

moviePitchApp.directive('loginModal', function(){
  return {
    controller: function($scope, userFactory){
      $scope.inputsError = "";

      $scope.clearInputErrors = function(){
        $scope.inputsError = "";
      }

      $scope.flagInputErrors = function(){
        $scope.inputsError = "is-error";
      }

      $scope.isAlertShown = "alert-hidden";
      $scope.hideAlert = function(){$scope.isAlertShown = "alert-hidden"};
      $scope.showAlert = function(){$scope.isAlertShown = "alert-shown"};

      $scope.userLogin = function(){
        // debugger;
        var user, pwd;
        var modal = $('#login-modal');

        user = angular.element(document.getElementById('login-username')).val();
        pwd = angular.element(document.getElementById('login-password')).val();

        userFactory.loginUser(user, pwd).then(
          function(resp){
            console.log(resp);
            $('#login-modal').modal('hide');
            $scope.clearInputErrors();
            $scope.hideAlert();
          },
          function(err){
            console.log(err);
            $scope.flagInputErrors();
            $scope.showAlert();
            console.log($scope.inputsError);
          }
        );

        // userFactory.loginUser(user, pwd).then(function(resp){
        //   // Close Modal on Success
        //   if(resp.status === "success"){
        //
        //   }
        //
        //   // Show errors on login fail
        //   else {
        //
        //   }
        // });
      }

      $scope.clearForms = function(){
        var modal = $('#login-modal');

        // Clear Existing Inputs
        modal.find('input').val('');

        // Reset Error Notifications
        scope.clearInputErrors();
      }
    },
    restrict: "E",
    templateUrl: 'components/login-modal/login-modal.html'
  }
})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwicGFyc2VGYWN0b3J5LmpzIiwidXNlckZhY3RvcnkuanMiLCJsb2dpbi9sb2dpbi5qcyIsInNpZ251cC9zaWdudXAuanMiLCJzdWJtaXRQaXRjaC9zdWJtaXRQaXRjaC5qcyIsIm5hdi9uYXYuanMiLCJsb2dpbi1tb2RhbC9sb2dpbi1tb2RhbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIGNvbnRyb2xsZXJBcnJheSA9IFtcbiAgXCJ1aS5yb3V0ZXJcIlxuXTtcblxuXG52YXIgbW92aWVQaXRjaEFwcCA9IGFuZ3VsYXJcbiAgLm1vZHVsZShcIm1vdmllUGl0Y2hBcHBcIiwgY29udHJvbGxlckFycmF5KVxuICAuY29uZmlnKFtcIiRzdGF0ZVByb3ZpZGVyXCIsIFwiJHVybFJvdXRlclByb3ZpZGVyXCIsXG4gICAgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcil7XG5cbiAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdpbmRleCcsIHtcbiAgICAgICAgICB1cmw6IFwiL1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2hvbWUuaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnb3VyLXRlYW0nLCB7XG4gICAgICAgICAgdXJsOiBcIi9vdXItdGVhbVwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL291ci10ZWFtLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2hvdy1pdC13b3JrcycsIHtcbiAgICAgICAgICB1cmw6IFwiL2hvdy1pdC13b3Jrc1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2hvdy1pdC13b3Jrcy5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdzdWNjZXNzLXN0b3JpZXMnLCB7XG4gICAgICAgICAgdXJsOiBcIi9zdWNjZXNzLXN0b3JpZXNcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9zdWNjZXNzLXN0b3JpZXMuaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnZmFxJywge1xuICAgICAgICAgIHVybDogXCIvZmFxXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvZmFxLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3N1Ym1pdC1waXRjaCcsIHtcbiAgICAgICAgICB1cmw6IFwiL3N1Ym1pdC1waXRjaFwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3N1Ym1pdC1waXRjaC5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgICB1cmw6IFwiL2xvZ2luXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbG9naW4uaHRtbFwiXG4gICAgICAgIH0pO1xuICAgIH1cbiAgXSlcbiAgLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKXtcbiAgICBQYXJzZS5pbml0aWFsaXplKFwiUFI5V0JIRXZqU3VXOXVzOFE3U0doMktZUlZRYUhMYnp0WmpzaHNiMVwiLCBcIm55ejdOOXNHTFVJTjFoak1ZOU5OUW5lRXh4UDVXME1KaFhIM3UxUWhcIik7XG5cbiAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICB9KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BhcnNlRmFjdG9yeScsIGZ1bmN0aW9uKCRxKSB7XG4gIHZhciBmYWN0b3J5ID0ge1xuICAgIHN1Ym1pdFBpdGNoOiBmdW5jdGlvbihnZW5yZSwgdGV4dCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbiB0byBzdG9yZSB0aGUgcGl0Y2hcbiAgICAgIGlmICgkcm9vdFNjb3BlLmN1clVzZXIgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIFBpdGNoID0gUGFyc2UuT2JqZWN0LmV4dGVuZChcIlBpdGNoXCIpO1xuICAgICAgICB2YXIgcGl0Y2ggPSBuZXcgUGl0Y2goKTtcblxuICAgICAgICBwaXRjaC5zZXQoXCJnZW5yZVwiLCBnZW5yZSk7XG4gICAgICAgIHBpdGNoLnNldChcInBpdGNoXCIsIHRleHQpO1xuICAgICAgICAvLyBwaXRjaC5zZXQoXCJjcmVhdGVyXCIsIFBhcnNlLlVzZXIuY3VycmVudC51c2VybmFtZSlcbiAgICAgICAgcGl0Y2guc2V0KFwicmV2aWV3ZWRcIiwgZmFsc2UpXG5cblxuICAgICAgICBwaXRjaC5zYXZlKG51bGwsIHtcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihwaXRjaCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICAgIGRhdGE6IHBpdGNoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihwaXRjaCwgZXJyb3IpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgICAgICBkYXRhOiBlcnJvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVqZWN0IHRoZSBzYXZlIGF0dGVtcHQgaWYgbm8gY3VycmVudCB1c2VyXG4gICAgICBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBub3QgbG9nZ2VkIGluXCJcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5mYWN0b3J5KCd1c2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRxLCAkcm9vdFNjb3BlKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgbG9naW5Vc2VyOiBmdW5jdGlvbih1c2VybmFtZSwgcHdkKXtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIFBhcnNlLlVzZXIubG9nSW4odXNlcm5hbWUsIHB3ZCkudGhlbihcbiAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICAgIGRhdGE6IHJlc3BcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICAgIGVycm9yOiBlcnJcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblxuICAgIH0sXG5cbiAgICBsb2dvdXRVc2VyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAgIHZhciB1c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbiAgICAgIGlmKHVzZXIgPT09IG51bGwpe1xuICAgICAgICAvLyBSZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgJHJvb3RTY29wZVxuICAgICAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgbXNnOiBcIlVzZXIgaXMgbG9nZ2VkIG91dFwiXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBzdGlsbCBsb2dnZWQgaW5cIlxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIHNpZ25VcDogZnVuY3Rpb24odXNlcm5hbWUsIGVtYWlsLCBwd2Qpe1xuICAgICAgdmFyIHVzZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgICAgdXNlci5zZXQoXCJ1c2VybmFtZVwiLCB1c2VybmFtZSk7XG4gICAgICB1c2VyLnNldChcImVtYWlsXCIsIGVtYWlsKTtcbiAgICAgIHVzZXIuc2V0KFwicGFzc3dvcmRcIiwgcHdkKTtcblxuICAgICAgdXNlci5zaWduVXAobnVsbCwge1xuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICBjb25zb2xlLmxvZyh1c2VyKTtcbiAgICAgICAgICByZXR1cm4gXCJzdWNjZXNzXCI7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcil7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yLmNvZGUpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pXG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW4nLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VyLCBwd2Q7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1sb2dpbi11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXB3ZCcpKS52YWwoKTtcblxuICAgICAgICB1c2VyRmFjdG9yeVxuICAgICAgICAgIC5sb2dpblVzZXIodXNlciwgcHdkKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgaWYocmVzcC5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB9O1xuXG5cbiAgICAgICRzY29wZS5sb2dvdXRVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdXNlckZhY3RvcnlcbiAgICAgICAgICAubG9nb3V0VXNlcigpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL2xvZ2luL2xvZ2luLmh0bWxcIlxuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc2lnbnVwJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5zaWdudXBVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXJuYW1lLCBlbWFpbCwgcHdkLCBjb25maXJtUHdkO1xuXG4gICAgICAgIHVzZXJuYW1lID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgZW1haWwgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VtYWlsJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3B3ZCcpKS52YWwoKTtcbiAgICAgICAgY29uZmlybVB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29uZmlybS1wd2QnKSkudmFsKCk7XG5cbiAgICAgICAgaWYocHdkID09PSBjb25maXJtUHdkKXtcbiAgICAgICAgICB1c2VyRmFjdG9yeS5zaWduVXAodXNlcm5hbWUsIGVtYWlsLCBwd2QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdwYXNzd29yZHMgZG8gbm90IG1hdGNoJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvc2lnbnVwL3NpZ251cC5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc3VibWl0UGl0Y2gnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgcGFyc2VGYWN0b3J5KXtcbiAgICAgICRzY29wZS5zdWJtaXRQaXRjaCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBnZW5yZSwgcGl0Y2g7XG5cbiAgICAgICAgZ2VucmUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dlbnJlJykpLnZhbCgpO1xuICAgICAgICBwaXRjaCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGl0Y2gnKSkudmFsKCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coZ2VucmUsIHBpdGNoKTtcbiAgICAgICAgaWYocGl0Y2ggIT09IFwiXCIpe1xuICAgICAgICAgIHBhcnNlRmFjdG9yeS5zdWJtaXRQaXRjaChnZW5yZSwgcGl0Y2gpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYXBwSGVhZGVyJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSBcIm1lbnUtY2xvc2VkXCI7XG5cbiAgICAgICRzY29wZS50b2dnbGVNZW51ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9PT0gXCJtZW51LWNsb3NlZFwiID8gXCJtZW51LW9wZW5cIiA6IFwibWVudS1jbG9zZWRcIjtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbCwgYXR0cnMpe1xuICAgICAgJChlbCkuZmluZCgnYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLnRvZ2dsZU1lbnUoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvbmF2L25hdi5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW5Nb2RhbCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcIlwiO1xuXG4gICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiXCI7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5mbGFnSW5wdXRFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcImlzLWVycm9yXCI7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LWhpZGRlblwiO1xuICAgICAgJHNjb3BlLmhpZGVBbGVydCA9IGZ1bmN0aW9uKCl7JHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtaGlkZGVuXCJ9O1xuICAgICAgJHNjb3BlLnNob3dBbGVydCA9IGZ1bmN0aW9uKCl7JHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtc2hvd25cIn07XG5cbiAgICAgICRzY29wZS51c2VyTG9naW4gPSBmdW5jdGlvbigpe1xuICAgICAgICAvLyBkZWJ1Z2dlcjtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcbiAgICAgICAgdmFyIG1vZGFsID0gJCgnI2xvZ2luLW1vZGFsJyk7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tcGFzc3dvcmQnKSkudmFsKCk7XG5cbiAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXIsIHB3ZCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzKCk7XG4gICAgICAgICAgICAkc2NvcGUuaGlkZUFsZXJ0KCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICRzY29wZS5mbGFnSW5wdXRFcnJvcnMoKTtcbiAgICAgICAgICAgICRzY29wZS5zaG93QWxlcnQoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5pbnB1dHNFcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VyLCBwd2QpLnRoZW4oZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgIC8vICAgLy8gQ2xvc2UgTW9kYWwgb24gU3VjY2Vzc1xuICAgICAgICAvLyAgIGlmKHJlc3Auc3RhdHVzID09PSBcInN1Y2Nlc3NcIil7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgfVxuICAgICAgICAvL1xuICAgICAgICAvLyAgIC8vIFNob3cgZXJyb3JzIG9uIGxvZ2luIGZhaWxcbiAgICAgICAgLy8gICBlbHNlIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH0pO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuY2xlYXJGb3JtcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBtb2RhbCA9ICQoJyNsb2dpbi1tb2RhbCcpO1xuXG4gICAgICAgIC8vIENsZWFyIEV4aXN0aW5nIElucHV0c1xuICAgICAgICBtb2RhbC5maW5kKCdpbnB1dCcpLnZhbCgnJyk7XG5cbiAgICAgICAgLy8gUmVzZXQgRXJyb3IgTm90aWZpY2F0aW9uc1xuICAgICAgICBzY29wZS5jbGVhcklucHV0RXJyb3JzKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6ICdjb21wb25lbnRzL2xvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmh0bWwnXG4gIH1cbn0pXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
