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

      // try {
      //   Parse.User.logIn(username, pwd, {
      //     success: function(user){
      //       // Store the user in the $rootScope
      //       $rootScope.curUser = user;
      //
      //       deferred.resolve({
      //         status: "success",
      //         data: user
      //       });
      //     },
      //     error: function(user, error){
      //       deferred.reject({
      //         status: "error",
      //         data: user,
      //         error: error
      //       });
      //     }
      //   });
      // } catch (e) {
      //   deferred.reject(e);
      // }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwicGFyc2VGYWN0b3J5LmpzIiwidXNlckZhY3RvcnkuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmpzIiwibmF2L25hdi5qcyIsInNpZ251cC9zaWdudXAuanMiLCJzdWJtaXRQaXRjaC9zdWJtaXRQaXRjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgY29udHJvbGxlckFycmF5ID0gW1xuICBcInVpLnJvdXRlclwiXG5dO1xuXG5cbnZhciBtb3ZpZVBpdGNoQXBwID0gYW5ndWxhclxuICAubW9kdWxlKFwibW92aWVQaXRjaEFwcFwiLCBjb250cm9sbGVyQXJyYXkpXG4gIC5jb25maWcoW1wiJHN0YXRlUHJvdmlkZXJcIiwgXCIkdXJsUm91dGVyUHJvdmlkZXJcIixcbiAgICBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcblxuICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xuICAgICAgICAgIHVybDogXCIvXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvaG9tZS5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdvdXItdGVhbScsIHtcbiAgICAgICAgICB1cmw6IFwiL291ci10ZWFtXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvb3VyLXRlYW0uaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnaG93LWl0LXdvcmtzJywge1xuICAgICAgICAgIHVybDogXCIvaG93LWl0LXdvcmtzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvaG93LWl0LXdvcmtzLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3N1Y2Nlc3Mtc3RvcmllcycsIHtcbiAgICAgICAgICB1cmw6IFwiL3N1Y2Nlc3Mtc3Rvcmllc1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3N1Y2Nlc3Mtc3Rvcmllcy5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdmYXEnLCB7XG4gICAgICAgICAgdXJsOiBcIi9mYXFcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9mYXEuaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnc3VibWl0LXBpdGNoJywge1xuICAgICAgICAgIHVybDogXCIvc3VibWl0LXBpdGNoXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvc3VibWl0LXBpdGNoLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICAgIHVybDogXCIvbG9naW5cIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9sb2dpbi5odG1sXCJcbiAgICAgICAgfSk7XG4gICAgfVxuICBdKVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpe1xuICAgIFBhcnNlLmluaXRpYWxpemUoXCJQUjlXQkhFdmpTdVc5dXM4UTdTR2gyS1lSVlFhSExienRaanNoc2IxXCIsIFwibnl6N045c0dMVUlOMWhqTVk5Tk5RbmVFeHhQNVcwTUpoWEgzdTFRaFwiKTtcblxuICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG4gIH0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGFyc2VGYWN0b3J5JywgZnVuY3Rpb24oJHEpIHtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgc3VibWl0UGl0Y2g6IGZ1bmN0aW9uKGdlbnJlLCB0ZXh0KSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIHVzZXIgaXMgbG9nZ2VkIGluIHRvIHN0b3JlIHRoZSBwaXRjaFxuICAgICAgaWYgKCRyb290U2NvcGUuY3VyVXNlciAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgUGl0Y2ggPSBQYXJzZS5PYmplY3QuZXh0ZW5kKFwiUGl0Y2hcIik7XG4gICAgICAgIHZhciBwaXRjaCA9IG5ldyBQaXRjaCgpO1xuXG4gICAgICAgIHBpdGNoLnNldChcImdlbnJlXCIsIGdlbnJlKTtcbiAgICAgICAgcGl0Y2guc2V0KFwicGl0Y2hcIiwgdGV4dCk7XG4gICAgICAgIC8vIHBpdGNoLnNldChcImNyZWF0ZXJcIiwgUGFyc2UuVXNlci5jdXJyZW50LnVzZXJuYW1lKVxuICAgICAgICBwaXRjaC5zZXQoXCJyZXZpZXdlZFwiLCBmYWxzZSlcblxuXG4gICAgICAgIHBpdGNoLnNhdmUobnVsbCwge1xuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHBpdGNoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgICAgZGF0YTogcGl0Y2hcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHBpdGNoLCBlcnJvcikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCIsXG4gICAgICAgICAgICAgIGRhdGE6IGVycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWplY3QgdGhlIHNhdmUgYXR0ZW1wdCBpZiBubyBjdXJyZW50IHVzZXJcbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIG5vdCBsb2dnZWQgaW5cIlxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3VzZXJGYWN0b3J5JywgZnVuY3Rpb24oJHEsICRyb290U2NvcGUpe1xuICB2YXIgZmFjdG9yeSA9IHtcbiAgICBsb2dpblVzZXI6IGZ1bmN0aW9uKHVzZXJuYW1lLCBwd2Qpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgLy8gdHJ5IHtcbiAgICAgIC8vICAgUGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwgcHdkLCB7XG4gICAgICAvLyAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcil7XG4gICAgICAvLyAgICAgICAvLyBTdG9yZSB0aGUgdXNlciBpbiB0aGUgJHJvb3RTY29wZVxuICAgICAgLy8gICAgICAgJHJvb3RTY29wZS5jdXJVc2VyID0gdXNlcjtcbiAgICAgIC8vXG4gICAgICAvLyAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgIC8vICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgIC8vICAgICAgICAgZGF0YTogdXNlclxuICAgICAgLy8gICAgICAgfSk7XG4gICAgICAvLyAgICAgfSxcbiAgICAgIC8vICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3Ipe1xuICAgICAgLy8gICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgIC8vICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAvLyAgICAgICAgIGRhdGE6IHVzZXIsXG4gICAgICAvLyAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgLy8gICAgICAgfSk7XG4gICAgICAvLyAgICAgfVxuICAgICAgLy8gICB9KTtcbiAgICAgIC8vIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vICAgZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgICAgLy8gfVxuICAgICAgUGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwgcHdkKS50aGVuKFxuICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgICAgZGF0YTogcmVzcFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXG4gICAgfSxcblxuICAgIGxvZ291dFVzZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgUGFyc2UuVXNlci5sb2dPdXQoKTtcblxuICAgICAgdmFyIHVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblxuICAgICAgaWYodXNlciA9PT0gbnVsbCl7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgdXNlciBmcm9tIHRoZSAkcm9vdFNjb3BlXG4gICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG5cbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBsb2dnZWQgb3V0XCJcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIHN0aWxsIGxvZ2dlZCBpblwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgc2lnblVwOiBmdW5jdGlvbih1c2VybmFtZSwgZW1haWwsIHB3ZCl7XG4gICAgICB2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgICB1c2VyLnNldChcInVzZXJuYW1lXCIsIHVzZXJuYW1lKTtcbiAgICAgIHVzZXIuc2V0KFwiZW1haWxcIiwgZW1haWwpO1xuICAgICAgdXNlci5zZXQoXCJwYXNzd29yZFwiLCBwd2QpO1xuXG4gICAgICB1c2VyLnNpZ25VcChudWxsLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKHVzZXIpO1xuICAgICAgICAgIHJldHVybiBcInN1Y2Nlc3NcIjtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKXtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IuY29kZSk7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSlcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdsb2dpbicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUubG9naW5Vc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcblxuICAgICAgICB1c2VyID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItbG9naW4tcHdkJykpLnZhbCgpO1xuXG4gICAgICAgIHVzZXJGYWN0b3J5XG4gICAgICAgICAgLmxvZ2luVXNlcih1c2VyLCBwd2QpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICBpZihyZXNwLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH07XG5cblxuICAgICAgJHNjb3BlLmxvZ291dFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB1c2VyRmFjdG9yeVxuICAgICAgICAgIC5sb2dvdXRVc2VyKClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvbG9naW4vbG9naW4uaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2xvZ2luTW9kYWwnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJcIjtcblxuICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcIlwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuZmxhZ0lucHV0RXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJpcy1lcnJvclwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1oaWRkZW5cIjtcbiAgICAgICRzY29wZS5oaWRlQWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LWhpZGRlblwifTtcbiAgICAgICRzY29wZS5zaG93QWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LXNob3duXCJ9O1xuXG4gICAgICAkc2NvcGUudXNlckxvZ2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgIHZhciB1c2VyLCBwd2Q7XG4gICAgICAgIHZhciBtb2RhbCA9ICQoJyNsb2dpbi1tb2RhbCcpO1xuXG4gICAgICAgIHVzZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLXBhc3N3b3JkJykpLnZhbCgpO1xuXG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VyLCBwd2QpLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgICAgICAgJHNjb3BlLmhpZGVBbGVydCgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAkc2NvcGUuZmxhZ0lucHV0RXJyb3JzKCk7XG4gICAgICAgICAgICAkc2NvcGUuc2hvd0FsZXJ0KCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuaW5wdXRzRXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICAvLyB1c2VyRmFjdG9yeS5sb2dpblVzZXIodXNlciwgcHdkKS50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAvLyAgIC8vIENsb3NlIE1vZGFsIG9uIFN1Y2Nlc3NcbiAgICAgICAgLy8gICBpZihyZXNwLnN0YXR1cyA9PT0gXCJzdWNjZXNzXCIpe1xuICAgICAgICAvL1xuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAvLyBTaG93IGVycm9ycyBvbiBsb2dpbiBmYWlsXG4gICAgICAgIC8vICAgZWxzZSB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyB9KTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmNsZWFyRm9ybXMgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbW9kYWwgPSAkKCcjbG9naW4tbW9kYWwnKTtcblxuICAgICAgICAvLyBDbGVhciBFeGlzdGluZyBJbnB1dHNcbiAgICAgICAgbW9kYWwuZmluZCgnaW5wdXQnKS52YWwoJycpO1xuXG4gICAgICAgIC8vIFJlc2V0IEVycm9yIE5vdGlmaWNhdGlvbnNcbiAgICAgICAgc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiAnY29tcG9uZW50cy9sb2dpbi1tb2RhbC9sb2dpbi1tb2RhbC5odG1sJ1xuICB9XG59KVxuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FwcEhlYWRlcicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID0gXCJtZW51LWNsb3NlZFwiO1xuXG4gICAgICAkc2NvcGUudG9nZ2xlTWVudSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID0gJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPT09IFwibWVudS1jbG9zZWRcIiA/IFwibWVudS1vcGVuXCIgOiBcIm1lbnUtY2xvc2VkXCI7XG4gICAgICB9XG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWwsIGF0dHJzKXtcbiAgICAgICQoZWwpLmZpbmQoJ2EnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBzY29wZS50b2dnbGVNZW51KCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL25hdi9uYXYuaHRtbFwiXG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdzaWdudXAnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLnNpZ251cFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlcm5hbWUsIGVtYWlsLCBwd2QsIGNvbmZpcm1Qd2Q7XG5cbiAgICAgICAgdXNlcm5hbWUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZW1haWwnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHdkJykpLnZhbCgpO1xuICAgICAgICBjb25maXJtUHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25maXJtLXB3ZCcpKS52YWwoKTtcblxuICAgICAgICBpZihwd2QgPT09IGNvbmZpcm1Qd2Qpe1xuICAgICAgICAgIHVzZXJGYWN0b3J5LnNpZ25VcCh1c2VybmFtZSwgZW1haWwsIHB3ZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Bhc3N3b3JkcyBkbyBub3QgbWF0Y2gnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9zaWdudXAvc2lnbnVwLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdzdWJtaXRQaXRjaCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCBwYXJzZUZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLnN1Ym1pdFBpdGNoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGdlbnJlLCBwaXRjaDtcblxuICAgICAgICBnZW5yZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2VucmUnKSkudmFsKCk7XG4gICAgICAgIHBpdGNoID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwaXRjaCcpKS52YWwoKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhnZW5yZSwgcGl0Y2gpO1xuICAgICAgICBpZihwaXRjaCAhPT0gXCJcIil7XG4gICAgICAgICAgcGFyc2VGYWN0b3J5LnN1Ym1pdFBpdGNoKGdlbnJlLCBwaXRjaCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
