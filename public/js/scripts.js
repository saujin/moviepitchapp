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
      console.log(pitch);
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
          $scope.validationText = "";

          // Update the pitch object with the returned pitch
          $scope.pitch = resp.pitch;
          // console.log($scope.pitch);

          // Now that pitch is validated, trigger Stripe
          $scope.handler.open({
            name: "MoviePitch.com",
            description: "Pitch Submission",
            amount: 200
          });
        }, function (err) {
          $scope.validationText = err.msg;
          console.log(err);
        });

        ev.preventDefault();
      };

      $scope.paymentSuccess = function (token) {
        // Update the pitch object with the payment token
        $scope.pitch.token = token;
        console.log($scope.pitch);

        // **************************************************
        // ********************* TO DO **********************

        // Write the pitch to the back-end here!!!

        // **************************************************
        // **************************************************
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJwYXltZW50RmFjdG9yeS5qcyIsInBpdGNoRmFjdG9yeS5qcyIsInVzZXJGYWN0b3J5LmpzIiwiYWRtaW4tcGl0Y2gtcmV2aWV3L2FkbWluLXBpdGNoLXJldmlldy5qcyIsImNvbnRhY3QtdXMtZm9ybS9jb250YWN0LXVzLWZvcm0uanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmpzIiwibmF2L25hdi5qcyIsInNpZ251cC9zaWdudXAuanMiLCJ1c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmpzIiwiY2hlY2tvdXQvcGl0Y2gtYm94LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkIsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDN0IsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUvQixJQUFNLGVBQWUsR0FBRyxDQUN0QixXQUFXLENBQ1osQ0FBQzs7QUFFRixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FDakUsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQzdDLFVBQVMsY0FBYyxFQUFFLGtCQUFrQixFQUFDOztBQUUxQyxvQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDOzs7QUFBQyxBQUdsQyxnQkFBYyxDQUNYLEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDZCxPQUFHLEVBQUUsR0FBRztBQUNSLGVBQVcsRUFBRSxpQkFBaUI7QUFDOUIsUUFBSSxFQUFFO0FBQ0osa0JBQVksRUFBRSxLQUFLO0tBQ3BCO0dBQ0YsQ0FBQyxDQUNELEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDZCxPQUFHLEVBQUUsUUFB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QztPQUNyQixDQUFDOztBQUVGLFlBQU0sQ0FBQyxjQUFjLEdBQUcsVUFBUyxLQUFLLEVBQUM7O0FBRXJDLGNBQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUMzQixlQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Ozs7Ozs7OztBQUFDLE9BVzNCLENBQUM7S0FFSDtBQUNELFFBQUksRUFBRSxjQUFTLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFDO0FBQzlCLFFBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFVO0FBQ3RDLFlBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsZUFBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUN2QyxDQUFDLENBQUM7S0FDSjtBQUNELFlBQVEsRUFBRSxHQUFHO0FBQ2IsZUFBVyxFQUFFLG9DQUFvQztHQUNsRCxDQUFBO0NBQ0YsQ0FBQyxDQUFDIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxucmVxdWlyZSgnYW5ndWxhcicpO1xucmVxdWlyZSgnYW5ndWxhci11aS1yb3V0ZXInKTtcbmNvbnN0IFBhcnNlID0gcmVxdWlyZSgncGFyc2UnKTtcblxuY29uc3QgY29udHJvbGxlckFycmF5ID0gW1xuICBcInVpLnJvdXRlclwiXG5dO1xuXG5sZXQgbW92aWVQaXRjaEFwcCA9IGFuZ3VsYXIubW9kdWxlKFwibW92aWVQaXRjaEFwcFwiLCBjb250cm9sbGVyQXJyYXkpXG4gIC5jb25maWcoW1wiJHN0YXRlUHJvdmlkZXJcIiwgXCIkdXJsUm91dGVyUHJvdmlkZXJcIixcbiAgICBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcblxuICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgICAvLyBNYWluIE5hdlxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdpbmRleCcsIHtcbiAgICAgICAgICB1cmw6IFwiL1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2hvbWUuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgICAgICAgdXJsOiBcIi9hZG1pblwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2FkbWluLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAvLyBBY2NvdW50XG4gICAgICAvLyAkc3RhdGVQcm92aWRlclxuICAgICAgLy8gICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgLy8gICAgIHVybDogXCIvcmVnaXN0ZXJcIixcbiAgICAgIC8vICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9yZWdpc3Rlci5odG1sXCIsXG4gICAgICAvLyAgICAgZGF0YToge1xuICAgICAgLy8gICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfSlcbiAgICAgIC8vICAgLnN0YXRlKCdteS1hY2NvdW50Jywge1xuICAgICAgLy8gICAgIHVybDogXCIvbXktYWNjb3VudFwiLFxuICAgICAgLy8gICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL215LWFjY291bnQuaHRtbFwiLFxuICAgICAgLy8gICAgIGRhdGE6IHtcbiAgICAgIC8vICAgICAgIHJlcXVpcmVMb2dpbjogdHJ1ZVxuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfSk7XG5cblxuICAgICAgLy8gRm9vdGVyIE5hdlxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdmYXEnLCB7XG4gICAgICAgICAgdXJsOiBcIi9mYXFcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9mYXEuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgncHJlc3MnLCB7XG4gICAgICAgICAgdXJsOiBcIi9wcmVzc1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3ByZXNzLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2NvbnRhY3QtdXMnLCB7XG4gICAgICAgICAgdXJsOiBcIi9jb250YWN0LXVzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvY29udGFjdC11cy5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdsZWdhbCcsIHtcbiAgICAgICAgICB1cmw6IFwiL2xlZ2FsXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbGVnYWwuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuICBdKVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpe1xuICAgIFBhcnNlLmluaXRpYWxpemUoXCJQUjlXQkhFdmpTdVc5dXM4UTdTR2gyS1lSVlFhSExienRaanNoc2IxXCIsIFwibnl6N045c0dMVUlOMWhqTVk5Tk5RbmVFeHhQNVcwTUpoWEgzdTFRaFwiKTtcblxuICAgIC8vIE1ha2Ugc3VyZSBhIHVzZXIgaXMgbG9nZ2VkIG91dFxuICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSl7XG4gICAgICBsZXQgcmVxdWlyZUxvZ2luID0gdG9TdGF0ZS5kYXRhLnJlcXVpcmVMb2dpbjtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHRvU3RhdGUpO1xuXG4gICAgICBpZihyZXF1aXJlTG9naW4gPT09IHRydWUgJiYgJHJvb3RTY29wZS5jdXJVc2VyID09PSBudWxsKXtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgJHJvb3RTY29wZS50YXJnZXRTdGF0ZSA9IHRvU3RhdGUubmFtZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG4gIH0pO1xuIiwibW92aWVQaXRjaEFwcC5jb250cm9sbGVyKCdNYWluQ3RybCcsIFsnJHNjb3BlJyxcbiAgZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAvLyAkc2NvcGUuJG9uKCdsb2dpbi10cnVlJywgZnVuY3Rpb24oKXtcbiAgICAvLyAgICRzY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAvLyB9KVxuICB9XG5dKVxuIiwibW92aWVQaXRjaEFwcC5mYWN0b3J5KCdlbWFpbEZhY3RvcnknLCBmdW5jdGlvbigkcSl7XG4gIGxldCBzZW5kZ3JpZCA9IHJlcXVpcmUoJ3NlbmRncmlkJykoJ1NHLjJDU3F4OTlqUTItVXdVZjhCaVVVT1EuS2VLRWN2QTVxbldDQVdqSENyOEkwVEtoODhKQkY4TEtCcUh3TkhLRWw5bycpO1xuXG4gIGxldCBmYWN0b3J5ID0ge1xuXG4gICAgLy8gTW9jayB1cCBzZW5kaW5nIGEgY29udGFjdCBlbWFpbFxuICAgIC8vIGh0dHBzOi8vbm9kZW1haWxlci5jb20vXG4gICAgc2VuZENvbnRhY3RVc01lc3NhZ2U6IGZ1bmN0aW9uKG5hbWUsIGVtYWlsLCBzdWJqZWN0LCBtc2cpe1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgc3ViamVjdDogc3ViamVjdCxcbiAgICAgICAgbWVzc2FnZTogbXNnXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlRW1haWw6IGZ1bmN0aW9uKGVtYWlsKSB7XG4gICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBsZXQgcmVnID0gL14oW2EtekEtWjAtOV9cXC5cXC1dKStcXEAoKFthLXpBLVowLTlcXC1dKStcXC4pKyhbYS16QS1aMC05XXsyLDR9KSskLztcblxuICAgICAgaWYocmVnLnRlc3QoZW1haWwpKXtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGFyc2VGYWN0b3J5JywgZnVuY3Rpb24oJHEpIHtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgc3VibWl0UGl0Y2g6IGZ1bmN0aW9uKGdlbnJlLCB0ZXh0KSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIHVzZXIgaXMgbG9nZ2VkIGluIHRvIHN0b3JlIHRoZSBwaXRjaFxuICAgICAgaWYgKCRyb290U2NvcGUuY3VyVXNlciAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgUGl0Y2ggPSBQYXJzZS5PYmplY3QuZXh0ZW5kKFwiUGl0Y2hcIik7XG4gICAgICAgIHZhciBwaXRjaCA9IG5ldyBQaXRjaCgpO1xuXG4gICAgICAgIHBpdGNoLnNldChcImdlbnJlXCIsIGdlbnJlKTtcbiAgICAgICAgcGl0Y2guc2V0KFwicGl0Y2hcIiwgdGV4dCk7XG4gICAgICAgIC8vIHBpdGNoLnNldChcImNyZWF0ZXJcIiwgUGFyc2UuVXNlci5jdXJyZW50LnVzZXJuYW1lKVxuICAgICAgICBwaXRjaC5zZXQoXCJyZXZpZXdlZFwiLCBmYWxzZSlcblxuXG4gICAgICAgIHBpdGNoLnNhdmUobnVsbCwge1xuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHBpdGNoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgICAgZGF0YTogcGl0Y2hcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHBpdGNoLCBlcnJvcikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCIsXG4gICAgICAgICAgICAgIGRhdGE6IGVycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWplY3QgdGhlIHNhdmUgYXR0ZW1wdCBpZiBubyBjdXJyZW50IHVzZXJcbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIG5vdCBsb2dnZWQgaW5cIlxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGF5bWVudEZhY3RvcnknLCBmdW5jdGlvbigpe1xuICB2YXIgZmFjdG9yeSA9IHtcblxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5mYWN0b3J5KCdwaXRjaEZhY3RvcnknLCBmdW5jdGlvbigkcSwgJGh0dHApIHtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgc3VibWl0UGl0Y2g6IGZ1bmN0aW9uKHBpdGNoKSB7XG4gICAgICAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIHVybDogXCJodHRwczovL21vdmllcGl0Y2hhcGkuaGVyb2t1YXBwLmNvbS9waXRjaFwiLFxuICAgICAgICBkYXRhOiBwaXRjaFxuICAgICAgfSlcbiAgICB9LFxuICAgIHZhbGlkYXRlUGl0Y2g6IGZ1bmN0aW9uKHBpdGNoKXtcbiAgICAgIGNvbnNvbGUubG9nKHBpdGNoKTtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmKFxuICAgICAgICBwaXRjaC51c2VySGFzQWNjZXB0ZWRUZXJtcyA9PT0gdHJ1ZSAmJlxuICAgICAgICBwaXRjaC5waXRjaFRleHQgIT09IFwiXCIgJiZcbiAgICAgICAgcGl0Y2gucGl0Y2hUZXh0ICE9PSBudWxsICYmXG4gICAgICAgIHBpdGNoLmdlbnJlICE9PSBcIlNlbGVjdCBHZW5yZVwiICYmXG4gICAgICAgIHBpdGNoLmdlbnJlICE9PSBcIlwiXG4gICAgICApIHtcbiAgICAgICAgcGl0Y2guc3RhdHVzID0gXCJjcmVhdGVkXCI7XG4gICAgICAgIHBpdGNoLnVzZXJIYXNBY2NlcHRlZFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgcGl0Y2ggOiBwaXRjaFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZWxzZSBpZiAoXG4gICAgICAgIHBpdGNoLnBpdGNoVGV4dCA9PT0gXCJcIiB8fCBwaXRjaC5waXRjaFRleHQgPT09IG51bGwgJiZcbiAgICAgICAgcGl0Y2guZ2VucmUgPT09IFwiXCIgfHwgcGl0Y2guZ2VucmUgPT09IFwiU2VsZWN0IEdlbnJlXCIpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICBlcnJvckNvZGU6IDEwMDAsXG4gICAgICAgICAgICBtc2c6IFwiUGxlYXNlIGZpbGwgb3V0IHRoZSBwaXRjaCBmb3JtIGJlZm9yZSBzdWJtaXR0aW5nLlwiXG4gICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGVsc2UgaWYocGl0Y2gudXNlckhhc0FjY2VwdGVkVGVybXMgPT09IGZhbHNlKXtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBlcnJvckNvZGU6IDEwMDEsXG4gICAgICAgICAgbXNnOiBcIlBsZWFzZSBhY2NlcHQgdGhlIHRlcm1zIGluIG9yZGVyIHRvIGNvbnRpbnVlLlwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBlbHNlIGlmIChwaXRjaC5waXRjaFRleHQgPT09IFwiXCIgfHwgcGl0Y2gucGl0Y2hUZXh0ID09PSBudWxsKXtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBlcnJvckNvZGU6IDEwMDIsXG4gICAgICAgICAgbXNnOiBcIlJvYmVydCBpcyBnb29kLCBidXQgbm90IGdvb2QgZW5vdWdoIHRvIHNlbGwgYSBibGFuayBwaXRjaCFcIlxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZWxzZSBpZiAocGl0Y2guZ2VucmUgPT09IFwiXCIgfHwgcGl0Y2guZ2VucmUgPT09IFwiU2VsZWN0IEdlbnJlXCIpe1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIGVycm9yQ29kZTogMTAwMyxcbiAgICAgICAgICBtc2c6IFwiV2hhdCBraW5kIG9mIG1vdmllIGlzIGl0PyBQbGVhc2Ugc2VsZWN0IGEgZ2VucmUuXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIGVycm9yQ29kZTogOTk5OSxcbiAgICAgICAgICBtc2c6IFwiQW4gdW5rbm93biBlcnJvciBoYXMgb2NjdXJyZWQuXCIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgndXNlckZhY3RvcnknLCBmdW5jdGlvbigkcSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgY2hlY2tMb2dnZWRJbjogZnVuY3Rpb24oKXtcbiAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmKCRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcxJyk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAkbG9jYXRpb24udXJsKCcvbG9naW4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJzInKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIGxvZ2luVXNlcjogZnVuY3Rpb24odXNlcm5hbWUsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwd2QpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IHVzZXI7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YTogdXNlclxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICBsb2dvdXRVc2VyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAgIHZhciB1c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbiAgICAgIGlmKHVzZXIgPT09IG51bGwpe1xuICAgICAgICAvLyBSZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgJHJvb3RTY29wZVxuICAgICAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ291dC11cGRhdGUnKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBsb2dnZWQgb3V0XCJcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIHN0aWxsIGxvZ2dlZCBpblwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgc2lnblVwOiBmdW5jdGlvbih1c2VybmFtZSwgZW1haWwsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICB2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgICB1c2VyLnNldChcInVzZXJuYW1lXCIsIHVzZXJuYW1lKTtcbiAgICAgIHVzZXIuc2V0KFwiZW1haWxcIiwgZW1haWwpO1xuICAgICAgdXNlci5zZXQoXCJwYXNzd29yZFwiLCBwd2QpO1xuXG4gICAgICB1c2VyLnNpZ25VcChudWxsLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIGRhdGE6IHVzZXJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnIpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgICAgIGVycm9yOiBlcnJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FkbWluUGl0Y2hSZXZpZXcnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAkc2NvcGUucGl0Y2hlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJOb3ZlbWJlciAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJSb21hbnRpYyBDb21lZHlcIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiQSBtYW4gZmFsbHMgaW4gbG92ZSB3aXRoIGEgbGFkeSwgYnV0IGl0J3MgZnVubnkuXCIsXG4gICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJPY3RvYmVyIDIzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJIb3Jyb3JcIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiQSB3b21hbiBrZWVwcyBjaGVja2luZyBoZXIgZnJpZGdlLCBidXQgdGhlcmUncyBuZXZlciBhbnl0aGluZyB3b3J0aCBlYXRpbmcuXCIsXG4gICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCJcbiAgICAgICAgfSx7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIkp1bmUgM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiV2VzdGVyblwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJTb21lIGNvd2JveXMgcmlkZSBhcm91bmQgY2hhc2luZyBhIGdhbmcgb2YgdGhpZXZlc1wiLFxuICAgICAgICAgIHN0YXR1czogXCJhY2NlcHRlZFwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdjb250YWN0VXNGb3JtJywgZnVuY3Rpb24oZW1haWxGYWN0b3J5KXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgIGVtYWlsOiBudWxsLFxuICAgICAgICBtc2dTdWJqZWN0OiBcIkdlbmVyYWxcIixcbiAgICAgICAgbWVzc2FnZTogbnVsbCxcbiAgICAgICAgc3ViamVjdHM6IFtcbiAgICAgICAgICBcIkdlbmVyYWxcIixcbiAgICAgICAgICBcIkJpbGxpbmdcIixcbiAgICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgICAgXCJTdXBwb3J0XCJcbiAgICAgICAgXSxcblxuICAgICAgfVxuXG4gICAgICBsZXQgY2xlYXJFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJcIjtcbiAgICAgICAgJHNjb3BlLnN1Ym1pdFN1Y2Nlc3MgPSBcIlwiO1xuICAgICAgfTtcblxuICAgICAgbGV0IGNsZWFyRmllbGRzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmRhdGEubmFtZSA9IG51bGw7XG4gICAgICAgICRzY29wZS5kYXRhLmVtYWlsID0gbnVsbDtcbiAgICAgICAgJHNjb3BlLmRhdGEubWVzc2FnZSA9IG51bGw7XG4gICAgICAgICRzY29wZS5kYXRhLm1zZ1N1YmplY3QgPSBcIkdlbmVyYWxcIjtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5zdWJtaXRDb250YWN0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNsZWFyRXJyb3JzKCk7XG5cbiAgICAgICAgZW1haWxGYWN0b3J5LnZhbGlkYXRlRW1haWwoJHNjb3BlLmRhdGEuZW1haWwpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgIGlmKFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLm5hbWUgPT09IFwiXCIgfHxcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5uYW1lID09PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEuZW1haWwgPT09IFwiXCIgfHxcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5lbWFpbCA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLm1zZ1N1YmplY3QgPT09IFwiXCIgfHxcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5tc2dTdWJqZWN0ID09PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubWVzc2FnZSA9PT0gXCJcIiB8fFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLm1lc3NhZ2UgPT09IG51bGxcbiAgICAgICAgICAgICAgKXtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yVGV4dCA9IFwiUGxlYXNlIGZpbGwgb3V0IGVhY2ggZmllbGQgYmVmb3JlIHN1Ym1pdHRpbmcuXCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZW1haWxGYWN0b3J5XG4gICAgICAgICAgICAgICAgICAuc2VuZENvbnRhY3RVc01lc3NhZ2UoXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5tc2dTdWJqZWN0LFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5tZXNzYWdlXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgICAgICAgY2xlYXJFcnJvcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICBjbGVhckZpZWxkcygpO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdWJtaXRTdWNjZXNzID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN1Y2Nlc3NUZXh0ID0gXCJTdWNjZXNzISBZb3VyIG1lc3NhZ2UgaGFzIGJlZW4gc3VibWl0dGVkLlwiO1xuICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIkFuIGVycm9yIGhhcyBvY2N1cnJlZC4gWW91ciBtZXNzYWdlIHdhcyBub3Qgc2VudC5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgJHNjb3BlLmVycm9yVGV4dCA9IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwgYWRkcmVzcy5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL2NvbnRhY3QtdXMtZm9ybS9jb250YWN0LXVzLWZvcm0uaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2xvZ2luJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5sb2dpblVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlciwgcHdkO1xuXG4gICAgICAgIHVzZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItbG9naW4tdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1sb2dpbi1wd2QnKSkudmFsKCk7XG5cbiAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXIsIHB3ZClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9O1xuXG5cbiAgICAgICRzY29wZS5sb2dvdXRVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdXNlckZhY3RvcnkubG9nb3V0VXNlcigpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvbG9naW4vbG9naW4uaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2xvZ2luTW9kYWwnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJcIjtcblxuICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcIlwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuZmxhZ0lucHV0RXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJpcy1lcnJvclwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1oaWRkZW5cIjtcbiAgICAgICRzY29wZS5oaWRlQWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LWhpZGRlblwifTtcbiAgICAgICRzY29wZS5zaG93QWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LXNob3duXCJ9O1xuXG4gICAgICAkc2NvcGUuY2xlYXJGb3JtcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBtb2RhbCA9ICQoJyNsb2dpbi1tb2RhbCcpO1xuXG4gICAgICAgIC8vIENsZWFyIEV4aXN0aW5nIElucHV0c1xuICAgICAgICBtb2RhbC5maW5kKCdpbnB1dCcpLnZhbCgnJyk7XG5cbiAgICAgICAgLy8gUmVzZXQgRXJyb3IgTm90aWZpY2F0aW9uc1xuICAgICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUudXNlckxvZ2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcbiAgICAgICAgdmFyIG1vZGFsID0gJCgnI2xvZ2luLW1vZGFsJyk7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tcGFzc3dvcmQnKSkudmFsKCk7XG5cbiAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXIsIHB3ZCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgICAgICAgJHNjb3BlLmNsZWFyRm9ybXMoKTtcbiAgICAgICAgICAgICRzY29wZS5oaWRlQWxlcnQoKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlICRyb290U2NvcGUgaXMgaW4gdGhlIHByb2Nlc3Mgb2YgbmF2aWdhdGluZyB0byBhIHN0YXRlLFxuICAgICAgICAgICAgLy8gYXMgaW4gYW4gZXZlbnQgd2hlcmUgbG9naW4gaW50ZXJydXB0cyBuYXZpZ2F0aW9uIHRvIGEgcmVzdHJpY3RlZCBwYWdlXG4gICAgICAgICAgICAvLyBjb250aW51ZSB0byB0aGF0IHN0YXRlLCBvdGhlcndpc2UgY2xlYXIgdGhlICRyb290U2NvcGUudGFyZ2V0U3RhdGVcbiAgICAgICAgICAgIGlmKCRyb290U2NvcGUudGFyZ2V0U3RhdGUgIT09IG51bGwpe1xuICAgICAgICAgICAgICAkc3RhdGUuZ28oJHJvb3RTY29wZS50YXJnZXRTdGF0ZSk7XG4gICAgICAgICAgICAgICRyb290U2NvcGUudGFyZ2V0U3RhdGUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICRzY29wZS5mbGFnSW5wdXRFcnJvcnMoKTtcbiAgICAgICAgICAgICRzY29wZS5zaG93QWxlcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG5cblxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiAnY29tcG9uZW50cy9sb2dpbi1tb2RhbC9sb2dpbi1tb2RhbC5odG1sJ1xuICB9XG59KVxuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FwcEhlYWRlcicsIGZ1bmN0aW9uKCRzdGF0ZSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9IFwibWVudS1jbG9zZWRcIjtcbiAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ2luXCI7XG5cbiAgICAgICRzY29wZS50b2dnbGVNZW51ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9PT0gXCJtZW51LWNsb3NlZFwiID8gXCJtZW51LW9wZW5cIiA6IFwibWVudS1jbG9zZWRcIjtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ2luLXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ291dFwiO1xuICAgICAgfSk7XG5cblxuICAgICAgJHNjb3BlLiRvbignbG9nb3V0LXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ2luXCI7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLmxvZ291dFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB1c2VyRmFjdG9yeS5sb2dvdXRVc2VyKCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdpbmRleCcpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUub3BlbkxvZ2luTW9kYWwgPSBmdW5jdGlvbigpe1xuICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICAkKGVsKS5maW5kKCcubWFpbi1uYXYgYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLnRvZ2dsZU1lbnUoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvbmF2L25hdi5odG1sXCJcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3NpZ251cCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgJHN0YXRlLCAkcm9vdFNjb3BlLCB1c2VyRmFjdG9yeSwgZW1haWxGYWN0b3J5KXtcbiAgICAgIC8vICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS51c2VybmFtZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcIlwiO1xuXG4gICAgICAkc2NvcGUudmFsaWRhdGVFbWFpbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItZW1haWwnKSkudmFsKCk7XG5cbiAgICAgICAgZW1haWxGYWN0b3J5LnZhbGlkYXRlRW1haWwoZW1haWwpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcIlwiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yVGV4dCA9IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwgYWRkcmVzcy5cIjtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuc2lnbnVwVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VybmFtZSwgZW1haWwsIHB3ZCwgY29uZmlybVB3ZDtcbiAgICAgICAgdmFyIHRlc3RBcnJheSA9IFtdO1xuXG4gICAgICAgIHVzZXJuYW1lID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgZW1haWwgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWVtYWlsJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXBhc3N3b3JkJykpLnZhbCgpO1xuICAgICAgICBjb25maXJtUHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1jb25maXJtLXBhc3N3b3JkJykpLnZhbCgpO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSBlbnRyaWVzIGV4aXN0IGZvciBhbGwgdGhyZWUgcHJpbWFyeSBmaWVsZHNcbiAgICAgICAgaWYodXNlcm5hbWUgPT09IFwiXCIgfHwgZW1haWwgPT09IFwiXCIgfHwgcHdkID09PSBcIlwiKXtcbiAgICAgICAgICAkc2NvcGUuZ2VuZXJhbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgdGVzdEFycmF5LnB1c2goZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHB3ZCAhPT0gY29uZmlybVB3ZCl7XG4gICAgICAgICAgJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICB0ZXN0QXJyYXkucHVzaChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGVzdEFycmF5Lmxlbmd0aCA9PT0gMCl7XG4gICAgICAgICAgdXNlckZhY3Rvcnkuc2lnblVwKHVzZXJuYW1lLCBlbWFpbCwgcHdkKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnNpZ251cFN1Y2Nlc3MgPSBcInNob3ctYWxlcnRcIjtcblxuICAgICAgICAgICAgICAgIC8vIGxvZ2luIHRoZSB1c2VyIGFmdGVyIGEgc3VjY2Vzc2Z1bCBzaWdudXAgYW5kIG5hdmlnYXRlIHRvIHN1Ym1pdC1waXRjaFxuICAgICAgICAgICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VybmFtZSwgcHdkKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3N1Ym1pdC1waXRjaCcpO1xuICAgICAgICAgICAgICAgICAgICAgIH0sIDU1MCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICBzd2l0Y2goZXJyLmVycm9yLmNvZGUpe1xuICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3JUZXh0ID0gXCJUaGUgdXNlcm5hbWUgZmllbGQgaXMgZW1wdHkuXCJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIGNhc2UgMjAyOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvclRleHQgPSBcIlRoZSBkZXNpcmVkIHVzZXJuYW1lIGlzIGFscmVhZHkgdGFrZW4uXCJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIGNhc2UgMjAzOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvclRleHQgPSBcIkFuIGFjY291bnQgaGFzIGFscmVhZHkgYmVlbiBjcmVhdGVkIGF0IFwiICsgZW1haWwgKyBcIi5cIjtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcblxuICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VuY2F1Z2h0IGVycm9yJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvc2lnbnVwL3NpZ251cC5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgndXNlclBpdGNoZXMnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuXG4gICAgICAkc2NvcGUucGl0Y2hlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJOb3ZlbWJlciAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJSb21hbnRpYyBDb21lZHlcIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiQSBtYW4gZmFsbHMgaW4gbG92ZSB3aXRoIGEgbGFkeSwgYnV0IGl0J3MgZnVubnkuXCIsXG4gICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJPY3RvYmVyIDIzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJIb3Jyb3JcIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiQSB3b21hbiBrZWVwcyBjaGVja2luZyBoZXIgZnJpZGdlLCBidXQgdGhlcmUncyBuZXZlciBhbnl0aGluZyB3b3J0aCBlYXRpbmcuXCIsXG4gICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCJcbiAgICAgICAgfSx7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIkp1bmUgM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiV2VzdGVyblwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJTb21lIGNvd2JveXMgcmlkZSBhcm91bmQgY2hhc2luZyBhIGdhbmcgb2YgdGhpZXZlc1wiLFxuICAgICAgICAgIHN0YXR1czogXCJhY2NlcHRlZFwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL3VzZXItcGl0Y2hlcy91c2VyLXBpdGNoZXMuaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3BpdGNoQm94JywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICRxLCAkaHR0cCwgcGF5bWVudEZhY3RvcnksIHBpdGNoRmFjdG9yeSl7XG5cbiAgICAgIC8vIFBvcHVsYXRlIGFuIGFycmF5IG9mIGdlbnJlcywgYW5kIGNyZWF0ZSBzb21lIHZhcmlhYmxlc1xuICAgICAgLy8gZm9yIHRoZSBuZy1tb2RlbHMgdG8gYmluZCB0b1xuICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIGdlbnJlczogW1xuICAgICAgICAgIFwiU2VsZWN0IEdlbnJlXCIsXG4gICAgICAgICAgXCJBY3Rpb25cIixcbiAgICAgICAgICBcIkFkdmVudHVyZVwiLFxuICAgICAgICAgIFwiQW5pbWF0ZWRcIixcbiAgICAgICAgICBcIkNvbWVkeVwiLFxuICAgICAgICAgIFwiQ3JpbWVcIixcbiAgICAgICAgICBcIkRyYW1hXCIsXG4gICAgICAgICAgXCJGYW50YXN5XCIsXG4gICAgICAgICAgXCJIaXN0b3JpY2FsXCIsXG4gICAgICAgICAgXCJIaXN0b3JpY2FsIEZpY3Rpb25cIixcbiAgICAgICAgICBcIkhvcnJvclwiLFxuICAgICAgICAgIFwiS2lkc1wiLFxuICAgICAgICAgIFwiTXlzdGVyeVwiLFxuICAgICAgICAgIFwiUG9saXRpY2FsXCIsXG4gICAgICAgICAgXCJSZWxpZ2lvdXNcIixcbiAgICAgICAgICBcIlJvbWFuY2VcIixcbiAgICAgICAgICBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICAgIFwiU2F0aXJlXCIsXG4gICAgICAgICAgXCJTY2llbmNlIEZpY3Rpb25cIixcbiAgICAgICAgICBcIlRocmlsbGVyXCIsXG4gICAgICAgICAgXCJXZXN0ZXJuXCJcbiAgICAgICAgXSxcbiAgICAgICAgcGl0Y2hHZW5yZTogXCJTZWxlY3QgR2VucmVcIixcbiAgICAgICAgcGl0Y2hUZXh0OiBudWxsLFxuICAgICAgICB0ZXJtc0FncmVlOiBmYWxzZVxuICAgICAgfVxuXG4gICAgICAvLyBDYXJ2ZSBvdXQgYSBwbGFjZSBmb3Igc3RvcmluZyBhIHN1Ym1pdHRlZCBwaXRjaFxuICAgICAgJHNjb3BlLnBpdGNoID0gbnVsbDtcblxuICAgICAgLy8gU2V0IHRoaXMgcHJvcGVydHkgdG8gY29uZmlndXJlIGFsZXJ0IG1lc3NhZ2VzIGRpc3BsYXllZFxuICAgICAgLy8gb24gdmFsaWRhdGlvbiBmYWlsdXJlc1xuICAgICAgJHNjb3BlLnZhbGlkYXRpb25UZXh0ID0gbnVsbDtcblxuICAgICAgLy8gVGhlIEhhbmRsZXIgaGFzIHNvbWUgYmFzaWMgU3RyaXBlIGNvbmZpZyBhbmQgdGhlbiBjYWxscyB0aGUgcGF5bWVudFxuICAgICAgLy8gc3VjY2VzcyBmdW5jdGlvblxuICAgICAgJHNjb3BlLmhhbmRsZXIgPSBTdHJpcGVDaGVja291dC5jb25maWd1cmUoe1xuICAgICAgICBrZXk6ICdwa190ZXN0X1hIa2h0MEdNTFFQcm4yc1lDWFNGeTRGcycsXG4gICAgICAgIC8vIGltYWdlOiAnL2ltZy9kb2N1bWVudGF0aW9uL2NoZWNrb3V0L21hcmtldHBsYWNlLnBuZycsXG4gICAgICAgIGxvY2FsZTogJ2F1dG8nLFxuICAgICAgICB0b2tlbjogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgICAkc2NvcGUucGF5bWVudFN1Y2Nlc3ModG9rZW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gUnVuIHRoZSBoYW5kbGVyIHdoZW4gc29tZW9uZSBjbGlja3MgJ3N1Ym1pdCdcbiAgICAgICRzY29wZS5zdWJtaXRQaXRjaCA9IGZ1bmN0aW9uKGV2KXtcblxuICAgICAgICAvLyBDcmVhdGUgYSBwaXRjaCBvYmplY3QgZm9yIHZhbGlkYXRpb25cbiAgICAgICAgJHNjb3BlLnBpdGNoID0ge1xuICAgICAgICAgIGdlbnJlOiAkc2NvcGUuZGF0YS5waXRjaEdlbnJlLFxuICAgICAgICAgIHBpdGNoVGV4dDogJHNjb3BlLmRhdGEucGl0Y2hUZXh0LFxuICAgICAgICAgIHVzZXJIYXNBY2NlcHRlZFRlcm1zOiAkc2NvcGUuZGF0YS50ZXJtc0FncmVlXG4gICAgICAgIH07XG5cbiAgICAgICAgcGl0Y2hGYWN0b3J5XG4gICAgICAgICAgLnZhbGlkYXRlUGl0Y2goJHNjb3BlLnBpdGNoKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAgICAgICAkc2NvcGUudmFsaWRhdGlvblRleHQgPSBcIlwiO1xuXG4gICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcGl0Y2ggb2JqZWN0IHdpdGggdGhlIHJldHVybmVkIHBpdGNoXG4gICAgICAgICAgICAgICRzY29wZS5waXRjaCA9IHJlc3AucGl0Y2g7XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCRzY29wZS5waXRjaCk7XG5cbiAgICAgICAgICAgICAgLy8gTm93IHRoYXQgcGl0Y2ggaXMgdmFsaWRhdGVkLCB0cmlnZ2VyIFN0cmlwZVxuICAgICAgICAgICAgICAkc2NvcGUuaGFuZGxlci5vcGVuKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIk1vdmllUGl0Y2guY29tXCIsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiUGl0Y2ggU3VibWlzc2lvblwiLFxuICAgICAgICAgICAgICAgIGFtb3VudDogMjAwXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAkc2NvcGUudmFsaWRhdGlvblRleHQgPSBlcnIubXNnO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5wYXltZW50U3VjY2VzcyA9IGZ1bmN0aW9uKHRva2VuKXtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBwaXRjaCBvYmplY3Qgd2l0aCB0aGUgcGF5bWVudCB0b2tlblxuICAgICAgICAkc2NvcGUucGl0Y2gudG9rZW4gPSB0b2tlbjtcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnBpdGNoKTtcblxuXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKiBUTyBETyAqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgICAgICAgLy8gV3JpdGUgdGhlIHBpdGNoIHRvIHRoZSBiYWNrLWVuZCBoZXJlISEhXG5cblxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgfTtcblxuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICBlbC5maW5kKCdzZWxlY3QnKS5vbignZm9jdXMnLCBmdW5jdGlvbigpe1xuICAgICAgICBjb25zdCBzZWxlY3RHZW5yZSA9IGVsLmZpbmQoJ29wdGlvbicpWzBdO1xuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoc2VsZWN0R2VucmUpLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9jaGVja291dC9waXRjaC1ib3guaHRtbFwiXG4gIH1cbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
