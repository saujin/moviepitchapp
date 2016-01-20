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
  // .state('our-team', {
  //   url: "/our-team",
  //   templateUrl: "views/our-team.html",
  //   data: {
  //     requireLogin: false
  //   }
  // })
  // .state('success-stories', {
  //   url: "/success-stories",
  //   templateUrl: "views/success-stories.html",
  //   data: {
  //     requireLogin: false
  //   }
  // })
  // .state('submit-pitch', {
  //   url: "/submit-pitch",
  //   templateUrl: "views/submit-pitch.html",
  //   data: {
  //     requireLogin: true
  //   }
  // });

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
            if ($scope.data.termsAgree === false) {
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
// moviePitchApp.directive('selectGenre', function(){
//   return {
//     controller: function($scope){
//
//     },
//     link: function(scope, el, attrs){
//      
//
//     },
//     scope: true,
//     restrict: "A"
//   }
// });
"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJwYXltZW50RmFjdG9yeS5qcyIsInVzZXJGYWN0b3J5LmpzIiwiYWN0aW9uLWJ1dHRvbi9hY3Rpb24tYnV0dG9uLmpzIiwiY2hlY2tvdXQvcGl0Y2gtYm94LmpzIiwiY29udGFjdC11cy1mb3JtL2NvbnRhY3QtdXMtZm9ybS5qcyIsImxvZ2luL2xvZ2luLmpzIiwibG9naW4tbW9kYWwvbG9naW4tbW9kYWwuanMiLCJhZG1pbi1waXRjaC1yZXZpZXcvYWRtaW4tcGl0Y2gtcmV2aWV3LmpzIiwibmF2L25hdi5qcyIsInNlbGVjdC1nZW5yZS9zZWxlY3QtZ2VucmUuanMiLCJzaWdudXAvc2lnbnVwLmpzIiwic3VibWl0UGl0Y2gvc3VibWl0UGl0Y2guanMiLCJ1c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkIsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDN0IsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUvQixJQUFNLGVBQWUsR0FBRyxDQUN0QixXQUFXLENBQ1osQ0FBQzs7QUFFRixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FDakUsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQzdDLFVBQVMsY0FBYyxFQUFFLGtCQUFrQixFQUFDOztBQUUxQyxvQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDOzs7QUFBQyxBQUdsQyxnQkFBYyxDQUNYLEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDZCxPQUFHLEVBQUUsR0FBRztBQUNSLGVBQVcsRUFBRSxpQkFBaUI7QUFDOUIsUUFBSSxFQUFFO0FBQ0os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Q0FBQyIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnJlcXVpcmUoJ2FuZ3VsYXInKTtcbnJlcXVpcmUoJ2FuZ3VsYXItdWktcm91dGVyJyk7XG5jb25zdCBQYXJzZSA9IHJlcXVpcmUoJ3BhcnNlJyk7XG5cbmNvbnN0IGNvbnRyb2xsZXJBcnJheSA9IFtcbiAgXCJ1aS5yb3V0ZXJcIlxuXTtcblxubGV0IG1vdmllUGl0Y2hBcHAgPSBhbmd1bGFyLm1vZHVsZShcIm1vdmllUGl0Y2hBcHBcIiwgY29udHJvbGxlckFycmF5KVxuICAuY29uZmlnKFtcIiRzdGF0ZVByb3ZpZGVyXCIsIFwiJHVybFJvdXRlclByb3ZpZGVyXCIsXG4gICAgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcil7XG5cbiAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICAgLy8gTWFpbiBOYXZcbiAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnaW5kZXgnLCB7XG4gICAgICAgICAgdXJsOiBcIi9cIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9ob21lLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluJywge1xuICAgICAgICAgIHVybDogXCIvYWRtaW5cIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9hZG1pbi5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gLnN0YXRlKCdvdXItdGVhbScsIHtcbiAgICAgICAgLy8gICB1cmw6IFwiL291ci10ZWFtXCIsXG4gICAgICAgIC8vICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvb3VyLXRlYW0uaHRtbFwiLFxuICAgICAgICAvLyAgIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH0pXG4gICAgICAgIC8vIC5zdGF0ZSgnc3VjY2Vzcy1zdG9yaWVzJywge1xuICAgICAgICAvLyAgIHVybDogXCIvc3VjY2Vzcy1zdG9yaWVzXCIsXG4gICAgICAgIC8vICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvc3VjY2Vzcy1zdG9yaWVzLmh0bWxcIixcbiAgICAgICAgLy8gICBkYXRhOiB7XG4gICAgICAgIC8vICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyB9KVxuICAgICAgICAvLyAuc3RhdGUoJ3N1Ym1pdC1waXRjaCcsIHtcbiAgICAgICAgLy8gICB1cmw6IFwiL3N1Ym1pdC1waXRjaFwiLFxuICAgICAgICAvLyAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3N1Ym1pdC1waXRjaC5odG1sXCIsXG4gICAgICAgIC8vICAgZGF0YToge1xuICAgICAgICAvLyAgICAgcmVxdWlyZUxvZ2luOiB0cnVlXG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyB9KTtcblxuICAgICAgLy8gQWNjb3VudFxuICAgICAgLy8gJHN0YXRlUHJvdmlkZXJcbiAgICAgIC8vICAgLnN0YXRlKCdyZWdpc3RlcicsIHtcbiAgICAgIC8vICAgICB1cmw6IFwiL3JlZ2lzdGVyXCIsXG4gICAgICAvLyAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvcmVnaXN0ZXIuaHRtbFwiLFxuICAgICAgLy8gICAgIGRhdGE6IHtcbiAgICAgIC8vICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgIC8vICAgICB9XG4gICAgICAvLyAgIH0pXG4gICAgICAvLyAgIC5zdGF0ZSgnbXktYWNjb3VudCcsIHtcbiAgICAgIC8vICAgICB1cmw6IFwiL215LWFjY291bnRcIixcbiAgICAgIC8vICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9teS1hY2NvdW50Lmh0bWxcIixcbiAgICAgIC8vICAgICBkYXRhOiB7XG4gICAgICAvLyAgICAgICByZXF1aXJlTG9naW46IHRydWVcbiAgICAgIC8vICAgICB9XG4gICAgICAvLyAgIH0pO1xuXG5cbiAgICAgIC8vIEZvb3RlciBOYXZcbiAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnZmFxJywge1xuICAgICAgICAgIHVybDogXCIvZmFxXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvZmFxLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3ByZXNzJywge1xuICAgICAgICAgIHVybDogXCIvcHJlc3NcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9wcmVzcy5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdjb250YWN0LXVzJywge1xuICAgICAgICAgIHVybDogXCIvY29udGFjdC11c1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2NvbnRhY3QtdXMuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnbGVnYWwnLCB7XG4gICAgICAgICAgdXJsOiBcIi9sZWdhbFwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2xlZ2FsLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cbiAgXSlcbiAgLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKXtcbiAgICBQYXJzZS5pbml0aWFsaXplKFwiUFI5V0JIRXZqU3VXOXVzOFE3U0doMktZUlZRYUhMYnp0WmpzaHNiMVwiLCBcIm55ejdOOXNHTFVJTjFoak1ZOU5OUW5lRXh4UDVXME1KaFhIM3UxUWhcIik7XG5cbiAgICAvLyBNYWtlIHN1cmUgYSB1c2VyIGlzIGxvZ2dlZCBvdXRcbiAgICBQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUpe1xuICAgICAgbGV0IHJlcXVpcmVMb2dpbiA9IHRvU3RhdGUuZGF0YS5yZXF1aXJlTG9naW47XG4gICAgICAvLyBjb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyh0b1N0YXRlKTtcblxuICAgICAgaWYocmVxdWlyZUxvZ2luID09PSB0cnVlICYmICRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICRyb290U2NvcGUudGFyZ2V0U3RhdGUgPSB0b1N0YXRlLm5hbWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICB9KTtcbiIsIm1vdmllUGl0Y2hBcHAuY29udHJvbGxlcignTWFpbkN0cmwnLCBbJyRzY29wZScsXG4gIGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgLy8gJHNjb3BlLiRvbignbG9naW4tdHJ1ZScsIGZ1bmN0aW9uKCl7XG4gICAgLy8gICAkc2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgLy8gfSlcbiAgfVxuXSlcbiIsIm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgnZW1haWxGYWN0b3J5JywgZnVuY3Rpb24oJHEpe1xuICBsZXQgc2VuZGdyaWQgPSByZXF1aXJlKCdzZW5kZ3JpZCcpKCdTRy4yQ1NxeDk5alEyLVV3VWY4QmlVVU9RLktlS0VjdkE1cW5XQ0FXakhDcjhJMFRLaDg4SkJGOExLQnFId05IS0VsOW8nKTtcblxuICBsZXQgZmFjdG9yeSA9IHtcblxuICAgIC8vIE1vY2sgdXAgc2VuZGluZyBhIGNvbnRhY3QgZW1haWxcbiAgICAvLyBodHRwczovL25vZGVtYWlsZXIuY29tL1xuICAgIHNlbmRDb250YWN0VXNNZXNzYWdlOiBmdW5jdGlvbihuYW1lLCBlbWFpbCwgc3ViamVjdCwgbXNnKXtcbiAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgIHN1YmplY3Q6IHN1YmplY3QsXG4gICAgICAgIG1lc3NhZ2U6IG1zZ1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICB2YWxpZGF0ZUVtYWlsOiBmdW5jdGlvbihlbWFpbCkge1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgbGV0IHJlZyA9IC9eKFthLXpBLVowLTlfXFwuXFwtXSkrXFxAKChbYS16QS1aMC05XFwtXSkrXFwuKSsoW2EtekEtWjAtOV17Miw0fSkrJC87XG5cbiAgICAgIGlmKHJlZy50ZXN0KGVtYWlsKSl7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BhcnNlRmFjdG9yeScsIGZ1bmN0aW9uKCRxKSB7XG4gIHZhciBmYWN0b3J5ID0ge1xuICAgIHN1Ym1pdFBpdGNoOiBmdW5jdGlvbihnZW5yZSwgdGV4dCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbiB0byBzdG9yZSB0aGUgcGl0Y2hcbiAgICAgIGlmICgkcm9vdFNjb3BlLmN1clVzZXIgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIFBpdGNoID0gUGFyc2UuT2JqZWN0LmV4dGVuZChcIlBpdGNoXCIpO1xuICAgICAgICB2YXIgcGl0Y2ggPSBuZXcgUGl0Y2goKTtcblxuICAgICAgICBwaXRjaC5zZXQoXCJnZW5yZVwiLCBnZW5yZSk7XG4gICAgICAgIHBpdGNoLnNldChcInBpdGNoXCIsIHRleHQpO1xuICAgICAgICAvLyBwaXRjaC5zZXQoXCJjcmVhdGVyXCIsIFBhcnNlLlVzZXIuY3VycmVudC51c2VybmFtZSlcbiAgICAgICAgcGl0Y2guc2V0KFwicmV2aWV3ZWRcIiwgZmFsc2UpXG5cblxuICAgICAgICBwaXRjaC5zYXZlKG51bGwsIHtcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihwaXRjaCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICAgIGRhdGE6IHBpdGNoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihwaXRjaCwgZXJyb3IpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgICAgICBkYXRhOiBlcnJvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVqZWN0IHRoZSBzYXZlIGF0dGVtcHQgaWYgbm8gY3VycmVudCB1c2VyXG4gICAgICBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBub3QgbG9nZ2VkIGluXCJcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BheW1lbnRGYWN0b3J5JywgZnVuY3Rpb24oKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG5cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgndXNlckZhY3RvcnknLCBmdW5jdGlvbigkcSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgY2hlY2tMb2dnZWRJbjogZnVuY3Rpb24oKXtcbiAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmKCRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcxJyk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAkbG9jYXRpb24udXJsKCcvbG9naW4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJzInKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIGxvZ2luVXNlcjogZnVuY3Rpb24odXNlcm5hbWUsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwd2QpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IHVzZXI7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YTogdXNlclxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICBsb2dvdXRVc2VyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAgIHZhciB1c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbiAgICAgIGlmKHVzZXIgPT09IG51bGwpe1xuICAgICAgICAvLyBSZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgJHJvb3RTY29wZVxuICAgICAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ291dC11cGRhdGUnKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBsb2dnZWQgb3V0XCJcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIHN0aWxsIGxvZ2dlZCBpblwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgc2lnblVwOiBmdW5jdGlvbih1c2VybmFtZSwgZW1haWwsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICB2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgICB1c2VyLnNldChcInVzZXJuYW1lXCIsIHVzZXJuYW1lKTtcbiAgICAgIHVzZXIuc2V0KFwiZW1haWxcIiwgZW1haWwpO1xuICAgICAgdXNlci5zZXQoXCJwYXNzd29yZFwiLCBwd2QpO1xuXG4gICAgICB1c2VyLnNpZ25VcChudWxsLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIGRhdGE6IHVzZXJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnIpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgICAgIGVycm9yOiBlcnJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FjdGlvbkJ1dHRvbicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGUpe1xuXG4gICAgICAkc2NvcGUudXBkYXRlID0gZnVuY3Rpb24oKXtcblxuICAgICAgICBpZigkcm9vdFNjb3BlLmN1clVzZXIgPT09IG51bGwpe1xuICAgICAgICAgICRzY29wZS50YXJnZXQgPSBcInJlZ2lzdGVyXCI7XG4gICAgICAgICAgJHNjb3BlLmFjdGlvblRleHQgPSBcIlJlZ2lzdGVyIFRvIFN0YXJ0IFBpdGNoaW5nIVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5hY3Rpb25UZXh0ID0gXCJTdWJtaXQgYSBQaXRjaCFcIjtcbiAgICAgICAgICAkc2NvcGUudGFyZ2V0ID0gXCJzdWJtaXQtcGl0Y2hcIjtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgJHNjb3BlLm5hdmlnYXRlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHN0YXRlLmdvKCRzY29wZS50YXJnZXQpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLiRvbignbG9naW4tdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLnVwZGF0ZSgpO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ291dC11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUudXBkYXRlKCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbCwgYXR0cnMpe1xuICAgICAgc2NvcGUudXBkYXRlKCk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCJcbiAgfVxufSlcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdwaXRjaEJveCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkcSl7XG5cbiAgICAgIC8vIFBvcHVsYXRlIGFuIGFycmF5IG9mIGdlbnJlcywgYW5kIGNyZWF0ZSBzb21lIHZhcmlhYmxlc1xuICAgICAgLy8gZm9yIHRoZSBuZy1tb2RlbHMgdG8gYmluZCB0b1xuICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIGdlbnJlczogW1xuICAgICAgICAgIFwiU2VsZWN0IEdlbnJlXCIsXG4gICAgICAgICAgXCJBY3Rpb25cIixcbiAgICAgICAgICBcIkFkdmVudHVyZVwiLFxuICAgICAgICAgIFwiQW5pbWF0ZWRcIixcbiAgICAgICAgICBcIkNvbWVkeVwiLFxuICAgICAgICAgIFwiQ3JpbWVcIixcbiAgICAgICAgICBcIkRyYW1hXCIsXG4gICAgICAgICAgXCJGYW50YXN5XCIsXG4gICAgICAgICAgXCJIaXN0b3JpY2FsXCIsXG4gICAgICAgICAgXCJIaXN0b3JpY2FsIEZpY3Rpb25cIixcbiAgICAgICAgICBcIkhvcnJvclwiLFxuICAgICAgICAgIFwiS2lkc1wiLFxuICAgICAgICAgIFwiTXlzdGVyeVwiLFxuICAgICAgICAgIFwiUG9saXRpY2FsXCIsXG4gICAgICAgICAgXCJSZWxpZ2lvdXNcIixcbiAgICAgICAgICBcIlJvbWFuY2VcIixcbiAgICAgICAgICBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICAgIFwiU2F0aXJlXCIsXG4gICAgICAgICAgXCJTY2llbmNlIEZpY3Rpb25cIixcbiAgICAgICAgICBcIlRocmlsbGVyXCIsXG4gICAgICAgICAgXCJXZXN0ZXJuXCJcbiAgICAgICAgXSxcbiAgICAgICAgcGl0Y2hHZW5yZTogXCJTZWxlY3QgR2VucmVcIixcbiAgICAgICAgcGl0Y2hUZXh0OiBudWxsLFxuICAgICAgICB0ZXJtc0FncmVlOiBmYWxzZVxuICAgICAgfVxuXG4gICAgICAvLyBDYXJ2ZSBvdXQgYSBwbGFjZSBmb3Igc3RvcmluZyBhIHN1Ym1pdHRlZCBwaXRjaFxuICAgICAgJHNjb3BlLnBpdGNoID0gbnVsbDtcblxuICAgICAgLy8gU2V0IHRoaXMgcHJvcGVydHkgdG8gY29uZmlndXJlIGFsZXJ0IG1lc3NhZ2VzIGRpc3BsYXllZFxuICAgICAgLy8gb24gdmFsaWRhdGlvbiBmYWlsdXJlc1xuICAgICAgJHNjb3BlLnZhbGlkYXRpb25UZXh0ID0gbnVsbDtcblxuICAgICAgLy8gVmFsaWRhdGUgdGhlIGZvcm0gYmVmb3JlIGxhdW5jaGluZyB0aGUgcGF5bWVudCB3aW5kb3dcbiAgICAgIGZ1bmN0aW9uIHZhbGlkYXRlUGl0Y2goKXtcbiAgICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICBpZihcbiAgICAgICAgICAkc2NvcGUuZGF0YS50ZXJtc0FncmVlID09PSB0cnVlICYmXG4gICAgICAgICAgJHNjb3BlLmRhdGEucGl0Y2hUZXh0ICE9PSBcIlwiICYmXG4gICAgICAgICAgJHNjb3BlLmRhdGEucGl0Y2hUZXh0ICE9PSBudWxsICYmXG4gICAgICAgICAgJHNjb3BlLmRhdGEucGl0Y2hHZW5yZSAhPT0gXCJTZWxlY3QgR2VucmVcIiAmJlxuICAgICAgICAgICRzY29wZS5kYXRhLnBpdGNoR2VucmUgIT09IFwiXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgcGl0Y2ggOiB7XG4gICAgICAgICAgICAgIGdlbnJlOiAkc2NvcGUuZGF0YS5waXRjaEdlbnJlLFxuICAgICAgICAgICAgICBwaXRjaDogJHNjb3BlLmRhdGEucGl0Y2hUZXh0LFxuICAgICAgICAgICAgICBhcmVUZXJtc0FncmVlZDogJHNjb3BlLmRhdGEudGVybXNBZ3JlZSxcbiAgICAgICAgICAgICAgZGF0ZUFncmVlZDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgdG9rZW4gOiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgZm9ybSBkb2Vzbid0IHZhbGlkYXRlLCBkaXNwbGF5IGVycm9ycyBmb3Igd2hhdCBraW5kIG9mIGVycm9yXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmKCRzY29wZS5kYXRhLnRlcm1zQWdyZWUgPT09IGZhbHNlKXtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJQbGVhc2UgYWNjZXB0IHRoZSB0ZXJtcyBpbiBvcmRlciB0byBjb250aW51ZS5cIixcbiAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUuZGF0YS5waXRjaFRleHQgPT09IFwiXCIgfHwgJHNjb3BlLmRhdGEucGl0Y2hUZXh0ID09PSBudWxsKXtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJSb2JlcnQgaXMgZ29vZCwgYnV0IG5vdCBnb29kIGVub3VnaCB0byBzZWxsIGEgYmxhbmsgcGl0Y2ghXCIsXG4gICAgICAgICAgICAgIGRhdGE6IG51bGxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLmRhdGEucGl0Y2hHZW5yZSA9PT0gXCJcIiB8fCAkc2NvcGUuZGF0YS5waXRjaEdlbnJlID09PSBcIlNlbGVjdCBHZW5yZVwiKXtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJXaGF0IGtpbmQgb2YgbW92aWUgaXMgaXQ/IFBsZWFzZSBzZWxlY3QgYSBnZW5yZS5cIixcbiAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJBbiB1bmtub3duIGVycm9yIGhhcyBvY2N1cnJlZC5cIixcbiAgICAgICAgICAgICAgZGF0YTogbnVsbFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9O1xuXG4gICAgICAvLyBSdW4gdGhlIGhhbmRsZXIgd2hlbiBzb21lb25lIGNsaWNrcyAnc3VibWl0J1xuICAgICAgJHNjb3BlLnN1Ym1pdFBpdGNoID0gZnVuY3Rpb24oZXYpe1xuXG4gICAgICAgIC8vIFJ1biB0aGUgZmllbGRzIHRocm91Z2ggdGhlIHZhbGlkYXRvciBiZWZvcmUgYW55IGFjdGlvblxuICAgICAgICB2YWxpZGF0ZVBpdGNoKCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgIC8vIENsZWFyIHRoZSBlcnJvciBtZXNzYWdlc1xuICAgICAgICAgICAgJHNjb3BlLnZhbGlkYXRpb25UZXh0ID0gXCJcIjtcblxuICAgICAgICAgICAgLy8gU3RvcmUgdGhlIFBpdGNoIERhdGEgZm9yIGZ1dHVyZSB1c2VcbiAgICAgICAgICAgICRzY29wZS5waXRjaCA9IHJlc3AucGl0Y2g7XG5cbiAgICAgICAgICAgICRzY29wZS5oYW5kbGVyLm9wZW4oe1xuICAgICAgICAgICAgICBuYW1lOiBcIk1vdmllUGl0Y2guY29tXCIsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlBpdGNoIFN1Ym1pc3Npb25cIixcbiAgICAgICAgICAgICAgYW1vdW50OiAyMDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICRzY29wZS52YWxpZGF0aW9uVGV4dCA9IGVyci5zdGF0dXM7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgKVxuXG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucGF5bWVudFN1Y2Nlc3MgPSBmdW5jdGlvbih0b2tlbil7XG4gICAgICAgICRzY29wZS5waXRjaC50b2tlbiA9IHRva2VuO1xuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucGl0Y2gpO1xuXG5cbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqIFRPIERPICoqKioqKioqKioqKioqKioqKioqKipcblxuICAgICAgICAvLyBXcml0ZSB0aGUgcGl0Y2ggdG8gdGhlIGJhY2stZW5kIGhlcmUhISFcblxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmhhbmRsZXIgPSBTdHJpcGVDaGVja291dC5jb25maWd1cmUoe1xuICAgICAgICBrZXk6ICdwa190ZXN0X1hIa2h0MEdNTFFQcm4yc1lDWFNGeTRGcycsXG4gICAgICAgIC8vIGltYWdlOiAnL2ltZy9kb2N1bWVudGF0aW9uL2NoZWNrb3V0L21hcmtldHBsYWNlLnBuZycsXG4gICAgICAgIGxvY2FsZTogJ2F1dG8nLFxuICAgICAgICB0b2tlbjogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgICAvLyBVc2UgdGhlIHRva2VuIHRvIGNyZWF0ZSB0aGUgY2hhcmdlIHdpdGggYSBzZXJ2ZXItc2lkZSBzY3JpcHQuXG4gICAgICAgICAgLy8gWW91IGNhbiBhY2Nlc3MgdGhlIHRva2VuIElEIHdpdGggYHRva2VuLmlkYFxuXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKiogVE8gRE8gKioqKioqKioqKioqKioqKioqKioqKlxuXG4gICAgICAgICAgLy8gQ29tcGxldGUgdGhlIHRyYW5zYWN0aW9uIHRocm91Z2ggdGhlIGJhY2stZW5kIGRhdGEgc2VydmljZXNcbiAgICAgICAgICAvLyBSZXR1cm4gYSBwcm9taXNlIFxuXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4gICAgICAgICAgJHNjb3BlLnBheW1lbnRTdWNjZXNzKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWwsIGF0dHJzKXtcbiAgICAgIGVsLmZpbmQoJ3NlbGVjdCcpLm9uKCdmb2N1cycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnN0IHNlbGVjdEdlbnJlID0gZWwuZmluZCgnb3B0aW9uJylbMF07XG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChzZWxlY3RHZW5yZSkucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdjb250YWN0VXNGb3JtJywgZnVuY3Rpb24oZW1haWxGYWN0b3J5KXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgJHNjb3BlLnN1YmplY3RzID0gW1xuICAgICAgICBcIkdlbmVyYWxcIixcbiAgICAgICAgXCJCaWxsaW5nXCIsXG4gICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgXCJTdXBwb3J0XCJcbiAgICAgIF07XG5cblxuICAgICAgbGV0IGNsZWFyRXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwiXCI7XG4gICAgICAgICRzY29wZS5zdWJtaXRTdWNjZXNzID0gXCJcIjtcbiAgICAgIH07XG5cbiAgICAgIGxldCBjbGVhckZpZWxkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICQoJ1tjb250YWN0LXVzLWZvcm1dJykuZmluZCgnLmZvcm0tY29udHJvbCcpLnZhbCgnJyk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q29udGFjdEZvcm0gPSBmdW5jdGlvbigpe1xuICAgICAgICBjbGVhckVycm9ycygpO1xuXG4gICAgICAgIGxldCBuYW1lLCBlbWFpbCwgc3ViamVjdCwgbWVzc2FnZTtcblxuICAgICAgICBuYW1lID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWN0LW5hbWUnKSkudmFsKCk7XG4gICAgICAgIGVtYWlsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWN0LWVtYWlsJykpLnZhbCgpO1xuICAgICAgICBzdWJqZWN0ID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWN0LXN1YmplY3QnKSkudmFsKCk7XG4gICAgICAgIG1lc3NhZ2UgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhY3QtbWVzc2FnZScpKS52YWwoKTtcblxuICAgICAgICBlbWFpbEZhY3RvcnkudmFsaWRhdGVFbWFpbChlbWFpbClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBpZihuYW1lID09PSBcIlwiIHx8IGVtYWlsID09PSBcIlwiIHx8IHN1YmplY3QgPT09IFwiXCIgfHwgbWVzc2FnZT09PVwiXCIpe1xuICAgICAgICAgICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJQbGVhc2UgZmlsbCBvdXQgZWFjaCBmaWVsZCBiZWZvcmUgc3VibWl0dGluZy5cIjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGVtYWlsRmFjdG9yeS5zZW5kQ29udGFjdFVzTWVzc2FnZShuYW1lLCBlbWFpbCwgc3ViamVjdCwgbWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgICAgICAgICBjbGVhckVycm9ycygpO1xuICAgICAgICAgICAgICAgICAgICAgIGNsZWFyRmllbGRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN1Ym1pdFN1Y2Nlc3MgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3VjY2Vzc1RleHQgPSBcIlN1Y2Nlc3MhIFlvdXIgbWVzc2FnZSBoYXMgYmVlbiBzdWJtaXR0ZWQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yVGV4dCA9IFwiQW4gZXJyb3IgaGFzIG9jY3VycmVkLiBZb3VyIG1lc3NhZ2Ugd2FzIG5vdCBzZW50LlwiO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9O1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvY29udGFjdC11cy1mb3JtL2NvbnRhY3QtdXMtZm9ybS5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW4nLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VyLCBwd2Q7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1sb2dpbi11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXB3ZCcpKS52YWwoKTtcblxuICAgICAgICB1c2VyRmFjdG9yeS5sb2dpblVzZXIodXNlciwgcHdkKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH07XG5cblxuICAgICAgJHNjb3BlLmxvZ291dFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB1c2VyRmFjdG9yeS5sb2dvdXRVc2VyKClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9sb2dpbi9sb2dpbi5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW5Nb2RhbCcsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcIlwiO1xuXG4gICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiXCI7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5mbGFnSW5wdXRFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcImlzLWVycm9yXCI7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LWhpZGRlblwiO1xuICAgICAgJHNjb3BlLmhpZGVBbGVydCA9IGZ1bmN0aW9uKCl7JHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtaGlkZGVuXCJ9O1xuICAgICAgJHNjb3BlLnNob3dBbGVydCA9IGZ1bmN0aW9uKCl7JHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtc2hvd25cIn07XG5cbiAgICAgICRzY29wZS5jbGVhckZvcm1zID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIG1vZGFsID0gJCgnI2xvZ2luLW1vZGFsJyk7XG5cbiAgICAgICAgLy8gQ2xlYXIgRXhpc3RpbmcgSW5wdXRzXG4gICAgICAgIG1vZGFsLmZpbmQoJ2lucHV0JykudmFsKCcnKTtcblxuICAgICAgICAvLyBSZXNldCBFcnJvciBOb3RpZmljYXRpb25zXG4gICAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzKCk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS51c2VyTG9naW4gPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlciwgcHdkO1xuICAgICAgICB2YXIgbW9kYWwgPSAkKCcjbG9naW4tbW9kYWwnKTtcblxuICAgICAgICB1c2VyID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2dpbi1wYXNzd29yZCcpKS52YWwoKTtcblxuICAgICAgICB1c2VyRmFjdG9yeS5sb2dpblVzZXIodXNlciwgcHdkKS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzKCk7XG4gICAgICAgICAgICAkc2NvcGUuY2xlYXJGb3JtcygpO1xuICAgICAgICAgICAgJHNjb3BlLmhpZGVBbGVydCgpO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUgJHJvb3RTY29wZSBpcyBpbiB0aGUgcHJvY2VzcyBvZiBuYXZpZ2F0aW5nIHRvIGEgc3RhdGUsXG4gICAgICAgICAgICAvLyBhcyBpbiBhbiBldmVudCB3aGVyZSBsb2dpbiBpbnRlcnJ1cHRzIG5hdmlnYXRpb24gdG8gYSByZXN0cmljdGVkIHBhZ2VcbiAgICAgICAgICAgIC8vIGNvbnRpbnVlIHRvIHRoYXQgc3RhdGUsIG90aGVyd2lzZSBjbGVhciB0aGUgJHJvb3RTY29wZS50YXJnZXRTdGF0ZVxuICAgICAgICAgICAgaWYoJHJvb3RTY29wZS50YXJnZXRTdGF0ZSAhPT0gbnVsbCl7XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygkcm9vdFNjb3BlLnRhcmdldFN0YXRlKTtcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS50YXJnZXRTdGF0ZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgJHNjb3BlLmZsYWdJbnB1dEVycm9ycygpO1xuICAgICAgICAgICAgJHNjb3BlLnNob3dBbGVydCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuXG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6ICdjb21wb25lbnRzL2xvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmh0bWwnXG4gIH1cbn0pXG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYWRtaW5QaXRjaFJldmlldycsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICRzY29wZS5waXRjaGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk5vdmVtYmVyIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIG1hbiBmYWxscyBpbiBsb3ZlIHdpdGggYSBsYWR5LCBidXQgaXQncyBmdW5ueS5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk9jdG9iZXIgMjNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIkhvcnJvclwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIHdvbWFuIGtlZXBzIGNoZWNraW5nIGhlciBmcmlkZ2UsIGJ1dCB0aGVyZSdzIG5ldmVyIGFueXRoaW5nIHdvcnRoIGVhdGluZy5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiSnVuZSAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJXZXN0ZXJuXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIlNvbWUgY293Ym95cyByaWRlIGFyb3VuZCBjaGFzaW5nIGEgZ2FuZyBvZiB0aGlldmVzXCIsXG4gICAgICAgICAgc3RhdHVzOiBcImFjY2VwdGVkXCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FwcEhlYWRlcicsIGZ1bmN0aW9uKCRzdGF0ZSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9IFwibWVudS1jbG9zZWRcIjtcbiAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ2luXCI7XG5cbiAgICAgICRzY29wZS50b2dnbGVNZW51ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9PT0gXCJtZW51LWNsb3NlZFwiID8gXCJtZW51LW9wZW5cIiA6IFwibWVudS1jbG9zZWRcIjtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ2luLXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ291dFwiO1xuICAgICAgfSk7XG5cblxuICAgICAgJHNjb3BlLiRvbignbG9nb3V0LXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ2luXCI7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLmxvZ291dFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB1c2VyRmFjdG9yeS5sb2dvdXRVc2VyKCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdpbmRleCcpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUub3BlbkxvZ2luTW9kYWwgPSBmdW5jdGlvbigpe1xuICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICAkKGVsKS5maW5kKCcubWFpbi1uYXYgYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLnRvZ2dsZU1lbnUoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvbmF2L25hdi5odG1sXCJcbiAgfVxufSk7XG4iLCIvLyBtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc2VsZWN0R2VucmUnLCBmdW5jdGlvbigpe1xuLy8gICByZXR1cm4ge1xuLy8gICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4vL1xuLy8gICAgIH0sXG4vLyAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4vLyAgICAgICBcbi8vXG4vLyAgICAgfSxcbi8vICAgICBzY29wZTogdHJ1ZSxcbi8vICAgICByZXN0cmljdDogXCJBXCJcbi8vICAgfVxuLy8gfSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3NpZ251cCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgJHN0YXRlLCAkcm9vdFNjb3BlLCB1c2VyRmFjdG9yeSwgZW1haWxGYWN0b3J5KXtcbiAgICAgIC8vICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS51c2VybmFtZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcIlwiO1xuXG4gICAgICAkc2NvcGUudmFsaWRhdGVFbWFpbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItZW1haWwnKSkudmFsKCk7XG5cbiAgICAgICAgZW1haWxGYWN0b3J5LnZhbGlkYXRlRW1haWwoZW1haWwpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcIlwiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yVGV4dCA9IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwgYWRkcmVzcy5cIjtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuc2lnbnVwVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VybmFtZSwgZW1haWwsIHB3ZCwgY29uZmlybVB3ZDtcbiAgICAgICAgdmFyIHRlc3RBcnJheSA9IFtdO1xuXG4gICAgICAgIHVzZXJuYW1lID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgZW1haWwgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWVtYWlsJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXBhc3N3b3JkJykpLnZhbCgpO1xuICAgICAgICBjb25maXJtUHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1jb25maXJtLXBhc3N3b3JkJykpLnZhbCgpO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSBlbnRyaWVzIGV4aXN0IGZvciBhbGwgdGhyZWUgcHJpbWFyeSBmaWVsZHNcbiAgICAgICAgaWYodXNlcm5hbWUgPT09IFwiXCIgfHwgZW1haWwgPT09IFwiXCIgfHwgcHdkID09PSBcIlwiKXtcbiAgICAgICAgICAkc2NvcGUuZ2VuZXJhbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgdGVzdEFycmF5LnB1c2goZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHB3ZCAhPT0gY29uZmlybVB3ZCl7XG4gICAgICAgICAgJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICB0ZXN0QXJyYXkucHVzaChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGVzdEFycmF5Lmxlbmd0aCA9PT0gMCl7XG4gICAgICAgICAgdXNlckZhY3Rvcnkuc2lnblVwKHVzZXJuYW1lLCBlbWFpbCwgcHdkKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnNpZ251cFN1Y2Nlc3MgPSBcInNob3ctYWxlcnRcIjtcblxuICAgICAgICAgICAgICAgIC8vIGxvZ2luIHRoZSB1c2VyIGFmdGVyIGEgc3VjY2Vzc2Z1bCBzaWdudXAgYW5kIG5hdmlnYXRlIHRvIHN1Ym1pdC1waXRjaFxuICAgICAgICAgICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VybmFtZSwgcHdkKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3N1Ym1pdC1waXRjaCcpO1xuICAgICAgICAgICAgICAgICAgICAgIH0sIDU1MCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICBzd2l0Y2goZXJyLmVycm9yLmNvZGUpe1xuICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3JUZXh0ID0gXCJUaGUgdXNlcm5hbWUgZmllbGQgaXMgZW1wdHkuXCJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIGNhc2UgMjAyOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvclRleHQgPSBcIlRoZSBkZXNpcmVkIHVzZXJuYW1lIGlzIGFscmVhZHkgdGFrZW4uXCJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIGNhc2UgMjAzOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvclRleHQgPSBcIkFuIGFjY291bnQgaGFzIGFscmVhZHkgYmVlbiBjcmVhdGVkIGF0IFwiICsgZW1haWwgKyBcIi5cIjtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcblxuICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VuY2F1Z2h0IGVycm9yJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvc2lnbnVwL3NpZ251cC5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc3VibWl0UGl0Y2gnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgcGFyc2VGYWN0b3J5KXtcbiAgICAgICRzY29wZS5nZW5yZXMgPSBbXG4gICAgICAgIFwiQWN0aW9uXCIsXG4gICAgICAgIFwiQWR2ZW50dXJlXCIsXG4gICAgICAgIFwiQW5pbWF0ZWRcIixcbiAgICAgICAgXCJDb21lZHlcIixcbiAgICAgICAgXCJDcmltZVwiLFxuICAgICAgICBcIkRyYW1hXCIsXG4gICAgICAgIFwiRmFudGFzeVwiLFxuICAgICAgICBcIkhpc3RvcmljYWxcIixcbiAgICAgICAgXCJIaXN0b3JpY2FsIEZpY3Rpb25cIixcbiAgICAgICAgXCJIb3Jyb3JcIixcbiAgICAgICAgXCJLaWRzXCIsXG4gICAgICAgIFwiTXlzdGVyeVwiLFxuICAgICAgICBcIlBvbGl0aWNhbFwiLFxuICAgICAgICBcIlJlbGlnaW91c1wiLFxuICAgICAgICBcIlJvbWFuY2VcIixcbiAgICAgICAgXCJSb21hbnRpYyBDb21lZHlcIixcbiAgICAgICAgXCJTYXRpcmVcIixcbiAgICAgICAgXCJTY2llbmNlIEZpY3Rpb25cIixcbiAgICAgICAgXCJUaHJpbGxlclwiLFxuICAgICAgICBcIldlc3Rlcm5cIlxuICAgICAgXTtcblxuICAgICAgJHNjb3BlLnN1Ym1pdFBpdGNoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGdlbnJlLCBwaXRjaCwgdGVybXMsIGRhdGVBZ3JlZWQ7XG5cbiAgICAgICAgZ2VucmUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dlbnJlJykpLnZhbCgpO1xuICAgICAgICBwaXRjaCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGl0Y2gnKSkudmFsKCk7XG4gICAgICAgIHRlcm1zID0gJCgnI2FncmVlLXRlcm1zJykuaXMoXCI6Y2hlY2tlZFwiKTtcbiAgICAgICAgZGF0ZUFncmVlZCA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coZ2VucmUsIHBpdGNoLCB0ZXJtcywgZGF0ZUFncmVlZCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIGZvcm0gZm9yIGJhc2ljIGVycm9yc1xuICAgICAgICB2YWxpZGF0ZUlucHV0KCk7XG5cbiAgICAgICAgLy8gaWYocGl0Y2ggIT09IFwiXCIpe1xuICAgICAgICAvLyAgIC8vIHBhcnNlRmFjdG9yeS5zdWJtaXRQaXRjaChnZW5yZSwgcGl0Y2gpO1xuICAgICAgICAvLyB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHZhbGlkYXRlSW5wdXQoKSB7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0ZXJtcyBhcmUgYWdyZWVkIHRvXG4gICAgICAgIGlmKHRlcm1zICE9PSB0cnVlKXtcbiAgICAgICAgICAkc2NvcGUudGVybXNFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChwaXRjaCA9PT0gXCJcIikge1xuICAgICAgICAgICRzY29wZS50ZXJtc0Vycm9yID0gXCJcIjtcbiAgICAgICAgICAkc2NvcGUucGl0Y2hFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChnZW5yZSkge1xuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCd1c2VyUGl0Y2hlcycsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG5cbiAgICAgICRzY29wZS5waXRjaGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk5vdmVtYmVyIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIG1hbiBmYWxscyBpbiBsb3ZlIHdpdGggYSBsYWR5LCBidXQgaXQncyBmdW5ueS5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk9jdG9iZXIgMjNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIkhvcnJvclwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIHdvbWFuIGtlZXBzIGNoZWNraW5nIGhlciBmcmlkZ2UsIGJ1dCB0aGVyZSdzIG5ldmVyIGFueXRoaW5nIHdvcnRoIGVhdGluZy5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiSnVuZSAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJXZXN0ZXJuXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIlNvbWUgY293Ym95cyByaWRlIGFyb3VuZCBjaGFzaW5nIGEgZ2FuZyBvZiB0aGlldmVzXCIsXG4gICAgICAgICAgc3RhdHVzOiBcImFjY2VwdGVkXCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvdXNlci1waXRjaGVzL3VzZXItcGl0Y2hlcy5odG1sXCJcbiAgfVxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
