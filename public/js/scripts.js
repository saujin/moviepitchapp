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
  }).state('admin', {
    url: "/admin",
    templateUrl: "views/admin.html",
    data: {
      requireLogin: true
    }
  });

  // Account
  // $stateProvider
  //   .state('register', {
  //     url: "/register",
  //     templateUrl: "views/register.html",
  //     data: {
  //       requireLogin: false
  //     }
  //   })
  //   .state('my-account', {
  //     url: "/my-account",
  //     templateUrl: "views/my-account.html",
  //     data: {
  //       requireLogin: true
  //     }
  //   });

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
    // console.log(event);
    // console.log(toState);

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

moviePitchApp.factory('pitchFactory', function ($q, $http) {
  var factory = {
    submitPitch: function submitPitch(pitch) {
      $http({
        method: "POST",
        url: "https://moviepitchapi.herokuapp.com/pitch",
        data: pitch
      });
    },
    validatePitch: function validatePitch(pitch) {
      // console.log(pitch);
      var deferred = $q.defer();

      if (pitch.userHasAcceptedTerms === true && pitch.pitchText !== "" && pitch.pitchText !== null && pitch.genre !== "Select Genre" && pitch.genre !== "") {
        pitch.status = "created";
        pitch.userHasAcceptedTime = new Date();

        deferred.resolve({
          status: "success",
          pitch: pitch
        });
      } else if (pitch.pitchText === "" || pitch.pitchText === null && pitch.genre === "" || pitch.genre === "Select Genre") {
        deferred.reject({
          status: "error",
          errorCode: 1000,
          msg: "Please fill out the pitch form before submitting."
        });
      } else if (pitch.userHasAcceptedTerms === false) {
        deferred.reject({
          status: "error",
          errorCode: 1001,
          msg: "Please accept the terms in order to continue."
        });
      } else if (pitch.pitchText === "" || pitch.pitchText === null) {
        deferred.reject({
          status: "error",
          errorCode: 1002,
          msg: "Robert is good, but not good enough to sell a blank pitch!"
        });
      } else if (pitch.genre === "" || pitch.genre === "Select Genre") {
        deferred.reject({
          status: "error",
          errorCode: 1003,
          msg: "What kind of movie is it? Please select a genre."
        });
      } else {
        deferred.reject({
          status: "error",
          errorCode: 9999,
          msg: "An unknown error has occurred."
        });
      }

      return deferred.promise;
    }

  };

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

moviePitchApp.directive('adminPitchReview', function () {
  return {
    controller: function controller($scope) {
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
    restrict: "A"
  };
});
"use strict";

moviePitchApp.directive('pitchBox', function () {
  return {
    controller: function controller($scope, $q, $http, paymentFactory, pitchFactory) {

      // Populate an array of genres, and create some variables
      // for the ng-models to bind to
      $scope.data = {
        genres: ["Select Genre", "Action", "Adventure", "Animated", "Comedy", "Crime", "Drama", "Fantasy", "Historical", "Historical Fiction", "Horror", "Kids", "Mystery", "Political", "Religious", "Romance", "Romantic Comedy", "Satire", "Science Fiction", "Thriller", "Western"],
        pitchGenre: "Select Genre",
        pitchText: null,
        termsAgree: false
      };

      // Carve out a place for storing a submitted pitch
      $scope.pitch = null;

      // Set this property to configure alert messages displayed
      // on validation failures
      $scope.validationText = null;

      // The Handler has some basic Stripe config and then calls the payment
      // success function
      $scope.handler = StripeCheckout.configure({
        key: 'pk_test_XHkht0GMLQPrn2sYCXSFy4Fs',
        // image: '/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function token(_token) {
          $scope.paymentSuccess(_token);
        }
      });

      // Run the handler when someone clicks 'submit'
      $scope.submitPitch = function (ev) {

        // Create a pitch object for validation
        $scope.pitch = {
          genre: $scope.data.pitchGenre,
          pitchText: $scope.data.pitchText,
          userHasAcceptedTerms: $scope.data.termsAgree
        };

        pitchFactory.validatePitch($scope.pitch).then(function (resp) {
          buildScopePitch(resp);
        }, function (err) {
          logError(err);
        }).then(function () {
          $scope.triggerScopeHandler();
        });

        ev.preventDefault();
      };

      function buildScopePitch(resp) {
        $scope.validationText = "";
        $scope.pitch = resp.pitch;
        // console.log($scope.pitch);
      }

      function logError(err) {
        $scope.validationText = err.msg;
        console.log(err);
      }

      function triggerScopeHandler() {
        $scope.handler.open({
          name: "MoviePitch.com",
          description: "Pitch Submission",
          amount: 200
        });
      }

      function paymentSuccess(token) {
        var deferred = $q.defer();

        // Update the pitch object with the payment token
        $scope.pitch.token = token;
        $scope.pitch.submitterEmail = token.pitchFactory.submitPitch($scope.pitch);

        return deferred.promise;
      };
    },
    link: function link(scope, el, attrs) {
      el.find('select').on('focus', function () {
        var selectGenre = el.find('option')[0];
        angular.element(selectGenre).remove();
      });
    },
    restrict: "A",
    templateUrl: "components/checkout/pitch-box.html"
  };
});
"use strict";

moviePitchApp.directive('contactUsForm', function (emailFactory) {
  return {
    controller: function controller($scope) {
      $scope.data = {
        name: null,
        email: null,
        msgSubject: "General",
        message: null,
        subjects: ["General", "Billing", "Sales", "Support"]

      };

      var clearErrors = function clearErrors() {
        $scope.messageError = "";
        $scope.submitSuccess = "";
      };

      var clearFields = function clearFields() {
        $scope.data.name = null;
        $scope.data.email = null;
        $scope.data.message = null;
        $scope.data.msgSubject = "General";
      };

      $scope.submitContactForm = function () {
        clearErrors();

        emailFactory.validateEmail($scope.data.email).then(function (resp) {
          debugger;
          if ($scope.data.name === "" || $scope.data.name === null || $scope.data.email === "" || $scope.data.email === null || $scope.data.msgSubject === "" || $scope.data.msgSubject === null || $scope.data.message === "" || $scope.data.message === null) {
            $scope.messageError = "show-alert";
            $scope.errorText = "Please fill out each field before submitting.";
          } else {
            emailFactory.sendContactUsMessage($scope.data.name, $scope.data.email, $scope.data.msgSubject, $scope.data.message).then(function (resp) {
              clearErrors();
              clearFields();
              $scope.submitSuccess = "show-alert";
              $scope.successText = "Success! Your message has been submitted.";
              // console.log(resp);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJwYXltZW50RmFjdG9yeS5qcyIsInBpdGNoRmFjdG9yeS5qcyIsInVzZXJGYWN0b3J5LmpzIiwiYWRtaW4tcGl0Y2gtcmV2aWV3L2FkbWluLXBpdGNoLXJldmlldy5qcyIsImNoZWNrb3V0L3BpdGNoLWJveC5qcyIsImNvbnRhY3QtdXMtZm9ybS9jb250YWN0LXVzLWZvcm0uanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmpzIiwic2lnbnVwL3NpZ251cC5qcyIsInVzZXItcGl0Y2hlcy91c2VyLXBpdGNoZXMuanMiLCJuYXYvbmF2LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkIsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDN0IsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUvQixJQUFNLGVBQWUsR0FBRyxDQUN0QixXQUFXLENBQ1osQ0FBQzs7QUFFRixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FDakUsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQzdDLFVBQVMsY0FBYyxFQUFFLGtCQUFrQixFQUFDOztBQUUxQyxvQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDOzs7QUFBQyxBQUdsQyxnQkFBYyxDQUNYLEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDZCxPQUFHLEVBQUUsR0FBRztBQUNSLGVBQVcsRUFBRSxpQkFBaUI7QUFDOUIsUUFBSSxFQUFFO0FBQ0osa0JBQVksRUFBRSxLQUFLO0tBQ3BCO0dBQ0YsQ0FBQyxDQUNELEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDZCxPQUFHLEVBQUUsUUFBUTtBQUNiLGVBQVcsRUFBRSxrQkFBa0I7QUFDL0IsUUFBSSxFQUFFO0FBQ0osa0JBQVksRUFBRSxJQUFJO0tBQ25CO0dBQ0YsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQyxBQXFCTCxnQkFBYyxDQUNYLEtBQUssQ0FBQyxLQUFLLEVBQUU7QUFDWixPQUFHLEVBQUUsTUFBTTtBQUNYLGVBQVcsRUFBRSxnQkFBZ0I7QUFDN0IsUUFBSSxFQUFFO0FBQ0osa0JBQVksRUFBRSxLQUFLO0tBQ3BCO0dBQ0YsQ0FBQyxDQUNELEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDZCxPQUFHLEVBQUUsUUFBUTtBQUNiLGVBQVcsRUFBRSxrQkFBa0I7QUFDL0IsUUFBSSxFQUFFO0FBQ0osa0JBQVksRUFBRSxLQUFLO0tBQ3BCO0dBQ0YsQ0FBQyxDQUNELEtBQUssQ0FBQyxZQUFZLEVBQUU7QUFDbkIsT0FBRyxFQUFFLGFBQWE7QUFDbEIsZUFBVyxFQUFFLHVCQUF1QjtBQUNwQyxRQUFJLEVBQUU7QUFDSixrQkFBWSxFQUFFLEtBQUs7S0FDcEI7R0FDRixDQUFDLENBQ0QsS0FBSyxDQUFDLE9BQU8sRUFBRTtBQUNkLE9BQUcsRUFBRSxRQUFRO0FBQ2IsZUFBVyxFQUFFLGtCQUFrQjtBQUMvQixRQUFJLEVBQUU7QUFDSixrQkFBWSxFQUFFLEtBQUs7S0FDcEI7R0FDRixDQUFDLENBQUM7Q0FFTixDQUNGLENBQUMsQ0FDRCxHQUFHLENBQUMsVUFBUyxVQUFVLEVBQUM7QUFDdkIsT0FBSyxDQUFDLFVBQVUsQ0FBQywwQ0FBMEMsRUFBRSwwQ0FBMEMsQ0FBQzs7O0FBQUMsQUFHekcsT0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFFcEIsWUFBVSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxVQUFTLEtBQUssRUFBRSxPQUFPLEVBQUM7QUFDMUQsUUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZOzs7O0FBQUMsQUFJN0MsUUFBRyxZQUFZLEtBQUssSUFBSSxJQUFJLFVBQVUsQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFDO0FBQ3RELFdBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN2QixPQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLGdCQUFVLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7S0FDdkM7R0FDRixDQUFDLENBQUM7O0FBRUgsWUFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Q0FDM0IsQ0FBQyxDQUFDOzs7QUN2R0wsYUFBYSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQzVDLFVBQVMsTUFBTSxFQUFDOzs7O0NBSWYsQ0FDRixDQUFDLENBQUE7OztBQ05GLGFBQWEsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLFVBQVMsRUFBRSxFQUFDO0FBQ2hELE1BQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDOztBQUU1RyxNQUFJLE9BQU8sR0FBRzs7OztBQUlaLHdCQUFvQixFQUFFLDhCQUFTLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBQztBQUN2RCxVQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRTFCLGNBQVEsQ0FBQyxPQUFPLENBQUM7QUFDZixjQUFNLEVBQUUsU0FBUztBQUNqQixZQUFJLEVBQUUsSUFBSTtBQUNWLGFBQUssRUFBRSxLQUFLO0FBQ1osZUFBTyxFQUFFLE9BQU87QUFDaEIsZUFBTyxFQUFFLEdBQUc7T0FDYixDQUFDLENBQUM7O0FBRUgsYUFBTyxRQUFRLENBQUMsT0FBTyxDQUFDO0tBQ3pCOztBQUVELGlCQUFhLEVBQUUsdUJBQVMsS0FBSyxFQUFFO0FBQzdCLFVBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFMUIsVUFBSSxHQUFHLEdBQUcsaUVBQWlFLENBQUM7O0FBRTVFLFVBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQztBQUNqQixnQkFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN4QixNQUFNO0FBQ0wsZ0JBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDeEI7O0FBRUQsYUFBTyxRQUFRLENBQUMsT0FBTyxDQUFDO0tBQ3pCO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLE9BQU8sQ0FBQztDQUNoQixDQUFDLENBQUM7QUNyQ0gsWUFBWSxDQUFDOztBQUViLGFBQWEsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLFVBQVMsRUFBRSxFQUFFO0FBQ2pELE1BQUksT0FBTyxHQUFHO0FBQ1osZUFBVyxFQUFFLHFCQUFTLEtBQUssRUFBRSxJQUFJLEVBQUU7QUFDakMsVUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRTs7O0FBQUMsQUFHMUIsVUFBSSxVQUFVLENBQUMsT0FBTyxLQUFLLElBQUksRUFBRTtBQUMvQixZQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QyxZQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDOztBQUV4QixhQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMxQixhQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUM7O0FBQUMsQUFFekIsYUFBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUE7O0FBRzVCLGFBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ2YsaUJBQU8sRUFBRSxpQkFBUyxLQUFLLEVBQUU7QUFDdkIsb0JBQVEsQ0FBQyxPQUFPLENBQUM7QUFDZixvQkFBTSxFQUFFLFNBQVM7QUFDakIsa0JBQUksRUFBRSxLQUFLO2FBQ1osQ0FBQyxDQUFDO1dBQ0o7QUFDRCxlQUFLLEVBQUUsZUFBUyxLQUFLLEVBQUUsTUFBSyxFQUFFO0FBQzVCLG9CQUFRLENBQUMsTUFBTSxDQUFDO0FBQ2Qsb0JBQU0sRUFBRSxVQUFVO0FBQ2xCLGtCQUFJLEVBQUUsTUFBSzthQUNaLENBQUMsQ0FBQztXQUNKO1NBQ0YsQ0FBQyxDQUFDOzs7O0FBQ0osV0FHSTtBQUNILGtCQUFRLENBQUMsTUFBTSxDQUFDO0FBQ2Qsa0JBQU0sRUFBRSxVQUFVO0FBQ2xCLGVBQUcsRUFBRSx1QkFBdUI7V0FDN0IsQ0FBQyxDQUFBO1NBQ0g7O0FBRUQsYUFBTyxRQUFRLENBQUMsT0FBTyxDQUFDO0tBQ3pCO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLE9BQU8sQ0FBQztDQUNoQixDQUFDLENBQUM7OztBQy9DSCxhQUFhLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFlBQVU7QUFDaEQsTUFBSSxPQUFPLEdBQUcsRUFFYixDQUFDOztBQUVGLFNBQU8sT0FBTyxDQUFDO0NBQ2hCLENBQUMsQ0FBQztBQ05ILFlBQVksQ0FBQzs7QUFFYixhQUFhLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxVQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDeEQsTUFBSSxPQUFPLEdBQUc7QUFDWixlQUFXLEVBQUUscUJBQVMsS0FBSyxFQUFFO0FBQzNCLFdBQUssQ0FBQztBQUNKLGNBQU0sRUFBRSxNQUFNO0FBQ2QsV0FBRyxFQUFFLDJDQUEyQztBQUNoRCxZQUFJLEVBQUUsS0FBSztPQUNaLENBQUMsQ0FBQTtLQUNIO0FBQ0QsaUJBQWEsRUFBRSx1QkFBUyxLQUFLLEVBQUM7O0FBRTVCLFVBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFMUIsVUFDRSxLQUFLLENBQUMsb0JBQW9CLEtBQUssSUFBSSxJQUNuQyxLQUFLLENBQUMsU0FBUyxLQUFLLEVBQUUsSUFDdEIsS0FBSyxDQUFDLFNBQVMsS0FBSyxJQUFJLElBQ3hCLEtBQUssQ0FBQyxLQUFLLEtBQUssY0FBYyxJQUM5QixLQUFLLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFDbEI7QUFDQSxhQUFLLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztBQUN6QixhQUFLLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzs7QUFFdkMsZ0JBQVEsQ0FBQyxPQUFPLENBQUM7QUFDZixnQkFBTSxFQUFFLFNBQVM7QUFDakIsZUFBSyxFQUFHLEtBQUs7U0FDZCxDQUFDLENBQUM7T0FDSixNQUVJLElBQ0gsS0FBSyxDQUFDLFNBQVMsS0FBSyxFQUFFLElBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxJQUFJLElBQ2xELEtBQUssQ0FBQyxLQUFLLEtBQUssRUFBRSxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssY0FBYyxFQUFFO0FBQ3BELGdCQUFRLENBQUMsTUFBTSxDQUFDO0FBQ2QsZ0JBQU0sRUFBRSxPQUFPO0FBQ2YsbUJBQVMsRUFBRSxJQUFJO0FBQ2YsYUFBRyxFQUFFLG1EQUFtRDtTQUN6RCxDQUFDLENBQUM7T0FDTixNQUVJLElBQUcsS0FBSyxDQUFDLG9CQUFvQixLQUFLLEtBQUssRUFBQztBQUMzQyxnQkFBUSxDQUFDLE1BQU0sQ0FBQztBQUNkLGdCQUFNLEVBQUUsT0FBTztBQUNmLG1CQUFTLEVBQUUsSUFBSTtBQUNmLGFBQUcsRUFBRSwrQ0FBK0M7U0FDckQsQ0FBQyxDQUFDO09BQ0osTUFFSSxJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssRUFBRSxJQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFDO0FBQzFELGdCQUFRLENBQUMsTUFBTSxDQUFDO0FBQ2QsZ0JBQU0sRUFBRSxPQUFPO0FBQ2YsbUJBQVMsRUFBRSxJQUFJO0FBQ2YsYUFBRyxFQUFFLDREQUE0RDtTQUNsRSxDQUFDLENBQUM7T0FDSixNQUVJLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxFQUFFLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxjQUFjLEVBQUM7QUFDNUQsZ0JBQVEsQ0FBQyxNQUFNLENBQUM7QUFDZCxnQkFBTSxFQUFFLE9BQU87QUFDZixtQkFBUyxFQUFFLElBQUk7QUFDZixhQUFHLEVBQUUsa0RBQWtEO1NBQ3hELENBQUMsQ0FBQztPQUNKLE1BRUk7QUFDSCxnQkFBUSxDQUFDLE1BQU0sQ0FBQztBQUNkLGdCQUFNLEVBQUUsT0FBTztBQUNmLG1CQUFTLEVBQUUsSUFBSTtBQUNmLGFBQUcsRUFBRSxnQ0FBZ0M7U0FDdEMsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsYUFBTyxRQUFRLENBQUMsT0FBTyxDQUFDO0tBQ3pCOztHQUVGLENBQUM7O0FBRUYsU0FBTyxPQUFPLENBQUM7Q0FDaEIsQ0FBQyxDQUFDO0FDL0VILFlBQVksQ0FBQzs7QUFFYixhQUFhLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxVQUFTLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFDO0FBQ3RFLE1BQUksT0FBTyxHQUFHO0FBQ1osaUJBQWEsRUFBRSx5QkFBVTtBQUN2QixVQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRTFCLFVBQUcsVUFBVSxDQUFDLE9BQU8sS0FBSyxJQUFJLEVBQUM7QUFDN0IsZUFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQixnQkFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2xCLGlCQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO09BQ3hCLE1BQU07QUFDTCxlQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLGdCQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDcEI7O0FBRUQsYUFBTyxRQUFRLENBQUMsT0FBTyxDQUFDO0tBQ3pCO0FBQ0QsYUFBUyxFQUFFLG1CQUFTLFFBQVEsRUFBRSxHQUFHLEVBQUM7QUFDaEMsVUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUxQixXQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUNsQyxVQUFTLElBQUksRUFBQztBQUNaLGtCQUFVLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUMxQixnQkFBUSxDQUFDLE9BQU8sQ0FBQztBQUNmLGdCQUFNLEVBQUUsU0FBUztBQUNqQixjQUFJLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQztBQUNILGtCQUFVLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO09BQ3ZDLEVBQ0QsVUFBUyxHQUFHLEVBQUM7QUFDWCxnQkFBUSxDQUFDLE1BQU0sQ0FBQztBQUNkLGdCQUFNLEVBQUUsT0FBTztBQUNmLGVBQUssRUFBRSxHQUFHO1NBQ1gsQ0FBQyxDQUFBO09BQ0gsQ0FDRixDQUFDOztBQUVGLGFBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQztLQUN6Qjs7QUFFRCxjQUFVLEVBQUUsc0JBQVU7QUFDcEIsVUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzFCLFdBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRXBCLFVBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRWhDLFVBQUcsSUFBSSxLQUFLLElBQUksRUFBQzs7QUFFZixrQkFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDMUIsa0JBQVUsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdkMsZ0JBQVEsQ0FBQyxPQUFPLENBQUM7QUFDZixnQkFBTSxFQUFFLFNBQVM7QUFDakIsYUFBRyxFQUFFLG9CQUFvQjtTQUMxQixDQUFDLENBQUM7T0FDSixNQUFNO0FBQ0wsZ0JBQVEsQ0FBQyxNQUFNLENBQUM7QUFDZCxnQkFBTSxFQUFFLE9BQU87QUFDZixhQUFHLEVBQUUseUJBQXlCO1NBQy9CLENBQUMsQ0FBQztPQUNKOztBQUVELGFBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQztLQUN6Qjs7QUFFRCxVQUFNLEVBQUUsZ0JBQVMsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUM7QUFDcEMsVUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUxQixVQUFJLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM1QixVQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMvQixVQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN6QixVQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFMUIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFDaEIsZUFBTyxFQUFFLGlCQUFTLElBQUksRUFBQztBQUNyQixrQkFBUSxDQUFDLE9BQU8sQ0FBQztBQUNmLGtCQUFNLEVBQUUsU0FBUztBQUNqQixnQkFBSSxFQUFFLElBQUk7V0FDWCxDQUFDLENBQUM7QUFDSCxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7U0FDbkM7QUFDRCxhQUFLLEVBQUUsZUFBUyxJQUFJLEVBQUUsR0FBRyxFQUFDO0FBQ3hCLGlCQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLGtCQUFRLENBQUMsTUFBTSxDQUFDO0FBQ2Qsa0JBQU0sRUFBRSxPQUFPO0FBQ2YsZ0JBQUksRUFBRSxJQUFJO0FBQ1YsaUJBQUssRUFBRSxHQUFHO1dBQ1gsQ0FBQyxDQUFDO1NBQ0o7T0FDRixDQUFDLENBQUM7O0FBRUgsYUFBTyxRQUFRLENBQUMsT0FBTyxDQUFDO0tBQ3pCO0dBQ0YsQ0FBQzs7QUFFRixTQUFPLE9BQU8sQ0FBQztDQUNoQixDQUFDLENBQUM7OztBQ2hHSCxhQUFhLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLFlBQVU7QUFDcEQsU0FBTztBQUNMLGNBQVUsRUFBRSxvQkFBUyxNQUFNLEVBQUM7QUFDMUIsWUFBTSxDQUFDLE9BQU8sR0FBRyxDQUNmO0FBQ0UsaUJBQVMsRUFBRSxvQkFBb0I7QUFDL0IsYUFBSyxFQUFFLGlCQUFpQjtBQUN4QixpQkFBUyxFQUFFLGtEQUFrRDtBQUM3RCxjQUFNLEVBQUUsVUFBVTtPQUNuQixFQUNEO0FBQ0UsaUJBQVMsRUFBRSxvQkFBb0I7QUFDL0IsYUFBSyxFQUFFLFFBQVE7QUFDZixpQkFBUyxFQUFFLDZFQUE2RTtBQUN4RixjQUFNLEVBQUUsVUFBVTtPQUNuQixFQUFDO0FBQ0EsaUJBQVMsRUFBRSxnQkFBZ0I7QUFDM0IsYUFBSyxFQUFFLFNBQVM7QUFDaEIsaUJBQVMsRUFBRSxvREFBb0Q7QUFDL0QsY0FBTSxFQUFFLFVBQVU7T0FDbkIsQ0FDRixDQUFBO0tBQ0Y7QUFDRCxZQUFRLEVBQUUsR0FBRztHQUNkLENBQUE7Q0FDRixDQUFDLENBQUM7OztBQ3pCSCxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxZQUFVO0FBQzVDLFNBQU87QUFDTCxjQUFVLEVBQUUsb0JBQVMsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBQzs7OztBQUluRSxZQUFNLENBQUMsSUFBSSxHQUFHO0FBQ1osY0FBTSxFQUFFLENBQ04sY0FBYyxFQUNkLFFBQVEsRUFDUixXQUFXLEVBQ1gsVUFBVSxFQUNWLFFBQVEsRUFDUixPQUFPLEVBQ1AsT0FBTyxFQUNQLFNBQVMsRUFDVCxZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUNULFdBQVcsRUFDWCxXQUFXLEVBQ1gsU0FBUyxFQUNULGlCQUFpQixFQUNqQixRQUFRLEVBQ1IsaUJBQWlCLEVBQ2pCLFVBQVUsRUFDVixTQUFTLENBQ1Y7QUFDRCxrQkFBVSxFQUFFLGNBQWM7QUFDMUIsaUJBQVMsRUFBRSxJQUFJO0FBQ2Ysa0JBQVUsRUFBRSxLQUFLO09BQ2xCOzs7QUFBQSxBQUdELFlBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSTs7OztBQUFDLEFBSXBCLFlBQU0sQ0FBQyxjQUFjLEdBQUcsSUFBSTs7OztBQUFDLEFBSTdCLFlBQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQztBQUN4QyxXQUFHLEVBQUUsa0NBQWtDOztBQUV2QyxjQUFNLEVBQUUsTUFBTTtBQUNkLGFBQUssRUFBRSxlQUFTLE1BQUssRUFBRTtBQUNyQixnQkFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFLLENBQUMsQ0FBQztTQUM5QjtPQUNGLENBQUM7OztBQUFDLEFBR0gsWUFBTSxDQUFDLFdBQVcsR0FBRyxVQUFTLEVBQUUsRUFBQzs7O0FBRy9CLGNBQU0sQ0FBQyxLQUFLLEdBQUc7QUFDYixlQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVO0FBQzdCLG1CQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTO0FBQ2hDLDhCQUFvQixFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVTtTQUM3QyxDQUFDOztBQUVGLG9CQUFZLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDckMsSUFBSSxDQUNILFVBQVMsSUFBSSxFQUFFO0FBQ2IseUJBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QixFQUNELFVBQVMsR0FBRyxFQUFFO0FBQ1osa0JBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNmLENBQ0YsQ0FDQSxJQUFJLENBQUMsWUFBVTtBQUNkLGdCQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztTQUM5QixDQUFDLENBQUM7O0FBRUwsVUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDO09BQ3JCLENBQUM7O0FBRUYsZUFBUyxlQUFlLENBQUMsSUFBSSxFQUFDO0FBQzVCLGNBQU0sQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBQzNCLGNBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUs7O0FBQUMsT0FFM0I7O0FBRUQsZUFBUyxRQUFRLENBQUMsR0FBRyxFQUFDO0FBQ3BCLGNBQU0sQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztBQUNoQyxlQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ2xCOztBQUVELGVBQVMsbUJBQW1CLEdBQUU7QUFDNUIsY0FBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDbEIsY0FBSSxFQUFFLGdCQUFnQjtBQUN0QixxQkFBVyxFQUFFLGtCQUFrQjtBQUMvQixnQkFBTSxFQUFFLEdBQUc7U0FDWixDQUFDLENBQUM7T0FDSjs7QUFFRCxlQUFTLGNBQWMsQ0FBQyxLQUFLLEVBQUM7QUFDNUIsWUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRTs7O0FBQUMsQUFHMUIsY0FBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzNCLGNBQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FFbkMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXZDLGVBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQztPQUN6QixDQUFDO0tBQ0g7QUFDRCxRQUFJLEVBQUUsY0FBUyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBQztBQUM5QixRQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBVTtBQUN0QyxZQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLGVBQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7T0FDdkMsQ0FBQyxDQUFDO0tBQ0o7QUFDRCxZQUFRLEVBQUUsR0FBRztBQUNiLGVBQVcsRUFBRSxvQ0FBb0M7R0FDbEQsQ0FBQTtDQUNGLENBQUMsQ0FBQzs7O0FDdkhILGFBQWEsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLFVBQVMsWUFBWSxFQUFDO0FBQzdELFNBQU87QUFDTCxjQUFVLEVBQUUsb0JBQVMsTUFBTSxFQUFDO0FBQzFCLFlBQU0sQ0FBQyxJQUFJLEdBQUc7QUFDWixZQUFJLEVBQUUsSUFBSTtBQUNWLGFBQUssRUFBRSxJQUFJO0FBQ1gsa0JBQVUsRUFBRSxTQUFTO0FBQ3JCLGVBQU8sRUFBRSxJQUFJO0FBQ2IsZ0JBQVEsRUFBRSxDQUNSLFNBQVMsRUFDVCxTQUFTLEVBQ1QsT0FBTyxFQUNQLFNBQVMsQ0FDVjs7T0FFRixDQUFBOztBQUVELFVBQUksV0FBVyxHQUFHLFNBQWQsV0FBVyxHQUFhO0FBQzFCLGNBQU0sQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLGNBQU0sQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO09BQzNCLENBQUM7O0FBRUYsVUFBSSxXQUFXLEdBQUcsU0FBZCxXQUFXLEdBQWE7QUFDMUIsY0FBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLGNBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUN6QixjQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDM0IsY0FBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO09BQ3BDLENBQUM7O0FBRUYsWUFBTSxDQUFDLGlCQUFpQixHQUFHLFlBQVU7QUFDbkMsbUJBQVcsRUFBRSxDQUFDOztBQUVkLG9CQUFZLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQzFDLElBQUksQ0FDSCxVQUFTLElBQUksRUFBQztBQUNaLG1CQUFTO0FBQ1QsY0FDRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLElBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksSUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRSxJQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLElBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLEVBQUUsSUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxFQUFFLElBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLElBQUksRUFDN0I7QUFDQyxrQkFBTSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7QUFDbkMsa0JBQU0sQ0FBQyxTQUFTLEdBQUcsK0NBQStDLENBQUM7V0FDcEUsTUFDSTtBQUNILHdCQUFZLENBQ1Qsb0JBQW9CLENBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUNwQixDQUNBLElBQUksQ0FDSCxVQUFTLElBQUksRUFBQztBQUNaLHlCQUFXLEVBQUUsQ0FBQztBQUNkLHlCQUFXLEVBQUUsQ0FBQztBQUNkLG9CQUFNLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztBQUNwQyxvQkFBTSxDQUFDLFdBQVcsR0FBRywyQ0FBMkM7O0FBQUMsYUFFbEUsRUFDRCxVQUFTLEdBQUcsRUFBQztBQUNYLG9CQUFNLENBQUMsU0FBUyxHQUFHLG1EQUFtRCxDQUFDO0FBQ3ZFLG9CQUFNLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQzthQUNwQyxDQUNGLENBQUE7V0FDSjtTQUNGLEVBQ0QsVUFBUyxHQUFHLEVBQUM7QUFDWCxnQkFBTSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7QUFDbkMsZ0JBQU0sQ0FBQyxTQUFTLEdBQUcscUNBQXFDLENBQUM7U0FDMUQsQ0FDRixDQUFDO09BQ0wsQ0FBQztLQUNIO0FBQ0QsWUFBUSxFQUFFLEdBQUc7QUFDYixlQUFXLEVBQUUsaURBQWlEO0dBQy9ELENBQUE7Q0FDRixDQUFDLENBQUM7OztBQ2xGSCxhQUFhLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxZQUFVO0FBQ3pDLFNBQU87QUFDTCxjQUFVLEVBQUUsb0JBQVMsTUFBTSxFQUFFLFdBQVcsRUFBQztBQUN2QyxZQUFNLENBQUMsU0FBUyxHQUFHLFlBQVU7QUFDM0IsWUFBSSxJQUFJLEVBQUUsR0FBRyxDQUFDOztBQUVkLFlBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzdFLFdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUV2RSxtQkFBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQzdCLElBQUksQ0FDSCxVQUFTLElBQUksRUFBQztBQUNaLGlCQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ25CLEVBQ0QsVUFBUyxHQUFHLEVBQUM7QUFDWCxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNsQixDQUNGLENBQUM7T0FDTCxDQUFDOztBQUdGLFlBQU0sQ0FBQyxVQUFVLEdBQUcsWUFBVTtBQUM1QixtQkFBVyxDQUFDLFVBQVUsRUFBRSxDQUNyQixJQUFJLENBQ0gsVUFBUyxJQUFJLEVBQUM7QUFDWixpQkFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNuQixFQUNELFVBQVMsR0FBRyxFQUFDO0FBQ1gsaUJBQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbEIsQ0FDRixDQUFDO09BQ0wsQ0FBQTtLQUNGO0FBQ0QsWUFBUSxFQUFFLEdBQUc7QUFDYixlQUFXLEVBQUUsNkJBQTZCO0dBQzNDLENBQUE7Q0FDRixDQUFDLENBQUM7OztBQ3BDSCxhQUFhLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxVQUFTLFVBQVUsRUFBRSxNQUFNLEVBQUM7QUFDaEUsU0FBTztBQUNMLGNBQVUsRUFBRSxvQkFBUyxNQUFNLEVBQUUsV0FBVyxFQUFDO0FBQ3ZDLFlBQU0sQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV4QixZQUFNLENBQUMsZ0JBQWdCLEdBQUcsWUFBVTtBQUNsQyxjQUFNLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztPQUN6QixDQUFBOztBQUVELFlBQU0sQ0FBQyxlQUFlLEdBQUcsWUFBVTtBQUNqQyxjQUFNLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztPQUNqQyxDQUFBOztBQUVELFlBQU0sQ0FBQyxZQUFZLEdBQUcsY0FBYyxDQUFDO0FBQ3JDLFlBQU0sQ0FBQyxTQUFTLEdBQUcsWUFBVTtBQUFDLGNBQU0sQ0FBQyxZQUFZLEdBQUcsY0FBYyxDQUFBO09BQUMsQ0FBQztBQUNwRSxZQUFNLENBQUMsU0FBUyxHQUFHLFlBQVU7QUFBQyxjQUFNLENBQUMsWUFBWSxHQUFHLGFBQWEsQ0FBQTtPQUFDLENBQUM7O0FBRW5FLFlBQU0sQ0FBQyxVQUFVLEdBQUcsWUFBVTtBQUM1QixZQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDOzs7QUFBQyxBQUc5QixhQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7OztBQUFDLEFBRzVCLGNBQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO09BQzNCLENBQUE7O0FBRUQsWUFBTSxDQUFDLFNBQVMsR0FBRyxZQUFVO0FBQzNCLFlBQUksSUFBSSxFQUFFLEdBQUcsQ0FBQztBQUNkLFlBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFOUIsWUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDeEUsV0FBRyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7O0FBRXZFLG1CQUFXLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQ25DLFVBQVMsSUFBSSxFQUFDO0FBQ1osV0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxnQkFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDMUIsZ0JBQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNwQixnQkFBTSxDQUFDLFNBQVMsRUFBRTs7Ozs7QUFBQyxBQUtuQixjQUFHLFVBQVUsQ0FBQyxXQUFXLEtBQUssSUFBSSxFQUFDO0FBQ2pDLGtCQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQyxzQkFBVSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7V0FDL0I7U0FDRixFQUNELFVBQVMsR0FBRyxFQUFDO0FBQ1gsZ0JBQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUN6QixnQkFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ3BCLENBQ0YsQ0FBQztPQUNILENBQUE7S0FHRjtBQUNELFlBQVEsRUFBRSxHQUFHO0FBQ2IsZUFBVyxFQUFFLHlDQUF5QztHQUN2RCxDQUFBO0NBQ0YsQ0FBQyxDQUFBO0FDN0RGLFlBQVksQ0FBQzs7QUFFYixhQUFhLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxZQUFVO0FBQzFDLFNBQU87QUFDTCxjQUFVLEVBQUUsb0JBQVMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUM7Ozs7OztBQU1uRixZQUFNLENBQUMsYUFBYSxHQUFHLFlBQVU7QUFDL0IsWUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFN0Usb0JBQVksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQzlCLElBQUksQ0FDSCxVQUFTLElBQUksRUFBQztBQUNaLGdCQUFNLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztTQUN4QixFQUNELFVBQVMsR0FBRyxFQUFDO0FBQ1gsZ0JBQU0sQ0FBQyxjQUFjLEdBQUcscUNBQXFDLENBQUM7QUFDOUQsZ0JBQU0sQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO1NBQ2xDLENBQ0YsQ0FBQztPQUNMLENBQUE7O0FBRUQsWUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFVO0FBQzVCLFlBQUksUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDO0FBQ3JDLFlBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFbkIsZ0JBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQy9FLGFBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3pFLFdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzFFLGtCQUFVLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUU7OztBQUFDLEFBR3pGLFlBQUcsUUFBUSxLQUFLLEVBQUUsSUFBSSxLQUFLLEtBQUssRUFBRSxJQUFJLEdBQUcsS0FBSyxFQUFFLEVBQUM7QUFDL0MsZ0JBQU0sQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0FBQ25DLG1CQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3ZCLE1BQU07QUFDTCxnQkFBTSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7U0FDMUI7O0FBRUQsWUFBSSxHQUFHLEtBQUssVUFBVSxFQUFDO0FBQ3JCLGdCQUFNLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztBQUNwQyxtQkFBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN2QixNQUFNO0FBQ0wsZ0JBQU0sQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1NBQzNCOztBQUVELFlBQUcsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUM7QUFDeEIscUJBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FDckMsSUFBSSxDQUNILFVBQVMsSUFBSSxFQUFDO0FBQ1osc0JBQVUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDdEMsa0JBQU0sQ0FBQyxhQUFhLEdBQUcsWUFBWTs7O0FBQUMsQUFHcEMsdUJBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUNqQyxJQUFJLENBQ0gsVUFBUyxJQUFJLEVBQUM7QUFDWixzQkFBUSxDQUFDLFlBQVU7QUFDakIsc0JBQU0sQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUM7ZUFDM0IsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUNULEVBQ0QsVUFBUyxHQUFHLEVBQUM7QUFDWCxxQkFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNsQixDQUNGLENBQUM7V0FDTCxFQUNELFVBQVMsR0FBRyxFQUFDO0FBQ1gsb0JBQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJO0FBQ25CLG1CQUFLLENBQUMsQ0FBQztBQUNMLHNCQUFNLENBQUMsaUJBQWlCLEdBQUcsOEJBQThCLENBQUE7QUFDekQsc0JBQU0sQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO0FBQ3BDLHNCQUFNOztBQUFBLEFBRVIsbUJBQUssR0FBRztBQUNOLHNCQUFNLENBQUMsaUJBQWlCLEdBQUcsd0NBQXdDLENBQUE7QUFDbkUsc0JBQU0sQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO0FBQ3BDLHNCQUFNOztBQUFBLEFBRVIsbUJBQUssR0FBRztBQUNOLHNCQUFNLENBQUMsY0FBYyxHQUFHLHlDQUF5QyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7QUFDaEYsc0JBQU0sQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDOztBQUFBLEFBRW5DO0FBQ0UsdUJBQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUFBLGFBQ2pDO1dBQ0YsQ0FDSixDQUFDO1NBQ0g7T0FDRixDQUFBO0tBQ0Y7QUFDRCxZQUFRLEVBQUUsR0FBRztBQUNiLGVBQVcsRUFBRSwrQkFBK0I7R0FDN0MsQ0FBQTtDQUNGLENBQUMsQ0FBQzs7O0FDaEdILGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLFlBQVU7QUFDL0MsU0FBTztBQUNMLGNBQVUsRUFBRSxvQkFBUyxNQUFNLEVBQUUsV0FBVyxFQUFDOztBQUV2QyxZQUFNLENBQUMsT0FBTyxHQUFHLENBQ2Y7QUFDRSxpQkFBUyxFQUFFLG9CQUFvQjtBQUMvQixhQUFLLEVBQUUsaUJBQWlCO0FBQ3hCLGlCQUFTLEVBQUUsa0RBQWtEO0FBQzdELGNBQU0sRUFBRSxVQUFVO09BQ25CLEVBQ0Q7QUFDRSxpQkFBUyxFQUFFLG9CQUFvQjtBQUMvQixhQUFLLEVBQUUsUUFBUTtBQUNmLGlCQUFTLEVBQUUsNkVBQTZFO0FBQ3hGLGNBQU0sRUFBRSxVQUFVO09BQ25CLEVBQUM7QUFDQSxpQkFBUyxFQUFFLGdCQUFnQjtBQUMzQixhQUFLLEVBQUUsU0FBUztBQUNoQixpQkFBUyxFQUFFLG9EQUFvRDtBQUMvRCxjQUFNLEVBQUUsVUFBVTtPQUNuQixDQUNGLENBQUE7S0FDRjtBQUNELFlBQVEsRUFBRSxHQUFHO0FBQ2IsZUFBVyxFQUFFLDJDQUEyQztHQUN6RCxDQUFBO0NBQ0YsQ0FBQyxDQUFDOzs7QUMzQkgsYUFBYSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsVUFBUyxNQUFNLEVBQUM7QUFDbkQsU0FBTztBQUNMLGNBQVUsRUFBRSxvQkFBUyxNQUFNLEVBQUUsV0FBVyxFQUFDO0FBQ3ZDLFlBQU0sQ0FBQyxnQkFBZ0IsR0FBRyxhQUFhLENBQUM7QUFDeEMsWUFBTSxDQUFDLGdCQUFnQixHQUFHLFlBQVksQ0FBQzs7QUFFdkMsWUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFVO0FBQzVCLGNBQU0sQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLEtBQUssYUFBYSxHQUFHLFdBQVcsR0FBRyxhQUFhLENBQUM7T0FDbkcsQ0FBQzs7QUFFRixZQUFNLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxZQUFVO0FBQ25DLGNBQU0sQ0FBQyxnQkFBZ0IsR0FBRyxhQUFhLENBQUM7T0FDekMsQ0FBQyxDQUFDOztBQUdILFlBQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFlBQVU7QUFDcEMsY0FBTSxDQUFDLGdCQUFnQixHQUFHLFlBQVksQ0FBQztPQUN4QyxDQUFDLENBQUM7O0FBRUgsWUFBTSxDQUFDLFVBQVUsR0FBRyxZQUFVO0FBQzVCLG1CQUFXLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUMzQixVQUFTLElBQUksRUFBQztBQUNaLGlCQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xCLGdCQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3BCLEVBQ0QsVUFBUyxHQUFHLEVBQUM7QUFDWCxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNsQixDQUNGLENBQUM7T0FDSCxDQUFBOztBQUVELFlBQU0sQ0FBQyxjQUFjLEdBQUcsWUFBVTtBQUNoQyxTQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ2pDLENBQUE7S0FDRjtBQUNELFFBQUksRUFBRSxjQUFTLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFDO0FBQzlCLE9BQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFVO0FBQzlDLGFBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztPQUNwQixDQUFDLENBQUM7S0FDSjtBQUNELFlBQVEsRUFBRSxHQUFHO0FBQ2IsZUFBVyxFQUFFLHlCQUF5QjtHQUN2QyxDQUFBO0NBQ0YsQ0FBQyxDQUFDIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxucmVxdWlyZSgnYW5ndWxhcicpO1xucmVxdWlyZSgnYW5ndWxhci11aS1yb3V0ZXInKTtcbmNvbnN0IFBhcnNlID0gcmVxdWlyZSgncGFyc2UnKTtcblxuY29uc3QgY29udHJvbGxlckFycmF5ID0gW1xuICBcInVpLnJvdXRlclwiXG5dO1xuXG5sZXQgbW92aWVQaXRjaEFwcCA9IGFuZ3VsYXIubW9kdWxlKFwibW92aWVQaXRjaEFwcFwiLCBjb250cm9sbGVyQXJyYXkpXG4gIC5jb25maWcoW1wiJHN0YXRlUHJvdmlkZXJcIiwgXCIkdXJsUm91dGVyUHJvdmlkZXJcIixcbiAgICBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcblxuICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgICAvLyBNYWluIE5hdlxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdpbmRleCcsIHtcbiAgICAgICAgICB1cmw6IFwiL1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2hvbWUuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgICAgICAgdXJsOiBcIi9hZG1pblwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2FkbWluLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAvLyBBY2NvdW50XG4gICAgICAvLyAkc3RhdGVQcm92aWRlclxuICAgICAgLy8gICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgLy8gICAgIHVybDogXCIvcmVnaXN0ZXJcIixcbiAgICAgIC8vICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9yZWdpc3Rlci5odG1sXCIsXG4gICAgICAvLyAgICAgZGF0YToge1xuICAgICAgLy8gICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfSlcbiAgICAgIC8vICAgLnN0YXRlKCdteS1hY2NvdW50Jywge1xuICAgICAgLy8gICAgIHVybDogXCIvbXktYWNjb3VudFwiLFxuICAgICAgLy8gICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL215LWFjY291bnQuaHRtbFwiLFxuICAgICAgLy8gICAgIGRhdGE6IHtcbiAgICAgIC8vICAgICAgIHJlcXVpcmVMb2dpbjogdHJ1ZVxuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfSk7XG5cblxuICAgICAgLy8gRm9vdGVyIE5hdlxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdmYXEnLCB7XG4gICAgICAgICAgdXJsOiBcIi9mYXFcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9mYXEuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgncHJlc3MnLCB7XG4gICAgICAgICAgdXJsOiBcIi9wcmVzc1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3ByZXNzLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2NvbnRhY3QtdXMnLCB7XG4gICAgICAgICAgdXJsOiBcIi9jb250YWN0LXVzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvY29udGFjdC11cy5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdsZWdhbCcsIHtcbiAgICAgICAgICB1cmw6IFwiL2xlZ2FsXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbGVnYWwuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuICBdKVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpe1xuICAgIFBhcnNlLmluaXRpYWxpemUoXCJQUjlXQkhFdmpTdVc5dXM4UTdTR2gyS1lSVlFhSExienRaanNoc2IxXCIsIFwibnl6N045c0dMVUlOMWhqTVk5Tk5RbmVFeHhQNVcwTUpoWEgzdTFRaFwiKTtcblxuICAgIC8vIE1ha2Ugc3VyZSBhIHVzZXIgaXMgbG9nZ2VkIG91dFxuICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSl7XG4gICAgICBsZXQgcmVxdWlyZUxvZ2luID0gdG9TdGF0ZS5kYXRhLnJlcXVpcmVMb2dpbjtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHRvU3RhdGUpO1xuXG4gICAgICBpZihyZXF1aXJlTG9naW4gPT09IHRydWUgJiYgJHJvb3RTY29wZS5jdXJVc2VyID09PSBudWxsKXtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgJHJvb3RTY29wZS50YXJnZXRTdGF0ZSA9IHRvU3RhdGUubmFtZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG4gIH0pO1xuIiwibW92aWVQaXRjaEFwcC5jb250cm9sbGVyKCdNYWluQ3RybCcsIFsnJHNjb3BlJyxcbiAgZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAvLyAkc2NvcGUuJG9uKCdsb2dpbi10cnVlJywgZnVuY3Rpb24oKXtcbiAgICAvLyAgICRzY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAvLyB9KVxuICB9XG5dKVxuIiwibW92aWVQaXRjaEFwcC5mYWN0b3J5KCdlbWFpbEZhY3RvcnknLCBmdW5jdGlvbigkcSl7XG4gIGxldCBzZW5kZ3JpZCA9IHJlcXVpcmUoJ3NlbmRncmlkJykoJ1NHLjJDU3F4OTlqUTItVXdVZjhCaVVVT1EuS2VLRWN2QTVxbldDQVdqSENyOEkwVEtoODhKQkY4TEtCcUh3TkhLRWw5bycpO1xuXG4gIGxldCBmYWN0b3J5ID0ge1xuXG4gICAgLy8gTW9jayB1cCBzZW5kaW5nIGEgY29udGFjdCBlbWFpbFxuICAgIC8vIGh0dHBzOi8vbm9kZW1haWxlci5jb20vXG4gICAgc2VuZENvbnRhY3RVc01lc3NhZ2U6IGZ1bmN0aW9uKG5hbWUsIGVtYWlsLCBzdWJqZWN0LCBtc2cpe1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgc3ViamVjdDogc3ViamVjdCxcbiAgICAgICAgbWVzc2FnZTogbXNnXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlRW1haWw6IGZ1bmN0aW9uKGVtYWlsKSB7XG4gICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBsZXQgcmVnID0gL14oW2EtekEtWjAtOV9cXC5cXC1dKStcXEAoKFthLXpBLVowLTlcXC1dKStcXC4pKyhbYS16QS1aMC05XXsyLDR9KSskLztcblxuICAgICAgaWYocmVnLnRlc3QoZW1haWwpKXtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGFyc2VGYWN0b3J5JywgZnVuY3Rpb24oJHEpIHtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgc3VibWl0UGl0Y2g6IGZ1bmN0aW9uKGdlbnJlLCB0ZXh0KSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIHVzZXIgaXMgbG9nZ2VkIGluIHRvIHN0b3JlIHRoZSBwaXRjaFxuICAgICAgaWYgKCRyb290U2NvcGUuY3VyVXNlciAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgUGl0Y2ggPSBQYXJzZS5PYmplY3QuZXh0ZW5kKFwiUGl0Y2hcIik7XG4gICAgICAgIHZhciBwaXRjaCA9IG5ldyBQaXRjaCgpO1xuXG4gICAgICAgIHBpdGNoLnNldChcImdlbnJlXCIsIGdlbnJlKTtcbiAgICAgICAgcGl0Y2guc2V0KFwicGl0Y2hcIiwgdGV4dCk7XG4gICAgICAgIC8vIHBpdGNoLnNldChcImNyZWF0ZXJcIiwgUGFyc2UuVXNlci5jdXJyZW50LnVzZXJuYW1lKVxuICAgICAgICBwaXRjaC5zZXQoXCJyZXZpZXdlZFwiLCBmYWxzZSlcblxuXG4gICAgICAgIHBpdGNoLnNhdmUobnVsbCwge1xuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHBpdGNoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgICAgZGF0YTogcGl0Y2hcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHBpdGNoLCBlcnJvcikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCIsXG4gICAgICAgICAgICAgIGRhdGE6IGVycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWplY3QgdGhlIHNhdmUgYXR0ZW1wdCBpZiBubyBjdXJyZW50IHVzZXJcbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIG5vdCBsb2dnZWQgaW5cIlxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGF5bWVudEZhY3RvcnknLCBmdW5jdGlvbigpe1xuICB2YXIgZmFjdG9yeSA9IHtcblxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5mYWN0b3J5KCdwaXRjaEZhY3RvcnknLCBmdW5jdGlvbigkcSwgJGh0dHApIHtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgc3VibWl0UGl0Y2g6IGZ1bmN0aW9uKHBpdGNoKSB7XG4gICAgICAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIHVybDogXCJodHRwczovL21vdmllcGl0Y2hhcGkuaGVyb2t1YXBwLmNvbS9waXRjaFwiLFxuICAgICAgICBkYXRhOiBwaXRjaFxuICAgICAgfSlcbiAgICB9LFxuICAgIHZhbGlkYXRlUGl0Y2g6IGZ1bmN0aW9uKHBpdGNoKXtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHBpdGNoKTtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmKFxuICAgICAgICBwaXRjaC51c2VySGFzQWNjZXB0ZWRUZXJtcyA9PT0gdHJ1ZSAmJlxuICAgICAgICBwaXRjaC5waXRjaFRleHQgIT09IFwiXCIgJiZcbiAgICAgICAgcGl0Y2gucGl0Y2hUZXh0ICE9PSBudWxsICYmXG4gICAgICAgIHBpdGNoLmdlbnJlICE9PSBcIlNlbGVjdCBHZW5yZVwiICYmXG4gICAgICAgIHBpdGNoLmdlbnJlICE9PSBcIlwiXG4gICAgICApIHtcbiAgICAgICAgcGl0Y2guc3RhdHVzID0gXCJjcmVhdGVkXCI7XG4gICAgICAgIHBpdGNoLnVzZXJIYXNBY2NlcHRlZFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgcGl0Y2ggOiBwaXRjaFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZWxzZSBpZiAoXG4gICAgICAgIHBpdGNoLnBpdGNoVGV4dCA9PT0gXCJcIiB8fCBwaXRjaC5waXRjaFRleHQgPT09IG51bGwgJiZcbiAgICAgICAgcGl0Y2guZ2VucmUgPT09IFwiXCIgfHwgcGl0Y2guZ2VucmUgPT09IFwiU2VsZWN0IEdlbnJlXCIpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICBlcnJvckNvZGU6IDEwMDAsXG4gICAgICAgICAgICBtc2c6IFwiUGxlYXNlIGZpbGwgb3V0IHRoZSBwaXRjaCBmb3JtIGJlZm9yZSBzdWJtaXR0aW5nLlwiXG4gICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGVsc2UgaWYocGl0Y2gudXNlckhhc0FjY2VwdGVkVGVybXMgPT09IGZhbHNlKXtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBlcnJvckNvZGU6IDEwMDEsXG4gICAgICAgICAgbXNnOiBcIlBsZWFzZSBhY2NlcHQgdGhlIHRlcm1zIGluIG9yZGVyIHRvIGNvbnRpbnVlLlwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBlbHNlIGlmIChwaXRjaC5waXRjaFRleHQgPT09IFwiXCIgfHwgcGl0Y2gucGl0Y2hUZXh0ID09PSBudWxsKXtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBlcnJvckNvZGU6IDEwMDIsXG4gICAgICAgICAgbXNnOiBcIlJvYmVydCBpcyBnb29kLCBidXQgbm90IGdvb2QgZW5vdWdoIHRvIHNlbGwgYSBibGFuayBwaXRjaCFcIlxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZWxzZSBpZiAocGl0Y2guZ2VucmUgPT09IFwiXCIgfHwgcGl0Y2guZ2VucmUgPT09IFwiU2VsZWN0IEdlbnJlXCIpe1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIGVycm9yQ29kZTogMTAwMyxcbiAgICAgICAgICBtc2c6IFwiV2hhdCBraW5kIG9mIG1vdmllIGlzIGl0PyBQbGVhc2Ugc2VsZWN0IGEgZ2VucmUuXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIGVycm9yQ29kZTogOTk5OSxcbiAgICAgICAgICBtc2c6IFwiQW4gdW5rbm93biBlcnJvciBoYXMgb2NjdXJyZWQuXCIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgndXNlckZhY3RvcnknLCBmdW5jdGlvbigkcSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgY2hlY2tMb2dnZWRJbjogZnVuY3Rpb24oKXtcbiAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmKCRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcxJyk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAkbG9jYXRpb24udXJsKCcvbG9naW4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJzInKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIGxvZ2luVXNlcjogZnVuY3Rpb24odXNlcm5hbWUsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwd2QpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IHVzZXI7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YTogdXNlclxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICBsb2dvdXRVc2VyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAgIHZhciB1c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbiAgICAgIGlmKHVzZXIgPT09IG51bGwpe1xuICAgICAgICAvLyBSZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgJHJvb3RTY29wZVxuICAgICAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ291dC11cGRhdGUnKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBsb2dnZWQgb3V0XCJcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIHN0aWxsIGxvZ2dlZCBpblwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgc2lnblVwOiBmdW5jdGlvbih1c2VybmFtZSwgZW1haWwsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICB2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgICB1c2VyLnNldChcInVzZXJuYW1lXCIsIHVzZXJuYW1lKTtcbiAgICAgIHVzZXIuc2V0KFwiZW1haWxcIiwgZW1haWwpO1xuICAgICAgdXNlci5zZXQoXCJwYXNzd29yZFwiLCBwd2QpO1xuXG4gICAgICB1c2VyLnNpZ25VcChudWxsLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIGRhdGE6IHVzZXJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnIpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgICAgIGVycm9yOiBlcnJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FkbWluUGl0Y2hSZXZpZXcnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAkc2NvcGUucGl0Y2hlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJOb3ZlbWJlciAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJSb21hbnRpYyBDb21lZHlcIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiQSBtYW4gZmFsbHMgaW4gbG92ZSB3aXRoIGEgbGFkeSwgYnV0IGl0J3MgZnVubnkuXCIsXG4gICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJPY3RvYmVyIDIzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJIb3Jyb3JcIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiQSB3b21hbiBrZWVwcyBjaGVja2luZyBoZXIgZnJpZGdlLCBidXQgdGhlcmUncyBuZXZlciBhbnl0aGluZyB3b3J0aCBlYXRpbmcuXCIsXG4gICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCJcbiAgICAgICAgfSx7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIkp1bmUgM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiV2VzdGVyblwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJTb21lIGNvd2JveXMgcmlkZSBhcm91bmQgY2hhc2luZyBhIGdhbmcgb2YgdGhpZXZlc1wiLFxuICAgICAgICAgIHN0YXR1czogXCJhY2NlcHRlZFwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdwaXRjaEJveCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkcSwgJGh0dHAsIHBheW1lbnRGYWN0b3J5LCBwaXRjaEZhY3Rvcnkpe1xuXG4gICAgICAvLyBQb3B1bGF0ZSBhbiBhcnJheSBvZiBnZW5yZXMsIGFuZCBjcmVhdGUgc29tZSB2YXJpYWJsZXNcbiAgICAgIC8vIGZvciB0aGUgbmctbW9kZWxzIHRvIGJpbmQgdG9cbiAgICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICBnZW5yZXM6IFtcbiAgICAgICAgICBcIlNlbGVjdCBHZW5yZVwiLFxuICAgICAgICAgIFwiQWN0aW9uXCIsXG4gICAgICAgICAgXCJBZHZlbnR1cmVcIixcbiAgICAgICAgICBcIkFuaW1hdGVkXCIsXG4gICAgICAgICAgXCJDb21lZHlcIixcbiAgICAgICAgICBcIkNyaW1lXCIsXG4gICAgICAgICAgXCJEcmFtYVwiLFxuICAgICAgICAgIFwiRmFudGFzeVwiLFxuICAgICAgICAgIFwiSGlzdG9yaWNhbFwiLFxuICAgICAgICAgIFwiSGlzdG9yaWNhbCBGaWN0aW9uXCIsXG4gICAgICAgICAgXCJIb3Jyb3JcIixcbiAgICAgICAgICBcIktpZHNcIixcbiAgICAgICAgICBcIk15c3RlcnlcIixcbiAgICAgICAgICBcIlBvbGl0aWNhbFwiLFxuICAgICAgICAgIFwiUmVsaWdpb3VzXCIsXG4gICAgICAgICAgXCJSb21hbmNlXCIsXG4gICAgICAgICAgXCJSb21hbnRpYyBDb21lZHlcIixcbiAgICAgICAgICBcIlNhdGlyZVwiLFxuICAgICAgICAgIFwiU2NpZW5jZSBGaWN0aW9uXCIsXG4gICAgICAgICAgXCJUaHJpbGxlclwiLFxuICAgICAgICAgIFwiV2VzdGVyblwiXG4gICAgICAgIF0sXG4gICAgICAgIHBpdGNoR2VucmU6IFwiU2VsZWN0IEdlbnJlXCIsXG4gICAgICAgIHBpdGNoVGV4dDogbnVsbCxcbiAgICAgICAgdGVybXNBZ3JlZTogZmFsc2VcbiAgICAgIH1cblxuICAgICAgLy8gQ2FydmUgb3V0IGEgcGxhY2UgZm9yIHN0b3JpbmcgYSBzdWJtaXR0ZWQgcGl0Y2hcbiAgICAgICRzY29wZS5waXRjaCA9IG51bGw7XG5cbiAgICAgIC8vIFNldCB0aGlzIHByb3BlcnR5IHRvIGNvbmZpZ3VyZSBhbGVydCBtZXNzYWdlcyBkaXNwbGF5ZWRcbiAgICAgIC8vIG9uIHZhbGlkYXRpb24gZmFpbHVyZXNcbiAgICAgICRzY29wZS52YWxpZGF0aW9uVGV4dCA9IG51bGw7XG5cbiAgICAgIC8vIFRoZSBIYW5kbGVyIGhhcyBzb21lIGJhc2ljIFN0cmlwZSBjb25maWcgYW5kIHRoZW4gY2FsbHMgdGhlIHBheW1lbnRcbiAgICAgIC8vIHN1Y2Nlc3MgZnVuY3Rpb25cbiAgICAgICRzY29wZS5oYW5kbGVyID0gU3RyaXBlQ2hlY2tvdXQuY29uZmlndXJlKHtcbiAgICAgICAga2V5OiAncGtfdGVzdF9YSGtodDBHTUxRUHJuMnNZQ1hTRnk0RnMnLFxuICAgICAgICAvLyBpbWFnZTogJy9pbWcvZG9jdW1lbnRhdGlvbi9jaGVja291dC9tYXJrZXRwbGFjZS5wbmcnLFxuICAgICAgICBsb2NhbGU6ICdhdXRvJyxcbiAgICAgICAgdG9rZW46IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgICAgJHNjb3BlLnBheW1lbnRTdWNjZXNzKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFJ1biB0aGUgaGFuZGxlciB3aGVuIHNvbWVvbmUgY2xpY2tzICdzdWJtaXQnXG4gICAgICAkc2NvcGUuc3VibWl0UGl0Y2ggPSBmdW5jdGlvbihldil7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgcGl0Y2ggb2JqZWN0IGZvciB2YWxpZGF0aW9uXG4gICAgICAgICRzY29wZS5waXRjaCA9IHtcbiAgICAgICAgICBnZW5yZTogJHNjb3BlLmRhdGEucGl0Y2hHZW5yZSxcbiAgICAgICAgICBwaXRjaFRleHQ6ICRzY29wZS5kYXRhLnBpdGNoVGV4dCxcbiAgICAgICAgICB1c2VySGFzQWNjZXB0ZWRUZXJtczogJHNjb3BlLmRhdGEudGVybXNBZ3JlZVxuICAgICAgICB9O1xuXG4gICAgICAgIHBpdGNoRmFjdG9yeS52YWxpZGF0ZVBpdGNoKCRzY29wZS5waXRjaClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICAgICAgYnVpbGRTY29wZVBpdGNoKHJlc3ApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICBsb2dFcnJvcihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgJHNjb3BlLnRyaWdnZXJTY29wZUhhbmRsZXIoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfTtcblxuICAgICAgZnVuY3Rpb24gYnVpbGRTY29wZVBpdGNoKHJlc3Ape1xuICAgICAgICAkc2NvcGUudmFsaWRhdGlvblRleHQgPSBcIlwiO1xuICAgICAgICAkc2NvcGUucGl0Y2ggPSByZXNwLnBpdGNoO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygkc2NvcGUucGl0Y2gpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBsb2dFcnJvcihlcnIpe1xuICAgICAgICAkc2NvcGUudmFsaWRhdGlvblRleHQgPSBlcnIubXNnO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0cmlnZ2VyU2NvcGVIYW5kbGVyKCl7XG4gICAgICAgICRzY29wZS5oYW5kbGVyLm9wZW4oe1xuICAgICAgICAgIG5hbWU6IFwiTW92aWVQaXRjaC5jb21cIixcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJQaXRjaCBTdWJtaXNzaW9uXCIsXG4gICAgICAgICAgYW1vdW50OiAyMDBcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHBheW1lbnRTdWNjZXNzKHRva2VuKXtcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIHBpdGNoIG9iamVjdCB3aXRoIHRoZSBwYXltZW50IHRva2VuXG4gICAgICAgICRzY29wZS5waXRjaC50b2tlbiA9IHRva2VuO1xuICAgICAgICAkc2NvcGUucGl0Y2guc3VibWl0dGVyRW1haWwgPSB0b2tlbi5cblxuICAgICAgICBwaXRjaEZhY3Rvcnkuc3VibWl0UGl0Y2goJHNjb3BlLnBpdGNoKTtcblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH07XG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWwsIGF0dHJzKXtcbiAgICAgIGVsLmZpbmQoJ3NlbGVjdCcpLm9uKCdmb2N1cycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnN0IHNlbGVjdEdlbnJlID0gZWwuZmluZCgnb3B0aW9uJylbMF07XG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChzZWxlY3RHZW5yZSkucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL2NoZWNrb3V0L3BpdGNoLWJveC5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnY29udGFjdFVzRm9ybScsIGZ1bmN0aW9uKGVtYWlsRmFjdG9yeSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICBlbWFpbDogbnVsbCxcbiAgICAgICAgbXNnU3ViamVjdDogXCJHZW5lcmFsXCIsXG4gICAgICAgIG1lc3NhZ2U6IG51bGwsXG4gICAgICAgIHN1YmplY3RzOiBbXG4gICAgICAgICAgXCJHZW5lcmFsXCIsXG4gICAgICAgICAgXCJCaWxsaW5nXCIsXG4gICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgIFwiU3VwcG9ydFwiXG4gICAgICAgIF0sXG5cbiAgICAgIH1cblxuICAgICAgbGV0IGNsZWFyRXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwiXCI7XG4gICAgICAgICRzY29wZS5zdWJtaXRTdWNjZXNzID0gXCJcIjtcbiAgICAgIH07XG5cbiAgICAgIGxldCBjbGVhckZpZWxkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5kYXRhLm5hbWUgPSBudWxsO1xuICAgICAgICAkc2NvcGUuZGF0YS5lbWFpbCA9IG51bGw7XG4gICAgICAgICRzY29wZS5kYXRhLm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAkc2NvcGUuZGF0YS5tc2dTdWJqZWN0ID0gXCJHZW5lcmFsXCI7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q29udGFjdEZvcm0gPSBmdW5jdGlvbigpe1xuICAgICAgICBjbGVhckVycm9ycygpO1xuXG4gICAgICAgIGVtYWlsRmFjdG9yeS52YWxpZGF0ZUVtYWlsKCRzY29wZS5kYXRhLmVtYWlsKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICBpZihcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5uYW1lID09PSBcIlwiIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubmFtZSA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLmVtYWlsID09PSBcIlwiIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEuZW1haWwgPT09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5tc2dTdWJqZWN0ID09PSBcIlwiIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubXNnU3ViamVjdCA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLm1lc3NhZ2UgPT09IFwiXCIgfHxcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5tZXNzYWdlID09PSBudWxsXG4gICAgICAgICAgICAgICl7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIlBsZWFzZSBmaWxsIG91dCBlYWNoIGZpZWxkIGJlZm9yZSBzdWJtaXR0aW5nLlwiO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtYWlsRmFjdG9yeVxuICAgICAgICAgICAgICAgICAgLnNlbmRDb250YWN0VXNNZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5lbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubXNnU3ViamVjdCxcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICAgICAgIGNsZWFyRXJyb3JzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgY2xlYXJGaWVsZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3VibWl0U3VjY2VzcyA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdWNjZXNzVGV4dCA9IFwiU3VjY2VzcyEgWW91ciBtZXNzYWdlIGhhcyBiZWVuIHN1Ym1pdHRlZC5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJBbiBlcnJvciBoYXMgb2NjdXJyZWQuIFlvdXIgbWVzc2FnZSB3YXMgbm90IHNlbnQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFkZHJlc3MuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9jb250YWN0LXVzLWZvcm0vY29udGFjdC11cy1mb3JtLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdsb2dpbicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUubG9naW5Vc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcblxuICAgICAgICB1c2VyID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItbG9naW4tcHdkJykpLnZhbCgpO1xuXG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VyLCBwd2QpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfTtcblxuXG4gICAgICAkc2NvcGUubG9nb3V0VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ291dFVzZXIoKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL2xvZ2luL2xvZ2luLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdsb2dpbk1vZGFsJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiXCI7XG5cbiAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJcIjtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmZsYWdJbnB1dEVycm9ycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiaXMtZXJyb3JcIjtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtaGlkZGVuXCI7XG4gICAgICAkc2NvcGUuaGlkZUFsZXJ0ID0gZnVuY3Rpb24oKXskc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1oaWRkZW5cIn07XG4gICAgICAkc2NvcGUuc2hvd0FsZXJ0ID0gZnVuY3Rpb24oKXskc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1zaG93blwifTtcblxuICAgICAgJHNjb3BlLmNsZWFyRm9ybXMgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbW9kYWwgPSAkKCcjbG9naW4tbW9kYWwnKTtcblxuICAgICAgICAvLyBDbGVhciBFeGlzdGluZyBJbnB1dHNcbiAgICAgICAgbW9kYWwuZmluZCgnaW5wdXQnKS52YWwoJycpO1xuXG4gICAgICAgIC8vIFJlc2V0IEVycm9yIE5vdGlmaWNhdGlvbnNcbiAgICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMoKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnVzZXJMb2dpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VyLCBwd2Q7XG4gICAgICAgIHZhciBtb2RhbCA9ICQoJyNsb2dpbi1tb2RhbCcpO1xuXG4gICAgICAgIHVzZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLXBhc3N3b3JkJykpLnZhbCgpO1xuXG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VyLCBwd2QpLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMoKTtcbiAgICAgICAgICAgICRzY29wZS5jbGVhckZvcm1zKCk7XG4gICAgICAgICAgICAkc2NvcGUuaGlkZUFsZXJ0KCk7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSAkcm9vdFNjb3BlIGlzIGluIHRoZSBwcm9jZXNzIG9mIG5hdmlnYXRpbmcgdG8gYSBzdGF0ZSxcbiAgICAgICAgICAgIC8vIGFzIGluIGFuIGV2ZW50IHdoZXJlIGxvZ2luIGludGVycnVwdHMgbmF2aWdhdGlvbiB0byBhIHJlc3RyaWN0ZWQgcGFnZVxuICAgICAgICAgICAgLy8gY29udGludWUgdG8gdGhhdCBzdGF0ZSwgb3RoZXJ3aXNlIGNsZWFyIHRoZSAkcm9vdFNjb3BlLnRhcmdldFN0YXRlXG4gICAgICAgICAgICBpZigkcm9vdFNjb3BlLnRhcmdldFN0YXRlICE9PSBudWxsKXtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCRyb290U2NvcGUudGFyZ2V0U3RhdGUpO1xuICAgICAgICAgICAgICAkcm9vdFNjb3BlLnRhcmdldFN0YXRlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAkc2NvcGUuZmxhZ0lucHV0RXJyb3JzKCk7XG4gICAgICAgICAgICAkc2NvcGUuc2hvd0FsZXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuXG5cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogJ2NvbXBvbmVudHMvbG9naW4tbW9kYWwvbG9naW4tbW9kYWwuaHRtbCdcbiAgfVxufSlcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc2lnbnVwJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCAkc3RhdGUsICRyb290U2NvcGUsIHVzZXJGYWN0b3J5LCBlbWFpbEZhY3Rvcnkpe1xuICAgICAgLy8gJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS5lbWFpbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwiXCI7XG5cbiAgICAgICRzY29wZS52YWxpZGF0ZUVtYWlsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGVtYWlsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1lbWFpbCcpKS52YWwoKTtcblxuICAgICAgICBlbWFpbEZhY3RvcnkudmFsaWRhdGVFbWFpbChlbWFpbClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwiXCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3JUZXh0ID0gXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLlwiO1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5zaWdudXBVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXJuYW1lLCBlbWFpbCwgcHdkLCBjb25maXJtUHdkO1xuICAgICAgICB2YXIgdGVzdEFycmF5ID0gW107XG5cbiAgICAgICAgdXNlcm5hbWUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItZW1haWwnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItcGFzc3dvcmQnKSkudmFsKCk7XG4gICAgICAgIGNvbmZpcm1Qd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWNvbmZpcm0tcGFzc3dvcmQnKSkudmFsKCk7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIGVudHJpZXMgZXhpc3QgZm9yIGFsbCB0aHJlZSBwcmltYXJ5IGZpZWxkc1xuICAgICAgICBpZih1c2VybmFtZSA9PT0gXCJcIiB8fCBlbWFpbCA9PT0gXCJcIiB8fCBwd2QgPT09IFwiXCIpe1xuICAgICAgICAgICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICB0ZXN0QXJyYXkucHVzaChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHdkICE9PSBjb25maXJtUHdkKXtcbiAgICAgICAgICAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHRlc3RBcnJheS5wdXNoKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0ZXN0QXJyYXkubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICB1c2VyRmFjdG9yeS5zaWduVXAodXNlcm5hbWUsIGVtYWlsLCBwd2QpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2lnbnVwU3VjY2VzcyA9IFwic2hvdy1hbGVydFwiO1xuXG4gICAgICAgICAgICAgICAgLy8gbG9naW4gdGhlIHVzZXIgYWZ0ZXIgYSBzdWNjZXNzZnVsIHNpZ251cCBhbmQgbmF2aWdhdGUgdG8gc3VibWl0LXBpdGNoXG4gICAgICAgICAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXJuYW1lLCBwd2QpXG4gICAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnc3VibWl0LXBpdGNoJyk7XG4gICAgICAgICAgICAgICAgICAgICAgfSwgNTUwKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAgIHN3aXRjaChlcnIuZXJyb3IuY29kZSl7XG4gICAgICAgICAgICAgICAgICBjYXNlIC0xOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvclRleHQgPSBcIlRoZSB1c2VybmFtZSBmaWVsZCBpcyBlbXB0eS5cIlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAyMDI6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yVGV4dCA9IFwiVGhlIGRlc2lyZWQgdXNlcm5hbWUgaXMgYWxyZWFkeSB0YWtlbi5cIlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAyMDM6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yVGV4dCA9IFwiQW4gYWNjb3VudCBoYXMgYWxyZWFkeSBiZWVuIGNyZWF0ZWQgYXQgXCIgKyBlbWFpbCArIFwiLlwiO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuXG4gICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5jYXVnaHQgZXJyb3InKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9zaWdudXAvc2lnbnVwLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCd1c2VyUGl0Y2hlcycsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG5cbiAgICAgICRzY29wZS5waXRjaGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk5vdmVtYmVyIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIG1hbiBmYWxscyBpbiBsb3ZlIHdpdGggYSBsYWR5LCBidXQgaXQncyBmdW5ueS5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk9jdG9iZXIgMjNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIkhvcnJvclwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIHdvbWFuIGtlZXBzIGNoZWNraW5nIGhlciBmcmlkZ2UsIGJ1dCB0aGVyZSdzIG5ldmVyIGFueXRoaW5nIHdvcnRoIGVhdGluZy5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiSnVuZSAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJXZXN0ZXJuXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIlNvbWUgY293Ym95cyByaWRlIGFyb3VuZCBjaGFzaW5nIGEgZ2FuZyBvZiB0aGlldmVzXCIsXG4gICAgICAgICAgc3RhdHVzOiBcImFjY2VwdGVkXCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvdXNlci1waXRjaGVzL3VzZXItcGl0Y2hlcy5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYXBwSGVhZGVyJywgZnVuY3Rpb24oJHN0YXRlKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID0gXCJtZW51LWNsb3NlZFwiO1xuICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9naW5cIjtcblxuICAgICAgJHNjb3BlLnRvZ2dsZU1lbnUgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9ICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID09PSBcIm1lbnUtY2xvc2VkXCIgPyBcIm1lbnUtb3BlblwiIDogXCJtZW51LWNsb3NlZFwiO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLiRvbignbG9naW4tdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9nb3V0XCI7XG4gICAgICB9KTtcblxuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dvdXQtdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9naW5cIjtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUubG9nb3V0VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ291dFVzZXIoKS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2luZGV4Jyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5vcGVuTG9naW5Nb2RhbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWwsIGF0dHJzKXtcbiAgICAgICQoZWwpLmZpbmQoJy5tYWluLW5hdiBhJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgc2NvcGUudG9nZ2xlTWVudSgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9uYXYvbmF2Lmh0bWxcIlxuICB9XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
