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
    controller: function controller($scope, $q) {

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

      // Validate the form before launching the payment window
      function validatePitch() {
        var deferred = $q.defer();

        if ($scope.data.termsAgree === true && $scope.data.pitchText !== "" && $scope.data.pitchText !== null && $scope.data.pitchGenre !== "Select Genre" && $scope.data.pitchGenre !== "") {
          deferred.resolve({
            status: "success",
            pitch: {
              genre: $scope.data.pitchGenre,
              pitch: $scope.data.pitchText,
              areTermsAgreed: $scope.data.termsAgree,
              dateAgreed: new Date(),
              token: null
            }
          });
        }

        // If the form doesn't validate, display errors for what kind of error
        else {
            if ($scope.data.pitchText === "" || $scope.data.pitchText === null && $scope.data.pitchGenre === "" || $scope.data.pitchGenre === "Select Genre") {
              deferred.reject({
                status: "Please fill out the pitch form before submitting.",
                data: null
              });
            } else if ($scope.data.termsAgree === false) {
              deferred.reject({
                status: "Please accept the terms in order to continue.",
                data: null
              });
            } else if ($scope.data.pitchText === "" || $scope.data.pitchText === null) {
              deferred.reject({
                status: "Robert is good, but not good enough to sell a blank pitch!",
                data: null
              });
            } else if ($scope.data.pitchGenre === "" || $scope.data.pitchGenre === "Select Genre") {
              deferred.reject({
                status: "What kind of movie is it? Please select a genre.",
                data: null
              });
            } else {
              deferred.reject({
                status: "An unknown error has occurred.",
                data: null
              });
            }
          }

        return deferred.promise;
      };

      // Run the handler when someone clicks 'submit'
      $scope.submitPitch = function (ev) {

        // Run the fields through the validator before any action
        validatePitch().then(function (resp) {
          // Clear the error messages
          $scope.validationText = "";

          // Store the Pitch Data for future use
          $scope.pitch = resp.pitch;

          $scope.handler.open({
            name: "MoviePitch.com",
            description: "Pitch Submission",
            amount: 200
          });
        }, function (err) {
          $scope.validationText = err.status;
          console.log(err);
        });

        ev.preventDefault();
      };

      $scope.paymentSuccess = function (token) {
        $scope.pitch.token = token;
        console.log($scope.pitch);

        // **************************************************
        // ********************* TO DO **********************

        // Write the pitch to the back-end here!!!

        // **************************************************
        // **************************************************
      };

      $scope.handler = StripeCheckout.configure({
        key: 'pk_test_XHkht0GMLQPrn2sYCXSFy4Fs',
        // image: '/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function token(_token) {
          // Use the token to create the charge with a server-side script.
          // You can access the token ID with `token.id`

          // **************************************************
          // ********************* TO DO **********************

          // Complete the transaction through the back-end data services
          // Return a promise

          // **************************************************
          // **************************************************

          $scope.paymentSuccess(_token);
        }
      });
    },
    link: function link(scope, el, attrs) {
      el.find('select').on('focus', function () {
        var selectGenre = el.find('option')[0];
        angular.element(selectGenre).remove();
      });
    },
    restrict: "A"
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJwYXltZW50RmFjdG9yeS5qcyIsInVzZXJGYWN0b3J5LmpzIiwiYWRtaW4tcGl0Y2gtcmV2aWV3L2FkbWluLXBpdGNoLXJldmlldy5qcyIsImNoZWNrb3V0L3BpdGNoLWJveC5qcyIsImNvbnRhY3QtdXMtZm9ybS9jb250YWN0LXVzLWZvcm0uanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmpzIiwibmF2L25hdi5qcyIsInNpZ251cC9zaWdudXAuanMiLCJ1c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkIsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDN0IsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUvQixJQUFNLGVBQWUsR0FBRyxDQUN0QixXQUFXLENBQ1osQ0FBQzs7QUFFRixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FDakUsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQzdDLFVBQVMsY0FBYyxFQUFFLGtCQUFrQixFQUFDOztBQUUxQyxvQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDOzs7QUFBQyxBQUdsQyxnQkFBYyxDQUNYLEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDZCxPQUFHLEVBQUUsR0FBRztBQUNSLGVBQVcsRUFBRSxpQkFBaUI7QUFDOUIsUUFBSSxFQUFFO0FBQ0osa0JBQVksRUFBRSxLQUFLO0tBQ3BCO0dBQ0YsQ0FBQyxDQUNELEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDZCxPQUFHLEVBQUUsUUFBUTtBQUNiLGVBQVcsRUFBRSxr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QTtLQUNGO0FBQ0QsWUFBUSxFQUFFLEdBQUc7QUFDYixlQUFXLEVBQUUsMkNBQTJDO0dBQ3pELENBQUE7Q0FDRixDQUFDLENBQUMiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5yZXF1aXJlKCdhbmd1bGFyJyk7XG5yZXF1aXJlKCdhbmd1bGFyLXVpLXJvdXRlcicpO1xuY29uc3QgUGFyc2UgPSByZXF1aXJlKCdwYXJzZScpO1xuXG5jb25zdCBjb250cm9sbGVyQXJyYXkgPSBbXG4gIFwidWkucm91dGVyXCJcbl07XG5cbmxldCBtb3ZpZVBpdGNoQXBwID0gYW5ndWxhci5tb2R1bGUoXCJtb3ZpZVBpdGNoQXBwXCIsIGNvbnRyb2xsZXJBcnJheSlcbiAgLmNvbmZpZyhbXCIkc3RhdGVQcm92aWRlclwiLCBcIiR1cmxSb3V0ZXJQcm92aWRlclwiLFxuICAgIGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpe1xuXG4gICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cbiAgICAgIC8vIE1haW4gTmF2XG4gICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xuICAgICAgICAgIHVybDogXCIvXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvaG9tZS5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbicsIHtcbiAgICAgICAgICB1cmw6IFwiL2FkbWluXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvYWRtaW4uaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIC8vIEFjY291bnRcbiAgICAgIC8vICRzdGF0ZVByb3ZpZGVyXG4gICAgICAvLyAgIC5zdGF0ZSgncmVnaXN0ZXInLCB7XG4gICAgICAvLyAgICAgdXJsOiBcIi9yZWdpc3RlclwiLFxuICAgICAgLy8gICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3JlZ2lzdGVyLmh0bWxcIixcbiAgICAgIC8vICAgICBkYXRhOiB7XG4gICAgICAvLyAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAvLyAgICAgfVxuICAgICAgLy8gICB9KVxuICAgICAgLy8gICAuc3RhdGUoJ215LWFjY291bnQnLCB7XG4gICAgICAvLyAgICAgdXJsOiBcIi9teS1hY2NvdW50XCIsXG4gICAgICAvLyAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbXktYWNjb3VudC5odG1sXCIsXG4gICAgICAvLyAgICAgZGF0YToge1xuICAgICAgLy8gICAgICAgcmVxdWlyZUxvZ2luOiB0cnVlXG4gICAgICAvLyAgICAgfVxuICAgICAgLy8gICB9KTtcblxuXG4gICAgICAvLyBGb290ZXIgTmF2XG4gICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2ZhcScsIHtcbiAgICAgICAgICB1cmw6IFwiL2ZhcVwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2ZhcS5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdwcmVzcycsIHtcbiAgICAgICAgICB1cmw6IFwiL3ByZXNzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvcHJlc3MuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnY29udGFjdC11cycsIHtcbiAgICAgICAgICB1cmw6IFwiL2NvbnRhY3QtdXNcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9jb250YWN0LXVzLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2xlZ2FsJywge1xuICAgICAgICAgIHVybDogXCIvbGVnYWxcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9sZWdhbC5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG4gIF0pXG4gIC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSl7XG4gICAgUGFyc2UuaW5pdGlhbGl6ZShcIlBSOVdCSEV2alN1Vzl1czhRN1NHaDJLWVJWUWFITGJ6dFpqc2hzYjFcIiwgXCJueXo3TjlzR0xVSU4xaGpNWTlOTlFuZUV4eFA1VzBNSmhYSDN1MVFoXCIpO1xuXG4gICAgLy8gTWFrZSBzdXJlIGEgdXNlciBpcyBsb2dnZWQgb3V0XG4gICAgUGFyc2UuVXNlci5sb2dPdXQoKTtcblxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlKXtcbiAgICAgIGxldCByZXF1aXJlTG9naW4gPSB0b1N0YXRlLmRhdGEucmVxdWlyZUxvZ2luO1xuICAgICAgLy8gY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgLy8gY29uc29sZS5sb2codG9TdGF0ZSk7XG5cbiAgICAgIGlmKHJlcXVpcmVMb2dpbiA9PT0gdHJ1ZSAmJiAkcm9vdFNjb3BlLmN1clVzZXIgPT09IG51bGwpe1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgICAkcm9vdFNjb3BlLnRhcmdldFN0YXRlID0gdG9TdGF0ZS5uYW1lO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJHJvb3RTY29wZS5jdXJVc2VyID0gbnVsbDtcbiAgfSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmNvbnRyb2xsZXIoJ01haW5DdHJsJywgWyckc2NvcGUnLFxuICBmdW5jdGlvbigkc2NvcGUpe1xuICAgIC8vICRzY29wZS4kb24oJ2xvZ2luLXRydWUnLCBmdW5jdGlvbigpe1xuICAgIC8vICAgJHNjb3BlLiRicm9hZGNhc3QoJ2xvZ2luLXVwZGF0ZScpO1xuICAgIC8vIH0pXG4gIH1cbl0pXG4iLCJtb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ2VtYWlsRmFjdG9yeScsIGZ1bmN0aW9uKCRxKXtcbiAgbGV0IHNlbmRncmlkID0gcmVxdWlyZSgnc2VuZGdyaWQnKSgnU0cuMkNTcXg5OWpRMi1Vd1VmOEJpVVVPUS5LZUtFY3ZBNXFuV0NBV2pIQ3I4STBUS2g4OEpCRjhMS0JxSHdOSEtFbDlvJyk7XG5cbiAgbGV0IGZhY3RvcnkgPSB7XG5cbiAgICAvLyBNb2NrIHVwIHNlbmRpbmcgYSBjb250YWN0IGVtYWlsXG4gICAgLy8gaHR0cHM6Ly9ub2RlbWFpbGVyLmNvbS9cbiAgICBzZW5kQ29udGFjdFVzTWVzc2FnZTogZnVuY3Rpb24obmFtZSwgZW1haWwsIHN1YmplY3QsIG1zZyl7XG4gICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICBzdWJqZWN0OiBzdWJqZWN0LFxuICAgICAgICBtZXNzYWdlOiBtc2dcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVFbWFpbDogZnVuY3Rpb24oZW1haWwpIHtcbiAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGxldCByZWcgPSAvXihbYS16QS1aMC05X1xcLlxcLV0pK1xcQCgoW2EtekEtWjAtOVxcLV0pK1xcLikrKFthLXpBLVowLTldezIsNH0pKyQvO1xuXG4gICAgICBpZihyZWcudGVzdChlbWFpbCkpe1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5mYWN0b3J5KCdwYXJzZUZhY3RvcnknLCBmdW5jdGlvbigkcSkge1xuICB2YXIgZmFjdG9yeSA9IHtcbiAgICBzdWJtaXRQaXRjaDogZnVuY3Rpb24oZ2VucmUsIHRleHQpIHtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgdXNlciBpcyBsb2dnZWQgaW4gdG8gc3RvcmUgdGhlIHBpdGNoXG4gICAgICBpZiAoJHJvb3RTY29wZS5jdXJVc2VyICE9PSBudWxsKSB7XG4gICAgICAgIHZhciBQaXRjaCA9IFBhcnNlLk9iamVjdC5leHRlbmQoXCJQaXRjaFwiKTtcbiAgICAgICAgdmFyIHBpdGNoID0gbmV3IFBpdGNoKCk7XG5cbiAgICAgICAgcGl0Y2guc2V0KFwiZ2VucmVcIiwgZ2VucmUpO1xuICAgICAgICBwaXRjaC5zZXQoXCJwaXRjaFwiLCB0ZXh0KTtcbiAgICAgICAgLy8gcGl0Y2guc2V0KFwiY3JlYXRlclwiLCBQYXJzZS5Vc2VyLmN1cnJlbnQudXNlcm5hbWUpXG4gICAgICAgIHBpdGNoLnNldChcInJldmlld2VkXCIsIGZhbHNlKVxuXG5cbiAgICAgICAgcGl0Y2guc2F2ZShudWxsLCB7XG4gICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocGl0Y2gpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgICBkYXRhOiBwaXRjaFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcjogZnVuY3Rpb24ocGl0Y2gsIGVycm9yKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIixcbiAgICAgICAgICAgICAgZGF0YTogZXJyb3JcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlamVjdCB0aGUgc2F2ZSBhdHRlbXB0IGlmIG5vIGN1cnJlbnQgdXNlclxuICAgICAgZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCIsXG4gICAgICAgICAgbXNnOiBcIlVzZXIgaXMgbm90IGxvZ2dlZCBpblwiXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwibW92aWVQaXRjaEFwcC5mYWN0b3J5KCdwYXltZW50RmFjdG9yeScsIGZ1bmN0aW9uKCl7XG4gIHZhciBmYWN0b3J5ID0ge1xuXG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3VzZXJGYWN0b3J5JywgZnVuY3Rpb24oJHEsICRyb290U2NvcGUsICRsb2NhdGlvbil7XG4gIHZhciBmYWN0b3J5ID0ge1xuICAgIGNoZWNrTG9nZ2VkSW46IGZ1bmN0aW9uKCl7XG4gICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBpZigkcm9vdFNjb3BlLmN1clVzZXIgPT09IG51bGwpe1xuICAgICAgICBjb25zb2xlLmxvZygnMScpO1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgJGxvY2F0aW9uLnVybCgnL2xvZ2luJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcyJyk7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcbiAgICBsb2dpblVzZXI6IGZ1bmN0aW9uKHVzZXJuYW1lLCBwd2Qpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgUGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwgcHdkKS50aGVuKFxuICAgICAgICBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSB1c2VyO1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIGRhdGE6IHVzZXJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ2luLXVwZGF0ZScpO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICAgIGVycm9yOiBlcnJcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgbG9nb3V0VXNlcjogZnVuY3Rpb24oKXtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICBQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXG4gICAgICB2YXIgdXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuXG4gICAgICBpZih1c2VyID09PSBudWxsKXtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSB1c2VyIGZyb20gdGhlICRyb290U2NvcGVcbiAgICAgICAgJHJvb3RTY29wZS5jdXJVc2VyID0gbnVsbDtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsb2dvdXQtdXBkYXRlJyk7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgbXNnOiBcIlVzZXIgaXMgbG9nZ2VkIG91dFwiXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBzdGlsbCBsb2dnZWQgaW5cIlxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIHNpZ25VcDogZnVuY3Rpb24odXNlcm5hbWUsIGVtYWlsLCBwd2Qpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgdmFyIHVzZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgICAgdXNlci5zZXQoXCJ1c2VybmFtZVwiLCB1c2VybmFtZSk7XG4gICAgICB1c2VyLnNldChcImVtYWlsXCIsIGVtYWlsKTtcbiAgICAgIHVzZXIuc2V0KFwicGFzc3dvcmRcIiwgcHdkKTtcblxuICAgICAgdXNlci5zaWduVXAobnVsbCwge1xuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICBkYXRhOiB1c2VyXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc29sZS5sb2coUGFyc2UuVXNlci5jdXJyZW50KCkpO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyKXtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICAgIHVzZXI6IHVzZXIsXG4gICAgICAgICAgICBlcnJvcjogZXJyXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdhZG1pblBpdGNoUmV2aWV3JywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgJHNjb3BlLnBpdGNoZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiTm92ZW1iZXIgM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiUm9tYW50aWMgQ29tZWR5XCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgbWFuIGZhbGxzIGluIGxvdmUgd2l0aCBhIGxhZHksIGJ1dCBpdCdzIGZ1bm55LlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiT2N0b2JlciAyM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiSG9ycm9yXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgd29tYW4ga2VlcHMgY2hlY2tpbmcgaGVyIGZyaWRnZSwgYnV0IHRoZXJlJ3MgbmV2ZXIgYW55dGhpbmcgd29ydGggZWF0aW5nLlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0se1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJKdW5lIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIldlc3Rlcm5cIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiU29tZSBjb3dib3lzIHJpZGUgYXJvdW5kIGNoYXNpbmcgYSBnYW5nIG9mIHRoaWV2ZXNcIixcbiAgICAgICAgICBzdGF0dXM6IFwiYWNjZXB0ZWRcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgncGl0Y2hCb3gnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJHEpe1xuXG4gICAgICAvLyBQb3B1bGF0ZSBhbiBhcnJheSBvZiBnZW5yZXMsIGFuZCBjcmVhdGUgc29tZSB2YXJpYWJsZXNcbiAgICAgIC8vIGZvciB0aGUgbmctbW9kZWxzIHRvIGJpbmQgdG9cbiAgICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICBnZW5yZXM6IFtcbiAgICAgICAgICBcIlNlbGVjdCBHZW5yZVwiLFxuICAgICAgICAgIFwiQWN0aW9uXCIsXG4gICAgICAgICAgXCJBZHZlbnR1cmVcIixcbiAgICAgICAgICBcIkFuaW1hdGVkXCIsXG4gICAgICAgICAgXCJDb21lZHlcIixcbiAgICAgICAgICBcIkNyaW1lXCIsXG4gICAgICAgICAgXCJEcmFtYVwiLFxuICAgICAgICAgIFwiRmFudGFzeVwiLFxuICAgICAgICAgIFwiSGlzdG9yaWNhbFwiLFxuICAgICAgICAgIFwiSGlzdG9yaWNhbCBGaWN0aW9uXCIsXG4gICAgICAgICAgXCJIb3Jyb3JcIixcbiAgICAgICAgICBcIktpZHNcIixcbiAgICAgICAgICBcIk15c3RlcnlcIixcbiAgICAgICAgICBcIlBvbGl0aWNhbFwiLFxuICAgICAgICAgIFwiUmVsaWdpb3VzXCIsXG4gICAgICAgICAgXCJSb21hbmNlXCIsXG4gICAgICAgICAgXCJSb21hbnRpYyBDb21lZHlcIixcbiAgICAgICAgICBcIlNhdGlyZVwiLFxuICAgICAgICAgIFwiU2NpZW5jZSBGaWN0aW9uXCIsXG4gICAgICAgICAgXCJUaHJpbGxlclwiLFxuICAgICAgICAgIFwiV2VzdGVyblwiXG4gICAgICAgIF0sXG4gICAgICAgIHBpdGNoR2VucmU6IFwiU2VsZWN0IEdlbnJlXCIsXG4gICAgICAgIHBpdGNoVGV4dDogbnVsbCxcbiAgICAgICAgdGVybXNBZ3JlZTogZmFsc2VcbiAgICAgIH1cblxuICAgICAgLy8gQ2FydmUgb3V0IGEgcGxhY2UgZm9yIHN0b3JpbmcgYSBzdWJtaXR0ZWQgcGl0Y2hcbiAgICAgICRzY29wZS5waXRjaCA9IG51bGw7XG5cbiAgICAgIC8vIFNldCB0aGlzIHByb3BlcnR5IHRvIGNvbmZpZ3VyZSBhbGVydCBtZXNzYWdlcyBkaXNwbGF5ZWRcbiAgICAgIC8vIG9uIHZhbGlkYXRpb24gZmFpbHVyZXNcbiAgICAgICRzY29wZS52YWxpZGF0aW9uVGV4dCA9IG51bGw7XG5cbiAgICAgIC8vIFZhbGlkYXRlIHRoZSBmb3JtIGJlZm9yZSBsYXVuY2hpbmcgdGhlIHBheW1lbnQgd2luZG93XG4gICAgICBmdW5jdGlvbiB2YWxpZGF0ZVBpdGNoKCl7XG4gICAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgaWYoXG4gICAgICAgICAgJHNjb3BlLmRhdGEudGVybXNBZ3JlZSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICRzY29wZS5kYXRhLnBpdGNoVGV4dCAhPT0gXCJcIiAmJlxuICAgICAgICAgICRzY29wZS5kYXRhLnBpdGNoVGV4dCAhPT0gbnVsbCAmJlxuICAgICAgICAgICRzY29wZS5kYXRhLnBpdGNoR2VucmUgIT09IFwiU2VsZWN0IEdlbnJlXCIgJiZcbiAgICAgICAgICAkc2NvcGUuZGF0YS5waXRjaEdlbnJlICE9PSBcIlwiXG4gICAgICAgICkge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIHBpdGNoIDoge1xuICAgICAgICAgICAgICBnZW5yZTogJHNjb3BlLmRhdGEucGl0Y2hHZW5yZSxcbiAgICAgICAgICAgICAgcGl0Y2g6ICRzY29wZS5kYXRhLnBpdGNoVGV4dCxcbiAgICAgICAgICAgICAgYXJlVGVybXNBZ3JlZWQ6ICRzY29wZS5kYXRhLnRlcm1zQWdyZWUsXG4gICAgICAgICAgICAgIGRhdGVBZ3JlZWQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgIHRva2VuIDogbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIGZvcm0gZG9lc24ndCB2YWxpZGF0ZSwgZGlzcGxheSBlcnJvcnMgZm9yIHdoYXQga2luZCBvZiBlcnJvclxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZigkc2NvcGUuZGF0YS5waXRjaFRleHQgPT09IFwiXCIgfHwgJHNjb3BlLmRhdGEucGl0Y2hUZXh0ID09PSBudWxsICYmICRzY29wZS5kYXRhLnBpdGNoR2VucmUgPT09IFwiXCIgfHwgJHNjb3BlLmRhdGEucGl0Y2hHZW5yZSA9PT0gXCJTZWxlY3QgR2VucmVcIikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcIlBsZWFzZSBmaWxsIG91dCB0aGUgcGl0Y2ggZm9ybSBiZWZvcmUgc3VibWl0dGluZy5cIixcbiAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmKCRzY29wZS5kYXRhLnRlcm1zQWdyZWUgPT09IGZhbHNlKXtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJQbGVhc2UgYWNjZXB0IHRoZSB0ZXJtcyBpbiBvcmRlciB0byBjb250aW51ZS5cIixcbiAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUuZGF0YS5waXRjaFRleHQgPT09IFwiXCIgfHwgJHNjb3BlLmRhdGEucGl0Y2hUZXh0ID09PSBudWxsKXtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJSb2JlcnQgaXMgZ29vZCwgYnV0IG5vdCBnb29kIGVub3VnaCB0byBzZWxsIGEgYmxhbmsgcGl0Y2ghXCIsXG4gICAgICAgICAgICAgIGRhdGE6IG51bGxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLmRhdGEucGl0Y2hHZW5yZSA9PT0gXCJcIiB8fCAkc2NvcGUuZGF0YS5waXRjaEdlbnJlID09PSBcIlNlbGVjdCBHZW5yZVwiKXtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJXaGF0IGtpbmQgb2YgbW92aWUgaXMgaXQ/IFBsZWFzZSBzZWxlY3QgYSBnZW5yZS5cIixcbiAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJBbiB1bmtub3duIGVycm9yIGhhcyBvY2N1cnJlZC5cIixcbiAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9O1xuXG4gICAgICAvLyBSdW4gdGhlIGhhbmRsZXIgd2hlbiBzb21lb25lIGNsaWNrcyAnc3VibWl0J1xuICAgICAgJHNjb3BlLnN1Ym1pdFBpdGNoID0gZnVuY3Rpb24oZXYpe1xuXG4gICAgICAgIC8vIFJ1biB0aGUgZmllbGRzIHRocm91Z2ggdGhlIHZhbGlkYXRvciBiZWZvcmUgYW55IGFjdGlvblxuICAgICAgICB2YWxpZGF0ZVBpdGNoKCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgIC8vIENsZWFyIHRoZSBlcnJvciBtZXNzYWdlc1xuICAgICAgICAgICAgJHNjb3BlLnZhbGlkYXRpb25UZXh0ID0gXCJcIjtcblxuICAgICAgICAgICAgLy8gU3RvcmUgdGhlIFBpdGNoIERhdGEgZm9yIGZ1dHVyZSB1c2VcbiAgICAgICAgICAgICRzY29wZS5waXRjaCA9IHJlc3AucGl0Y2g7XG5cbiAgICAgICAgICAgICRzY29wZS5oYW5kbGVyLm9wZW4oe1xuICAgICAgICAgICAgICBuYW1lOiBcIk1vdmllUGl0Y2guY29tXCIsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlBpdGNoIFN1Ym1pc3Npb25cIixcbiAgICAgICAgICAgICAgYW1vdW50OiAyMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICRzY29wZS52YWxpZGF0aW9uVGV4dCA9IGVyci5zdGF0dXM7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgKVxuXG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucGF5bWVudFN1Y2Nlc3MgPSBmdW5jdGlvbih0b2tlbil7XG4gICAgICAgICRzY29wZS5waXRjaC50b2tlbiA9IHRva2VuO1xuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucGl0Y2gpO1xuXG5cbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqIFRPIERPICoqKioqKioqKioqKioqKioqKioqKipcblxuICAgICAgICAvLyBXcml0ZSB0aGUgcGl0Y2ggdG8gdGhlIGJhY2stZW5kIGhlcmUhISFcblxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmhhbmRsZXIgPSBTdHJpcGVDaGVja291dC5jb25maWd1cmUoe1xuICAgICAgICBrZXk6ICdwa190ZXN0X1hIa2h0MEdNTFFQcm4yc1lDWFNGeTRGcycsXG4gICAgICAgIC8vIGltYWdlOiAnL2ltZy9kb2N1bWVudGF0aW9uL2NoZWNrb3V0L21hcmtldHBsYWNlLnBuZycsXG4gICAgICAgIGxvY2FsZTogJ2F1dG8nLFxuICAgICAgICB0b2tlbjogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIHRva2VuIHRvIGNyZWF0ZSB0aGUgY2hhcmdlIHdpdGggYSBzZXJ2ZXItc2lkZSBzY3JpcHQuXG4gICAgICAgICAgLy8gWW91IGNhbiBhY2Nlc3MgdGhlIHRva2VuIElEIHdpdGggYHRva2VuLmlkYFxuXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKiogVE8gRE8gKioqKioqKioqKioqKioqKioqKioqKlxuXG4gICAgICAgICAgLy8gQ29tcGxldGUgdGhlIHRyYW5zYWN0aW9uIHRocm91Z2ggdGhlIGJhY2stZW5kIGRhdGEgc2VydmljZXNcbiAgICAgICAgICAvLyBSZXR1cm4gYSBwcm9taXNlXG5cbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgICAgICAgICAkc2NvcGUucGF5bWVudFN1Y2Nlc3ModG9rZW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbCwgYXR0cnMpe1xuICAgICAgZWwuZmluZCgnc2VsZWN0Jykub24oJ2ZvY3VzJywgZnVuY3Rpb24oKXtcbiAgICAgICAgY29uc3Qgc2VsZWN0R2VucmUgPSBlbC5maW5kKCdvcHRpb24nKVswXTtcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KHNlbGVjdEdlbnJlKS5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2NvbnRhY3RVc0Zvcm0nLCBmdW5jdGlvbihlbWFpbEZhY3Rvcnkpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgZW1haWw6IG51bGwsXG4gICAgICAgIG1zZ1N1YmplY3Q6IFwiR2VuZXJhbFwiLFxuICAgICAgICBtZXNzYWdlOiBudWxsLFxuICAgICAgICBzdWJqZWN0czogW1xuICAgICAgICAgIFwiR2VuZXJhbFwiLFxuICAgICAgICAgIFwiQmlsbGluZ1wiLFxuICAgICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgICBcIlN1cHBvcnRcIlxuICAgICAgICBdLFxuXG4gICAgICB9XG5cbiAgICAgIGxldCBjbGVhckVycm9ycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcIlwiO1xuICAgICAgICAkc2NvcGUuc3VibWl0U3VjY2VzcyA9IFwiXCI7XG4gICAgICB9O1xuXG4gICAgICBsZXQgY2xlYXJGaWVsZHMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuZGF0YS5uYW1lID0gbnVsbDtcbiAgICAgICAgJHNjb3BlLmRhdGEuZW1haWwgPSBudWxsO1xuICAgICAgICAkc2NvcGUuZGF0YS5tZXNzYWdlID0gbnVsbDtcbiAgICAgICAgJHNjb3BlLmRhdGEubXNnU3ViamVjdCA9IFwiR2VuZXJhbFwiO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnN1Ym1pdENvbnRhY3RGb3JtID0gZnVuY3Rpb24oKXtcbiAgICAgICAgY2xlYXJFcnJvcnMoKTtcblxuICAgICAgICBlbWFpbEZhY3RvcnkudmFsaWRhdGVFbWFpbCgkc2NvcGUuZGF0YS5lbWFpbClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICAgICAgaWYoXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubmFtZSA9PT0gXCJcIiB8fFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLm5hbWUgPT09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5lbWFpbCA9PT0gXCJcIiB8fFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLmVtYWlsID09PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubXNnU3ViamVjdCA9PT0gXCJcIiB8fFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLm1zZ1N1YmplY3QgPT09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5tZXNzYWdlID09PSBcIlwiIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubWVzc2FnZSA9PT0gbnVsbFxuICAgICAgICAgICAgICApe1xuICAgICAgICAgICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJQbGVhc2UgZmlsbCBvdXQgZWFjaCBmaWVsZCBiZWZvcmUgc3VibWl0dGluZy5cIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbWFpbEZhY3RvcnlcbiAgICAgICAgICAgICAgICAgIC5zZW5kQ29udGFjdFVzTWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEuZW1haWwsXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLm1zZ1N1YmplY3QsXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgICAgICAgICBjbGVhckVycm9ycygpO1xuICAgICAgICAgICAgICAgICAgICAgIGNsZWFyRmllbGRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN1Ym1pdFN1Y2Nlc3MgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3VjY2Vzc1RleHQgPSBcIlN1Y2Nlc3MhIFlvdXIgbWVzc2FnZSBoYXMgYmVlbiBzdWJtaXR0ZWQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yVGV4dCA9IFwiQW4gZXJyb3IgaGFzIG9jY3VycmVkLiBZb3VyIG1lc3NhZ2Ugd2FzIG5vdCBzZW50LlwiO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9O1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvY29udGFjdC11cy1mb3JtL2NvbnRhY3QtdXMtZm9ybS5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW4nLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VyLCBwd2Q7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1sb2dpbi11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXB3ZCcpKS52YWwoKTtcblxuICAgICAgICB1c2VyRmFjdG9yeS5sb2dpblVzZXIodXNlciwgcHdkKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH07XG5cblxuICAgICAgJHNjb3BlLmxvZ291dFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB1c2VyRmFjdG9yeS5sb2dvdXRVc2VyKClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9sb2dpbi9sb2dpbi5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW5Nb2RhbCcsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcIlwiO1xuXG4gICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiXCI7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5mbGFnSW5wdXRFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcImlzLWVycm9yXCI7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LWhpZGRlblwiO1xuICAgICAgJHNjb3BlLmhpZGVBbGVydCA9IGZ1bmN0aW9uKCl7JHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtaGlkZGVuXCJ9O1xuICAgICAgJHNjb3BlLnNob3dBbGVydCA9IGZ1bmN0aW9uKCl7JHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtc2hvd25cIn07XG5cbiAgICAgICRzY29wZS5jbGVhckZvcm1zID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIG1vZGFsID0gJCgnI2xvZ2luLW1vZGFsJyk7XG5cbiAgICAgICAgLy8gQ2xlYXIgRXhpc3RpbmcgSW5wdXRzXG4gICAgICAgIG1vZGFsLmZpbmQoJ2lucHV0JykudmFsKCcnKTtcblxuICAgICAgICAvLyBSZXNldCBFcnJvciBOb3RpZmljYXRpb25zXG4gICAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzKCk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS51c2VyTG9naW4gPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlciwgcHdkO1xuICAgICAgICB2YXIgbW9kYWwgPSAkKCcjbG9naW4tbW9kYWwnKTtcblxuICAgICAgICB1c2VyID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi1wYXNzd29yZCcpKS52YWwoKTtcblxuICAgICAgICB1c2VyRmFjdG9yeS5sb2dpblVzZXIodXNlciwgcHdkKS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzKCk7XG4gICAgICAgICAgICAkc2NvcGUuY2xlYXJGb3JtcygpO1xuICAgICAgICAgICAgJHNjb3BlLmhpZGVBbGVydCgpO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUgJHJvb3RTY29wZSBpcyBpbiB0aGUgcHJvY2VzcyBvZiBuYXZpZ2F0aW5nIHRvIGEgc3RhdGUsXG4gICAgICAgICAgICAvLyBhcyBpbiBhbiBldmVudCB3aGVyZSBsb2dpbiBpbnRlcnJ1cHRzIG5hdmlnYXRpb24gdG8gYSByZXN0cmljdGVkIHBhZ2VcbiAgICAgICAgICAgIC8vIGNvbnRpbnVlIHRvIHRoYXQgc3RhdGUsIG90aGVyd2lzZSBjbGVhciB0aGUgJHJvb3RTY29wZS50YXJnZXRTdGF0ZVxuICAgICAgICAgICAgaWYoJHJvb3RTY29wZS50YXJnZXRTdGF0ZSAhPT0gbnVsbCl7XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygkcm9vdFNjb3BlLnRhcmdldFN0YXRlKTtcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS50YXJnZXRTdGF0ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgJHNjb3BlLmZsYWdJbnB1dEVycm9ycygpO1xuICAgICAgICAgICAgJHNjb3BlLnNob3dBbGVydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuXG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6ICdjb21wb25lbnRzL2xvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmh0bWwnXG4gIH1cbn0pXG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYXBwSGVhZGVyJywgZnVuY3Rpb24oJHN0YXRlKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID0gXCJtZW51LWNsb3NlZFwiO1xuICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9naW5cIjtcblxuICAgICAgJHNjb3BlLnRvZ2dsZU1lbnUgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9ICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID09PSBcIm1lbnUtY2xvc2VkXCIgPyBcIm1lbnUtb3BlblwiIDogXCJtZW51LWNsb3NlZFwiO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLiRvbignbG9naW4tdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9nb3V0XCI7XG4gICAgICB9KTtcblxuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dvdXQtdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRMb2dBY3Rpb24gPSBcInNob3ctbG9naW5cIjtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUubG9nb3V0VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ291dFVzZXIoKS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2luZGV4Jyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5vcGVuTG9naW5Nb2RhbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWwsIGF0dHJzKXtcbiAgICAgICQoZWwpLmZpbmQoJy5tYWluLW5hdiBhJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICAgICAgc2NvcGUudG9nZ2xlTWVudSgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9uYXYvbmF2Lmh0bWxcIlxuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc2lnbnVwJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCAkc3RhdGUsICRyb290U2NvcGUsIHVzZXJGYWN0b3J5LCBlbWFpbEZhY3Rvcnkpe1xuICAgICAgLy8gJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS5lbWFpbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwiXCI7XG5cbiAgICAgICRzY29wZS52YWxpZGF0ZUVtYWlsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGVtYWlsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1lbWFpbCcpKS52YWwoKTtcblxuICAgICAgICBlbWFpbEZhY3RvcnkudmFsaWRhdGVFbWFpbChlbWFpbClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwiXCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3JUZXh0ID0gXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLlwiO1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5zaWdudXBVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXJuYW1lLCBlbWFpbCwgcHdkLCBjb25maXJtUHdkO1xuICAgICAgICB2YXIgdGVzdEFycmF5ID0gW107XG5cbiAgICAgICAgdXNlcm5hbWUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItZW1haWwnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItcGFzc3dvcmQnKSkudmFsKCk7XG4gICAgICAgIGNvbmZpcm1Qd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWNvbmZpcm0tcGFzc3dvcmQnKSkudmFsKCk7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIGVudHJpZXMgZXhpc3QgZm9yIGFsbCB0aHJlZSBwcmltYXJ5IGZpZWxkc1xuICAgICAgICBpZih1c2VybmFtZSA9PT0gXCJcIiB8fCBlbWFpbCA9PT0gXCJcIiB8fCBwd2QgPT09IFwiXCIpe1xuICAgICAgICAgICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICB0ZXN0QXJyYXkucHVzaChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHdkICE9PSBjb25maXJtUHdkKXtcbiAgICAgICAgICAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHRlc3RBcnJheS5wdXNoKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0ZXN0QXJyYXkubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICB1c2VyRmFjdG9yeS5zaWduVXAodXNlcm5hbWUsIGVtYWlsLCBwd2QpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2lnbnVwU3VjY2VzcyA9IFwic2hvdy1hbGVydFwiO1xuXG4gICAgICAgICAgICAgICAgLy8gbG9naW4gdGhlIHVzZXIgYWZ0ZXIgYSBzdWNjZXNzZnVsIHNpZ251cCBhbmQgbmF2aWdhdGUgdG8gc3VibWl0LXBpdGNoXG4gICAgICAgICAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXJuYW1lLCBwd2QpXG4gICAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnc3VibWl0LXBpdGNoJyk7XG4gICAgICAgICAgICAgICAgICAgICAgfSwgNTUwKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAgIHN3aXRjaChlcnIuZXJyb3IuY29kZSl7XG4gICAgICAgICAgICAgICAgICBjYXNlIC0xOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvclRleHQgPSBcIlRoZSB1c2VybmFtZSBmaWVsZCBpcyBlbXB0eS5cIlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAyMDI6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yVGV4dCA9IFwiVGhlIGRlc2lyZWQgdXNlcm5hbWUgaXMgYWxyZWFkeSB0YWtlbi5cIlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAyMDM6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yVGV4dCA9IFwiQW4gYWNjb3VudCBoYXMgYWxyZWFkeSBiZWVuIGNyZWF0ZWQgYXQgXCIgKyBlbWFpbCArIFwiLlwiO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuXG4gICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5jYXVnaHQgZXJyb3InKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9zaWdudXAvc2lnbnVwLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCd1c2VyUGl0Y2hlcycsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG5cbiAgICAgICRzY29wZS5waXRjaGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk5vdmVtYmVyIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIG1hbiBmYWxscyBpbiBsb3ZlIHdpdGggYSBsYWR5LCBidXQgaXQncyBmdW5ueS5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk9jdG9iZXIgMjNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIkhvcnJvclwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIHdvbWFuIGtlZXBzIGNoZWNraW5nIGhlciBmcmlkZ2UsIGJ1dCB0aGVyZSdzIG5ldmVyIGFueXRoaW5nIHdvcnRoIGVhdGluZy5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiSnVuZSAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJXZXN0ZXJuXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIlNvbWUgY293Ym95cyByaWRlIGFyb3VuZCBjaGFzaW5nIGEgZ2FuZyBvZiB0aGlldmVzXCIsXG4gICAgICAgICAgc3RhdHVzOiBcImFjY2VwdGVkXCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvdXNlci1waXRjaGVzL3VzZXItcGl0Y2hlcy5odG1sXCJcbiAgfVxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
