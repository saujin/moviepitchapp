"use strict";

require('angular');
require('angular-ui-router');
var Parse = require('parse');

var controllerArray = ["ui.router"];

var moviePitchApp = angular.module("moviePitchApp", controllerArray).config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  // Main Nav
  $stateProvider.state('index', {
    url: "/",
    templateUrl: "views/home.html",
    data: {
      requireLogin: false
    }
  }).state('our-team', {
    url: "/our-team",
    templateUrl: "views/our-team.html",
    data: {
      requireLogin: false
    }
  }).state('success-stories', {
    url: "/success-stories",
    templateUrl: "views/success-stories.html",
    data: {
      requireLogin: false
    }
  }).state('submit-pitch', {
    url: "/submit-pitch",
    templateUrl: "views/submit-pitch.html",
    data: {
      requireLogin: true
    }
  });

  // Account
  $stateProvider.state('register', {
    url: "/register",
    templateUrl: "views/register.html",
    data: {
      requireLogin: false
    }
  }).state('my-account', {
    url: "/my-account",
    templateUrl: "views/my-account.html",
    data: {
      requireLogin: true
    }
  });

  // Footer Nav
  $stateProvider.state('faq', {
    url: "/faq",
    templateUrl: "views/faq.html",
    data: {
      requireLogin: false
    }
  }).state('press', {
    url: "/press",
    templateUrl: "views/press.html",
    data: {
      requireLogin: false
    }
  }).state('contact-us', {
    url: "/contact-us",
    templateUrl: "views/contact-us.html",
    data: {
      requireLogin: false
    }
  }).state('legal', {
    url: "/legal",
    templateUrl: "views/legal.html",
    data: {
      requireLogin: false
    }
  });
}]).run(function ($rootScope) {
  Parse.initialize("PR9WBHEvjSuW9us8Q7SGh2KYRVQaHLbztZjshsb1", "nyz7N9sGLUIN1hjMY9NNQneExxP5W0MJhXH3u1Qh");

  // Make sure a user is logged out
  Parse.User.logOut();

  $rootScope.$on('$stateChangeStart', function (event, toState) {
    var requireLogin = toState.data.requireLogin;
    console.log(event);
    console.log(toState);

    if (requireLogin === true && $rootScope.curUser === null) {
      event.preventDefault();
      $('#login-modal').modal('show');
      $rootScope.targetState = toState.name;
    }
  });

  $rootScope.curUser = null;
});
'use strict';

moviePitchApp.controller('MainCtrl', ['$scope', function ($scope) {
  // $scope.$on('login-true', function(){
  //   $scope.$broadcast('login-update');
  // })
}]);
'use strict';

moviePitchApp.factory('emailFactory', function ($q) {
  var sendgrid = require('sendgrid')('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');

  var factory = {

    // Mock up sending a contact email
    // https://nodemailer.com/
    sendContactUsMessage: function sendContactUsMessage(name, email, subject, msg) {
      var deferred = $q.defer();

      deferred.resolve({
        status: "success",
        name: name,
        email: email,
        subject: subject,
        message: msg
      });

      return deferred.promise;
    },

    validateEmail: function validateEmail(email) {
      var deferred = $q.defer();

      var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if (reg.test(email)) {
        deferred.resolve(true);
      } else {
        deferred.reject(false);
      }

      return deferred.promise;
    }
  };

  return factory;
});
"use strict";

moviePitchApp.factory('parseFactory', function ($q) {
  var factory = {
    submitPitch: function submitPitch(genre, text) {
      var deferred = $q.defer();

      // Make sure the user is logged in to store the pitch
      if ($rootScope.curUser !== null) {
        var Pitch = Parse.Object.extend("Pitch");
        var pitch = new Pitch();

        pitch.set("genre", genre);
        pitch.set("pitch", text);
        // pitch.set("creater", Parse.User.current.username)
        pitch.set("reviewed", false);

        pitch.save(null, {
          success: function success(pitch) {
            deferred.resolve({
              status: "success",
              data: pitch
            });
          },
          error: function error(pitch, _error) {
            deferred.reject({
              status: "rejected",
              data: _error
            });
          }
        });
      }

      // Reject the save attempt if no current user
      else {
          deferred.reject({
            status: "rejected",
            msg: "User is not logged in"
          });
        }

      return deferred.promise;
    }
  };

  return factory;
});
'use strict';

moviePitchApp.factory('paymentFactory', function () {
  var factory = {};

  return factory;
});
"use strict";

moviePitchApp.factory('userFactory', function ($q, $rootScope, $location) {
  var factory = {
    checkLoggedIn: function checkLoggedIn() {
      var deferred = $q.defer();

      if ($rootScope.curUser === null) {
        console.log('1');
        deferred.reject();
        $location.url('/login');
      } else {
        console.log('2');
        deferred.resolve();
      }

      return deferred.promise;
    },
    loginUser: function loginUser(username, pwd) {
      var deferred = $q.defer();

      Parse.User.logIn(username, pwd).then(function (user) {
        $rootScope.curUser = user;
        deferred.resolve({
          status: "success",
          data: user
        });
        $rootScope.$broadcast('login-update');
      }, function (err) {
        deferred.reject({
          status: "error",
          error: err
        });
      });

      return deferred.promise;
    },

    logoutUser: function logoutUser() {
      var deferred = $q.defer();
      Parse.User.logOut();

      var user = Parse.User.current();

      if (user === null) {
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

    signUp: function signUp(username, email, pwd) {
      var deferred = $q.defer();

      var user = new Parse.User();
      user.set("username", username);
      user.set("email", email);
      user.set("password", pwd);

      user.signUp(null, {
        success: function success(user) {
          deferred.resolve({
            status: "success",
            data: user
          });
          console.log(Parse.User.current());
        },
        error: function error(user, err) {
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
});
"use strict";

moviePitchApp.directive('actionButton', function () {
  return {
    controller: function controller($scope, $rootScope, $state) {

      $scope.update = function () {

        if ($rootScope.curUser === null) {
          $scope.target = "register";
          $scope.actionText = "Register To Start Pitching!";
        } else {
          $scope.actionText = "Submit a Pitch!";
          $scope.target = "submit-pitch";
        }
      };

      $scope.navigate = function () {
        $state.go($scope.target);
      };

      $scope.$on('login-update', function () {
        $scope.update();
      });

      $scope.$on('logout-update', function () {
        $scope.update();
      });
    },
    link: function link(scope, el, attrs) {
      scope.update();
    },
    restrict: "E"
  };
});
"use strict";

moviePitchApp.directive('contactUsForm', function (emailFactory) {
  return {
    controller: function controller($scope) {
      $scope.subjects = ["General", "Billing", "Sales", "Support"];

      var clearErrors = function clearErrors() {
        $scope.messageError = "";
        $scope.submitSuccess = "";
      };

      var clearFields = function clearFields() {
        $('[contact-us-form]').find('.form-control').val('');
      };

      $scope.submitContactForm = function () {
        clearErrors();

        var name = undefined,
            email = undefined,
            subject = undefined,
            message = undefined;

        name = angular.element(document.getElementById('contact-name')).val();
        email = angular.element(document.getElementById('contact-email')).val();
        subject = angular.element(document.getElementById('contact-subject')).val();
        message = angular.element(document.getElementById('contact-message')).val();

        emailFactory.validateEmail(email).then(function (resp) {
          if (name === "" || email === "" || subject === "" || message === "") {
            $scope.messageError = "show-alert";
            $scope.errorText = "Please fill out each field before submitting.";
          } else {

            emailFactory.sendContactUsMessage(name, email, subject, message).then(function (resp) {
              clearErrors();
              clearFields();
              $scope.submitSuccess = "show-alert";
              $scope.successText = "Success! Your message has been submitted.";
              console.log(resp);
            }, function (err) {
              $scope.errorText = "An error has occurred. Your message was not sent.";
              $scope.messageError = "show-alert";
            });
          }
        }, function (err) {
          $scope.messageError = "show-alert";
          $scope.errorText = "Please enter a valid email address.";
        });
      };
    },
    restrict: "A",
    templateUrl: "components/contact-us-form/contact-us-form.html"
  };
});
'use strict';

moviePitchApp.directive('login', function () {
  return {
    controller: function controller($scope, userFactory) {
      $scope.loginUser = function () {
        var user, pwd;

        user = angular.element(document.getElementById('user-login-username')).val();
        pwd = angular.element(document.getElementById('user-login-pwd')).val();

        userFactory.loginUser(user, pwd).then(function (resp) {
          console.log(resp);
        }, function (err) {
          console.log(err);
        });
      };

      $scope.logoutUser = function () {
        userFactory.logoutUser().then(function (resp) {
          console.log(resp);
        }, function (err) {
          console.log(err);
        });
      };
    },
    restrict: "E",
    templateUrl: "components/login/login.html"
  };
});
"use strict";

moviePitchApp.directive('loginModal', function ($rootScope, $state) {
  return {
    controller: function controller($scope, userFactory) {
      $scope.inputsError = "";

      $scope.clearInputErrors = function () {
        $scope.inputsError = "";
      };

      $scope.flagInputErrors = function () {
        $scope.inputsError = "is-error";
      };

      $scope.isAlertShown = "alert-hidden";
      $scope.hideAlert = function () {
        $scope.isAlertShown = "alert-hidden";
      };
      $scope.showAlert = function () {
        $scope.isAlertShown = "alert-shown";
      };

      $scope.clearForms = function () {
        var modal = $('#login-modal');

        // Clear Existing Inputs
        modal.find('input').val('');

        // Reset Error Notifications
        $scope.clearInputErrors();
      };

      $scope.userLogin = function () {
        var user, pwd;
        var modal = $('#login-modal');

        user = angular.element(document.getElementById('login-username')).val();
        pwd = angular.element(document.getElementById('login-password')).val();

        userFactory.loginUser(user, pwd).then(function (resp) {
          $('#login-modal').modal('hide');
          $scope.clearInputErrors();
          $scope.clearForms();
          $scope.hideAlert();

          // if the $rootScope is in the process of navigating to a state,
          // as in an event where login interrupts navigation to a restricted page
          // continue to that state, otherwise clear the $rootScope.targetState
          if ($rootScope.targetState !== null) {
            $state.go($rootScope.targetState);
            $rootScope.targetState = null;
          }
        }, function (err) {
          $scope.flagInputErrors();
          $scope.showAlert();
        });
      };
    },
    restrict: "E",
    templateUrl: 'components/login-modal/login-modal.html'
  };
});
"use strict";

moviePitchApp.directive('appHeader', function ($state) {
  return {
    controller: function controller($scope, userFactory) {
      $scope.menuToggleStatus = "menu-closed";
      $scope.currentLogAction = "show-login";

      $scope.toggleMenu = function () {
        $scope.menuToggleStatus = $scope.menuToggleStatus === "menu-closed" ? "menu-open" : "menu-closed";
      };

      $scope.$on('login-update', function () {
        $scope.currentLogAction = "show-logout";
      });

      $scope.$on('logout-update', function () {
        $scope.currentLogAction = "show-login";
      });

      $scope.logoutUser = function () {
        userFactory.logoutUser().then(function (resp) {
          console.log(resp);
          $state.go('index');
        }, function (err) {
          console.log(err);
        });
      };

      $scope.openLoginModal = function () {
        $('#login-modal').modal('show');
      };
    },
    link: function link(scope, el, attrs) {
      $(el).find('.main-nav a').on('click', function () {
        scope.toggleMenu();
      });
    },
    restrict: "E",
    templateUrl: "components/nav/nav.html"
  };
});
"use strict";

moviePitchApp.directive('signup', function () {
  return {
    controller: function controller($scope, $timeout, $state, $rootScope, userFactory, emailFactory) {
      // $scope.generalError = "show-alert";
      // $scope.usernameError = "show-alert";
      // $scope.emailError = "show-alert";
      // $scope.passwordError = "";

      $scope.validateEmail = function () {
        var email = angular.element(document.getElementById('register-email')).val();

        emailFactory.validateEmail(email).then(function (resp) {
          $scope.emailError = "";
        }, function (err) {
          $scope.emailErrorText = "Please enter a valid email address.";
          $scope.emailError = "show-alert";
        });
      };

      $scope.signupUser = function () {
        var username, email, pwd, confirmPwd;
        var testArray = [];

        username = angular.element(document.getElementById('register-username')).val();
        email = angular.element(document.getElementById('register-email')).val();
        pwd = angular.element(document.getElementById('register-password')).val();
        confirmPwd = angular.element(document.getElementById('register-confirm-password')).val();

        // Make sure entries exist for all three primary fields
        if (username === "" || email === "" || pwd === "") {
          $scope.generalError = "show-alert";
          testArray.push(false);
        } else {
          $scope.generalError = "";
        }

        if (pwd !== confirmPwd) {
          $scope.passwordError = "show-alert";
          testArray.push(false);
        } else {
          $scope.passwordError = "";
        }

        if (testArray.length === 0) {
          userFactory.signUp(username, email, pwd).then(function (resp) {
            $rootScope.$broadcast('login-update');
            $scope.signupSuccess = "show-alert";

            // login the user after a successful signup and navigate to submit-pitch
            userFactory.loginUser(username, pwd).then(function (resp) {
              $timeout(function () {
                $state.go('submit-pitch');
              }, 550);
            }, function (err) {
              console.log(err);
            });
          }, function (err) {
            switch (err.error.code) {
              case -1:
                $scope.usernameErrorText = "The username field is empty.";
                $scope.usernameError = "show-alert";
                break;

              case 202:
                $scope.usernameErrorText = "The desired username is already taken.";
                $scope.usernameError = "show-alert";
                break;

              case 203:
                $scope.emailErrorText = "An account has already been created at " + email + ".";
                $scope.emailError = "show-alert";

              default:
                console.log('uncaught error');
            }
          });
        }
      };
    },
    restrict: "E",
    templateUrl: "components/signup/signup.html"
  };
});
"use strict";

moviePitchApp.directive('submitPitch', function () {
  return {
    controller: function controller($scope, parseFactory) {
      $scope.genres = ["Action", "Adventure", "Animated", "Comedy", "Crime", "Drama", "Fantasy", "Historical", "Historical Fiction", "Horror", "Kids", "Mystery", "Political", "Religious", "Romance", "Romantic Comedy", "Satire", "Science Fiction", "Thriller", "Western"];

      $scope.submitPitch = function () {
        var genre, pitch, terms, dateAgreed;

        genre = angular.element(document.getElementById('genre')).val();
        pitch = angular.element(document.getElementById('pitch')).val();
        terms = $('#agree-terms').is(":checked");
        dateAgreed = new Date();

        console.log(genre, pitch, terms, dateAgreed);

        // Check the form for basic errors
        validateInput();

        // if(pitch !== ""){
        //   // parseFactory.submitPitch(genre, pitch);
        // }
      };

      function validateInput() {
        // Make sure terms are agreed to
        if (terms !== true) {
          $scope.termsError = "show-alert";
          return;
        } else if (pitch === "") {
          $scope.termsError = "";
          $scope.pitchError = "show-alert";
          return;
        } else if (genre) {}
      }
    },
    restrict: "A"
  };
});
"use strict";

moviePitchApp.directive('userPitches', function () {
  return {
    controller: function controller($scope, userFactory) {

      $scope.pitches = [{
        pitchDate: "November 3rd, 2015",
        genre: "Romantic Comedy",
        pitchText: "A man falls in love with a lady, but it's funny.",
        status: "rejected"
      }, {
        pitchDate: "October 23rd, 2015",
        genre: "Horror",
        pitchText: "A woman keeps checking her fridge, but there's never anything worth eating.",
        status: "rejected"
      }, {
        pitchDate: "June 3rd, 2015",
        genre: "Western",
        pitchText: "Some cowboys ride around chasing a gang of thieves",
        status: "accepted"
      }];
    },
    restrict: "E",
    templateUrl: "components/user-pitches/user-pitches.html"
  };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJwYXltZW50RmFjdG9yeS5qcyIsInVzZXJGYWN0b3J5LmpzIiwiYWN0aW9uLWJ1dHRvbi9hY3Rpb24tYnV0dG9uLmpzIiwiY29udGFjdC11cy1mb3JtL2NvbnRhY3QtdXMtZm9ybS5qcyIsImxvZ2luL2xvZ2luLmpzIiwibG9naW4tbW9kYWwvbG9naW4tbW9kYWwuanMiLCJuYXYvbmF2LmpzIiwic2lnbnVwL3NpZ251cC5qcyIsInN1Ym1pdFBpdGNoL3N1Ym1pdFBpdGNoLmpzIiwidXNlci1waXRjaGVzL3VzZXItcGl0Y2hlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25CLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzdCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFHN0IsSUFBTSxlQUFlLEdBQUcsQ0FDdEIsV0FBVyxDQUNaLENBQUM7O0FBRUYsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQ2pFLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLG9CQUFvQixFQUM3QyxVQUFTLGNBQWMsRUFBRSxrQkFBa0IsRUFBQzs7QUFFMUMsb0JBQWtCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQzs7O0FBQUMsQUFHbEMsZ0JBQWMsQ0FDWCxLQUFLLENBQUMsT0FBTyxFQUFFO0FBQ2QsT0FBRyxFQUFFLEdBQUc7QUFDUixlQUFXLEVBQUUsaUJBQWlCO0FBQzlCLFFBQUksRUFBRTtBQUNKLGtCQUFZLEVBQUUsS0FBSztLQUNwQjtHQUNGLENBQUMsQ0FDRCxLQUFLLENBQUMsVUFBVSxFQUFFO0FBQ2pCLE9BQUcsRUFBRSxXQUFXO0FBQ2hCLGVBQVcsRUFBRSxxQkFB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RUFBRSxDQUFDO0FBQ3ZCLGdCQUFNLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQztBQUNqQyxpQkFBTztTQUNSLE1BQU0sSUFBSSxLQUFLLEVBQUUsRUFFakI7T0FDRjtLQUNGO0FBQ0QsWUFBUSxFQUFFLEdBQUc7R0FDZCxDQUFBO0NBQ0YsQ0FBQyxDQUFDOzs7QUM1REgsYUFBYSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsWUFBVTtBQUMvQyxTQUFPO0FBQ0wsY0FBVSxFQUFFLG9CQUFTLE1BQU0sRUFBRSxXQUFXLEVBQUM7O0FBRXZDLFlBQU0sQ0FBQyxPQUFPLEdBQUcsQ0FDZjtBQUNFLGlCQUFTLEVBQUUsb0JBQW9CO0FBQy9CLGFBQUssRUFBRSxpQkFBaUI7QUFDeEIsaUJBQVMsRUFBRSxrREFBa0Q7QUFDN0QsY0FBTSxFQUFFLFVBQVU7T0FDbkIsRUFDRDtBQUNFLGlCQUFTLEVBQUUsb0JBQW9CO0FBQy9CLGFBQUssRUFBRSxRQUFRO0FBQ2YsaUJBQVMsRUFBRSw2RUFBNkU7QUFDeEYsY0FBTSxFQUFFLFVBQVU7T0FDbkIsRUFBQztBQUNBLGlCQUFTLEVBQUUsZ0JBQWdCO0FBQzNCLGFBQUssRUFBRSxTQUFTO0FBQ2hCLGlCQUFTLEVBQUUsb0RBQW9EO0FBQy9ELGNBQU0sRUFBRSxVQUFVO09BQ25CLENBQ0YsQ0FBQTtLQUNGO0FBQ0QsWUFBUSxFQUFFLEdBQUc7QUFDYixlQUFXLEVBQUUsMkNBQTJDO0dBQ3pELENBQUE7Q0FDRixDQUFDLENBQUMiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5yZXF1aXJlKCdhbmd1bGFyJyk7XG5yZXF1aXJlKCdhbmd1bGFyLXVpLXJvdXRlcicpO1xubGV0IFBhcnNlID0gcmVxdWlyZSgncGFyc2UnKTtcblxuXG5jb25zdCBjb250cm9sbGVyQXJyYXkgPSBbXG4gIFwidWkucm91dGVyXCJcbl07XG5cbmxldCBtb3ZpZVBpdGNoQXBwID0gYW5ndWxhci5tb2R1bGUoXCJtb3ZpZVBpdGNoQXBwXCIsIGNvbnRyb2xsZXJBcnJheSlcbiAgLmNvbmZpZyhbXCIkc3RhdGVQcm92aWRlclwiLCBcIiR1cmxSb3V0ZXJQcm92aWRlclwiLFxuICAgIGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpe1xuXG4gICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cbiAgICAgIC8vIE1haW4gTmF2XG4gICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xuICAgICAgICAgIHVybDogXCIvXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvaG9tZS5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdvdXItdGVhbScsIHtcbiAgICAgICAgICB1cmw6IFwiL291ci10ZWFtXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvb3VyLXRlYW0uaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnc3VjY2Vzcy1zdG9yaWVzJywge1xuICAgICAgICAgIHVybDogXCIvc3VjY2Vzcy1zdG9yaWVzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvc3VjY2Vzcy1zdG9yaWVzLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3N1Ym1pdC1waXRjaCcsIHtcbiAgICAgICAgICB1cmw6IFwiL3N1Ym1pdC1waXRjaFwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3N1Ym1pdC1waXRjaC5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgLy8gQWNjb3VudFxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdyZWdpc3RlcicsIHtcbiAgICAgICAgICB1cmw6IFwiL3JlZ2lzdGVyXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvcmVnaXN0ZXIuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnbXktYWNjb3VudCcsIHtcbiAgICAgICAgICB1cmw6IFwiL215LWFjY291bnRcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9teS1hY2NvdW50Lmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICAgIC8vIEZvb3RlciBOYXZcbiAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnZmFxJywge1xuICAgICAgICAgIHVybDogXCIvZmFxXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvZmFxLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3ByZXNzJywge1xuICAgICAgICAgIHVybDogXCIvcHJlc3NcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9wcmVzcy5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdjb250YWN0LXVzJywge1xuICAgICAgICAgIHVybDogXCIvY29udGFjdC11c1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2NvbnRhY3QtdXMuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnbGVnYWwnLCB7XG4gICAgICAgICAgdXJsOiBcIi9sZWdhbFwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2xlZ2FsLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cbiAgXSlcbiAgLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKXtcbiAgICBQYXJzZS5pbml0aWFsaXplKFwiUFI5V0JIRXZqU3VXOXVzOFE3U0doMktZUlZRYUhMYnp0WmpzaHNiMVwiLCBcIm55ejdOOXNHTFVJTjFoak1ZOU5OUW5lRXh4UDVXME1KaFhIM3UxUWhcIik7XG5cbiAgICAvLyBNYWtlIHN1cmUgYSB1c2VyIGlzIGxvZ2dlZCBvdXRcbiAgICBQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUpe1xuICAgICAgbGV0IHJlcXVpcmVMb2dpbiA9IHRvU3RhdGUuZGF0YS5yZXF1aXJlTG9naW47XG4gICAgICBjb25zb2xlLmxvZyhldmVudCk7XG4gICAgICBjb25zb2xlLmxvZyh0b1N0YXRlKTtcblxuICAgICAgaWYocmVxdWlyZUxvZ2luID09PSB0cnVlICYmICRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICRyb290U2NvcGUudGFyZ2V0U3RhdGUgPSB0b1N0YXRlLm5hbWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICB9KTtcbiIsIm1vdmllUGl0Y2hBcHAuY29udHJvbGxlcignTWFpbkN0cmwnLCBbJyRzY29wZScsXG4gIGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgLy8gJHNjb3BlLiRvbignbG9naW4tdHJ1ZScsIGZ1bmN0aW9uKCl7XG4gICAgLy8gICAkc2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgLy8gfSlcbiAgfVxuXSlcbiIsIm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgnZW1haWxGYWN0b3J5JywgZnVuY3Rpb24oJHEpe1xuICBsZXQgc2VuZGdyaWQgPSByZXF1aXJlKCdzZW5kZ3JpZCcpKCdTRy4yQ1NxeDk5alEyLVV3VWY4QmlVVU9RLktlS0VjdkE1cW5XQ0FXakhDcjhJMFRLaDg4SkJGOExLQnFId05IS0VsOW8nKTtcblxuICBsZXQgZmFjdG9yeSA9IHtcblxuICAgIC8vIE1vY2sgdXAgc2VuZGluZyBhIGNvbnRhY3QgZW1haWxcbiAgICAvLyBodHRwczovL25vZGVtYWlsZXIuY29tL1xuICAgIHNlbmRDb250YWN0VXNNZXNzYWdlOiBmdW5jdGlvbihuYW1lLCBlbWFpbCwgc3ViamVjdCwgbXNnKXtcbiAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgIHN1YmplY3Q6IHN1YmplY3QsXG4gICAgICAgIG1lc3NhZ2U6IG1zZ1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICB2YWxpZGF0ZUVtYWlsOiBmdW5jdGlvbihlbWFpbCkge1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgbGV0IHJlZyA9IC9eKFthLXpBLVowLTlfXFwuXFwtXSkrXFxAKChbYS16QS1aMC05XFwtXSkrXFwuKSsoW2EtekEtWjAtOV17Miw0fSkrJC87XG5cbiAgICAgIGlmKHJlZy50ZXN0KGVtYWlsKSl7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BhcnNlRmFjdG9yeScsIGZ1bmN0aW9uKCRxKSB7XG4gIHZhciBmYWN0b3J5ID0ge1xuICAgIHN1Ym1pdFBpdGNoOiBmdW5jdGlvbihnZW5yZSwgdGV4dCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbiB0byBzdG9yZSB0aGUgcGl0Y2hcbiAgICAgIGlmICgkcm9vdFNjb3BlLmN1clVzZXIgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIFBpdGNoID0gUGFyc2UuT2JqZWN0LmV4dGVuZChcIlBpdGNoXCIpO1xuICAgICAgICB2YXIgcGl0Y2ggPSBuZXcgUGl0Y2goKTtcblxuICAgICAgICBwaXRjaC5zZXQoXCJnZW5yZVwiLCBnZW5yZSk7XG4gICAgICAgIHBpdGNoLnNldChcInBpdGNoXCIsIHRleHQpO1xuICAgICAgICAvLyBwaXRjaC5zZXQoXCJjcmVhdGVyXCIsIFBhcnNlLlVzZXIuY3VycmVudC51c2VybmFtZSlcbiAgICAgICAgcGl0Y2guc2V0KFwicmV2aWV3ZWRcIiwgZmFsc2UpXG5cblxuICAgICAgICBwaXRjaC5zYXZlKG51bGwsIHtcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihwaXRjaCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICAgIGRhdGE6IHBpdGNoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihwaXRjaCwgZXJyb3IpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgICAgICBkYXRhOiBlcnJvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVqZWN0IHRoZSBzYXZlIGF0dGVtcHQgaWYgbm8gY3VycmVudCB1c2VyXG4gICAgICBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBub3QgbG9nZ2VkIGluXCJcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BheW1lbnRGYWN0b3J5JywgZnVuY3Rpb24oKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG5cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgndXNlckZhY3RvcnknLCBmdW5jdGlvbigkcSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgY2hlY2tMb2dnZWRJbjogZnVuY3Rpb24oKXtcbiAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmKCRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcxJyk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAkbG9jYXRpb24udXJsKCcvbG9naW4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJzInKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIGxvZ2luVXNlcjogZnVuY3Rpb24odXNlcm5hbWUsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwd2QpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IHVzZXI7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YTogdXNlclxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICBsb2dvdXRVc2VyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAgIHZhciB1c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbiAgICAgIGlmKHVzZXIgPT09IG51bGwpe1xuICAgICAgICAvLyBSZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgJHJvb3RTY29wZVxuICAgICAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ291dC11cGRhdGUnKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBsb2dnZWQgb3V0XCJcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIHN0aWxsIGxvZ2dlZCBpblwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgc2lnblVwOiBmdW5jdGlvbih1c2VybmFtZSwgZW1haWwsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICB2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgICB1c2VyLnNldChcInVzZXJuYW1lXCIsIHVzZXJuYW1lKTtcbiAgICAgIHVzZXIuc2V0KFwiZW1haWxcIiwgZW1haWwpO1xuICAgICAgdXNlci5zZXQoXCJwYXNzd29yZFwiLCBwd2QpO1xuXG4gICAgICB1c2VyLnNpZ25VcChudWxsLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIGRhdGE6IHVzZXJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnIpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgICAgIGVycm9yOiBlcnJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FjdGlvbkJ1dHRvbicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGUpe1xuXG4gICAgICAkc2NvcGUudXBkYXRlID0gZnVuY3Rpb24oKXtcblxuICAgICAgICBpZigkcm9vdFNjb3BlLmN1clVzZXIgPT09IG51bGwpe1xuICAgICAgICAgICRzY29wZS50YXJnZXQgPSBcInJlZ2lzdGVyXCI7XG4gICAgICAgICAgJHNjb3BlLmFjdGlvblRleHQgPSBcIlJlZ2lzdGVyIFRvIFN0YXJ0IFBpdGNoaW5nIVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5hY3Rpb25UZXh0ID0gXCJTdWJtaXQgYSBQaXRjaCFcIjtcbiAgICAgICAgICAkc2NvcGUudGFyZ2V0ID0gXCJzdWJtaXQtcGl0Y2hcIjtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgJHNjb3BlLm5hdmlnYXRlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHN0YXRlLmdvKCRzY29wZS50YXJnZXQpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLiRvbignbG9naW4tdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLnVwZGF0ZSgpO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ291dC11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUudXBkYXRlKCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbCwgYXR0cnMpe1xuICAgICAgc2NvcGUudXBkYXRlKCk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCJcbiAgfVxufSlcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdjb250YWN0VXNGb3JtJywgZnVuY3Rpb24oZW1haWxGYWN0b3J5KXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgJHNjb3BlLnN1YmplY3RzID0gW1xuICAgICAgICBcIkdlbmVyYWxcIixcbiAgICAgICAgXCJCaWxsaW5nXCIsXG4gICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgXCJTdXBwb3J0XCJcbiAgICAgIF07XG5cblxuICAgICAgbGV0IGNsZWFyRXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwiXCI7XG4gICAgICAgICRzY29wZS5zdWJtaXRTdWNjZXNzID0gXCJcIjtcbiAgICAgIH07XG5cbiAgICAgIGxldCBjbGVhckZpZWxkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICQoJ1tjb250YWN0LXVzLWZvcm1dJykuZmluZCgnLmZvcm0tY29udHJvbCcpLnZhbCgnJyk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q29udGFjdEZvcm0gPSBmdW5jdGlvbigpe1xuICAgICAgICBjbGVhckVycm9ycygpO1xuXG4gICAgICAgIGxldCBuYW1lLCBlbWFpbCwgc3ViamVjdCwgbWVzc2FnZTtcblxuICAgICAgICBuYW1lID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWN0LW5hbWUnKSkudmFsKCk7XG4gICAgICAgIGVtYWlsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWN0LWVtYWlsJykpLnZhbCgpO1xuICAgICAgICBzdWJqZWN0ID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWN0LXN1YmplY3QnKSkudmFsKCk7XG4gICAgICAgIG1lc3NhZ2UgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhY3QtbWVzc2FnZScpKS52YWwoKTtcblxuICAgICAgICBlbWFpbEZhY3RvcnkudmFsaWRhdGVFbWFpbChlbWFpbClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBpZihuYW1lID09PSBcIlwiIHx8IGVtYWlsID09PSBcIlwiIHx8IHN1YmplY3QgPT09IFwiXCIgfHwgbWVzc2FnZT09PVwiXCIpe1xuICAgICAgICAgICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJQbGVhc2UgZmlsbCBvdXQgZWFjaCBmaWVsZCBiZWZvcmUgc3VibWl0dGluZy5cIjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGVtYWlsRmFjdG9yeS5zZW5kQ29udGFjdFVzTWVzc2FnZShuYW1lLCBlbWFpbCwgc3ViamVjdCwgbWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgICAgICAgICBjbGVhckVycm9ycygpO1xuICAgICAgICAgICAgICAgICAgICAgIGNsZWFyRmllbGRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN1Ym1pdFN1Y2Nlc3MgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3VjY2Vzc1RleHQgPSBcIlN1Y2Nlc3MhIFlvdXIgbWVzc2FnZSBoYXMgYmVlbiBzdWJtaXR0ZWQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yVGV4dCA9IFwiQW4gZXJyb3IgaGFzIG9jY3VycmVkLiBZb3VyIG1lc3NhZ2Ugd2FzIG5vdCBzZW50LlwiO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9O1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvY29udGFjdC11cy1mb3JtL2NvbnRhY3QtdXMtZm9ybS5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW4nLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VyLCBwd2Q7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1sb2dpbi11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXB3ZCcpKS52YWwoKTtcblxuICAgICAgICB1c2VyRmFjdG9yeS5sb2dpblVzZXIodXNlciwgcHdkKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH07XG5cblxuICAgICAgJHNjb3BlLmxvZ291dFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB1c2VyRmFjdG9yeS5sb2dvdXRVc2VyKClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9sb2dpbi9sb2dpbi5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW5Nb2RhbCcsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcIlwiO1xuXG4gICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiXCI7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5mbGFnSW5wdXRFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcImlzLWVycm9yXCI7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LWhpZGRlblwiO1xuICAgICAgJHNjb3BlLmhpZGVBbGVydCA9IGZ1bmN0aW9uKCl7JHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtaGlkZGVuXCJ9O1xuICAgICAgJHNjb3BlLnNob3dBbGVydCA9IGZ1bmN0aW9uKCl7JHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtc2hvd25cIn07XG5cbiAgICAgICRzY29wZS5jbGVhckZvcm1zID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIG1vZGFsID0gJCgnI2xvZ2luLW1vZGFsJyk7XG5cbiAgICAgICAgLy8gQ2xlYXIgRXhpc3RpbmcgSW5wdXRzXG4gICAgICAgIG1vZGFsLmZpbmQoJ2lucHV0JykudmFsKCcnKTtcblxuICAgICAgICAvLyBSZXNldCBFcnJvciBOb3RpZmljYXRpb25zXG4gICAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzKCk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS51c2VyTG9naW4gPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlciwgcHdkO1xuICAgICAgICB2YXIgbW9kYWwgPSAkKCcjbG9naW4tbW9kYWwnKTtcblxuICAgICAgICB1c2VyID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi1wYXNzd29yZCcpKS52YWwoKTtcblxuICAgICAgICB1c2VyRmFjdG9yeS5sb2dpblVzZXIodXNlciwgcHdkKS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzKCk7XG4gICAgICAgICAgICAkc2NvcGUuY2xlYXJGb3JtcygpO1xuICAgICAgICAgICAgJHNjb3BlLmhpZGVBbGVydCgpO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUgJHJvb3RTY29wZSBpcyBpbiB0aGUgcHJvY2VzcyBvZiBuYXZpZ2F0aW5nIHRvIGEgc3RhdGUsXG4gICAgICAgICAgICAvLyBhcyBpbiBhbiBldmVudCB3aGVyZSBsb2dpbiBpbnRlcnJ1cHRzIG5hdmlnYXRpb24gdG8gYSByZXN0cmljdGVkIHBhZ2VcbiAgICAgICAgICAgIC8vIGNvbnRpbnVlIHRvIHRoYXQgc3RhdGUsIG90aGVyd2lzZSBjbGVhciB0aGUgJHJvb3RTY29wZS50YXJnZXRTdGF0ZVxuICAgICAgICAgICAgaWYoJHJvb3RTY29wZS50YXJnZXRTdGF0ZSAhPT0gbnVsbCl7XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygkcm9vdFNjb3BlLnRhcmdldFN0YXRlKTtcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS50YXJnZXRTdGF0ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgJHNjb3BlLmZsYWdJbnB1dEVycm9ycygpO1xuICAgICAgICAgICAgJHNjb3BlLnNob3dBbGVydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuXG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6ICdjb21wb25lbnRzL2xvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmh0bWwnXG4gIH1cbn0pXG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYXBwSGVhZGVyJywgZnVuY3Rpb24oJHN0YXRlKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID0gXCJtZW51LWNsb3NlZFwiO1xuICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9naW5cIjtcblxuICAgICAgJHNjb3BlLnRvZ2dsZU1lbnUgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9ICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID09PSBcIm1lbnUtY2xvc2VkXCIgPyBcIm1lbnUtb3BlblwiIDogXCJtZW51LWNsb3NlZFwiO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLiRvbignbG9naW4tdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9nb3V0XCI7XG4gICAgICB9KTtcblxuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dvdXQtdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9naW5cIjtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUubG9nb3V0VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ291dFVzZXIoKS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2luZGV4Jyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5vcGVuTG9naW5Nb2RhbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWwsIGF0dHJzKXtcbiAgICAgICQoZWwpLmZpbmQoJy5tYWluLW5hdiBhJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgc2NvcGUudG9nZ2xlTWVudSgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9uYXYvbmF2Lmh0bWxcIlxuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc2lnbnVwJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCAkc3RhdGUsICRyb290U2NvcGUsIHVzZXJGYWN0b3J5LCBlbWFpbEZhY3Rvcnkpe1xuICAgICAgLy8gJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS5lbWFpbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwiXCI7XG5cbiAgICAgICRzY29wZS52YWxpZGF0ZUVtYWlsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGVtYWlsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1lbWFpbCcpKS52YWwoKTtcblxuICAgICAgICBlbWFpbEZhY3RvcnkudmFsaWRhdGVFbWFpbChlbWFpbClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwiXCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3JUZXh0ID0gXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLlwiO1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5zaWdudXBVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXJuYW1lLCBlbWFpbCwgcHdkLCBjb25maXJtUHdkO1xuICAgICAgICB2YXIgdGVzdEFycmF5ID0gW107XG5cbiAgICAgICAgdXNlcm5hbWUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItZW1haWwnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItcGFzc3dvcmQnKSkudmFsKCk7XG4gICAgICAgIGNvbmZpcm1Qd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWNvbmZpcm0tcGFzc3dvcmQnKSkudmFsKCk7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIGVudHJpZXMgZXhpc3QgZm9yIGFsbCB0aHJlZSBwcmltYXJ5IGZpZWxkc1xuICAgICAgICBpZih1c2VybmFtZSA9PT0gXCJcIiB8fCBlbWFpbCA9PT0gXCJcIiB8fCBwd2QgPT09IFwiXCIpe1xuICAgICAgICAgICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICB0ZXN0QXJyYXkucHVzaChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHdkICE9PSBjb25maXJtUHdkKXtcbiAgICAgICAgICAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHRlc3RBcnJheS5wdXNoKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0ZXN0QXJyYXkubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICB1c2VyRmFjdG9yeS5zaWduVXAodXNlcm5hbWUsIGVtYWlsLCBwd2QpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2lnbnVwU3VjY2VzcyA9IFwic2hvdy1hbGVydFwiO1xuXG4gICAgICAgICAgICAgICAgLy8gbG9naW4gdGhlIHVzZXIgYWZ0ZXIgYSBzdWNjZXNzZnVsIHNpZ251cCBhbmQgbmF2aWdhdGUgdG8gc3VibWl0LXBpdGNoXG4gICAgICAgICAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXJuYW1lLCBwd2QpXG4gICAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnc3VibWl0LXBpdGNoJyk7XG4gICAgICAgICAgICAgICAgICAgICAgfSwgNTUwKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAgIHN3aXRjaChlcnIuZXJyb3IuY29kZSl7XG4gICAgICAgICAgICAgICAgICBjYXNlIC0xOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvclRleHQgPSBcIlRoZSB1c2VybmFtZSBmaWVsZCBpcyBlbXB0eS5cIlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAyMDI6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yVGV4dCA9IFwiVGhlIGRlc2lyZWQgdXNlcm5hbWUgaXMgYWxyZWFkeSB0YWtlbi5cIlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAyMDM6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yVGV4dCA9IFwiQW4gYWNjb3VudCBoYXMgYWxyZWFkeSBiZWVuIGNyZWF0ZWQgYXQgXCIgKyBlbWFpbCArIFwiLlwiO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuXG4gICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5jYXVnaHQgZXJyb3InKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9zaWdudXAvc2lnbnVwLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdzdWJtaXRQaXRjaCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCBwYXJzZUZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmdlbnJlcyA9IFtcbiAgICAgICAgXCJBY3Rpb25cIixcbiAgICAgICAgXCJBZHZlbnR1cmVcIixcbiAgICAgICAgXCJBbmltYXRlZFwiLFxuICAgICAgICBcIkNvbWVkeVwiLFxuICAgICAgICBcIkNyaW1lXCIsXG4gICAgICAgIFwiRHJhbWFcIixcbiAgICAgICAgXCJGYW50YXN5XCIsXG4gICAgICAgIFwiSGlzdG9yaWNhbFwiLFxuICAgICAgICBcIkhpc3RvcmljYWwgRmljdGlvblwiLFxuICAgICAgICBcIkhvcnJvclwiLFxuICAgICAgICBcIktpZHNcIixcbiAgICAgICAgXCJNeXN0ZXJ5XCIsXG4gICAgICAgIFwiUG9saXRpY2FsXCIsXG4gICAgICAgIFwiUmVsaWdpb3VzXCIsXG4gICAgICAgIFwiUm9tYW5jZVwiLFxuICAgICAgICBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICBcIlNhdGlyZVwiLFxuICAgICAgICBcIlNjaWVuY2UgRmljdGlvblwiLFxuICAgICAgICBcIlRocmlsbGVyXCIsXG4gICAgICAgIFwiV2VzdGVyblwiXG4gICAgICBdO1xuXG4gICAgICAkc2NvcGUuc3VibWl0UGl0Y2ggPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgZ2VucmUsIHBpdGNoLCB0ZXJtcywgZGF0ZUFncmVlZDtcblxuICAgICAgICBnZW5yZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2VucmUnKSkudmFsKCk7XG4gICAgICAgIHBpdGNoID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwaXRjaCcpKS52YWwoKTtcbiAgICAgICAgdGVybXMgPSAkKCcjYWdyZWUtdGVybXMnKS5pcyhcIjpjaGVja2VkXCIpO1xuICAgICAgICBkYXRlQWdyZWVkID0gbmV3IERhdGUoKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhnZW5yZSwgcGl0Y2gsIHRlcm1zLCBkYXRlQWdyZWVkKTtcblxuICAgICAgICAvLyBDaGVjayB0aGUgZm9ybSBmb3IgYmFzaWMgZXJyb3JzXG4gICAgICAgIHZhbGlkYXRlSW5wdXQoKTtcblxuICAgICAgICAvLyBpZihwaXRjaCAhPT0gXCJcIil7XG4gICAgICAgIC8vICAgLy8gcGFyc2VGYWN0b3J5LnN1Ym1pdFBpdGNoKGdlbnJlLCBwaXRjaCk7XG4gICAgICAgIC8vIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdmFsaWRhdGVJbnB1dCgpIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRlcm1zIGFyZSBhZ3JlZWQgdG9cbiAgICAgICAgaWYodGVybXMgIT09IHRydWUpe1xuICAgICAgICAgICRzY29wZS50ZXJtc0Vycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKHBpdGNoID09PSBcIlwiKSB7XG4gICAgICAgICAgJHNjb3BlLnRlcm1zRXJyb3IgPSBcIlwiO1xuICAgICAgICAgICRzY29wZS5waXRjaEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGdlbnJlKSB7XG5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3VzZXJQaXRjaGVzJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcblxuICAgICAgJHNjb3BlLnBpdGNoZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiTm92ZW1iZXIgM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiUm9tYW50aWMgQ29tZWR5XCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgbWFuIGZhbGxzIGluIGxvdmUgd2l0aCBhIGxhZHksIGJ1dCBpdCdzIGZ1bm55LlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiT2N0b2JlciAyM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiSG9ycm9yXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgd29tYW4ga2VlcHMgY2hlY2tpbmcgaGVyIGZyaWRnZSwgYnV0IHRoZXJlJ3MgbmV2ZXIgYW55dGhpbmcgd29ydGggZWF0aW5nLlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0se1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJKdW5lIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIldlc3Rlcm5cIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiU29tZSBjb3dib3lzIHJpZGUgYXJvdW5kIGNoYXNpbmcgYSBnYW5nIG9mIHRoaWV2ZXNcIixcbiAgICAgICAgICBzdGF0dXM6IFwiYWNjZXB0ZWRcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy91c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmh0bWxcIlxuICB9XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
