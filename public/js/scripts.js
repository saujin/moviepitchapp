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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJwYXltZW50RmFjdG9yeS5qcyIsInVzZXJGYWN0b3J5LmpzIiwiYWRtaW4tcGl0Y2gtcmV2aWV3L2FkbWluLXBpdGNoLXJldmlldy5qcyIsImNvbnRhY3QtdXMtZm9ybS9jb250YWN0LXVzLWZvcm0uanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmpzIiwibmF2L25hdi5qcyIsInNpZ251cC9zaWdudXAuanMiLCJ1c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmpzIiwiY2hlY2tvdXQvcGl0Y2gtYm94LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkIsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDN0IsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUvQixJQUFNLGVBQWUsR0FBRyxDQUN0QixXQUFXLENBQ1osQ0FBQzs7QUFFRixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FDakUsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQzdDLFVBQVMsY0FBYyxFQUFFLGtCQUFrQixFQUFDOztBQUUxQyxvQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDOzs7QUFBQyxBQUdsQyxnQkFBYyxDQUNYLEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDZCxPQUFHLEVBQUUsR0FBRztBQUNSLGVBQVcsRUFBRSxpQkFBaUI7QUFDOUIsUUFBSSxFQUFFO0FBQ0osa0JBQVksRUFBRSxLQUFLO0tBQ3BCO0dBQ0YsQ0FBQyxDQUNELEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDZCxPQUFHLEVBQUUsUUFBUTtBQUNiLGVBQVcsRUFBRSxr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InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxucmVxdWlyZSgnYW5ndWxhcicpO1xucmVxdWlyZSgnYW5ndWxhci11aS1yb3V0ZXInKTtcbmNvbnN0IFBhcnNlID0gcmVxdWlyZSgncGFyc2UnKTtcblxuY29uc3QgY29udHJvbGxlckFycmF5ID0gW1xuICBcInVpLnJvdXRlclwiXG5dO1xuXG5sZXQgbW92aWVQaXRjaEFwcCA9IGFuZ3VsYXIubW9kdWxlKFwibW92aWVQaXRjaEFwcFwiLCBjb250cm9sbGVyQXJyYXkpXG4gIC5jb25maWcoW1wiJHN0YXRlUHJvdmlkZXJcIiwgXCIkdXJsUm91dGVyUHJvdmlkZXJcIixcbiAgICBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcblxuICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgICAvLyBNYWluIE5hdlxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdpbmRleCcsIHtcbiAgICAgICAgICB1cmw6IFwiL1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2hvbWUuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgICAgICAgdXJsOiBcIi9hZG1pblwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2FkbWluLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAvLyBBY2NvdW50XG4gICAgICAvLyAkc3RhdGVQcm92aWRlclxuICAgICAgLy8gICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgLy8gICAgIHVybDogXCIvcmVnaXN0ZXJcIixcbiAgICAgIC8vICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9yZWdpc3Rlci5odG1sXCIsXG4gICAgICAvLyAgICAgZGF0YToge1xuICAgICAgLy8gICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfSlcbiAgICAgIC8vICAgLnN0YXRlKCdteS1hY2NvdW50Jywge1xuICAgICAgLy8gICAgIHVybDogXCIvbXktYWNjb3VudFwiLFxuICAgICAgLy8gICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL215LWFjY291bnQuaHRtbFwiLFxuICAgICAgLy8gICAgIGRhdGE6IHtcbiAgICAgIC8vICAgICAgIHJlcXVpcmVMb2dpbjogdHJ1ZVxuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfSk7XG5cblxuICAgICAgLy8gRm9vdGVyIE5hdlxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdmYXEnLCB7XG4gICAgICAgICAgdXJsOiBcIi9mYXFcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9mYXEuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgncHJlc3MnLCB7XG4gICAgICAgICAgdXJsOiBcIi9wcmVzc1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3ByZXNzLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2NvbnRhY3QtdXMnLCB7XG4gICAgICAgICAgdXJsOiBcIi9jb250YWN0LXVzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvY29udGFjdC11cy5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdsZWdhbCcsIHtcbiAgICAgICAgICB1cmw6IFwiL2xlZ2FsXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbGVnYWwuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuICBdKVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpe1xuICAgIFBhcnNlLmluaXRpYWxpemUoXCJQUjlXQkhFdmpTdVc5dXM4UTdTR2gyS1lSVlFhSExienRaanNoc2IxXCIsIFwibnl6N045c0dMVUlOMWhqTVk5Tk5RbmVFeHhQNVcwTUpoWEgzdTFRaFwiKTtcblxuICAgIC8vIE1ha2Ugc3VyZSBhIHVzZXIgaXMgbG9nZ2VkIG91dFxuICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSl7XG4gICAgICBsZXQgcmVxdWlyZUxvZ2luID0gdG9TdGF0ZS5kYXRhLnJlcXVpcmVMb2dpbjtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHRvU3RhdGUpO1xuXG4gICAgICBpZihyZXF1aXJlTG9naW4gPT09IHRydWUgJiYgJHJvb3RTY29wZS5jdXJVc2VyID09PSBudWxsKXtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgJHJvb3RTY29wZS50YXJnZXRTdGF0ZSA9IHRvU3RhdGUubmFtZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG4gIH0pO1xuIiwibW92aWVQaXRjaEFwcC5jb250cm9sbGVyKCdNYWluQ3RybCcsIFsnJHNjb3BlJyxcbiAgZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAvLyAkc2NvcGUuJG9uKCdsb2dpbi10cnVlJywgZnVuY3Rpb24oKXtcbiAgICAvLyAgICRzY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAvLyB9KVxuICB9XG5dKVxuIiwibW92aWVQaXRjaEFwcC5mYWN0b3J5KCdlbWFpbEZhY3RvcnknLCBmdW5jdGlvbigkcSl7XG4gIGxldCBzZW5kZ3JpZCA9IHJlcXVpcmUoJ3NlbmRncmlkJykoJ1NHLjJDU3F4OTlqUTItVXdVZjhCaVVVT1EuS2VLRWN2QTVxbldDQVdqSENyOEkwVEtoODhKQkY4TEtCcUh3TkhLRWw5bycpO1xuXG4gIGxldCBmYWN0b3J5ID0ge1xuXG4gICAgLy8gTW9jayB1cCBzZW5kaW5nIGEgY29udGFjdCBlbWFpbFxuICAgIC8vIGh0dHBzOi8vbm9kZW1haWxlci5jb20vXG4gICAgc2VuZENvbnRhY3RVc01lc3NhZ2U6IGZ1bmN0aW9uKG5hbWUsIGVtYWlsLCBzdWJqZWN0LCBtc2cpe1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgc3ViamVjdDogc3ViamVjdCxcbiAgICAgICAgbWVzc2FnZTogbXNnXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlRW1haWw6IGZ1bmN0aW9uKGVtYWlsKSB7XG4gICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBsZXQgcmVnID0gL14oW2EtekEtWjAtOV9cXC5cXC1dKStcXEAoKFthLXpBLVowLTlcXC1dKStcXC4pKyhbYS16QS1aMC05XXsyLDR9KSskLztcblxuICAgICAgaWYocmVnLnRlc3QoZW1haWwpKXtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGFyc2VGYWN0b3J5JywgZnVuY3Rpb24oJHEpIHtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgc3VibWl0UGl0Y2g6IGZ1bmN0aW9uKGdlbnJlLCB0ZXh0KSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIHVzZXIgaXMgbG9nZ2VkIGluIHRvIHN0b3JlIHRoZSBwaXRjaFxuICAgICAgaWYgKCRyb290U2NvcGUuY3VyVXNlciAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgUGl0Y2ggPSBQYXJzZS5PYmplY3QuZXh0ZW5kKFwiUGl0Y2hcIik7XG4gICAgICAgIHZhciBwaXRjaCA9IG5ldyBQaXRjaCgpO1xuXG4gICAgICAgIHBpdGNoLnNldChcImdlbnJlXCIsIGdlbnJlKTtcbiAgICAgICAgcGl0Y2guc2V0KFwicGl0Y2hcIiwgdGV4dCk7XG4gICAgICAgIC8vIHBpdGNoLnNldChcImNyZWF0ZXJcIiwgUGFyc2UuVXNlci5jdXJyZW50LnVzZXJuYW1lKVxuICAgICAgICBwaXRjaC5zZXQoXCJyZXZpZXdlZFwiLCBmYWxzZSlcblxuXG4gICAgICAgIHBpdGNoLnNhdmUobnVsbCwge1xuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHBpdGNoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgICAgZGF0YTogcGl0Y2hcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHBpdGNoLCBlcnJvcikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCIsXG4gICAgICAgICAgICAgIGRhdGE6IGVycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWplY3QgdGhlIHNhdmUgYXR0ZW1wdCBpZiBubyBjdXJyZW50IHVzZXJcbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIG5vdCBsb2dnZWQgaW5cIlxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGF5bWVudEZhY3RvcnknLCBmdW5jdGlvbigpe1xuICB2YXIgZmFjdG9yeSA9IHtcblxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5mYWN0b3J5KCd1c2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRxLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24pe1xuICB2YXIgZmFjdG9yeSA9IHtcbiAgICBjaGVja0xvZ2dlZEluOiBmdW5jdGlvbigpe1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgaWYoJHJvb3RTY29wZS5jdXJVc2VyID09PSBudWxsKXtcbiAgICAgICAgY29uc29sZS5sb2coJzEnKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICRsb2NhdGlvbi51cmwoJy9sb2dpbicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnMicpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgbG9naW5Vc2VyOiBmdW5jdGlvbih1c2VybmFtZSwgcHdkKXtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIFBhcnNlLlVzZXIubG9nSW4odXNlcm5hbWUsIHB3ZCkudGhlbihcbiAgICAgICAgZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgJHJvb3RTY29wZS5jdXJVc2VyID0gdXNlcjtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICBkYXRhOiB1c2VyXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICBlcnJvcjogZXJyXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIGxvZ291dFVzZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgUGFyc2UuVXNlci5sb2dPdXQoKTtcblxuICAgICAgdmFyIHVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblxuICAgICAgaWYodXNlciA9PT0gbnVsbCl7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgdXNlciBmcm9tIHRoZSAkcm9vdFNjb3BlXG4gICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9nb3V0LXVwZGF0ZScpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIGxvZ2dlZCBvdXRcIlxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgbXNnOiBcIlVzZXIgaXMgc3RpbGwgbG9nZ2VkIGluXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICBzaWduVXA6IGZ1bmN0aW9uKHVzZXJuYW1lLCBlbWFpbCwgcHdkKXtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIHZhciB1c2VyID0gbmV3IFBhcnNlLlVzZXIoKTtcbiAgICAgIHVzZXIuc2V0KFwidXNlcm5hbWVcIiwgdXNlcm5hbWUpO1xuICAgICAgdXNlci5zZXQoXCJlbWFpbFwiLCBlbWFpbCk7XG4gICAgICB1c2VyLnNldChcInBhc3N3b3JkXCIsIHB3ZCk7XG5cbiAgICAgIHVzZXIuc2lnblVwKG51bGwsIHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YTogdXNlclxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycil7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICB1c2VyOiB1c2VyLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYWRtaW5QaXRjaFJldmlldycsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICRzY29wZS5waXRjaGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk5vdmVtYmVyIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIG1hbiBmYWxscyBpbiBsb3ZlIHdpdGggYSBsYWR5LCBidXQgaXQncyBmdW5ueS5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk9jdG9iZXIgMjNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIkhvcnJvclwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIHdvbWFuIGtlZXBzIGNoZWNraW5nIGhlciBmcmlkZ2UsIGJ1dCB0aGVyZSdzIG5ldmVyIGFueXRoaW5nIHdvcnRoIGVhdGluZy5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiSnVuZSAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJXZXN0ZXJuXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIlNvbWUgY293Ym95cyByaWRlIGFyb3VuZCBjaGFzaW5nIGEgZ2FuZyBvZiB0aGlldmVzXCIsXG4gICAgICAgICAgc3RhdHVzOiBcImFjY2VwdGVkXCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2NvbnRhY3RVc0Zvcm0nLCBmdW5jdGlvbihlbWFpbEZhY3Rvcnkpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAkc2NvcGUuc3ViamVjdHMgPSBbXG4gICAgICAgIFwiR2VuZXJhbFwiLFxuICAgICAgICBcIkJpbGxpbmdcIixcbiAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICBcIlN1cHBvcnRcIlxuICAgICAgXTtcblxuXG4gICAgICBsZXQgY2xlYXJFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJcIjtcbiAgICAgICAgJHNjb3BlLnN1Ym1pdFN1Y2Nlc3MgPSBcIlwiO1xuICAgICAgfTtcblxuICAgICAgbGV0IGNsZWFyRmllbGRzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnW2NvbnRhY3QtdXMtZm9ybV0nKS5maW5kKCcuZm9ybS1jb250cm9sJykudmFsKCcnKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5zdWJtaXRDb250YWN0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNsZWFyRXJyb3JzKCk7XG5cbiAgICAgICAgbGV0IG5hbWUsIGVtYWlsLCBzdWJqZWN0LCBtZXNzYWdlO1xuXG4gICAgICAgIG5hbWUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhY3QtbmFtZScpKS52YWwoKTtcbiAgICAgICAgZW1haWwgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhY3QtZW1haWwnKSkudmFsKCk7XG4gICAgICAgIHN1YmplY3QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhY3Qtc3ViamVjdCcpKS52YWwoKTtcbiAgICAgICAgbWVzc2FnZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFjdC1tZXNzYWdlJykpLnZhbCgpO1xuXG4gICAgICAgIGVtYWlsRmFjdG9yeS52YWxpZGF0ZUVtYWlsKGVtYWlsKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGlmKG5hbWUgPT09IFwiXCIgfHwgZW1haWwgPT09IFwiXCIgfHwgc3ViamVjdCA9PT0gXCJcIiB8fCBtZXNzYWdlPT09XCJcIil7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIlBsZWFzZSBmaWxsIG91dCBlYWNoIGZpZWxkIGJlZm9yZSBzdWJtaXR0aW5nLlwiO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgZW1haWxGYWN0b3J5LnNlbmRDb250YWN0VXNNZXNzYWdlKG5hbWUsIGVtYWlsLCBzdWJqZWN0LCBtZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICAgICAgIGNsZWFyRXJyb3JzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgY2xlYXJGaWVsZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3VibWl0U3VjY2VzcyA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdWNjZXNzVGV4dCA9IFwiU3VjY2VzcyEgWW91ciBtZXNzYWdlIGhhcyBiZWVuIHN1Ym1pdHRlZC5cIjtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJBbiBlcnJvciBoYXMgb2NjdXJyZWQuIFlvdXIgbWVzc2FnZSB3YXMgbm90IHNlbnQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFkZHJlc3MuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9jb250YWN0LXVzLWZvcm0vY29udGFjdC11cy1mb3JtLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdsb2dpbicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUubG9naW5Vc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcblxuICAgICAgICB1c2VyID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItbG9naW4tcHdkJykpLnZhbCgpO1xuXG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VyLCBwd2QpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfTtcblxuXG4gICAgICAkc2NvcGUubG9nb3V0VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ291dFVzZXIoKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL2xvZ2luL2xvZ2luLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdsb2dpbk1vZGFsJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiXCI7XG5cbiAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJcIjtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmZsYWdJbnB1dEVycm9ycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiaXMtZXJyb3JcIjtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtaGlkZGVuXCI7XG4gICAgICAkc2NvcGUuaGlkZUFsZXJ0ID0gZnVuY3Rpb24oKXskc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1oaWRkZW5cIn07XG4gICAgICAkc2NvcGUuc2hvd0FsZXJ0ID0gZnVuY3Rpb24oKXskc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1zaG93blwifTtcblxuICAgICAgJHNjb3BlLmNsZWFyRm9ybXMgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbW9kYWwgPSAkKCcjbG9naW4tbW9kYWwnKTtcblxuICAgICAgICAvLyBDbGVhciBFeGlzdGluZyBJbnB1dHNcbiAgICAgICAgbW9kYWwuZmluZCgnaW5wdXQnKS52YWwoJycpO1xuXG4gICAgICAgIC8vIFJlc2V0IEVycm9yIE5vdGlmaWNhdGlvbnNcbiAgICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMoKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnVzZXJMb2dpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VyLCBwd2Q7XG4gICAgICAgIHZhciBtb2RhbCA9ICQoJyNsb2dpbi1tb2RhbCcpO1xuXG4gICAgICAgIHVzZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLXBhc3N3b3JkJykpLnZhbCgpO1xuXG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VyLCBwd2QpLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMoKTtcbiAgICAgICAgICAgICRzY29wZS5jbGVhckZvcm1zKCk7XG4gICAgICAgICAgICAkc2NvcGUuaGlkZUFsZXJ0KCk7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSAkcm9vdFNjb3BlIGlzIGluIHRoZSBwcm9jZXNzIG9mIG5hdmlnYXRpbmcgdG8gYSBzdGF0ZSxcbiAgICAgICAgICAgIC8vIGFzIGluIGFuIGV2ZW50IHdoZXJlIGxvZ2luIGludGVycnVwdHMgbmF2aWdhdGlvbiB0byBhIHJlc3RyaWN0ZWQgcGFnZVxuICAgICAgICAgICAgLy8gY29udGludWUgdG8gdGhhdCBzdGF0ZSwgb3RoZXJ3aXNlIGNsZWFyIHRoZSAkcm9vdFNjb3BlLnRhcmdldFN0YXRlXG4gICAgICAgICAgICBpZigkcm9vdFNjb3BlLnRhcmdldFN0YXRlICE9PSBudWxsKXtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCRyb290U2NvcGUudGFyZ2V0U3RhdGUpO1xuICAgICAgICAgICAgICAkcm9vdFNjb3BlLnRhcmdldFN0YXRlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAkc2NvcGUuZmxhZ0lucHV0RXJyb3JzKCk7XG4gICAgICAgICAgICAkc2NvcGUuc2hvd0FsZXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuXG5cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogJ2NvbXBvbmVudHMvbG9naW4tbW9kYWwvbG9naW4tbW9kYWwuaHRtbCdcbiAgfVxufSlcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdhcHBIZWFkZXInLCBmdW5jdGlvbigkc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSBcIm1lbnUtY2xvc2VkXCI7XG4gICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dpblwiO1xuXG4gICAgICAkc2NvcGUudG9nZ2xlTWVudSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID0gJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPT09IFwibWVudS1jbG9zZWRcIiA/IFwibWVudS1vcGVuXCIgOiBcIm1lbnUtY2xvc2VkXCI7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dpbi11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dvdXRcIjtcbiAgICAgIH0pO1xuXG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ291dC11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dpblwiO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5sb2dvdXRVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdXNlckZhY3RvcnkubG9nb3V0VXNlcigpLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaW5kZXgnKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLm9wZW5Mb2dpbk1vZGFsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbCwgYXR0cnMpe1xuICAgICAgJChlbCkuZmluZCgnLm1haW4tbmF2IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBzY29wZS50b2dnbGVNZW51KCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL25hdi9uYXYuaHRtbFwiXG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdzaWdudXAnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsICRzdGF0ZSwgJHJvb3RTY29wZSwgdXNlckZhY3RvcnksIGVtYWlsRmFjdG9yeSl7XG4gICAgICAvLyAkc2NvcGUuZ2VuZXJhbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLmVtYWlsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS5wYXNzd29yZEVycm9yID0gXCJcIjtcblxuICAgICAgJHNjb3BlLnZhbGlkYXRlRW1haWwgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgZW1haWwgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWVtYWlsJykpLnZhbCgpO1xuXG4gICAgICAgIGVtYWlsRmFjdG9yeS52YWxpZGF0ZUVtYWlsKGVtYWlsKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yID0gXCJcIjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvclRleHQgPSBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFkZHJlc3MuXCI7XG4gICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnNpZ251cFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlcm5hbWUsIGVtYWlsLCBwd2QsIGNvbmZpcm1Qd2Q7XG4gICAgICAgIHZhciB0ZXN0QXJyYXkgPSBbXTtcblxuICAgICAgICB1c2VybmFtZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIGVtYWlsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1lbWFpbCcpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1wYXNzd29yZCcpKS52YWwoKTtcbiAgICAgICAgY29uZmlybVB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItY29uZmlybS1wYXNzd29yZCcpKS52YWwoKTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgZW50cmllcyBleGlzdCBmb3IgYWxsIHRocmVlIHByaW1hcnkgZmllbGRzXG4gICAgICAgIGlmKHVzZXJuYW1lID09PSBcIlwiIHx8IGVtYWlsID09PSBcIlwiIHx8IHB3ZCA9PT0gXCJcIil7XG4gICAgICAgICAgJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHRlc3RBcnJheS5wdXNoKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUuZ2VuZXJhbEVycm9yID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwd2QgIT09IGNvbmZpcm1Qd2Qpe1xuICAgICAgICAgICRzY29wZS5wYXNzd29yZEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgdGVzdEFycmF5LnB1c2goZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5wYXNzd29yZEVycm9yID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRlc3RBcnJheS5sZW5ndGggPT09IDApe1xuICAgICAgICAgIHVzZXJGYWN0b3J5LnNpZ25VcCh1c2VybmFtZSwgZW1haWwsIHB3ZClcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ2luLXVwZGF0ZScpO1xuICAgICAgICAgICAgICAgICRzY29wZS5zaWdudXBTdWNjZXNzID0gXCJzaG93LWFsZXJ0XCI7XG5cbiAgICAgICAgICAgICAgICAvLyBsb2dpbiB0aGUgdXNlciBhZnRlciBhIHN1Y2Nlc3NmdWwgc2lnbnVwIGFuZCBuYXZpZ2F0ZSB0byBzdWJtaXQtcGl0Y2hcbiAgICAgICAgICAgICAgICB1c2VyRmFjdG9yeS5sb2dpblVzZXIodXNlcm5hbWUsIHB3ZClcbiAgICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdzdWJtaXQtcGl0Y2gnKTtcbiAgICAgICAgICAgICAgICAgICAgICB9LCA1NTApO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgc3dpdGNoKGVyci5lcnJvci5jb2RlKXtcbiAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yVGV4dCA9IFwiVGhlIHVzZXJuYW1lIGZpZWxkIGlzIGVtcHR5LlwiXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICBjYXNlIDIwMjpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3JUZXh0ID0gXCJUaGUgZGVzaXJlZCB1c2VybmFtZSBpcyBhbHJlYWR5IHRha2VuLlwiXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICBjYXNlIDIwMzpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3JUZXh0ID0gXCJBbiBhY2NvdW50IGhhcyBhbHJlYWR5IGJlZW4gY3JlYXRlZCBhdCBcIiArIGVtYWlsICsgXCIuXCI7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG5cbiAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmNhdWdodCBlcnJvcicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL3NpZ251cC9zaWdudXAuaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3VzZXJQaXRjaGVzJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcblxuICAgICAgJHNjb3BlLnBpdGNoZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiTm92ZW1iZXIgM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiUm9tYW50aWMgQ29tZWR5XCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgbWFuIGZhbGxzIGluIGxvdmUgd2l0aCBhIGxhZHksIGJ1dCBpdCdzIGZ1bm55LlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiT2N0b2JlciAyM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiSG9ycm9yXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgd29tYW4ga2VlcHMgY2hlY2tpbmcgaGVyIGZyaWRnZSwgYnV0IHRoZXJlJ3MgbmV2ZXIgYW55dGhpbmcgd29ydGggZWF0aW5nLlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0se1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJKdW5lIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIldlc3Rlcm5cIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiU29tZSBjb3dib3lzIHJpZGUgYXJvdW5kIGNoYXNpbmcgYSBnYW5nIG9mIHRoaWV2ZXNcIixcbiAgICAgICAgICBzdGF0dXM6IFwiYWNjZXB0ZWRcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy91c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdwaXRjaEJveCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkcSl7XG5cbiAgICAgIC8vIFBvcHVsYXRlIGFuIGFycmF5IG9mIGdlbnJlcywgYW5kIGNyZWF0ZSBzb21lIHZhcmlhYmxlc1xuICAgICAgLy8gZm9yIHRoZSBuZy1tb2RlbHMgdG8gYmluZCB0b1xuICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIGdlbnJlczogW1xuICAgICAgICAgIFwiU2VsZWN0IEdlbnJlXCIsXG4gICAgICAgICAgXCJBY3Rpb25cIixcbiAgICAgICAgICBcIkFkdmVudHVyZVwiLFxuICAgICAgICAgIFwiQW5pbWF0ZWRcIixcbiAgICAgICAgICBcIkNvbWVkeVwiLFxuICAgICAgICAgIFwiQ3JpbWVcIixcbiAgICAgICAgICBcIkRyYW1hXCIsXG4gICAgICAgICAgXCJGYW50YXN5XCIsXG4gICAgICAgICAgXCJIaXN0b3JpY2FsXCIsXG4gICAgICAgICAgXCJIaXN0b3JpY2FsIEZpY3Rpb25cIixcbiAgICAgICAgICBcIkhvcnJvclwiLFxuICAgICAgICAgIFwiS2lkc1wiLFxuICAgICAgICAgIFwiTXlzdGVyeVwiLFxuICAgICAgICAgIFwiUG9saXRpY2FsXCIsXG4gICAgICAgICAgXCJSZWxpZ2lvdXNcIixcbiAgICAgICAgICBcIlJvbWFuY2VcIixcbiAgICAgICAgICBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICAgIFwiU2F0aXJlXCIsXG4gICAgICAgICAgXCJTY2llbmNlIEZpY3Rpb25cIixcbiAgICAgICAgICBcIlRocmlsbGVyXCIsXG4gICAgICAgICAgXCJXZXN0ZXJuXCJcbiAgICAgICAgXSxcbiAgICAgICAgcGl0Y2hHZW5yZTogXCJTZWxlY3QgR2VucmVcIixcbiAgICAgICAgcGl0Y2hUZXh0OiBudWxsLFxuICAgICAgICB0ZXJtc0FncmVlOiBmYWxzZVxuICAgICAgfVxuXG4gICAgICAvLyBDYXJ2ZSBvdXQgYSBwbGFjZSBmb3Igc3RvcmluZyBhIHN1Ym1pdHRlZCBwaXRjaFxuICAgICAgJHNjb3BlLnBpdGNoID0gbnVsbDtcblxuICAgICAgLy8gU2V0IHRoaXMgcHJvcGVydHkgdG8gY29uZmlndXJlIGFsZXJ0IG1lc3NhZ2VzIGRpc3BsYXllZFxuICAgICAgLy8gb24gdmFsaWRhdGlvbiBmYWlsdXJlc1xuICAgICAgJHNjb3BlLnZhbGlkYXRpb25UZXh0ID0gbnVsbDtcblxuICAgICAgLy8gVmFsaWRhdGUgdGhlIGZvcm0gYmVmb3JlIGxhdW5jaGluZyB0aGUgcGF5bWVudCB3aW5kb3dcbiAgICAgIGZ1bmN0aW9uIHZhbGlkYXRlUGl0Y2goKXtcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBpZihcbiAgICAgICAgICAkc2NvcGUuZGF0YS50ZXJtc0FncmVlID09PSB0cnVlICYmXG4gICAgICAgICAgJHNjb3BlLmRhdGEucGl0Y2hUZXh0ICE9PSBcIlwiICYmXG4gICAgICAgICAgJHNjb3BlLmRhdGEucGl0Y2hUZXh0ICE9PSBudWxsICYmXG4gICAgICAgICAgJHNjb3BlLmRhdGEucGl0Y2hHZW5yZSAhPT0gXCJTZWxlY3QgR2VucmVcIiAmJlxuICAgICAgICAgICRzY29wZS5kYXRhLnBpdGNoR2VucmUgIT09IFwiXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgcGl0Y2ggOiB7XG4gICAgICAgICAgICAgIGdlbnJlOiAkc2NvcGUuZGF0YS5waXRjaEdlbnJlLFxuICAgICAgICAgICAgICBwaXRjaDogJHNjb3BlLmRhdGEucGl0Y2hUZXh0LFxuICAgICAgICAgICAgICBhcmVUZXJtc0FncmVlZDogJHNjb3BlLmRhdGEudGVybXNBZ3JlZSxcbiAgICAgICAgICAgICAgZGF0ZUFncmVlZDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgdG9rZW4gOiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgZm9ybSBkb2Vzbid0IHZhbGlkYXRlLCBkaXNwbGF5IGVycm9ycyBmb3Igd2hhdCBraW5kIG9mIGVycm9yXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmKCRzY29wZS5kYXRhLnBpdGNoVGV4dCA9PT0gXCJcIiB8fCAkc2NvcGUuZGF0YS5waXRjaFRleHQgPT09IG51bGwgJiYgJHNjb3BlLmRhdGEucGl0Y2hHZW5yZSA9PT0gXCJcIiB8fCAkc2NvcGUuZGF0YS5waXRjaEdlbnJlID09PSBcIlNlbGVjdCBHZW5yZVwiKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgICBzdGF0dXM6IFwiUGxlYXNlIGZpbGwgb3V0IHRoZSBwaXRjaCBmb3JtIGJlZm9yZSBzdWJtaXR0aW5nLlwiLFxuICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYoJHNjb3BlLmRhdGEudGVybXNBZ3JlZSA9PT0gZmFsc2Upe1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcIlBsZWFzZSBhY2NlcHQgdGhlIHRlcm1zIGluIG9yZGVyIHRvIGNvbnRpbnVlLlwiLFxuICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS5kYXRhLnBpdGNoVGV4dCA9PT0gXCJcIiB8fCAkc2NvcGUuZGF0YS5waXRjaFRleHQgPT09IG51bGwpe1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcIlJvYmVydCBpcyBnb29kLCBidXQgbm90IGdvb2QgZW5vdWdoIHRvIHNlbGwgYSBibGFuayBwaXRjaCFcIixcbiAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUuZGF0YS5waXRjaEdlbnJlID09PSBcIlwiIHx8ICRzY29wZS5kYXRhLnBpdGNoR2VucmUgPT09IFwiU2VsZWN0IEdlbnJlXCIpe1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcIldoYXQga2luZCBvZiBtb3ZpZSBpcyBpdD8gUGxlYXNlIHNlbGVjdCBhIGdlbnJlLlwiLFxuICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcIkFuIHVua25vd24gZXJyb3IgaGFzIG9jY3VycmVkLlwiLFxuICAgICAgICAgICAgICBkYXRhOiBudWxsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFJ1biB0aGUgaGFuZGxlciB3aGVuIHNvbWVvbmUgY2xpY2tzICdzdWJtaXQnXG4gICAgICAkc2NvcGUuc3VibWl0UGl0Y2ggPSBmdW5jdGlvbihldil7XG5cbiAgICAgICAgLy8gUnVuIHRoZSBmaWVsZHMgdGhyb3VnaCB0aGUgdmFsaWRhdG9yIGJlZm9yZSBhbnkgYWN0aW9uXG4gICAgICAgIHZhbGlkYXRlUGl0Y2goKS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIGVycm9yIG1lc3NhZ2VzXG4gICAgICAgICAgICAkc2NvcGUudmFsaWRhdGlvblRleHQgPSBcIlwiO1xuXG4gICAgICAgICAgICAvLyBTdG9yZSB0aGUgUGl0Y2ggRGF0YSBmb3IgZnV0dXJlIHVzZVxuICAgICAgICAgICAgJHNjb3BlLnBpdGNoID0gcmVzcC5waXRjaDtcblxuICAgICAgICAgICAgJHNjb3BlLmhhbmRsZXIub3Blbih7XG4gICAgICAgICAgICAgIG5hbWU6IFwiTW92aWVQaXRjaC5jb21cIixcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiUGl0Y2ggU3VibWlzc2lvblwiLFxuICAgICAgICAgICAgICBhbW91bnQ6IDIwMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgJHNjb3BlLnZhbGlkYXRpb25UZXh0ID0gZXJyLnN0YXR1cztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICApXG5cbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5wYXltZW50U3VjY2VzcyA9IGZ1bmN0aW9uKHRva2VuKXtcbiAgICAgICAgJHNjb3BlLnBpdGNoLnRva2VuID0gdG9rZW47XG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5waXRjaCk7XG5cblxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKiogVE8gRE8gKioqKioqKioqKioqKioqKioqKioqKlxuXG4gICAgICAgIC8vIFdyaXRlIHRoZSBwaXRjaCB0byB0aGUgYmFjay1lbmQgaGVyZSEhIVxuXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuaGFuZGxlciA9IFN0cmlwZUNoZWNrb3V0LmNvbmZpZ3VyZSh7XG4gICAgICAgIGtleTogJ3BrX3Rlc3RfWEhraHQwR01MUVBybjJzWUNYU0Z5NEZzJyxcbiAgICAgICAgLy8gaW1hZ2U6ICcvaW1nL2RvY3VtZW50YXRpb24vY2hlY2tvdXQvbWFya2V0cGxhY2UucG5nJyxcbiAgICAgICAgbG9jYWxlOiAnYXV0bycsXG4gICAgICAgIHRva2VuOiBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICAgIC8vIFVzZSB0aGUgdG9rZW4gdG8gY3JlYXRlIHRoZSBjaGFyZ2Ugd2l0aCBhIHNlcnZlci1zaWRlIHNjcmlwdC5cbiAgICAgICAgICAvLyBZb3UgY2FuIGFjY2VzcyB0aGUgdG9rZW4gSUQgd2l0aCBgdG9rZW4uaWRgXG5cbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKiBUTyBETyAqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgICAgICAgICAvLyBDb21wbGV0ZSB0aGUgdHJhbnNhY3Rpb24gdGhyb3VnaCB0aGUgYmFjay1lbmQgZGF0YSBzZXJ2aWNlc1xuICAgICAgICAgIC8vIFJldHVybiBhIHByb21pc2VcblxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuICAgICAgICAgICRzY29wZS5wYXltZW50U3VjY2Vzcyh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICBlbC5maW5kKCdzZWxlY3QnKS5vbignZm9jdXMnLCBmdW5jdGlvbigpe1xuICAgICAgICBjb25zdCBzZWxlY3RHZW5yZSA9IGVsLmZpbmQoJ29wdGlvbicpWzBdO1xuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoc2VsZWN0R2VucmUpLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCJcbiAgfVxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
