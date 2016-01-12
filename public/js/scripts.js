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
        .state('register', {
          url: "/register",
          templateUrl: "views/register.html"
        });
    }
  ])
  .run(function($rootScope){
    Parse.initialize("PR9WBHEvjSuW9us8Q7SGh2KYRVQaHLbztZjshsb1", "nyz7N9sGLUIN1hjMY9NNQneExxP5W0MJhXH3u1Qh");

    $rootScope.curUser = null;
  });

moviePitchApp.controller('MainCtrl', ['$scope',
  function($scope){
    // $scope.$on('login-true', function(){
    //   $scope.$broadcast('login-update');
    // })
  }
])

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
        function(user){
          $rootScope.curUser = user;
          deferred.resolve({
            status: "success",
            data: user
          });
          $rootScope.$broadcast('login-update');
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
        $rootScope.$broadcast('logout-update');
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

moviePitchApp.directive('actionButton', function(){
  return {
    controller: function($scope, $rootScope, $state){

      $scope.update = function(){

        if($rootScope.curUser === null){
          $scope.target = "register";
          $scope.actionText = "Register To Start Pitching!";
        } else {
          $scope.actionText = "Submit a Pitch!";
          $scope.target = "submit-pitch";
        }
      };

      $scope.navigate = function(){
        $state.go($scope.target);
      };

      $scope.$on('login-update', function(){
        $scope.update();
      });

      $scope.$on('logout-update', function(){
        $scope.update();
      });
    },
    link: function(scope, el, attrs){
      scope.update();
    },
    restrict: "E"
  }
})

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

      $scope.clearForms = function(){
        var modal = $('#login-modal');

        // Clear Existing Inputs
        modal.find('input').val('');

        // Reset Error Notifications
        $scope.clearInputErrors();
      }

      $scope.userLogin = function(){
        var user, pwd;
        var modal = $('#login-modal');

        user = angular.element(document.getElementById('login-username')).val();
        pwd = angular.element(document.getElementById('login-password')).val();

        userFactory.loginUser(user, pwd).then(
          function(resp){
            $('#login-modal').modal('hide');
            $scope.clearInputErrors();
            $scope.clearForms();
            $scope.hideAlert();

          },
          function(err){
            console.log(err);
            $scope.flagInputErrors();
            $scope.showAlert();
            console.log($scope.inputsError);
          }
        );
      }


    },
    restrict: "E",
    templateUrl: 'components/login-modal/login-modal.html'
  }
})

moviePitchApp.directive('appHeader', function(){
  return {
    controller: function($scope, userFactory){
      $scope.menuToggleStatus = "menu-closed";
      $scope.currentLogAction = "show-login";

      $scope.toggleMenu = function(){
        $scope.menuToggleStatus = $scope.menuToggleStatus === "menu-closed" ? "menu-open" : "menu-closed";
      };

      $scope.$on('login-update', function(){
        $scope.currentLogAction = "show-logout";
      });


      $scope.$on('logout-update', function(){
        $scope.currentLogAction = "show-login";
      });

      $scope.logoutUser = function(){
        userFactory.logoutUser().then(
          function(resp){
            console.log(resp);
          },
          function(err){
            console.log(err);
          }
        );
      }
    },
    link: function(scope, el, attrs){
      $(el).find('.main-nav a').on('click', function(){
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJ1c2VyRmFjdG9yeS5qcyIsImFjdGlvbi1idXR0b24vYWN0aW9uLWJ1dHRvbi5qcyIsImxvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmpzIiwibmF2L25hdi5qcyIsInNpZ251cC9zaWdudXAuanMiLCJzdWJtaXRQaXRjaC9zdWJtaXRQaXRjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgY29udHJvbGxlckFycmF5ID0gW1xuICBcInVpLnJvdXRlclwiXG5dO1xuXG5cbnZhciBtb3ZpZVBpdGNoQXBwID0gYW5ndWxhclxuICAubW9kdWxlKFwibW92aWVQaXRjaEFwcFwiLCBjb250cm9sbGVyQXJyYXkpXG4gIC5jb25maWcoW1wiJHN0YXRlUHJvdmlkZXJcIiwgXCIkdXJsUm91dGVyUHJvdmlkZXJcIixcbiAgICBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcblxuICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xuICAgICAgICAgIHVybDogXCIvXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvaG9tZS5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdvdXItdGVhbScsIHtcbiAgICAgICAgICB1cmw6IFwiL291ci10ZWFtXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvb3VyLXRlYW0uaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnaG93LWl0LXdvcmtzJywge1xuICAgICAgICAgIHVybDogXCIvaG93LWl0LXdvcmtzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvaG93LWl0LXdvcmtzLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3N1Y2Nlc3Mtc3RvcmllcycsIHtcbiAgICAgICAgICB1cmw6IFwiL3N1Y2Nlc3Mtc3Rvcmllc1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3N1Y2Nlc3Mtc3Rvcmllcy5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdmYXEnLCB7XG4gICAgICAgICAgdXJsOiBcIi9mYXFcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9mYXEuaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnc3VibWl0LXBpdGNoJywge1xuICAgICAgICAgIHVybDogXCIvc3VibWl0LXBpdGNoXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvc3VibWl0LXBpdGNoLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgICAgIHVybDogXCIvcmVnaXN0ZXJcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9yZWdpc3Rlci5odG1sXCJcbiAgICAgICAgfSk7XG4gICAgfVxuICBdKVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpe1xuICAgIFBhcnNlLmluaXRpYWxpemUoXCJQUjlXQkhFdmpTdVc5dXM4UTdTR2gyS1lSVlFhSExienRaanNoc2IxXCIsIFwibnl6N045c0dMVUlOMWhqTVk5Tk5RbmVFeHhQNVcwTUpoWEgzdTFRaFwiKTtcblxuICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG4gIH0pO1xuIiwibW92aWVQaXRjaEFwcC5jb250cm9sbGVyKCdNYWluQ3RybCcsIFsnJHNjb3BlJyxcbiAgZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAvLyAkc2NvcGUuJG9uKCdsb2dpbi10cnVlJywgZnVuY3Rpb24oKXtcbiAgICAvLyAgICRzY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAvLyB9KVxuICB9XG5dKVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGFyc2VGYWN0b3J5JywgZnVuY3Rpb24oJHEpIHtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgc3VibWl0UGl0Y2g6IGZ1bmN0aW9uKGdlbnJlLCB0ZXh0KSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIHVzZXIgaXMgbG9nZ2VkIGluIHRvIHN0b3JlIHRoZSBwaXRjaFxuICAgICAgaWYgKCRyb290U2NvcGUuY3VyVXNlciAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgUGl0Y2ggPSBQYXJzZS5PYmplY3QuZXh0ZW5kKFwiUGl0Y2hcIik7XG4gICAgICAgIHZhciBwaXRjaCA9IG5ldyBQaXRjaCgpO1xuXG4gICAgICAgIHBpdGNoLnNldChcImdlbnJlXCIsIGdlbnJlKTtcbiAgICAgICAgcGl0Y2guc2V0KFwicGl0Y2hcIiwgdGV4dCk7XG4gICAgICAgIC8vIHBpdGNoLnNldChcImNyZWF0ZXJcIiwgUGFyc2UuVXNlci5jdXJyZW50LnVzZXJuYW1lKVxuICAgICAgICBwaXRjaC5zZXQoXCJyZXZpZXdlZFwiLCBmYWxzZSlcblxuXG4gICAgICAgIHBpdGNoLnNhdmUobnVsbCwge1xuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHBpdGNoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgICAgZGF0YTogcGl0Y2hcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHBpdGNoLCBlcnJvcikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCIsXG4gICAgICAgICAgICAgIGRhdGE6IGVycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWplY3QgdGhlIHNhdmUgYXR0ZW1wdCBpZiBubyBjdXJyZW50IHVzZXJcbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIG5vdCBsb2dnZWQgaW5cIlxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3VzZXJGYWN0b3J5JywgZnVuY3Rpb24oJHEsICRyb290U2NvcGUpe1xuICB2YXIgZmFjdG9yeSA9IHtcbiAgICBsb2dpblVzZXI6IGZ1bmN0aW9uKHVzZXJuYW1lLCBwd2Qpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgUGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwgcHdkKS50aGVuKFxuICAgICAgICBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSB1c2VyO1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIGRhdGE6IHVzZXJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ2luLXVwZGF0ZScpO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICAgIGVycm9yOiBlcnJcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgbG9nb3V0VXNlcjogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICBQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXG4gICAgICB2YXIgdXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuXG4gICAgICBpZih1c2VyID09PSBudWxsKXtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSB1c2VyIGZyb20gdGhlICRyb290U2NvcGVcbiAgICAgICAgJHJvb3RTY29wZS5jdXJVc2VyID0gbnVsbDtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsb2dvdXQtdXBkYXRlJyk7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgbXNnOiBcIlVzZXIgaXMgbG9nZ2VkIG91dFwiXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBzdGlsbCBsb2dnZWQgaW5cIlxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIHNpZ25VcDogZnVuY3Rpb24odXNlcm5hbWUsIGVtYWlsLCBwd2Qpe1xuICAgICAgdmFyIHVzZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgICAgdXNlci5zZXQoXCJ1c2VybmFtZVwiLCB1c2VybmFtZSk7XG4gICAgICB1c2VyLnNldChcImVtYWlsXCIsIGVtYWlsKTtcbiAgICAgIHVzZXIuc2V0KFwicGFzc3dvcmRcIiwgcHdkKTtcblxuICAgICAgdXNlci5zaWduVXAobnVsbCwge1xuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICBjb25zb2xlLmxvZyh1c2VyKTtcbiAgICAgICAgICByZXR1cm4gXCJzdWNjZXNzXCI7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcil7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yLmNvZGUpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pXG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYWN0aW9uQnV0dG9uJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRzdGF0ZSl7XG5cbiAgICAgICRzY29wZS51cGRhdGUgPSBmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgICAgJHNjb3BlLnRhcmdldCA9IFwicmVnaXN0ZXJcIjtcbiAgICAgICAgICAkc2NvcGUuYWN0aW9uVGV4dCA9IFwiUmVnaXN0ZXIgVG8gU3RhcnQgUGl0Y2hpbmchXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLmFjdGlvblRleHQgPSBcIlN1Ym1pdCBhIFBpdGNoIVwiO1xuICAgICAgICAgICRzY29wZS50YXJnZXQgPSBcInN1Ym1pdC1waXRjaFwiO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUubmF2aWdhdGUgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc3RhdGUuZ28oJHNjb3BlLnRhcmdldCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dpbi11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUudXBkYXRlKCk7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLiRvbignbG9nb3V0LXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS51cGRhdGUoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICBzY29wZS51cGRhdGUoKTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIlxuICB9XG59KVxuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2xvZ2luTW9kYWwnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJcIjtcblxuICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcIlwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuZmxhZ0lucHV0RXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJpcy1lcnJvclwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1oaWRkZW5cIjtcbiAgICAgICRzY29wZS5oaWRlQWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LWhpZGRlblwifTtcbiAgICAgICRzY29wZS5zaG93QWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LXNob3duXCJ9O1xuXG4gICAgICAkc2NvcGUuY2xlYXJGb3JtcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBtb2RhbCA9ICQoJyNsb2dpbi1tb2RhbCcpO1xuXG4gICAgICAgIC8vIENsZWFyIEV4aXN0aW5nIElucHV0c1xuICAgICAgICBtb2RhbC5maW5kKCdpbnB1dCcpLnZhbCgnJyk7XG5cbiAgICAgICAgLy8gUmVzZXQgRXJyb3IgTm90aWZpY2F0aW9uc1xuICAgICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUudXNlckxvZ2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcbiAgICAgICAgdmFyIG1vZGFsID0gJCgnI2xvZ2luLW1vZGFsJyk7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tcGFzc3dvcmQnKSkudmFsKCk7XG5cbiAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXIsIHB3ZCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgICAgICAgJHNjb3BlLmNsZWFyRm9ybXMoKTtcbiAgICAgICAgICAgICRzY29wZS5oaWRlQWxlcnQoKTtcblxuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAkc2NvcGUuZmxhZ0lucHV0RXJyb3JzKCk7XG4gICAgICAgICAgICAkc2NvcGUuc2hvd0FsZXJ0KCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuaW5wdXRzRXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuXG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6ICdjb21wb25lbnRzL2xvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmh0bWwnXG4gIH1cbn0pXG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYXBwSGVhZGVyJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID0gXCJtZW51LWNsb3NlZFwiO1xuICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9naW5cIjtcblxuICAgICAgJHNjb3BlLnRvZ2dsZU1lbnUgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9ICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID09PSBcIm1lbnUtY2xvc2VkXCIgPyBcIm1lbnUtb3BlblwiIDogXCJtZW51LWNsb3NlZFwiO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLiRvbignbG9naW4tdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9nb3V0XCI7XG4gICAgICB9KTtcblxuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dvdXQtdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9naW5cIjtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUubG9nb3V0VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ291dFVzZXIoKS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWwsIGF0dHJzKXtcbiAgICAgICQoZWwpLmZpbmQoJy5tYWluLW5hdiBhJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgc2NvcGUudG9nZ2xlTWVudSgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9uYXYvbmF2Lmh0bWxcIlxuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc2lnbnVwJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5zaWdudXBVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXJuYW1lLCBlbWFpbCwgcHdkLCBjb25maXJtUHdkO1xuXG4gICAgICAgIHVzZXJuYW1lID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgZW1haWwgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2VtYWlsJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3B3ZCcpKS52YWwoKTtcbiAgICAgICAgY29uZmlybVB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29uZmlybS1wd2QnKSkudmFsKCk7XG5cbiAgICAgICAgaWYocHdkID09PSBjb25maXJtUHdkKXtcbiAgICAgICAgICB1c2VyRmFjdG9yeS5zaWduVXAodXNlcm5hbWUsIGVtYWlsLCBwd2QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdwYXNzd29yZHMgZG8gbm90IG1hdGNoJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvc2lnbnVwL3NpZ251cC5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc3VibWl0UGl0Y2gnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgcGFyc2VGYWN0b3J5KXtcbiAgICAgICRzY29wZS5zdWJtaXRQaXRjaCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBnZW5yZSwgcGl0Y2g7XG5cbiAgICAgICAgZ2VucmUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dlbnJlJykpLnZhbCgpO1xuICAgICAgICBwaXRjaCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGl0Y2gnKSkudmFsKCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coZ2VucmUsIHBpdGNoKTtcbiAgICAgICAgaWYocGl0Y2ggIT09IFwiXCIpe1xuICAgICAgICAgIHBhcnNlRmFjdG9yeS5zdWJtaXRQaXRjaChnZW5yZSwgcGl0Y2gpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCJcbiAgfVxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
