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
        })
        .state('my-account', {
          url: "/account",
          templateUrl: "views/my-account.html"
        });
    }
  ])
  .run(function($rootScope){
    Parse.initialize("PR9WBHEvjSuW9us8Q7SGh2KYRVQaHLbztZjshsb1", "nyz7N9sGLUIN1hjMY9NNQneExxP5W0MJhXH3u1Qh");

    // Make sure a user is logged out
    Parse.User.logOut();
    $rootScope.curUser = null;
  });

moviePitchApp.controller('MainCtrl', ['$scope',
  function($scope){
    // $scope.$on('login-true', function(){
    //   $scope.$broadcast('login-update');
    // })
  }
])

moviePitchApp.factory('emailFactory', function($q){
  var factory = {
    validateEmail: function(email) {
      var deferred = $q.defer();

      var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if(reg.test(email)){
        deferred.resolve(true);
      } else {
        deferred.reject(false);
      }

      return deferred.promise;
    }
  };

  return factory;
})

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
      var deferred = $q.defer();

      var user = new Parse.User();
      user.set("username", username);
      user.set("email", email);
      user.set("password", pwd);

      user.signUp(null, {
        success: function(user){
          deferred.resolve({
            status: "success",
            data: user
          });
          console.log(Parse.User.current());
        },
        error: function(user, err){
          console.log(err);
          deferred.reject({
            status: "error",
            user: user,
            error: err
          });
        }
      });

      return deferred.promise;
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

moviePitchApp.directive('login', function(){
  return {
    controller: function($scope, userFactory){
      $scope.loginUser = function(){
        var user, pwd;

        user = angular.element(document.getElementById('user-login-username')).val();
        pwd = angular.element(document.getElementById('user-login-pwd')).val();

        userFactory.loginUser(user, pwd)
          .then(
            function(resp){
              console.log(resp);
            },
            function(err){
              console.log(err);
            }
          );
      };


      $scope.logoutUser = function(){
        userFactory.logoutUser()
          .then(
            function(resp){
              console.log(resp);
            },
            function(err){
              console.log(err);
            }
          );
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
                $timeout(function(){
                  $state.go('my-account');
                }, 750);
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
          // parseFactory.submitPitch(genre, pitch);
        }
      }
    },
    restrict: "A"
  }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJ1c2VyRmFjdG9yeS5qcyIsImFjdGlvbi1idXR0b24vYWN0aW9uLWJ1dHRvbi5qcyIsImxvZ2luL2xvZ2luLmpzIiwibG9naW4tbW9kYWwvbG9naW4tbW9kYWwuanMiLCJuYXYvbmF2LmpzIiwic2lnbnVwL3NpZ251cC5qcyIsInN1Ym1pdFBpdGNoL3N1Ym1pdFBpdGNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjb250cm9sbGVyQXJyYXkgPSBbXG4gIFwidWkucm91dGVyXCJcbl07XG5cblxudmFyIG1vdmllUGl0Y2hBcHAgPSBhbmd1bGFyXG4gIC5tb2R1bGUoXCJtb3ZpZVBpdGNoQXBwXCIsIGNvbnRyb2xsZXJBcnJheSlcbiAgLmNvbmZpZyhbXCIkc3RhdGVQcm92aWRlclwiLCBcIiR1cmxSb3V0ZXJQcm92aWRlclwiLFxuICAgIGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpe1xuXG4gICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cbiAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnaW5kZXgnLCB7XG4gICAgICAgICAgdXJsOiBcIi9cIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9ob21lLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ291ci10ZWFtJywge1xuICAgICAgICAgIHVybDogXCIvb3VyLXRlYW1cIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9vdXItdGVhbS5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdob3ctaXQtd29ya3MnLCB7XG4gICAgICAgICAgdXJsOiBcIi9ob3ctaXQtd29ya3NcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9ob3ctaXQtd29ya3MuaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnc3VjY2Vzcy1zdG9yaWVzJywge1xuICAgICAgICAgIHVybDogXCIvc3VjY2Vzcy1zdG9yaWVzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvc3VjY2Vzcy1zdG9yaWVzLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2ZhcScsIHtcbiAgICAgICAgICB1cmw6IFwiL2ZhcVwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2ZhcS5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdzdWJtaXQtcGl0Y2gnLCB7XG4gICAgICAgICAgdXJsOiBcIi9zdWJtaXQtcGl0Y2hcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9zdWJtaXQtcGl0Y2guaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgncmVnaXN0ZXInLCB7XG4gICAgICAgICAgdXJsOiBcIi9yZWdpc3RlclwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3JlZ2lzdGVyLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ215LWFjY291bnQnLCB7XG4gICAgICAgICAgdXJsOiBcIi9hY2NvdW50XCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbXktYWNjb3VudC5odG1sXCJcbiAgICAgICAgfSk7XG4gICAgfVxuICBdKVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpe1xuICAgIFBhcnNlLmluaXRpYWxpemUoXCJQUjlXQkhFdmpTdVc5dXM4UTdTR2gyS1lSVlFhSExienRaanNoc2IxXCIsIFwibnl6N045c0dMVUlOMWhqTVk5Tk5RbmVFeHhQNVcwTUpoWEgzdTFRaFwiKTtcblxuICAgIC8vIE1ha2Ugc3VyZSBhIHVzZXIgaXMgbG9nZ2VkIG91dFxuICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG4gICAgJHJvb3RTY29wZS5jdXJVc2VyID0gbnVsbDtcbiAgfSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmNvbnRyb2xsZXIoJ01haW5DdHJsJywgWyckc2NvcGUnLFxuICBmdW5jdGlvbigkc2NvcGUpe1xuICAgIC8vICRzY29wZS4kb24oJ2xvZ2luLXRydWUnLCBmdW5jdGlvbigpe1xuICAgIC8vICAgJHNjb3BlLiRicm9hZGNhc3QoJ2xvZ2luLXVwZGF0ZScpO1xuICAgIC8vIH0pXG4gIH1cbl0pXG4iLCJtb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ2VtYWlsRmFjdG9yeScsIGZ1bmN0aW9uKCRxKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgdmFsaWRhdGVFbWFpbDogZnVuY3Rpb24oZW1haWwpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIHZhciByZWcgPSAvXihbYS16QS1aMC05X1xcLlxcLV0pK1xcQCgoW2EtekEtWjAtOVxcLV0pK1xcLikrKFthLXpBLVowLTldezIsNH0pKyQvO1xuXG4gICAgICBpZihyZWcudGVzdChlbWFpbCkpe1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSlcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BhcnNlRmFjdG9yeScsIGZ1bmN0aW9uKCRxKSB7XG4gIHZhciBmYWN0b3J5ID0ge1xuICAgIHN1Ym1pdFBpdGNoOiBmdW5jdGlvbihnZW5yZSwgdGV4dCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbiB0byBzdG9yZSB0aGUgcGl0Y2hcbiAgICAgIGlmICgkcm9vdFNjb3BlLmN1clVzZXIgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIFBpdGNoID0gUGFyc2UuT2JqZWN0LmV4dGVuZChcIlBpdGNoXCIpO1xuICAgICAgICB2YXIgcGl0Y2ggPSBuZXcgUGl0Y2goKTtcblxuICAgICAgICBwaXRjaC5zZXQoXCJnZW5yZVwiLCBnZW5yZSk7XG4gICAgICAgIHBpdGNoLnNldChcInBpdGNoXCIsIHRleHQpO1xuICAgICAgICAvLyBwaXRjaC5zZXQoXCJjcmVhdGVyXCIsIFBhcnNlLlVzZXIuY3VycmVudC51c2VybmFtZSlcbiAgICAgICAgcGl0Y2guc2V0KFwicmV2aWV3ZWRcIiwgZmFsc2UpXG5cblxuICAgICAgICBwaXRjaC5zYXZlKG51bGwsIHtcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihwaXRjaCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICAgIGRhdGE6IHBpdGNoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihwaXRjaCwgZXJyb3IpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgICAgICBkYXRhOiBlcnJvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVqZWN0IHRoZSBzYXZlIGF0dGVtcHQgaWYgbm8gY3VycmVudCB1c2VyXG4gICAgICBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBub3QgbG9nZ2VkIGluXCJcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5mYWN0b3J5KCd1c2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRxLCAkcm9vdFNjb3BlKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgbG9naW5Vc2VyOiBmdW5jdGlvbih1c2VybmFtZSwgcHdkKXtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIFBhcnNlLlVzZXIubG9nSW4odXNlcm5hbWUsIHB3ZCkudGhlbihcbiAgICAgICAgZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgJHJvb3RTY29wZS5jdXJVc2VyID0gdXNlcjtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICBkYXRhOiB1c2VyXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICBlcnJvcjogZXJyXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIGxvZ291dFVzZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgUGFyc2UuVXNlci5sb2dPdXQoKTtcblxuICAgICAgdmFyIHVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblxuICAgICAgaWYodXNlciA9PT0gbnVsbCl7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgdXNlciBmcm9tIHRoZSAkcm9vdFNjb3BlXG4gICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9nb3V0LXVwZGF0ZScpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIGxvZ2dlZCBvdXRcIlxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgbXNnOiBcIlVzZXIgaXMgc3RpbGwgbG9nZ2VkIGluXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICBzaWduVXA6IGZ1bmN0aW9uKHVzZXJuYW1lLCBlbWFpbCwgcHdkKXtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIHZhciB1c2VyID0gbmV3IFBhcnNlLlVzZXIoKTtcbiAgICAgIHVzZXIuc2V0KFwidXNlcm5hbWVcIiwgdXNlcm5hbWUpO1xuICAgICAgdXNlci5zZXQoXCJlbWFpbFwiLCBlbWFpbCk7XG4gICAgICB1c2VyLnNldChcInBhc3N3b3JkXCIsIHB3ZCk7XG5cbiAgICAgIHVzZXIuc2lnblVwKG51bGwsIHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YTogdXNlclxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycil7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICB1c2VyOiB1c2VyLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSlcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdhY3Rpb25CdXR0b24nLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJHN0YXRlKXtcblxuICAgICAgJHNjb3BlLnVwZGF0ZSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoJHJvb3RTY29wZS5jdXJVc2VyID09PSBudWxsKXtcbiAgICAgICAgICAkc2NvcGUudGFyZ2V0ID0gXCJyZWdpc3RlclwiO1xuICAgICAgICAgICRzY29wZS5hY3Rpb25UZXh0ID0gXCJSZWdpc3RlciBUbyBTdGFydCBQaXRjaGluZyFcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUuYWN0aW9uVGV4dCA9IFwiU3VibWl0IGEgUGl0Y2ghXCI7XG4gICAgICAgICAgJHNjb3BlLnRhcmdldCA9IFwic3VibWl0LXBpdGNoXCI7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5uYXZpZ2F0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzdGF0ZS5nbygkc2NvcGUudGFyZ2V0KTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ2luLXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS51cGRhdGUoKTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dvdXQtdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLnVwZGF0ZSgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWwsIGF0dHJzKXtcbiAgICAgIHNjb3BlLnVwZGF0ZSgpO1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiXG4gIH1cbn0pXG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW4nLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VyLCBwd2Q7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1sb2dpbi11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXB3ZCcpKS52YWwoKTtcblxuICAgICAgICB1c2VyRmFjdG9yeS5sb2dpblVzZXIodXNlciwgcHdkKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH07XG5cblxuICAgICAgJHNjb3BlLmxvZ291dFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB1c2VyRmFjdG9yeS5sb2dvdXRVc2VyKClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9sb2dpbi9sb2dpbi5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW5Nb2RhbCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcIlwiO1xuXG4gICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiXCI7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5mbGFnSW5wdXRFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcImlzLWVycm9yXCI7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LWhpZGRlblwiO1xuICAgICAgJHNjb3BlLmhpZGVBbGVydCA9IGZ1bmN0aW9uKCl7JHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtaGlkZGVuXCJ9O1xuICAgICAgJHNjb3BlLnNob3dBbGVydCA9IGZ1bmN0aW9uKCl7JHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtc2hvd25cIn07XG5cbiAgICAgICRzY29wZS5jbGVhckZvcm1zID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIG1vZGFsID0gJCgnI2xvZ2luLW1vZGFsJyk7XG5cbiAgICAgICAgLy8gQ2xlYXIgRXhpc3RpbmcgSW5wdXRzXG4gICAgICAgIG1vZGFsLmZpbmQoJ2lucHV0JykudmFsKCcnKTtcblxuICAgICAgICAvLyBSZXNldCBFcnJvciBOb3RpZmljYXRpb25zXG4gICAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzKCk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS51c2VyTG9naW4gPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlciwgcHdkO1xuICAgICAgICB2YXIgbW9kYWwgPSAkKCcjbG9naW4tbW9kYWwnKTtcblxuICAgICAgICB1c2VyID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi1wYXNzd29yZCcpKS52YWwoKTtcblxuICAgICAgICB1c2VyRmFjdG9yeS5sb2dpblVzZXIodXNlciwgcHdkKS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzKCk7XG4gICAgICAgICAgICAkc2NvcGUuY2xlYXJGb3JtcygpO1xuICAgICAgICAgICAgJHNjb3BlLmhpZGVBbGVydCgpO1xuXG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICRzY29wZS5mbGFnSW5wdXRFcnJvcnMoKTtcbiAgICAgICAgICAgICRzY29wZS5zaG93QWxlcnQoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5pbnB1dHNFcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuXG5cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogJ2NvbXBvbmVudHMvbG9naW4tbW9kYWwvbG9naW4tbW9kYWwuaHRtbCdcbiAgfVxufSlcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdhcHBIZWFkZXInLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSBcIm1lbnUtY2xvc2VkXCI7XG4gICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dpblwiO1xuXG4gICAgICAkc2NvcGUudG9nZ2xlTWVudSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID0gJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPT09IFwibWVudS1jbG9zZWRcIiA/IFwibWVudS1vcGVuXCIgOiBcIm1lbnUtY2xvc2VkXCI7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dpbi11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dvdXRcIjtcbiAgICAgIH0pO1xuXG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ291dC11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dpblwiO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5sb2dvdXRVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdXNlckZhY3RvcnkubG9nb3V0VXNlcigpLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbCwgYXR0cnMpe1xuICAgICAgJChlbCkuZmluZCgnLm1haW4tbmF2IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBzY29wZS50b2dnbGVNZW51KCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL25hdi9uYXYuaHRtbFwiXG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdzaWdudXAnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsICRzdGF0ZSwgJHJvb3RTY29wZSwgdXNlckZhY3RvcnksIGVtYWlsRmFjdG9yeSl7XG4gICAgICAvLyAkc2NvcGUuZ2VuZXJhbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLmVtYWlsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS5wYXNzd29yZEVycm9yID0gXCJcIjtcblxuICAgICAgJHNjb3BlLnZhbGlkYXRlRW1haWwgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgZW1haWwgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWVtYWlsJykpLnZhbCgpO1xuXG4gICAgICAgIGVtYWlsRmFjdG9yeS52YWxpZGF0ZUVtYWlsKGVtYWlsKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yID0gXCJcIjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvclRleHQgPSBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFkZHJlc3MuXCI7XG4gICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnNpZ251cFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlcm5hbWUsIGVtYWlsLCBwd2QsIGNvbmZpcm1Qd2Q7XG4gICAgICAgIHZhciB0ZXN0QXJyYXkgPSBbXTtcblxuICAgICAgICB1c2VybmFtZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIGVtYWlsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1lbWFpbCcpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1wYXNzd29yZCcpKS52YWwoKTtcbiAgICAgICAgY29uZmlybVB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItY29uZmlybS1wYXNzd29yZCcpKS52YWwoKTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgZW50cmllcyBleGlzdCBmb3IgYWxsIHRocmVlIHByaW1hcnkgZmllbGRzXG4gICAgICAgIGlmKHVzZXJuYW1lID09PSBcIlwiIHx8IGVtYWlsID09PSBcIlwiIHx8IHB3ZCA9PT0gXCJcIil7XG4gICAgICAgICAgJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHRlc3RBcnJheS5wdXNoKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUuZ2VuZXJhbEVycm9yID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwd2QgIT09IGNvbmZpcm1Qd2Qpe1xuICAgICAgICAgICRzY29wZS5wYXNzd29yZEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgdGVzdEFycmF5LnB1c2goZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5wYXNzd29yZEVycm9yID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRlc3RBcnJheS5sZW5ndGggPT09IDApe1xuICAgICAgICAgIHVzZXJGYWN0b3J5LnNpZ25VcCh1c2VybmFtZSwgZW1haWwsIHB3ZClcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ2luLXVwZGF0ZScpO1xuICAgICAgICAgICAgICAgICRzY29wZS5zaWdudXBTdWNjZXNzID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbXktYWNjb3VudCcpO1xuICAgICAgICAgICAgICAgIH0sIDc1MCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgc3dpdGNoKGVyci5lcnJvci5jb2RlKXtcbiAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yVGV4dCA9IFwiVGhlIHVzZXJuYW1lIGZpZWxkIGlzIGVtcHR5LlwiXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICBjYXNlIDIwMjpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3JUZXh0ID0gXCJUaGUgZGVzaXJlZCB1c2VybmFtZSBpcyBhbHJlYWR5IHRha2VuLlwiXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICBjYXNlIDIwMzpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3JUZXh0ID0gXCJBbiBhY2NvdW50IGhhcyBhbHJlYWR5IGJlZW4gY3JlYXRlZCBhdCBcIiArIGVtYWlsICsgXCIuXCI7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG5cbiAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmNhdWdodCBlcnJvcicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL3NpZ251cC9zaWdudXAuaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3N1Ym1pdFBpdGNoJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHBhcnNlRmFjdG9yeSl7XG4gICAgICAkc2NvcGUuc3VibWl0UGl0Y2ggPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgZ2VucmUsIHBpdGNoO1xuXG4gICAgICAgIGdlbnJlID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnZW5yZScpKS52YWwoKTtcbiAgICAgICAgcGl0Y2ggPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BpdGNoJykpLnZhbCgpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGdlbnJlLCBwaXRjaCk7XG4gICAgICAgIGlmKHBpdGNoICE9PSBcIlwiKXtcbiAgICAgICAgICAvLyBwYXJzZUZhY3Rvcnkuc3VibWl0UGl0Y2goZ2VucmUsIHBpdGNoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiXG4gIH1cbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
