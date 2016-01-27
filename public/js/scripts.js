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
"use strict";

moviePitchApp.factory('paymentFactory', function ($http) {
  var factory = {

    createCharge: function createCharge(amount, description, token) {
      return $http({
        method: "POST",
        url: "https://moviepitchapi.herokuapp.com/stripe/create_charge",
        data: {
          amount: amount,
          description: description,
          currency: "usd",
          source: token
        }
      });
    }
  };

  return factory;
});
"use strict";

moviePitchApp.factory('pitchFactory', function ($q, $http) {
  var factory = {
    submitPitch: function submitPitch(pitch) {
      return $http({
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
          // Update the pitch object with the payment token
          $scope.pitch.token = _token;
          $scope.pitch.submitterEmail = _token.email;

          console.log($scope.pitch);
          paymentFactory.createCharge(200, "Pitch submission", _token.id).then(function (resp) {
            console.log(resp);
            pitchFactory.submitPitch($scope.pitch).then(function (resp) {
              console.log(resp);
            }).catch(function (err) {
              console.log(err);
            });
          }).catch(function (err) {
            console.log(err);
          });

          // Create an array of promises to run when the Stripe
          // handler creates and returns a charge token
          // $q
          //   .all([
          //     pitchFactory.submitPitch($scope.pitch),
          //     chargeCard()
          //   ])
          //   .then(function(resp){
          //     debugger;
          //     console.log(resp);
          //   })
          //   .catch(function(err){
          //     debugger;
          //     console.log(err);
          //   });
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

        pitchFactory
        // Validate the pitch object
        .validatePitch($scope.pitch).then(function (resp) {
          // If Pitch validates, build a pitch in $scope
          $scope.validationText = "";
          $scope.pitch = resp.pitch;

          // Open the Stripe Checkout Handler
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJwYXltZW50RmFjdG9yeS5qcyIsInBpdGNoRmFjdG9yeS5qcyIsInVzZXJGYWN0b3J5LmpzIiwiYWRtaW4tcGl0Y2gtcmV2aWV3L2FkbWluLXBpdGNoLXJldmlldy5qcyIsImNoZWNrb3V0L3BpdGNoLWJveC5qcyIsImNvbnRhY3QtdXMtZm9ybS9jb250YWN0LXVzLWZvcm0uanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmpzIiwibmF2L25hdi5qcyIsInNpZ251cC9zaWdudXAuanMiLCJ1c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLFFBQVEsU0FBUjtBQUNBLFFBQVEsbUJBQVI7QUFDQSxJQUFNLFFBQVEsUUFBUSxPQUFSLENBQVI7O0FBRU4sSUFBTSxrQkFBa0IsQ0FDdEIsV0FEc0IsQ0FBbEI7O0FBSU4sSUFBSSxnQkFBZ0IsUUFBUSxNQUFSLENBQWUsZUFBZixFQUFnQyxlQUFoQyxFQUNqQixNQURpQixDQUNWLENBQUMsZ0JBQUQsRUFBbUIsb0JBQW5CLEVBQ04sVUFBUyxjQUFULEVBQXlCLGtCQUF6QixFQUE0Qzs7QUFFMUMscUJBQW1CLFNBQW5CLENBQTZCLEdBQTdCOzs7QUFGMEMsZ0JBSzFDLENBQ0csS0FESCxDQUNTLE9BRFQsRUFDa0I7QUFDZCxTQUFLLEdBQUw7QUFDQSxpQkFBYSxpQkFBYjtBQUNBLFVBQU07QUFDSixvQkFBYyxLQUFkO0tBREY7R0FKSixFQVFHLEtBUkgsQ0FRUyxPQVJULEVBUWtCO0FBQ2QsU0FBSyxRQUFMO0FBQ0EsaUJBQWEsa0JBQWI7QUFDQSxVQUFNO0FBQ0osb0JBQWMsSUFBZDtLQURGO0dBWEo7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTDBDLGdCQXdDMUMsQ0FDRyxLQURILENBQ1MsS0FEVCxFQUNnQjtBQUNaLFNBQUssTUFBTDtBQUNBLGlCQUFhLGdCQUFiO0FBQ0EsVUFBTTtBQUNKLG9CQUFjLEtBQWQ7S0FERjtHQUpKLEVBUUcsS0FSSCxDQVFTLE9BUlQsRUFRa0I7QUFDZCxTQUFLLFFBQUw7QUFDQSxpQkFBYSxrQkFBYjtBQUNBLFVBQU07QUFDSixvQkFBYyxLQUFkO0tBREY7R0FYSixFQWVHLEtBZkgsQ0FlUyxZQWZULEVBZXVCO0FBQ25CLFNBQUssYUFBTDtBQUNBLGlCQUFhLHVCQUFiO0FBQ0EsVUFBTTtBQUNKLG9CQUFjLEtBQWQ7S0FERjtHQWxCSixFQXNCRyxLQXRCSCxDQXNCUyxPQXRCVCxFQXNCa0I7QUFDZCxTQUFLLFFBQUw7QUFDQSxpQkFBYSxrQkFBYjtBQUNBLFVBQU07QUFDSixvQkFBYyxLQUFkO0tBREY7R0F6QkosRUF4QzBDO0NBQTVDLENBRmdCLEVBMEVqQixHQTFFaUIsQ0EwRWIsVUFBUyxVQUFULEVBQW9CO0FBQ3ZCLFFBQU0sVUFBTixDQUFpQiwwQ0FBakIsRUFBNkQsMENBQTdEOzs7QUFEdUIsT0FJdkIsQ0FBTSxJQUFOLENBQVcsTUFBWCxHQUp1Qjs7QUFNdkIsYUFBVyxHQUFYLENBQWUsbUJBQWYsRUFBb0MsVUFBUyxLQUFULEVBQWdCLE9BQWhCLEVBQXdCO0FBQzFELFFBQUksZUFBZSxRQUFRLElBQVIsQ0FBYSxZQUFiOzs7O0FBRHVDLFFBS3ZELGlCQUFpQixJQUFqQixJQUF5QixXQUFXLE9BQVgsS0FBdUIsSUFBdkIsRUFBNEI7QUFDdEQsWUFBTSxjQUFOLEdBRHNEO0FBRXRELFFBQUUsY0FBRixFQUFrQixLQUFsQixDQUF3QixNQUF4QixFQUZzRDtBQUd0RCxpQkFBVyxXQUFYLEdBQXlCLFFBQVEsSUFBUixDQUg2QjtLQUF4RDtHQUxrQyxDQUFwQyxDQU51Qjs7QUFrQnZCLGFBQVcsT0FBWCxHQUFxQixJQUFyQixDQWxCdUI7Q0FBcEIsQ0ExRUg7OztBQ1ZKLGNBQWMsVUFBZCxDQUF5QixVQUF6QixFQUFxQyxDQUFDLFFBQUQsRUFDbkMsVUFBUyxNQUFULEVBQWdCOzs7O0NBQWhCLENBREY7OztBQ0FBLGNBQWMsT0FBZCxDQUFzQixjQUF0QixFQUFzQyxVQUFTLEVBQVQsRUFBWTtBQUNoRCxNQUFJLFdBQVcsUUFBUSxVQUFSLEVBQW9CLHVFQUFwQixDQUFYLENBRDRDOztBQUdoRCxNQUFJLFVBQVU7Ozs7QUFJWiwwQkFBc0IsOEJBQVMsSUFBVCxFQUFlLEtBQWYsRUFBc0IsT0FBdEIsRUFBK0IsR0FBL0IsRUFBbUM7QUFDdkQsVUFBSSxXQUFXLEdBQUcsS0FBSCxFQUFYLENBRG1EOztBQUd2RCxlQUFTLE9BQVQsQ0FBaUI7QUFDZixnQkFBUSxTQUFSO0FBQ0EsY0FBTSxJQUFOO0FBQ0EsZUFBTyxLQUFQO0FBQ0EsaUJBQVMsT0FBVDtBQUNBLGlCQUFTLEdBQVQ7T0FMRixFQUh1RDs7QUFXdkQsYUFBTyxTQUFTLE9BQVQsQ0FYZ0Q7S0FBbkM7O0FBY3RCLG1CQUFlLHVCQUFTLEtBQVQsRUFBZ0I7QUFDN0IsVUFBSSxXQUFXLEdBQUcsS0FBSCxFQUFYLENBRHlCOztBQUc3QixVQUFJLE1BQU0saUVBQU4sQ0FIeUI7O0FBSzdCLFVBQUcsSUFBSSxJQUFKLENBQVMsS0FBVCxDQUFILEVBQW1CO0FBQ2pCLGlCQUFTLE9BQVQsQ0FBaUIsSUFBakIsRUFEaUI7T0FBbkIsTUFFTztBQUNMLGlCQUFTLE1BQVQsQ0FBZ0IsS0FBaEIsRUFESztPQUZQOztBQU1BLGFBQU8sU0FBUyxPQUFULENBWHNCO0tBQWhCO0dBbEJiLENBSDRDOztBQW9DaEQsU0FBTyxPQUFQLENBcENnRDtDQUFaLENBQXRDO0FDQUE7O0FBRUEsY0FBYyxPQUFkLENBQXNCLGNBQXRCLEVBQXNDLFVBQVMsRUFBVCxFQUFhO0FBQ2pELE1BQUksVUFBVTtBQUNaLGlCQUFhLHFCQUFTLEtBQVQsRUFBZ0IsSUFBaEIsRUFBc0I7QUFDakMsVUFBSSxXQUFXLEdBQUcsS0FBSCxFQUFYOzs7QUFENkIsVUFJN0IsV0FBVyxPQUFYLEtBQXVCLElBQXZCLEVBQTZCO0FBQy9CLFlBQUksUUFBUSxNQUFNLE1BQU4sQ0FBYSxNQUFiLENBQW9CLE9BQXBCLENBQVIsQ0FEMkI7QUFFL0IsWUFBSSxRQUFRLElBQUksS0FBSixFQUFSLENBRjJCOztBQUkvQixjQUFNLEdBQU4sQ0FBVSxPQUFWLEVBQW1CLEtBQW5CLEVBSitCO0FBSy9CLGNBQU0sR0FBTixDQUFVLE9BQVYsRUFBbUIsSUFBbkI7O0FBTCtCLGFBTy9CLENBQU0sR0FBTixDQUFVLFVBQVYsRUFBc0IsS0FBdEIsRUFQK0I7O0FBVS9CLGNBQU0sSUFBTixDQUFXLElBQVgsRUFBaUI7QUFDZixtQkFBUyxpQkFBUyxLQUFULEVBQWdCO0FBQ3ZCLHFCQUFTLE9BQVQsQ0FBaUI7QUFDZixzQkFBUSxTQUFSO0FBQ0Esb0JBQU0sS0FBTjthQUZGLEVBRHVCO1dBQWhCO0FBTVQsaUJBQU8sZUFBUyxLQUFULEVBQWdCLE1BQWhCLEVBQXVCO0FBQzVCLHFCQUFTLE1BQVQsQ0FBZ0I7QUFDZCxzQkFBUSxVQUFSO0FBQ0Esb0JBQU0sTUFBTjthQUZGLEVBRDRCO1dBQXZCO1NBUFQsRUFWK0I7Ozs7QUFBakMsV0EyQks7QUFDSCxtQkFBUyxNQUFULENBQWdCO0FBQ2Qsb0JBQVEsVUFBUjtBQUNBLGlCQUFLLHVCQUFMO1dBRkYsRUFERztTQTNCTDs7QUFrQ0EsYUFBTyxTQUFTLE9BQVQsQ0F0QzBCO0tBQXRCO0dBRFgsQ0FENkM7O0FBNENqRCxTQUFPLE9BQVAsQ0E1Q2lEO0NBQWIsQ0FBdEM7OztBQ0ZBLGNBQWMsT0FBZCxDQUFzQixnQkFBdEIsRUFBd0MsVUFBUyxLQUFULEVBQWU7QUFDckQsTUFBSSxVQUFVOztBQUVaLGtCQUFjLHNCQUFTLE1BQVQsRUFBaUIsV0FBakIsRUFBOEIsS0FBOUIsRUFBb0M7QUFDaEQsYUFBTyxNQUFNO0FBQ1gsZ0JBQVEsTUFBUjtBQUNBLGFBQUssMERBQUw7QUFDQSxjQUFNO0FBQ0osa0JBQVEsTUFBUjtBQUNBLHVCQUFhLFdBQWI7QUFDQSxvQkFBVSxLQUFWO0FBQ0Esa0JBQVEsS0FBUjtTQUpGO09BSEssQ0FBUCxDQURnRDtLQUFwQztHQUZaLENBRGlEOztBQWlCckQsU0FBTyxPQUFQLENBakJxRDtDQUFmLENBQXhDO0FDQUE7O0FBRUEsY0FBYyxPQUFkLENBQXNCLGNBQXRCLEVBQXNDLFVBQVMsRUFBVCxFQUFhLEtBQWIsRUFBb0I7QUFDeEQsTUFBSSxVQUFVO0FBQ1osaUJBQWEscUJBQVMsS0FBVCxFQUFnQjtBQUMzQixhQUFPLE1BQU07QUFDWCxnQkFBUSxNQUFSO0FBQ0EsYUFBSywyQ0FBTDtBQUNBLGNBQU0sS0FBTjtPQUhLLENBQVAsQ0FEMkI7S0FBaEI7QUFPYixtQkFBZSx1QkFBUyxLQUFULEVBQWU7O0FBRTVCLFVBQUksV0FBVyxHQUFHLEtBQUgsRUFBWCxDQUZ3Qjs7QUFJNUIsVUFDRSxNQUFNLG9CQUFOLEtBQStCLElBQS9CLElBQ0EsTUFBTSxTQUFOLEtBQW9CLEVBQXBCLElBQ0EsTUFBTSxTQUFOLEtBQW9CLElBQXBCLElBQ0EsTUFBTSxLQUFOLEtBQWdCLGNBQWhCLElBQ0EsTUFBTSxLQUFOLEtBQWdCLEVBQWhCLEVBQ0E7QUFDQSxjQUFNLE1BQU4sR0FBZSxTQUFmLENBREE7QUFFQSxjQUFNLG1CQUFOLEdBQTRCLElBQUksSUFBSixFQUE1QixDQUZBOztBQUlBLGlCQUFTLE9BQVQsQ0FBaUI7QUFDZixrQkFBUSxTQUFSO0FBQ0EsaUJBQVEsS0FBUjtTQUZGLEVBSkE7T0FORixNQWdCSyxJQUNILE1BQU0sU0FBTixLQUFvQixFQUFwQixJQUEwQixNQUFNLFNBQU4sS0FBb0IsSUFBcEIsSUFDMUIsTUFBTSxLQUFOLEtBQWdCLEVBQWhCLElBQXNCLE1BQU0sS0FBTixLQUFnQixjQUFoQixFQUFnQztBQUNwRCxpQkFBUyxNQUFULENBQWdCO0FBQ2Qsa0JBQVEsT0FBUjtBQUNBLHFCQUFXLElBQVg7QUFDQSxlQUFLLG1EQUFMO1NBSEYsRUFEb0Q7T0FGbkQsTUFVQSxJQUFHLE1BQU0sb0JBQU4sS0FBK0IsS0FBL0IsRUFBcUM7QUFDM0MsaUJBQVMsTUFBVCxDQUFnQjtBQUNkLGtCQUFRLE9BQVI7QUFDQSxxQkFBVyxJQUFYO0FBQ0EsZUFBSywrQ0FBTDtTQUhGLEVBRDJDO09BQXhDLE1BUUEsSUFBSSxNQUFNLFNBQU4sS0FBb0IsRUFBcEIsSUFBMEIsTUFBTSxTQUFOLEtBQW9CLElBQXBCLEVBQXlCO0FBQzFELGlCQUFTLE1BQVQsQ0FBZ0I7QUFDZCxrQkFBUSxPQUFSO0FBQ0EscUJBQVcsSUFBWDtBQUNBLGVBQUssNERBQUw7U0FIRixFQUQwRDtPQUF2RCxNQVFBLElBQUksTUFBTSxLQUFOLEtBQWdCLEVBQWhCLElBQXNCLE1BQU0sS0FBTixLQUFnQixjQUFoQixFQUErQjtBQUM1RCxpQkFBUyxNQUFULENBQWdCO0FBQ2Qsa0JBQVEsT0FBUjtBQUNBLHFCQUFXLElBQVg7QUFDQSxlQUFLLGtEQUFMO1NBSEYsRUFENEQ7T0FBekQsTUFRQTtBQUNILGlCQUFTLE1BQVQsQ0FBZ0I7QUFDZCxrQkFBUSxPQUFSO0FBQ0EscUJBQVcsSUFBWDtBQUNBLGVBQUssZ0NBQUw7U0FIRixFQURHO09BUkE7O0FBZ0JMLGFBQU8sU0FBUyxPQUFULENBOURxQjtLQUFmOztHQVJiLENBRG9EOztBQTRFeEQsU0FBTyxPQUFQLENBNUV3RDtDQUFwQixDQUF0QztBQ0ZBOztBQUVBLGNBQWMsT0FBZCxDQUFzQixhQUF0QixFQUFxQyxVQUFTLEVBQVQsRUFBYSxVQUFiLEVBQXlCLFNBQXpCLEVBQW1DO0FBQ3RFLE1BQUksVUFBVTtBQUNaLG1CQUFlLHlCQUFVO0FBQ3ZCLFVBQUksV0FBVyxHQUFHLEtBQUgsRUFBWCxDQURtQjs7QUFHdkIsVUFBRyxXQUFXLE9BQVgsS0FBdUIsSUFBdkIsRUFBNEI7QUFDN0IsZ0JBQVEsR0FBUixDQUFZLEdBQVosRUFENkI7QUFFN0IsaUJBQVMsTUFBVCxHQUY2QjtBQUc3QixrQkFBVSxHQUFWLENBQWMsUUFBZCxFQUg2QjtPQUEvQixNQUlPO0FBQ0wsZ0JBQVEsR0FBUixDQUFZLEdBQVosRUFESztBQUVMLGlCQUFTLE9BQVQsR0FGSztPQUpQOztBQVNBLGFBQU8sU0FBUyxPQUFULENBWmdCO0tBQVY7QUFjZixlQUFXLG1CQUFTLFFBQVQsRUFBbUIsR0FBbkIsRUFBdUI7QUFDaEMsVUFBSSxXQUFXLEdBQUcsS0FBSCxFQUFYLENBRDRCOztBQUdoQyxZQUFNLElBQU4sQ0FBVyxLQUFYLENBQWlCLFFBQWpCLEVBQTJCLEdBQTNCLEVBQWdDLElBQWhDLENBQ0UsVUFBUyxJQUFULEVBQWM7QUFDWixtQkFBVyxPQUFYLEdBQXFCLElBQXJCLENBRFk7QUFFWixpQkFBUyxPQUFULENBQWlCO0FBQ2Ysa0JBQVEsU0FBUjtBQUNBLGdCQUFNLElBQU47U0FGRixFQUZZO0FBTVosbUJBQVcsVUFBWCxDQUFzQixjQUF0QixFQU5ZO09BQWQsRUFRQSxVQUFTLEdBQVQsRUFBYTtBQUNYLGlCQUFTLE1BQVQsQ0FBZ0I7QUFDZCxrQkFBUSxPQUFSO0FBQ0EsaUJBQU8sR0FBUDtTQUZGLEVBRFc7T0FBYixDQVRGLENBSGdDOztBQW9CaEMsYUFBTyxTQUFTLE9BQVQsQ0FwQnlCO0tBQXZCOztBQXVCWCxnQkFBWSxzQkFBVTtBQUNwQixVQUFJLFdBQVcsR0FBRyxLQUFILEVBQVgsQ0FEZ0I7QUFFcEIsWUFBTSxJQUFOLENBQVcsTUFBWCxHQUZvQjs7QUFJcEIsVUFBSSxPQUFPLE1BQU0sSUFBTixDQUFXLE9BQVgsRUFBUCxDQUpnQjs7QUFNcEIsVUFBRyxTQUFTLElBQVQsRUFBYzs7QUFFZixtQkFBVyxPQUFYLEdBQXFCLElBQXJCLENBRmU7QUFHZixtQkFBVyxVQUFYLENBQXNCLGVBQXRCLEVBSGU7QUFJZixpQkFBUyxPQUFULENBQWlCO0FBQ2Ysa0JBQVEsU0FBUjtBQUNBLGVBQUssb0JBQUw7U0FGRixFQUplO09BQWpCLE1BUU87QUFDTCxpQkFBUyxNQUFULENBQWdCO0FBQ2Qsa0JBQVEsT0FBUjtBQUNBLGVBQUsseUJBQUw7U0FGRixFQURLO09BUlA7O0FBZUEsYUFBTyxTQUFTLE9BQVQsQ0FyQmE7S0FBVjs7QUF3QlosWUFBUSxnQkFBUyxRQUFULEVBQW1CLEtBQW5CLEVBQTBCLEdBQTFCLEVBQThCO0FBQ3BDLFVBQUksV0FBVyxHQUFHLEtBQUgsRUFBWCxDQURnQzs7QUFHcEMsVUFBSSxPQUFPLElBQUksTUFBTSxJQUFOLEVBQVgsQ0FIZ0M7QUFJcEMsV0FBSyxHQUFMLENBQVMsVUFBVCxFQUFxQixRQUFyQixFQUpvQztBQUtwQyxXQUFLLEdBQUwsQ0FBUyxPQUFULEVBQWtCLEtBQWxCLEVBTG9DO0FBTXBDLFdBQUssR0FBTCxDQUFTLFVBQVQsRUFBcUIsR0FBckIsRUFOb0M7O0FBUXBDLFdBQUssTUFBTCxDQUFZLElBQVosRUFBa0I7QUFDaEIsaUJBQVMsaUJBQVMsSUFBVCxFQUFjO0FBQ3JCLG1CQUFTLE9BQVQsQ0FBaUI7QUFDZixvQkFBUSxTQUFSO0FBQ0Esa0JBQU0sSUFBTjtXQUZGLEVBRHFCO0FBS3JCLGtCQUFRLEdBQVIsQ0FBWSxNQUFNLElBQU4sQ0FBVyxPQUFYLEVBQVosRUFMcUI7U0FBZDtBQU9ULGVBQU8sZUFBUyxJQUFULEVBQWUsR0FBZixFQUFtQjtBQUN4QixrQkFBUSxHQUFSLENBQVksR0FBWixFQUR3QjtBQUV4QixtQkFBUyxNQUFULENBQWdCO0FBQ2Qsb0JBQVEsT0FBUjtBQUNBLGtCQUFNLElBQU47QUFDQSxtQkFBTyxHQUFQO1dBSEYsRUFGd0I7U0FBbkI7T0FSVCxFQVJvQzs7QUEwQnBDLGFBQU8sU0FBUyxPQUFULENBMUI2QjtLQUE5QjtHQTlETixDQURrRTs7QUE2RnRFLFNBQU8sT0FBUCxDQTdGc0U7Q0FBbkMsQ0FBckM7OztBQ0ZBLGNBQWMsU0FBZCxDQUF3QixrQkFBeEIsRUFBNEMsWUFBVTtBQUNwRCxTQUFPO0FBQ0wsZ0JBQVksb0JBQVMsTUFBVCxFQUFnQjtBQUMxQixhQUFPLE9BQVAsR0FBaUIsQ0FDZjtBQUNFLG1CQUFXLG9CQUFYO0FBQ0EsZUFBTyxpQkFBUDtBQUNBLG1CQUFXLGtEQUFYO0FBQ0EsZ0JBQVEsVUFBUjtPQUxhLEVBT2Y7QUFDRSxtQkFBVyxvQkFBWDtBQUNBLGVBQU8sUUFBUDtBQUNBLG1CQUFXLDZFQUFYO0FBQ0EsZ0JBQVEsVUFBUjtPQVhhLEVBWWI7QUFDQSxtQkFBVyxnQkFBWDtBQUNBLGVBQU8sU0FBUDtBQUNBLG1CQUFXLG9EQUFYO0FBQ0EsZ0JBQVEsVUFBUjtPQWhCYSxDQUFqQixDQUQwQjtLQUFoQjtBQXFCWixjQUFVLEdBQVY7R0F0QkYsQ0FEb0Q7Q0FBVixDQUE1Qzs7O0FDQUEsY0FBYyxTQUFkLENBQXdCLFVBQXhCLEVBQW9DLFlBQVU7QUFDNUMsU0FBTztBQUNMLGdCQUFZLG9CQUFTLE1BQVQsRUFBaUIsRUFBakIsRUFBcUIsS0FBckIsRUFBNEIsY0FBNUIsRUFBNEMsWUFBNUMsRUFBeUQ7Ozs7QUFJbkUsYUFBTyxJQUFQLEdBQWM7QUFDWixnQkFBUSxDQUNOLGNBRE0sRUFFTixRQUZNLEVBR04sV0FITSxFQUlOLFVBSk0sRUFLTixRQUxNLEVBTU4sT0FOTSxFQU9OLE9BUE0sRUFRTixTQVJNLEVBU04sWUFUTSxFQVVOLG9CQVZNLEVBV04sUUFYTSxFQVlOLE1BWk0sRUFhTixTQWJNLEVBY04sV0FkTSxFQWVOLFdBZk0sRUFnQk4sU0FoQk0sRUFpQk4saUJBakJNLEVBa0JOLFFBbEJNLEVBbUJOLGlCQW5CTSxFQW9CTixVQXBCTSxFQXFCTixTQXJCTSxDQUFSO0FBdUJBLG9CQUFZLGNBQVo7QUFDQSxtQkFBVyxJQUFYO0FBQ0Esb0JBQVksS0FBWjtPQTFCRjs7O0FBSm1FLFlBa0NuRSxDQUFPLEtBQVAsR0FBZSxJQUFmOzs7O0FBbENtRSxZQXNDbkUsQ0FBTyxjQUFQLEdBQXdCLElBQXhCOzs7O0FBdENtRSxZQTBDbkUsQ0FBTyxPQUFQLEdBQWlCLGVBQWUsU0FBZixDQUF5QjtBQUN4QyxhQUFLLGtDQUFMOztBQUVBLGdCQUFRLE1BQVI7QUFDQSxlQUFPLGVBQVMsTUFBVCxFQUFnQjs7QUFFckIsaUJBQU8sS0FBUCxDQUFhLEtBQWIsR0FBcUIsTUFBckIsQ0FGcUI7QUFHckIsaUJBQU8sS0FBUCxDQUFhLGNBQWIsR0FBOEIsT0FBTSxLQUFOLENBSFQ7O0FBS3JCLGtCQUFRLEdBQVIsQ0FBWSxPQUFPLEtBQVAsQ0FBWixDQUxxQjtBQU1yQix5QkFDRyxZQURILENBQ2dCLEdBRGhCLEVBQ3FCLGtCQURyQixFQUN5QyxPQUFNLEVBQU4sQ0FEekMsQ0FFRyxJQUZILENBRVEsVUFBUyxJQUFULEVBQWM7QUFDbEIsb0JBQVEsR0FBUixDQUFZLElBQVosRUFEa0I7QUFFbEIseUJBQWEsV0FBYixDQUF5QixPQUFPLEtBQVAsQ0FBekIsQ0FDRyxJQURILENBQ1EsVUFBUyxJQUFULEVBQWM7QUFDbEIsc0JBQVEsR0FBUixDQUFZLElBQVosRUFEa0I7YUFBZCxDQURSLENBSUcsS0FKSCxDQUlTLFVBQVMsR0FBVCxFQUFhO0FBQ2xCLHNCQUFRLEdBQVIsQ0FBWSxHQUFaLEVBRGtCO2FBQWIsQ0FKVCxDQUZrQjtXQUFkLENBRlIsQ0FZRyxLQVpILENBWVMsVUFBUyxHQUFULEVBQWE7QUFDbEIsb0JBQVEsR0FBUixDQUFZLEdBQVosRUFEa0I7V0FBYixDQVpUOzs7Ozs7Ozs7Ozs7Ozs7OztBQU5xQixTQUFoQjtPQUpRLENBQWpCOzs7QUExQ21FLFlBd0ZuRSxDQUFPLFdBQVAsR0FBcUIsVUFBUyxFQUFULEVBQVk7OztBQUcvQixlQUFPLEtBQVAsR0FBZTtBQUNiLGlCQUFPLE9BQU8sSUFBUCxDQUFZLFVBQVo7QUFDUCxxQkFBVyxPQUFPLElBQVAsQ0FBWSxTQUFaO0FBQ1gsZ0NBQXNCLE9BQU8sSUFBUCxDQUFZLFVBQVo7U0FIeEIsQ0FIK0I7O0FBUy9COztTQUVHLGFBRkgsQ0FFaUIsT0FBTyxLQUFQLENBRmpCLENBR0csSUFISCxDQUlJLFVBQVMsSUFBVCxFQUFlOztBQUViLGlCQUFPLGNBQVAsR0FBd0IsRUFBeEIsQ0FGYTtBQUdiLGlCQUFPLEtBQVAsR0FBZSxLQUFLLEtBQUw7OztBQUhGLGdCQU1iLENBQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0I7QUFDbEIsa0JBQU0sZ0JBQU47QUFDQSx5QkFBYSxrQkFBYjtBQUNBLG9CQUFRLEdBQVI7V0FIRixFQU5hO1NBQWYsRUFZQSxVQUFTLEdBQVQsRUFBYztBQUNaLGlCQUFPLGNBQVAsR0FBd0IsSUFBSSxHQUFKLENBRFo7QUFFWixrQkFBUSxHQUFSLENBQVksR0FBWixFQUZZO1NBQWQsQ0FoQkosQ0FUK0I7O0FBK0IvQixXQUFHLGNBQUgsR0EvQitCO09BQVosQ0F4RjhDO0tBQXpEO0FBMkhaLFVBQU0sY0FBUyxLQUFULEVBQWdCLEVBQWhCLEVBQW9CLEtBQXBCLEVBQTBCO0FBQzlCLFNBQUcsSUFBSCxDQUFRLFFBQVIsRUFBa0IsRUFBbEIsQ0FBcUIsT0FBckIsRUFBOEIsWUFBVTtBQUN0QyxZQUFNLGNBQWMsR0FBRyxJQUFILENBQVEsUUFBUixFQUFrQixDQUFsQixDQUFkLENBRGdDO0FBRXRDLGdCQUFRLE9BQVIsQ0FBZ0IsV0FBaEIsRUFBNkIsTUFBN0IsR0FGc0M7T0FBVixDQUE5QixDQUQ4QjtLQUExQjtBQU1OLGNBQVUsR0FBVjtBQUNBLGlCQUFhLG9DQUFiO0dBbklGLENBRDRDO0NBQVYsQ0FBcEM7OztBQ0FBLGNBQWMsU0FBZCxDQUF3QixlQUF4QixFQUF5QyxVQUFTLFlBQVQsRUFBc0I7QUFDN0QsU0FBTztBQUNMLGdCQUFZLG9CQUFTLE1BQVQsRUFBZ0I7QUFDMUIsYUFBTyxJQUFQLEdBQWM7QUFDWixjQUFNLElBQU47QUFDQSxlQUFPLElBQVA7QUFDQSxvQkFBWSxTQUFaO0FBQ0EsaUJBQVMsSUFBVDtBQUNBLGtCQUFVLENBQ1IsU0FEUSxFQUVSLFNBRlEsRUFHUixPQUhRLEVBSVIsU0FKUSxDQUFWOztPQUxGLENBRDBCOztBQWUxQixVQUFJLGNBQWMsU0FBZCxXQUFjLEdBQVU7QUFDMUIsZUFBTyxZQUFQLEdBQXNCLEVBQXRCLENBRDBCO0FBRTFCLGVBQU8sYUFBUCxHQUF1QixFQUF2QixDQUYwQjtPQUFWLENBZlE7O0FBb0IxQixVQUFJLGNBQWMsU0FBZCxXQUFjLEdBQVU7QUFDMUIsZUFBTyxJQUFQLENBQVksSUFBWixHQUFtQixJQUFuQixDQUQwQjtBQUUxQixlQUFPLElBQVAsQ0FBWSxLQUFaLEdBQW9CLElBQXBCLENBRjBCO0FBRzFCLGVBQU8sSUFBUCxDQUFZLE9BQVosR0FBc0IsSUFBdEIsQ0FIMEI7QUFJMUIsZUFBTyxJQUFQLENBQVksVUFBWixHQUF5QixTQUF6QixDQUowQjtPQUFWLENBcEJROztBQTJCMUIsYUFBTyxpQkFBUCxHQUEyQixZQUFVO0FBQ25DLHNCQURtQzs7QUFHbkMscUJBQWEsYUFBYixDQUEyQixPQUFPLElBQVAsQ0FBWSxLQUFaLENBQTNCLENBQ0csSUFESCxDQUVJLFVBQVMsSUFBVCxFQUFjO0FBQ1osbUJBRFk7QUFFWixjQUNFLE9BQU8sSUFBUCxDQUFZLElBQVosS0FBcUIsRUFBckIsSUFDQSxPQUFPLElBQVAsQ0FBWSxJQUFaLEtBQXFCLElBQXJCLElBQ0EsT0FBTyxJQUFQLENBQVksS0FBWixLQUFzQixFQUF0QixJQUNBLE9BQU8sSUFBUCxDQUFZLEtBQVosS0FBc0IsSUFBdEIsSUFDQSxPQUFPLElBQVAsQ0FBWSxVQUFaLEtBQTJCLEVBQTNCLElBQ0EsT0FBTyxJQUFQLENBQVksVUFBWixLQUEyQixJQUEzQixJQUNBLE9BQU8sSUFBUCxDQUFZLE9BQVosS0FBd0IsRUFBeEIsSUFDQSxPQUFPLElBQVAsQ0FBWSxPQUFaLEtBQXdCLElBQXhCLEVBQ0Q7QUFDQyxtQkFBTyxZQUFQLEdBQXNCLFlBQXRCLENBREQ7QUFFQyxtQkFBTyxTQUFQLEdBQW1CLCtDQUFuQixDQUZEO1dBVEQsTUFhSztBQUNILHlCQUNHLG9CQURILENBRUksT0FBTyxJQUFQLENBQVksSUFBWixFQUNBLE9BQU8sSUFBUCxDQUFZLEtBQVosRUFDQSxPQUFPLElBQVAsQ0FBWSxVQUFaLEVBQ0EsT0FBTyxJQUFQLENBQVksT0FBWixDQUxKLENBT0csSUFQSCxDQVFJLFVBQVMsSUFBVCxFQUFjO0FBQ1osNEJBRFk7QUFFWiw0QkFGWTtBQUdaLHFCQUFPLGFBQVAsR0FBdUIsWUFBdkIsQ0FIWTtBQUlaLHFCQUFPLFdBQVAsR0FBcUIsMkNBQXJCOztBQUpZLGFBQWQsRUFPQSxVQUFTLEdBQVQsRUFBYTtBQUNYLHFCQUFPLFNBQVAsR0FBbUIsbURBQW5CLENBRFc7QUFFWCxxQkFBTyxZQUFQLEdBQXNCLFlBQXRCLENBRlc7YUFBYixDQWZKLENBREc7V0FiTDtTQUZGLEVBc0NBLFVBQVMsR0FBVCxFQUFhO0FBQ1gsaUJBQU8sWUFBUCxHQUFzQixZQUF0QixDQURXO0FBRVgsaUJBQU8sU0FBUCxHQUFtQixxQ0FBbkIsQ0FGVztTQUFiLENBeENKLENBSG1DO09BQVYsQ0EzQkQ7S0FBaEI7QUE2RVosY0FBVSxHQUFWO0FBQ0EsaUJBQWEsaURBQWI7R0EvRUYsQ0FENkQ7Q0FBdEIsQ0FBekM7OztBQ0FBLGNBQWMsU0FBZCxDQUF3QixPQUF4QixFQUFpQyxZQUFVO0FBQ3pDLFNBQU87QUFDTCxnQkFBWSxvQkFBUyxNQUFULEVBQWlCLFdBQWpCLEVBQTZCO0FBQ3ZDLGFBQU8sU0FBUCxHQUFtQixZQUFVO0FBQzNCLFlBQUksSUFBSixFQUFVLEdBQVYsQ0FEMkI7O0FBRzNCLGVBQU8sUUFBUSxPQUFSLENBQWdCLFNBQVMsY0FBVCxDQUF3QixxQkFBeEIsQ0FBaEIsRUFBZ0UsR0FBaEUsRUFBUCxDQUgyQjtBQUkzQixjQUFNLFFBQVEsT0FBUixDQUFnQixTQUFTLGNBQVQsQ0FBd0IsZ0JBQXhCLENBQWhCLEVBQTJELEdBQTNELEVBQU4sQ0FKMkI7O0FBTTNCLG9CQUFZLFNBQVosQ0FBc0IsSUFBdEIsRUFBNEIsR0FBNUIsRUFDRyxJQURILENBRUksVUFBUyxJQUFULEVBQWM7QUFDWixrQkFBUSxHQUFSLENBQVksSUFBWixFQURZO1NBQWQsRUFHQSxVQUFTLEdBQVQsRUFBYTtBQUNYLGtCQUFRLEdBQVIsQ0FBWSxHQUFaLEVBRFc7U0FBYixDQUxKLENBTjJCO09BQVYsQ0FEb0I7O0FBbUJ2QyxhQUFPLFVBQVAsR0FBb0IsWUFBVTtBQUM1QixvQkFBWSxVQUFaLEdBQ0csSUFESCxDQUVJLFVBQVMsSUFBVCxFQUFjO0FBQ1osa0JBQVEsR0FBUixDQUFZLElBQVosRUFEWTtTQUFkLEVBR0EsVUFBUyxHQUFULEVBQWE7QUFDWCxrQkFBUSxHQUFSLENBQVksR0FBWixFQURXO1NBQWIsQ0FMSixDQUQ0QjtPQUFWLENBbkJtQjtLQUE3QjtBQStCWixjQUFVLEdBQVY7QUFDQSxpQkFBYSw2QkFBYjtHQWpDRixDQUR5QztDQUFWLENBQWpDOzs7QUNBQSxjQUFjLFNBQWQsQ0FBd0IsWUFBeEIsRUFBc0MsVUFBUyxVQUFULEVBQXFCLE1BQXJCLEVBQTRCO0FBQ2hFLFNBQU87QUFDTCxnQkFBWSxvQkFBUyxNQUFULEVBQWlCLFdBQWpCLEVBQTZCO0FBQ3ZDLGFBQU8sV0FBUCxHQUFxQixFQUFyQixDQUR1Qzs7QUFHdkMsYUFBTyxnQkFBUCxHQUEwQixZQUFVO0FBQ2xDLGVBQU8sV0FBUCxHQUFxQixFQUFyQixDQURrQztPQUFWLENBSGE7O0FBT3ZDLGFBQU8sZUFBUCxHQUF5QixZQUFVO0FBQ2pDLGVBQU8sV0FBUCxHQUFxQixVQUFyQixDQURpQztPQUFWLENBUGM7O0FBV3ZDLGFBQU8sWUFBUCxHQUFzQixjQUF0QixDQVh1QztBQVl2QyxhQUFPLFNBQVAsR0FBbUIsWUFBVTtBQUFDLGVBQU8sWUFBUCxHQUFzQixjQUF0QixDQUFEO09BQVYsQ0Fab0I7QUFhdkMsYUFBTyxTQUFQLEdBQW1CLFlBQVU7QUFBQyxlQUFPLFlBQVAsR0FBc0IsYUFBdEIsQ0FBRDtPQUFWLENBYm9COztBQWV2QyxhQUFPLFVBQVAsR0FBb0IsWUFBVTtBQUM1QixZQUFJLFFBQVEsRUFBRSxjQUFGLENBQVI7OztBQUR3QixhQUk1QixDQUFNLElBQU4sQ0FBVyxPQUFYLEVBQW9CLEdBQXBCLENBQXdCLEVBQXhCOzs7QUFKNEIsY0FPNUIsQ0FBTyxnQkFBUCxHQVA0QjtPQUFWLENBZm1COztBQXlCdkMsYUFBTyxTQUFQLEdBQW1CLFlBQVU7QUFDM0IsWUFBSSxJQUFKLEVBQVUsR0FBVixDQUQyQjtBQUUzQixZQUFJLFFBQVEsRUFBRSxjQUFGLENBQVIsQ0FGdUI7O0FBSTNCLGVBQU8sUUFBUSxPQUFSLENBQWdCLFNBQVMsY0FBVCxDQUF3QixnQkFBeEIsQ0FBaEIsRUFBMkQsR0FBM0QsRUFBUCxDQUoyQjtBQUszQixjQUFNLFFBQVEsT0FBUixDQUFnQixTQUFTLGNBQVQsQ0FBd0IsZ0JBQXhCLENBQWhCLEVBQTJELEdBQTNELEVBQU4sQ0FMMkI7O0FBTzNCLG9CQUFZLFNBQVosQ0FBc0IsSUFBdEIsRUFBNEIsR0FBNUIsRUFBaUMsSUFBakMsQ0FDRSxVQUFTLElBQVQsRUFBYztBQUNaLFlBQUUsY0FBRixFQUFrQixLQUFsQixDQUF3QixNQUF4QixFQURZO0FBRVosaUJBQU8sZ0JBQVAsR0FGWTtBQUdaLGlCQUFPLFVBQVAsR0FIWTtBQUlaLGlCQUFPLFNBQVA7Ozs7O0FBSlksY0FTVCxXQUFXLFdBQVgsS0FBMkIsSUFBM0IsRUFBZ0M7QUFDakMsbUJBQU8sRUFBUCxDQUFVLFdBQVcsV0FBWCxDQUFWLENBRGlDO0FBRWpDLHVCQUFXLFdBQVgsR0FBeUIsSUFBekIsQ0FGaUM7V0FBbkM7U0FURixFQWNBLFVBQVMsR0FBVCxFQUFhO0FBQ1gsaUJBQU8sZUFBUCxHQURXO0FBRVgsaUJBQU8sU0FBUCxHQUZXO1NBQWIsQ0FmRixDQVAyQjtPQUFWLENBekJvQjtLQUE3QjtBQXdEWixjQUFVLEdBQVY7QUFDQSxpQkFBYSx5Q0FBYjtHQTFERixDQURnRTtDQUE1QixDQUF0Qzs7O0FDQUEsY0FBYyxTQUFkLENBQXdCLFdBQXhCLEVBQXFDLFVBQVMsTUFBVCxFQUFnQjtBQUNuRCxTQUFPO0FBQ0wsZ0JBQVksb0JBQVMsTUFBVCxFQUFpQixXQUFqQixFQUE2QjtBQUN2QyxhQUFPLGdCQUFQLEdBQTBCLGFBQTFCLENBRHVDO0FBRXZDLGFBQU8sZ0JBQVAsR0FBMEIsWUFBMUIsQ0FGdUM7O0FBSXZDLGFBQU8sVUFBUCxHQUFvQixZQUFVO0FBQzVCLGVBQU8sZ0JBQVAsR0FBMEIsT0FBTyxnQkFBUCxLQUE0QixhQUE1QixHQUE0QyxXQUE1QyxHQUEwRCxhQUExRCxDQURFO09BQVYsQ0FKbUI7O0FBUXZDLGFBQU8sR0FBUCxDQUFXLGNBQVgsRUFBMkIsWUFBVTtBQUNuQyxlQUFPLGdCQUFQLEdBQTBCLGFBQTFCLENBRG1DO09BQVYsQ0FBM0IsQ0FSdUM7O0FBYXZDLGFBQU8sR0FBUCxDQUFXLGVBQVgsRUFBNEIsWUFBVTtBQUNwQyxlQUFPLGdCQUFQLEdBQTBCLFlBQTFCLENBRG9DO09BQVYsQ0FBNUIsQ0FidUM7O0FBaUJ2QyxhQUFPLFVBQVAsR0FBb0IsWUFBVTtBQUM1QixvQkFBWSxVQUFaLEdBQXlCLElBQXpCLENBQ0UsVUFBUyxJQUFULEVBQWM7QUFDWixrQkFBUSxHQUFSLENBQVksSUFBWixFQURZO0FBRVosaUJBQU8sRUFBUCxDQUFVLE9BQVYsRUFGWTtTQUFkLEVBSUEsVUFBUyxHQUFULEVBQWE7QUFDWCxrQkFBUSxHQUFSLENBQVksR0FBWixFQURXO1NBQWIsQ0FMRixDQUQ0QjtPQUFWLENBakJtQjs7QUE2QnZDLGFBQU8sY0FBUCxHQUF3QixZQUFVO0FBQ2hDLFVBQUUsY0FBRixFQUFrQixLQUFsQixDQUF3QixNQUF4QixFQURnQztPQUFWLENBN0JlO0tBQTdCO0FBaUNaLFVBQU0sY0FBUyxLQUFULEVBQWdCLEVBQWhCLEVBQW9CLEtBQXBCLEVBQTBCO0FBQzlCLFFBQUUsRUFBRixFQUFNLElBQU4sQ0FBVyxhQUFYLEVBQTBCLEVBQTFCLENBQTZCLE9BQTdCLEVBQXNDLFlBQVU7QUFDOUMsY0FBTSxVQUFOLEdBRDhDO09BQVYsQ0FBdEMsQ0FEOEI7S0FBMUI7QUFLTixjQUFVLEdBQVY7QUFDQSxpQkFBYSx5QkFBYjtHQXhDRixDQURtRDtDQUFoQixDQUFyQztBQ0FBOztBQUVBLGNBQWMsU0FBZCxDQUF3QixRQUF4QixFQUFrQyxZQUFVO0FBQzFDLFNBQU87QUFDTCxnQkFBWSxvQkFBUyxNQUFULEVBQWlCLFFBQWpCLEVBQTJCLE1BQTNCLEVBQW1DLFVBQW5DLEVBQStDLFdBQS9DLEVBQTRELFlBQTVELEVBQXlFOzs7Ozs7QUFNbkYsYUFBTyxhQUFQLEdBQXVCLFlBQVU7QUFDL0IsWUFBSSxRQUFRLFFBQVEsT0FBUixDQUFnQixTQUFTLGNBQVQsQ0FBd0IsZ0JBQXhCLENBQWhCLEVBQTJELEdBQTNELEVBQVIsQ0FEMkI7O0FBRy9CLHFCQUFhLGFBQWIsQ0FBMkIsS0FBM0IsRUFDRyxJQURILENBRUksVUFBUyxJQUFULEVBQWM7QUFDWixpQkFBTyxVQUFQLEdBQW9CLEVBQXBCLENBRFk7U0FBZCxFQUdBLFVBQVMsR0FBVCxFQUFhO0FBQ1gsaUJBQU8sY0FBUCxHQUF3QixxQ0FBeEIsQ0FEVztBQUVYLGlCQUFPLFVBQVAsR0FBb0IsWUFBcEIsQ0FGVztTQUFiLENBTEosQ0FIK0I7T0FBVixDQU40RDs7QUFxQm5GLGFBQU8sVUFBUCxHQUFvQixZQUFVO0FBQzVCLFlBQUksUUFBSixFQUFjLEtBQWQsRUFBcUIsR0FBckIsRUFBMEIsVUFBMUIsQ0FENEI7QUFFNUIsWUFBSSxZQUFZLEVBQVosQ0FGd0I7O0FBSTVCLG1CQUFXLFFBQVEsT0FBUixDQUFnQixTQUFTLGNBQVQsQ0FBd0IsbUJBQXhCLENBQWhCLEVBQThELEdBQTlELEVBQVgsQ0FKNEI7QUFLNUIsZ0JBQVEsUUFBUSxPQUFSLENBQWdCLFNBQVMsY0FBVCxDQUF3QixnQkFBeEIsQ0FBaEIsRUFBMkQsR0FBM0QsRUFBUixDQUw0QjtBQU01QixjQUFNLFFBQVEsT0FBUixDQUFnQixTQUFTLGNBQVQsQ0FBd0IsbUJBQXhCLENBQWhCLEVBQThELEdBQTlELEVBQU4sQ0FONEI7QUFPNUIscUJBQWEsUUFBUSxPQUFSLENBQWdCLFNBQVMsY0FBVCxDQUF3QiwyQkFBeEIsQ0FBaEIsRUFBc0UsR0FBdEUsRUFBYjs7O0FBUDRCLFlBVXpCLGFBQWEsRUFBYixJQUFtQixVQUFVLEVBQVYsSUFBZ0IsUUFBUSxFQUFSLEVBQVc7QUFDL0MsaUJBQU8sWUFBUCxHQUFzQixZQUF0QixDQUQrQztBQUUvQyxvQkFBVSxJQUFWLENBQWUsS0FBZixFQUYrQztTQUFqRCxNQUdPO0FBQ0wsaUJBQU8sWUFBUCxHQUFzQixFQUF0QixDQURLO1NBSFA7O0FBT0EsWUFBSSxRQUFRLFVBQVIsRUFBbUI7QUFDckIsaUJBQU8sYUFBUCxHQUF1QixZQUF2QixDQURxQjtBQUVyQixvQkFBVSxJQUFWLENBQWUsS0FBZixFQUZxQjtTQUF2QixNQUdPO0FBQ0wsaUJBQU8sYUFBUCxHQUF1QixFQUF2QixDQURLO1NBSFA7O0FBT0EsWUFBRyxVQUFVLE1BQVYsS0FBcUIsQ0FBckIsRUFBdUI7QUFDeEIsc0JBQVksTUFBWixDQUFtQixRQUFuQixFQUE2QixLQUE3QixFQUFvQyxHQUFwQyxFQUNHLElBREgsQ0FFSSxVQUFTLElBQVQsRUFBYztBQUNaLHVCQUFXLFVBQVgsQ0FBc0IsY0FBdEIsRUFEWTtBQUVaLG1CQUFPLGFBQVAsR0FBdUIsWUFBdkI7OztBQUZZLHVCQUtaLENBQVksU0FBWixDQUFzQixRQUF0QixFQUFnQyxHQUFoQyxFQUNHLElBREgsQ0FFSSxVQUFTLElBQVQsRUFBYztBQUNaLHVCQUFTLFlBQVU7QUFDakIsdUJBQU8sRUFBUCxDQUFVLGNBQVYsRUFEaUI7ZUFBVixFQUVOLEdBRkgsRUFEWTthQUFkLEVBS0EsVUFBUyxHQUFULEVBQWE7QUFDWCxzQkFBUSxHQUFSLENBQVksR0FBWixFQURXO2FBQWIsQ0FQSixDQUxZO1dBQWQsRUFpQkEsVUFBUyxHQUFULEVBQWE7QUFDWCxvQkFBTyxJQUFJLEtBQUosQ0FBVSxJQUFWO0FBQ0wsbUJBQUssQ0FBQyxDQUFEO0FBQ0gsdUJBQU8saUJBQVAsR0FBMkIsOEJBQTNCLENBREY7QUFFRSx1QkFBTyxhQUFQLEdBQXVCLFlBQXZCLENBRkY7QUFHRSxzQkFIRjs7QUFERixtQkFNTyxHQUFMO0FBQ0UsdUJBQU8saUJBQVAsR0FBMkIsd0NBQTNCLENBREY7QUFFRSx1QkFBTyxhQUFQLEdBQXVCLFlBQXZCLENBRkY7QUFHRSxzQkFIRjs7QUFORixtQkFXTyxHQUFMO0FBQ0UsdUJBQU8sY0FBUCxHQUF3Qiw0Q0FBNEMsS0FBNUMsR0FBb0QsR0FBcEQsQ0FEMUI7QUFFRSx1QkFBTyxVQUFQLEdBQW9CLFlBQXBCLENBRkY7O0FBWEY7QUFnQkksd0JBQVEsR0FBUixDQUFZLGdCQUFaLEVBREY7QUFmRixhQURXO1dBQWIsQ0FuQkosQ0FEd0I7U0FBMUI7T0F4QmtCLENBckIrRDtLQUF6RTtBQXlGWixjQUFVLEdBQVY7QUFDQSxpQkFBYSwrQkFBYjtHQTNGRixDQUQwQztDQUFWLENBQWxDOzs7QUNGQSxjQUFjLFNBQWQsQ0FBd0IsYUFBeEIsRUFBdUMsWUFBVTtBQUMvQyxTQUFPO0FBQ0wsZ0JBQVksb0JBQVMsTUFBVCxFQUFpQixXQUFqQixFQUE2Qjs7QUFFdkMsYUFBTyxPQUFQLEdBQWlCLENBQ2Y7QUFDRSxtQkFBVyxvQkFBWDtBQUNBLGVBQU8saUJBQVA7QUFDQSxtQkFBVyxrREFBWDtBQUNBLGdCQUFRLFVBQVI7T0FMYSxFQU9mO0FBQ0UsbUJBQVcsb0JBQVg7QUFDQSxlQUFPLFFBQVA7QUFDQSxtQkFBVyw2RUFBWDtBQUNBLGdCQUFRLFVBQVI7T0FYYSxFQVliO0FBQ0EsbUJBQVcsZ0JBQVg7QUFDQSxlQUFPLFNBQVA7QUFDQSxtQkFBVyxvREFBWDtBQUNBLGdCQUFRLFVBQVI7T0FoQmEsQ0FBakIsQ0FGdUM7S0FBN0I7QUFzQlosY0FBVSxHQUFWO0FBQ0EsaUJBQWEsMkNBQWI7R0F4QkYsQ0FEK0M7Q0FBVixDQUF2QyIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnJlcXVpcmUoJ2FuZ3VsYXInKTtcbnJlcXVpcmUoJ2FuZ3VsYXItdWktcm91dGVyJyk7XG5jb25zdCBQYXJzZSA9IHJlcXVpcmUoJ3BhcnNlJyk7XG5cbmNvbnN0IGNvbnRyb2xsZXJBcnJheSA9IFtcbiAgXCJ1aS5yb3V0ZXJcIlxuXTtcblxubGV0IG1vdmllUGl0Y2hBcHAgPSBhbmd1bGFyLm1vZHVsZShcIm1vdmllUGl0Y2hBcHBcIiwgY29udHJvbGxlckFycmF5KVxuICAuY29uZmlnKFtcIiRzdGF0ZVByb3ZpZGVyXCIsIFwiJHVybFJvdXRlclByb3ZpZGVyXCIsXG4gICAgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcil7XG5cbiAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICAgLy8gTWFpbiBOYXZcbiAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnaW5kZXgnLCB7XG4gICAgICAgICAgdXJsOiBcIi9cIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9ob21lLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FkbWluJywge1xuICAgICAgICAgIHVybDogXCIvYWRtaW5cIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9hZG1pbi5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgLy8gQWNjb3VudFxuICAgICAgLy8gJHN0YXRlUHJvdmlkZXJcbiAgICAgIC8vICAgLnN0YXRlKCdyZWdpc3RlcicsIHtcbiAgICAgIC8vICAgICB1cmw6IFwiL3JlZ2lzdGVyXCIsXG4gICAgICAvLyAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvcmVnaXN0ZXIuaHRtbFwiLFxuICAgICAgLy8gICAgIGRhdGE6IHtcbiAgICAgIC8vICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgIC8vICAgICB9XG4gICAgICAvLyAgIH0pXG4gICAgICAvLyAgIC5zdGF0ZSgnbXktYWNjb3VudCcsIHtcbiAgICAgIC8vICAgICB1cmw6IFwiL215LWFjY291bnRcIixcbiAgICAgIC8vICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9teS1hY2NvdW50Lmh0bWxcIixcbiAgICAgIC8vICAgICBkYXRhOiB7XG4gICAgICAvLyAgICAgICByZXF1aXJlTG9naW46IHRydWVcbiAgICAgIC8vICAgICB9XG4gICAgICAvLyAgIH0pO1xuXG5cbiAgICAgIC8vIEZvb3RlciBOYXZcbiAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnZmFxJywge1xuICAgICAgICAgIHVybDogXCIvZmFxXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvZmFxLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3ByZXNzJywge1xuICAgICAgICAgIHVybDogXCIvcHJlc3NcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9wcmVzcy5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdjb250YWN0LXVzJywge1xuICAgICAgICAgIHVybDogXCIvY29udGFjdC11c1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2NvbnRhY3QtdXMuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnbGVnYWwnLCB7XG4gICAgICAgICAgdXJsOiBcIi9sZWdhbFwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2xlZ2FsLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cbiAgXSlcbiAgLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKXtcbiAgICBQYXJzZS5pbml0aWFsaXplKFwiUFI5V0JIRXZqU3VXOXVzOFE3U0doMktZUlZRYUhMYnp0WmpzaHNiMVwiLCBcIm55ejdOOXNHTFVJTjFoak1ZOU5OUW5lRXh4UDVXME1KaFhIM3UxUWhcIik7XG5cbiAgICAvLyBNYWtlIHN1cmUgYSB1c2VyIGlzIGxvZ2dlZCBvdXRcbiAgICBQYXJzZS5Vc2VyLmxvZ091dCgpO1xuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUpe1xuICAgICAgbGV0IHJlcXVpcmVMb2dpbiA9IHRvU3RhdGUuZGF0YS5yZXF1aXJlTG9naW47XG4gICAgICAvLyBjb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAvLyBjb25zb2xlLmxvZyh0b1N0YXRlKTtcblxuICAgICAgaWYocmVxdWlyZUxvZ2luID09PSB0cnVlICYmICRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICRyb290U2NvcGUudGFyZ2V0U3RhdGUgPSB0b1N0YXRlLm5hbWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICB9KTtcbiIsIm1vdmllUGl0Y2hBcHAuY29udHJvbGxlcignTWFpbkN0cmwnLCBbJyRzY29wZScsXG4gIGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgLy8gJHNjb3BlLiRvbignbG9naW4tdHJ1ZScsIGZ1bmN0aW9uKCl7XG4gICAgLy8gICAkc2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgLy8gfSlcbiAgfVxuXSlcbiIsIm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgnZW1haWxGYWN0b3J5JywgZnVuY3Rpb24oJHEpe1xuICBsZXQgc2VuZGdyaWQgPSByZXF1aXJlKCdzZW5kZ3JpZCcpKCdTRy4yQ1NxeDk5alEyLVV3VWY4QmlVVU9RLktlS0VjdkE1cW5XQ0FXakhDcjhJMFRLaDg4SkJGOExLQnFId05IS0VsOW8nKTtcblxuICBsZXQgZmFjdG9yeSA9IHtcblxuICAgIC8vIE1vY2sgdXAgc2VuZGluZyBhIGNvbnRhY3QgZW1haWxcbiAgICAvLyBodHRwczovL25vZGVtYWlsZXIuY29tL1xuICAgIHNlbmRDb250YWN0VXNNZXNzYWdlOiBmdW5jdGlvbihuYW1lLCBlbWFpbCwgc3ViamVjdCwgbXNnKXtcbiAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgIHN1YmplY3Q6IHN1YmplY3QsXG4gICAgICAgIG1lc3NhZ2U6IG1zZ1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICB2YWxpZGF0ZUVtYWlsOiBmdW5jdGlvbihlbWFpbCkge1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgbGV0IHJlZyA9IC9eKFthLXpBLVowLTlfXFwuXFwtXSkrXFxAKChbYS16QS1aMC05XFwtXSkrXFwuKSsoW2EtekEtWjAtOV17Miw0fSkrJC87XG5cbiAgICAgIGlmKHJlZy50ZXN0KGVtYWlsKSl7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BhcnNlRmFjdG9yeScsIGZ1bmN0aW9uKCRxKSB7XG4gIHZhciBmYWN0b3J5ID0ge1xuICAgIHN1Ym1pdFBpdGNoOiBmdW5jdGlvbihnZW5yZSwgdGV4dCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbiB0byBzdG9yZSB0aGUgcGl0Y2hcbiAgICAgIGlmICgkcm9vdFNjb3BlLmN1clVzZXIgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIFBpdGNoID0gUGFyc2UuT2JqZWN0LmV4dGVuZChcIlBpdGNoXCIpO1xuICAgICAgICB2YXIgcGl0Y2ggPSBuZXcgUGl0Y2goKTtcblxuICAgICAgICBwaXRjaC5zZXQoXCJnZW5yZVwiLCBnZW5yZSk7XG4gICAgICAgIHBpdGNoLnNldChcInBpdGNoXCIsIHRleHQpO1xuICAgICAgICAvLyBwaXRjaC5zZXQoXCJjcmVhdGVyXCIsIFBhcnNlLlVzZXIuY3VycmVudC51c2VybmFtZSlcbiAgICAgICAgcGl0Y2guc2V0KFwicmV2aWV3ZWRcIiwgZmFsc2UpXG5cblxuICAgICAgICBwaXRjaC5zYXZlKG51bGwsIHtcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihwaXRjaCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICAgIGRhdGE6IHBpdGNoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihwaXRjaCwgZXJyb3IpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgICAgICBkYXRhOiBlcnJvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVqZWN0IHRoZSBzYXZlIGF0dGVtcHQgaWYgbm8gY3VycmVudCB1c2VyXG4gICAgICBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBub3QgbG9nZ2VkIGluXCJcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BheW1lbnRGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuICB2YXIgZmFjdG9yeSA9IHtcblxuICAgIGNyZWF0ZUNoYXJnZTogZnVuY3Rpb24oYW1vdW50LCBkZXNjcmlwdGlvbiwgdG9rZW4pe1xuICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgdXJsOiBcImh0dHBzOi8vbW92aWVwaXRjaGFwaS5oZXJva3VhcHAuY29tL3N0cmlwZS9jcmVhdGVfY2hhcmdlXCIsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBhbW91bnQ6IGFtb3VudCxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gICAgICAgICAgY3VycmVuY3k6IFwidXNkXCIsXG4gICAgICAgICAgc291cmNlOiB0b2tlblxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BpdGNoRmFjdG9yeScsIGZ1bmN0aW9uKCRxLCAkaHR0cCkge1xuICB2YXIgZmFjdG9yeSA9IHtcbiAgICBzdWJtaXRQaXRjaDogZnVuY3Rpb24ocGl0Y2gpIHtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIHVybDogXCJodHRwczovL21vdmllcGl0Y2hhcGkuaGVyb2t1YXBwLmNvbS9waXRjaFwiLFxuICAgICAgICBkYXRhOiBwaXRjaFxuICAgICAgfSlcbiAgICB9LFxuICAgIHZhbGlkYXRlUGl0Y2g6IGZ1bmN0aW9uKHBpdGNoKXtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHBpdGNoKTtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmKFxuICAgICAgICBwaXRjaC51c2VySGFzQWNjZXB0ZWRUZXJtcyA9PT0gdHJ1ZSAmJlxuICAgICAgICBwaXRjaC5waXRjaFRleHQgIT09IFwiXCIgJiZcbiAgICAgICAgcGl0Y2gucGl0Y2hUZXh0ICE9PSBudWxsICYmXG4gICAgICAgIHBpdGNoLmdlbnJlICE9PSBcIlNlbGVjdCBHZW5yZVwiICYmXG4gICAgICAgIHBpdGNoLmdlbnJlICE9PSBcIlwiXG4gICAgICApIHtcbiAgICAgICAgcGl0Y2guc3RhdHVzID0gXCJjcmVhdGVkXCI7XG4gICAgICAgIHBpdGNoLnVzZXJIYXNBY2NlcHRlZFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgcGl0Y2ggOiBwaXRjaFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZWxzZSBpZiAoXG4gICAgICAgIHBpdGNoLnBpdGNoVGV4dCA9PT0gXCJcIiB8fCBwaXRjaC5waXRjaFRleHQgPT09IG51bGwgJiZcbiAgICAgICAgcGl0Y2guZ2VucmUgPT09IFwiXCIgfHwgcGl0Y2guZ2VucmUgPT09IFwiU2VsZWN0IEdlbnJlXCIpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICBlcnJvckNvZGU6IDEwMDAsXG4gICAgICAgICAgICBtc2c6IFwiUGxlYXNlIGZpbGwgb3V0IHRoZSBwaXRjaCBmb3JtIGJlZm9yZSBzdWJtaXR0aW5nLlwiXG4gICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGVsc2UgaWYocGl0Y2gudXNlckhhc0FjY2VwdGVkVGVybXMgPT09IGZhbHNlKXtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBlcnJvckNvZGU6IDEwMDEsXG4gICAgICAgICAgbXNnOiBcIlBsZWFzZSBhY2NlcHQgdGhlIHRlcm1zIGluIG9yZGVyIHRvIGNvbnRpbnVlLlwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBlbHNlIGlmIChwaXRjaC5waXRjaFRleHQgPT09IFwiXCIgfHwgcGl0Y2gucGl0Y2hUZXh0ID09PSBudWxsKXtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBlcnJvckNvZGU6IDEwMDIsXG4gICAgICAgICAgbXNnOiBcIlJvYmVydCBpcyBnb29kLCBidXQgbm90IGdvb2QgZW5vdWdoIHRvIHNlbGwgYSBibGFuayBwaXRjaCFcIlxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZWxzZSBpZiAocGl0Y2guZ2VucmUgPT09IFwiXCIgfHwgcGl0Y2guZ2VucmUgPT09IFwiU2VsZWN0IEdlbnJlXCIpe1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIGVycm9yQ29kZTogMTAwMyxcbiAgICAgICAgICBtc2c6IFwiV2hhdCBraW5kIG9mIG1vdmllIGlzIGl0PyBQbGVhc2Ugc2VsZWN0IGEgZ2VucmUuXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIGVycm9yQ29kZTogOTk5OSxcbiAgICAgICAgICBtc2c6IFwiQW4gdW5rbm93biBlcnJvciBoYXMgb2NjdXJyZWQuXCIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgndXNlckZhY3RvcnknLCBmdW5jdGlvbigkcSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgY2hlY2tMb2dnZWRJbjogZnVuY3Rpb24oKXtcbiAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmKCRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcxJyk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAkbG9jYXRpb24udXJsKCcvbG9naW4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJzInKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIGxvZ2luVXNlcjogZnVuY3Rpb24odXNlcm5hbWUsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwd2QpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IHVzZXI7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YTogdXNlclxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICBsb2dvdXRVc2VyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAgIHZhciB1c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbiAgICAgIGlmKHVzZXIgPT09IG51bGwpe1xuICAgICAgICAvLyBSZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgJHJvb3RTY29wZVxuICAgICAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ291dC11cGRhdGUnKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBsb2dnZWQgb3V0XCJcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIHN0aWxsIGxvZ2dlZCBpblwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgc2lnblVwOiBmdW5jdGlvbih1c2VybmFtZSwgZW1haWwsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICB2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgICB1c2VyLnNldChcInVzZXJuYW1lXCIsIHVzZXJuYW1lKTtcbiAgICAgIHVzZXIuc2V0KFwiZW1haWxcIiwgZW1haWwpO1xuICAgICAgdXNlci5zZXQoXCJwYXNzd29yZFwiLCBwd2QpO1xuXG4gICAgICB1c2VyLnNpZ25VcChudWxsLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIGRhdGE6IHVzZXJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnIpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgICAgIGVycm9yOiBlcnJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FkbWluUGl0Y2hSZXZpZXcnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAkc2NvcGUucGl0Y2hlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJOb3ZlbWJlciAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJSb21hbnRpYyBDb21lZHlcIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiQSBtYW4gZmFsbHMgaW4gbG92ZSB3aXRoIGEgbGFkeSwgYnV0IGl0J3MgZnVubnkuXCIsXG4gICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJPY3RvYmVyIDIzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJIb3Jyb3JcIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiQSB3b21hbiBrZWVwcyBjaGVja2luZyBoZXIgZnJpZGdlLCBidXQgdGhlcmUncyBuZXZlciBhbnl0aGluZyB3b3J0aCBlYXRpbmcuXCIsXG4gICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCJcbiAgICAgICAgfSx7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIkp1bmUgM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiV2VzdGVyblwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJTb21lIGNvd2JveXMgcmlkZSBhcm91bmQgY2hhc2luZyBhIGdhbmcgb2YgdGhpZXZlc1wiLFxuICAgICAgICAgIHN0YXR1czogXCJhY2NlcHRlZFwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdwaXRjaEJveCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkcSwgJGh0dHAsIHBheW1lbnRGYWN0b3J5LCBwaXRjaEZhY3Rvcnkpe1xuXG4gICAgICAvLyBQb3B1bGF0ZSBhbiBhcnJheSBvZiBnZW5yZXMsIGFuZCBjcmVhdGUgc29tZSB2YXJpYWJsZXNcbiAgICAgIC8vIGZvciB0aGUgbmctbW9kZWxzIHRvIGJpbmQgdG9cbiAgICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICBnZW5yZXM6IFtcbiAgICAgICAgICBcIlNlbGVjdCBHZW5yZVwiLFxuICAgICAgICAgIFwiQWN0aW9uXCIsXG4gICAgICAgICAgXCJBZHZlbnR1cmVcIixcbiAgICAgICAgICBcIkFuaW1hdGVkXCIsXG4gICAgICAgICAgXCJDb21lZHlcIixcbiAgICAgICAgICBcIkNyaW1lXCIsXG4gICAgICAgICAgXCJEcmFtYVwiLFxuICAgICAgICAgIFwiRmFudGFzeVwiLFxuICAgICAgICAgIFwiSGlzdG9yaWNhbFwiLFxuICAgICAgICAgIFwiSGlzdG9yaWNhbCBGaWN0aW9uXCIsXG4gICAgICAgICAgXCJIb3Jyb3JcIixcbiAgICAgICAgICBcIktpZHNcIixcbiAgICAgICAgICBcIk15c3RlcnlcIixcbiAgICAgICAgICBcIlBvbGl0aWNhbFwiLFxuICAgICAgICAgIFwiUmVsaWdpb3VzXCIsXG4gICAgICAgICAgXCJSb21hbmNlXCIsXG4gICAgICAgICAgXCJSb21hbnRpYyBDb21lZHlcIixcbiAgICAgICAgICBcIlNhdGlyZVwiLFxuICAgICAgICAgIFwiU2NpZW5jZSBGaWN0aW9uXCIsXG4gICAgICAgICAgXCJUaHJpbGxlclwiLFxuICAgICAgICAgIFwiV2VzdGVyblwiXG4gICAgICAgIF0sXG4gICAgICAgIHBpdGNoR2VucmU6IFwiU2VsZWN0IEdlbnJlXCIsXG4gICAgICAgIHBpdGNoVGV4dDogbnVsbCxcbiAgICAgICAgdGVybXNBZ3JlZTogZmFsc2VcbiAgICAgIH1cblxuICAgICAgLy8gQ2FydmUgb3V0IGEgcGxhY2UgZm9yIHN0b3JpbmcgYSBzdWJtaXR0ZWQgcGl0Y2hcbiAgICAgICRzY29wZS5waXRjaCA9IG51bGw7XG5cbiAgICAgIC8vIFNldCB0aGlzIHByb3BlcnR5IHRvIGNvbmZpZ3VyZSBhbGVydCBtZXNzYWdlcyBkaXNwbGF5ZWRcbiAgICAgIC8vIG9uIHZhbGlkYXRpb24gZmFpbHVyZXNcbiAgICAgICRzY29wZS52YWxpZGF0aW9uVGV4dCA9IG51bGw7XG5cbiAgICAgIC8vIFRoZSBIYW5kbGVyIGhhcyBzb21lIGJhc2ljIFN0cmlwZSBjb25maWcgYW5kIHRoZW4gY2FsbHMgdGhlIHBheW1lbnRcbiAgICAgIC8vIHN1Y2Nlc3MgZnVuY3Rpb25cbiAgICAgICRzY29wZS5oYW5kbGVyID0gU3RyaXBlQ2hlY2tvdXQuY29uZmlndXJlKHtcbiAgICAgICAga2V5OiAncGtfdGVzdF9YSGtodDBHTUxRUHJuMnNZQ1hTRnk0RnMnLFxuICAgICAgICAvLyBpbWFnZTogJy9pbWcvZG9jdW1lbnRhdGlvbi9jaGVja291dC9tYXJrZXRwbGFjZS5wbmcnLFxuICAgICAgICBsb2NhbGU6ICdhdXRvJyxcbiAgICAgICAgdG9rZW46IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBwaXRjaCBvYmplY3Qgd2l0aCB0aGUgcGF5bWVudCB0b2tlblxuICAgICAgICAgICRzY29wZS5waXRjaC50b2tlbiA9IHRva2VuO1xuICAgICAgICAgICRzY29wZS5waXRjaC5zdWJtaXR0ZXJFbWFpbCA9IHRva2VuLmVtYWlsO1xuXG4gICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnBpdGNoKTtcbiAgICAgICAgICBwYXltZW50RmFjdG9yeVxuICAgICAgICAgICAgLmNyZWF0ZUNoYXJnZSgyMDAsIFwiUGl0Y2ggc3VibWlzc2lvblwiLCB0b2tlbi5pZClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgICAgcGl0Y2hGYWN0b3J5LnN1Ym1pdFBpdGNoKCRzY29wZS5waXRjaClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIENyZWF0ZSBhbiBhcnJheSBvZiBwcm9taXNlcyB0byBydW4gd2hlbiB0aGUgU3RyaXBlXG4gICAgICAgICAgLy8gaGFuZGxlciBjcmVhdGVzIGFuZCByZXR1cm5zIGEgY2hhcmdlIHRva2VuXG4gICAgICAgICAgLy8gJHFcbiAgICAgICAgICAvLyAgIC5hbGwoW1xuICAgICAgICAgIC8vICAgICBwaXRjaEZhY3Rvcnkuc3VibWl0UGl0Y2goJHNjb3BlLnBpdGNoKSxcbiAgICAgICAgICAvLyAgICAgY2hhcmdlQ2FyZCgpXG4gICAgICAgICAgLy8gICBdKVxuICAgICAgICAgIC8vICAgLnRoZW4oZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgLy8gICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAvLyAgIH0pXG4gICAgICAgICAgLy8gICAuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAvLyAgICAgZGVidWdnZXI7XG4gICAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgLy8gICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cblxuICAgICAgLy8gUnVuIHRoZSBoYW5kbGVyIHdoZW4gc29tZW9uZSBjbGlja3MgJ3N1Ym1pdCdcbiAgICAgICRzY29wZS5zdWJtaXRQaXRjaCA9IGZ1bmN0aW9uKGV2KXtcblxuICAgICAgICAvLyBDcmVhdGUgYSBwaXRjaCBvYmplY3QgZm9yIHZhbGlkYXRpb25cbiAgICAgICAgJHNjb3BlLnBpdGNoID0ge1xuICAgICAgICAgIGdlbnJlOiAkc2NvcGUuZGF0YS5waXRjaEdlbnJlLFxuICAgICAgICAgIHBpdGNoVGV4dDogJHNjb3BlLmRhdGEucGl0Y2hUZXh0LFxuICAgICAgICAgIHVzZXJIYXNBY2NlcHRlZFRlcm1zOiAkc2NvcGUuZGF0YS50ZXJtc0FncmVlXG4gICAgICAgIH07XG5cbiAgICAgICAgcGl0Y2hGYWN0b3J5XG4gICAgICAgICAgLy8gVmFsaWRhdGUgdGhlIHBpdGNoIG9iamVjdFxuICAgICAgICAgIC52YWxpZGF0ZVBpdGNoKCRzY29wZS5waXRjaClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgICAgICAgICAgLy8gSWYgUGl0Y2ggdmFsaWRhdGVzLCBidWlsZCBhIHBpdGNoIGluICRzY29wZVxuICAgICAgICAgICAgICAkc2NvcGUudmFsaWRhdGlvblRleHQgPSBcIlwiO1xuICAgICAgICAgICAgICAkc2NvcGUucGl0Y2ggPSByZXNwLnBpdGNoO1xuXG4gICAgICAgICAgICAgIC8vIE9wZW4gdGhlIFN0cmlwZSBDaGVja291dCBIYW5kbGVyXG4gICAgICAgICAgICAgICRzY29wZS5oYW5kbGVyLm9wZW4oe1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiTW92aWVQaXRjaC5jb21cIixcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJQaXRjaCBTdWJtaXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgYW1vdW50OiAyMDBcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICRzY29wZS52YWxpZGF0aW9uVGV4dCA9IGVyci5tc2c7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuXG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9O1xuXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWwsIGF0dHJzKXtcbiAgICAgIGVsLmZpbmQoJ3NlbGVjdCcpLm9uKCdmb2N1cycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnN0IHNlbGVjdEdlbnJlID0gZWwuZmluZCgnb3B0aW9uJylbMF07XG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChzZWxlY3RHZW5yZSkucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL2NoZWNrb3V0L3BpdGNoLWJveC5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnY29udGFjdFVzRm9ybScsIGZ1bmN0aW9uKGVtYWlsRmFjdG9yeSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICBlbWFpbDogbnVsbCxcbiAgICAgICAgbXNnU3ViamVjdDogXCJHZW5lcmFsXCIsXG4gICAgICAgIG1lc3NhZ2U6IG51bGwsXG4gICAgICAgIHN1YmplY3RzOiBbXG4gICAgICAgICAgXCJHZW5lcmFsXCIsXG4gICAgICAgICAgXCJCaWxsaW5nXCIsXG4gICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgIFwiU3VwcG9ydFwiXG4gICAgICAgIF0sXG5cbiAgICAgIH1cblxuICAgICAgbGV0IGNsZWFyRXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwiXCI7XG4gICAgICAgICRzY29wZS5zdWJtaXRTdWNjZXNzID0gXCJcIjtcbiAgICAgIH07XG5cbiAgICAgIGxldCBjbGVhckZpZWxkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5kYXRhLm5hbWUgPSBudWxsO1xuICAgICAgICAkc2NvcGUuZGF0YS5lbWFpbCA9IG51bGw7XG4gICAgICAgICRzY29wZS5kYXRhLm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAkc2NvcGUuZGF0YS5tc2dTdWJqZWN0ID0gXCJHZW5lcmFsXCI7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q29udGFjdEZvcm0gPSBmdW5jdGlvbigpe1xuICAgICAgICBjbGVhckVycm9ycygpO1xuXG4gICAgICAgIGVtYWlsRmFjdG9yeS52YWxpZGF0ZUVtYWlsKCRzY29wZS5kYXRhLmVtYWlsKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICBpZihcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5uYW1lID09PSBcIlwiIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubmFtZSA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLmVtYWlsID09PSBcIlwiIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEuZW1haWwgPT09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5tc2dTdWJqZWN0ID09PSBcIlwiIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubXNnU3ViamVjdCA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLm1lc3NhZ2UgPT09IFwiXCIgfHxcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5tZXNzYWdlID09PSBudWxsXG4gICAgICAgICAgICAgICl7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIlBsZWFzZSBmaWxsIG91dCBlYWNoIGZpZWxkIGJlZm9yZSBzdWJtaXR0aW5nLlwiO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtYWlsRmFjdG9yeVxuICAgICAgICAgICAgICAgICAgLnNlbmRDb250YWN0VXNNZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5lbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubXNnU3ViamVjdCxcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICAgICAgIGNsZWFyRXJyb3JzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgY2xlYXJGaWVsZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3VibWl0U3VjY2VzcyA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdWNjZXNzVGV4dCA9IFwiU3VjY2VzcyEgWW91ciBtZXNzYWdlIGhhcyBiZWVuIHN1Ym1pdHRlZC5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJBbiBlcnJvciBoYXMgb2NjdXJyZWQuIFlvdXIgbWVzc2FnZSB3YXMgbm90IHNlbnQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFkZHJlc3MuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9jb250YWN0LXVzLWZvcm0vY29udGFjdC11cy1mb3JtLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdsb2dpbicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUubG9naW5Vc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcblxuICAgICAgICB1c2VyID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItbG9naW4tcHdkJykpLnZhbCgpO1xuXG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VyLCBwd2QpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfTtcblxuXG4gICAgICAkc2NvcGUubG9nb3V0VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ291dFVzZXIoKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL2xvZ2luL2xvZ2luLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdsb2dpbk1vZGFsJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiXCI7XG5cbiAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJcIjtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmZsYWdJbnB1dEVycm9ycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiaXMtZXJyb3JcIjtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtaGlkZGVuXCI7XG4gICAgICAkc2NvcGUuaGlkZUFsZXJ0ID0gZnVuY3Rpb24oKXskc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1oaWRkZW5cIn07XG4gICAgICAkc2NvcGUuc2hvd0FsZXJ0ID0gZnVuY3Rpb24oKXskc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1zaG93blwifTtcblxuICAgICAgJHNjb3BlLmNsZWFyRm9ybXMgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbW9kYWwgPSAkKCcjbG9naW4tbW9kYWwnKTtcblxuICAgICAgICAvLyBDbGVhciBFeGlzdGluZyBJbnB1dHNcbiAgICAgICAgbW9kYWwuZmluZCgnaW5wdXQnKS52YWwoJycpO1xuXG4gICAgICAgIC8vIFJlc2V0IEVycm9yIE5vdGlmaWNhdGlvbnNcbiAgICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMoKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnVzZXJMb2dpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VyLCBwd2Q7XG4gICAgICAgIHZhciBtb2RhbCA9ICQoJyNsb2dpbi1tb2RhbCcpO1xuXG4gICAgICAgIHVzZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLXBhc3N3b3JkJykpLnZhbCgpO1xuXG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VyLCBwd2QpLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMoKTtcbiAgICAgICAgICAgICRzY29wZS5jbGVhckZvcm1zKCk7XG4gICAgICAgICAgICAkc2NvcGUuaGlkZUFsZXJ0KCk7XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSAkcm9vdFNjb3BlIGlzIGluIHRoZSBwcm9jZXNzIG9mIG5hdmlnYXRpbmcgdG8gYSBzdGF0ZSxcbiAgICAgICAgICAgIC8vIGFzIGluIGFuIGV2ZW50IHdoZXJlIGxvZ2luIGludGVycnVwdHMgbmF2aWdhdGlvbiB0byBhIHJlc3RyaWN0ZWQgcGFnZVxuICAgICAgICAgICAgLy8gY29udGludWUgdG8gdGhhdCBzdGF0ZSwgb3RoZXJ3aXNlIGNsZWFyIHRoZSAkcm9vdFNjb3BlLnRhcmdldFN0YXRlXG4gICAgICAgICAgICBpZigkcm9vdFNjb3BlLnRhcmdldFN0YXRlICE9PSBudWxsKXtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCRyb290U2NvcGUudGFyZ2V0U3RhdGUpO1xuICAgICAgICAgICAgICAkcm9vdFNjb3BlLnRhcmdldFN0YXRlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAkc2NvcGUuZmxhZ0lucHV0RXJyb3JzKCk7XG4gICAgICAgICAgICAkc2NvcGUuc2hvd0FsZXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuXG5cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogJ2NvbXBvbmVudHMvbG9naW4tbW9kYWwvbG9naW4tbW9kYWwuaHRtbCdcbiAgfVxufSlcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdhcHBIZWFkZXInLCBmdW5jdGlvbigkc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSBcIm1lbnUtY2xvc2VkXCI7XG4gICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dpblwiO1xuXG4gICAgICAkc2NvcGUudG9nZ2xlTWVudSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID0gJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPT09IFwibWVudS1jbG9zZWRcIiA/IFwibWVudS1vcGVuXCIgOiBcIm1lbnUtY2xvc2VkXCI7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dpbi11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dvdXRcIjtcbiAgICAgIH0pO1xuXG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ291dC11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dpblwiO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5sb2dvdXRVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdXNlckZhY3RvcnkubG9nb3V0VXNlcigpLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaW5kZXgnKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLm9wZW5Mb2dpbk1vZGFsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbCwgYXR0cnMpe1xuICAgICAgJChlbCkuZmluZCgnLm1haW4tbmF2IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBzY29wZS50b2dnbGVNZW51KCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL25hdi9uYXYuaHRtbFwiXG4gIH1cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdzaWdudXAnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsICRzdGF0ZSwgJHJvb3RTY29wZSwgdXNlckZhY3RvcnksIGVtYWlsRmFjdG9yeSl7XG4gICAgICAvLyAkc2NvcGUuZ2VuZXJhbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLmVtYWlsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS5wYXNzd29yZEVycm9yID0gXCJcIjtcblxuICAgICAgJHNjb3BlLnZhbGlkYXRlRW1haWwgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgZW1haWwgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWVtYWlsJykpLnZhbCgpO1xuXG4gICAgICAgIGVtYWlsRmFjdG9yeS52YWxpZGF0ZUVtYWlsKGVtYWlsKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yID0gXCJcIjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvclRleHQgPSBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFkZHJlc3MuXCI7XG4gICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnNpZ251cFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlcm5hbWUsIGVtYWlsLCBwd2QsIGNvbmZpcm1Qd2Q7XG4gICAgICAgIHZhciB0ZXN0QXJyYXkgPSBbXTtcblxuICAgICAgICB1c2VybmFtZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIGVtYWlsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1lbWFpbCcpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1wYXNzd29yZCcpKS52YWwoKTtcbiAgICAgICAgY29uZmlybVB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItY29uZmlybS1wYXNzd29yZCcpKS52YWwoKTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgZW50cmllcyBleGlzdCBmb3IgYWxsIHRocmVlIHByaW1hcnkgZmllbGRzXG4gICAgICAgIGlmKHVzZXJuYW1lID09PSBcIlwiIHx8IGVtYWlsID09PSBcIlwiIHx8IHB3ZCA9PT0gXCJcIil7XG4gICAgICAgICAgJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHRlc3RBcnJheS5wdXNoKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUuZ2VuZXJhbEVycm9yID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwd2QgIT09IGNvbmZpcm1Qd2Qpe1xuICAgICAgICAgICRzY29wZS5wYXNzd29yZEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgdGVzdEFycmF5LnB1c2goZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5wYXNzd29yZEVycm9yID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRlc3RBcnJheS5sZW5ndGggPT09IDApe1xuICAgICAgICAgIHVzZXJGYWN0b3J5LnNpZ25VcCh1c2VybmFtZSwgZW1haWwsIHB3ZClcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ2luLXVwZGF0ZScpO1xuICAgICAgICAgICAgICAgICRzY29wZS5zaWdudXBTdWNjZXNzID0gXCJzaG93LWFsZXJ0XCI7XG5cbiAgICAgICAgICAgICAgICAvLyBsb2dpbiB0aGUgdXNlciBhZnRlciBhIHN1Y2Nlc3NmdWwgc2lnbnVwIGFuZCBuYXZpZ2F0ZSB0byBzdWJtaXQtcGl0Y2hcbiAgICAgICAgICAgICAgICB1c2VyRmFjdG9yeS5sb2dpblVzZXIodXNlcm5hbWUsIHB3ZClcbiAgICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdzdWJtaXQtcGl0Y2gnKTtcbiAgICAgICAgICAgICAgICAgICAgICB9LCA1NTApO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgc3dpdGNoKGVyci5lcnJvci5jb2RlKXtcbiAgICAgICAgICAgICAgICAgIGNhc2UgLTE6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yVGV4dCA9IFwiVGhlIHVzZXJuYW1lIGZpZWxkIGlzIGVtcHR5LlwiXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICBjYXNlIDIwMjpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3JUZXh0ID0gXCJUaGUgZGVzaXJlZCB1c2VybmFtZSBpcyBhbHJlYWR5IHRha2VuLlwiXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICBjYXNlIDIwMzpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3JUZXh0ID0gXCJBbiBhY2NvdW50IGhhcyBhbHJlYWR5IGJlZW4gY3JlYXRlZCBhdCBcIiArIGVtYWlsICsgXCIuXCI7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG5cbiAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmNhdWdodCBlcnJvcicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL3NpZ251cC9zaWdudXAuaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3VzZXJQaXRjaGVzJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcblxuICAgICAgJHNjb3BlLnBpdGNoZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiTm92ZW1iZXIgM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiUm9tYW50aWMgQ29tZWR5XCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgbWFuIGZhbGxzIGluIGxvdmUgd2l0aCBhIGxhZHksIGJ1dCBpdCdzIGZ1bm55LlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiT2N0b2JlciAyM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiSG9ycm9yXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgd29tYW4ga2VlcHMgY2hlY2tpbmcgaGVyIGZyaWRnZSwgYnV0IHRoZXJlJ3MgbmV2ZXIgYW55dGhpbmcgd29ydGggZWF0aW5nLlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0se1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJKdW5lIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIldlc3Rlcm5cIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiU29tZSBjb3dib3lzIHJpZGUgYXJvdW5kIGNoYXNpbmcgYSBnYW5nIG9mIHRoaWV2ZXNcIixcbiAgICAgICAgICBzdGF0dXM6IFwiYWNjZXB0ZWRcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy91c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmh0bWxcIlxuICB9XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
