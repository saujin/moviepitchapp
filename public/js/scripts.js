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

moviePitchApp.directive('checkoutButton', function () {
  return {
    controller: function controller($scope) {
      $scope.handler = StripeCheckout.configure({
        key: 'pk_test_XHkht0GMLQPrn2sYCXSFy4Fs',
        // image: '/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function token(_token) {
          // Use the token to create the charge with a server-side script.
          // You can access the token ID with `token.id`
          console.log(_token);
          // $scope.$emit('payment-success', token);
        }
      });
    },
    link: function link(scope, el, attrs) {
      el.on('click', function (e) {
        scope.handler.open({
          name: "MoviePitch.com",
          description: "Pitch Submission",
          amount: 200
        });
        e.preventDefault();
      });
    },
    restrict: "A"
  };
});
'use strict';

moviePitchApp.directive('pitchBox', function () {
  return {
    scope: function scope($scope) {
      $scope.$on('payment-success', function (token) {
        debugger;
        console.log(token);
        console.log('yo');
      });
    },
    link: function link(scope, el, attrs) {
      console.log(scope);
    },
    restrict: "A"
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

moviePitchApp.directive('selectGenre', function () {
  return {
    controller: function controller($scope) {
      $scope.genres = ["Select Genre", "Action", "Adventure", "Animated", "Comedy", "Crime", "Drama", "Fantasy", "Historical", "Historical Fiction", "Horror", "Kids", "Mystery", "Political", "Religious", "Romance", "Romantic Comedy", "Satire", "Science Fiction", "Thriller", "Western"];
    },
    link: function link(scope, el, attrs) {
      el.on('focus', function () {
        var selectGenre = el.find('option')[0];
        angular.element(selectGenre).remove();
      });
    },
    restrict: "A"
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJwYXltZW50RmFjdG9yeS5qcyIsInVzZXJGYWN0b3J5LmpzIiwiYWRtaW4tcGl0Y2gtcmV2aWV3L2FkbWluLXBpdGNoLXJldmlldy5qcyIsImFjdGlvbi1idXR0b24vYWN0aW9uLWJ1dHRvbi5qcyIsImNvbnRhY3QtdXMtZm9ybS9jb250YWN0LXVzLWZvcm0uanMiLCJjaGVja291dC9jaGVja291dC1idXR0b24uanMiLCJjaGVja291dC9waXRjaC1ib3guanMiLCJsb2dpbi9sb2dpbi5qcyIsIm5hdi9uYXYuanMiLCJsb2dpbi1tb2RhbC9sb2dpbi1tb2RhbC5qcyIsInNlbGVjdC1nZW5yZS9zZWxlY3QtZ2VucmUuanMiLCJzaWdudXAvc2lnbnVwLmpzIiwic3VibWl0UGl0Y2gvc3VibWl0UGl0Y2guanMiLCJ1c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkIsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDN0IsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUvQixJQUFNLGVBQWUsR0FBRyxDQUN0QixXQUFXLENBQ1osQ0FBQzs7QUFFRixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FDakUsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQzdDLFVBQVMsY0FBYyxFQUFFLGtCQUFrQixFQUFDOztBQUUxQyxvQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDOzs7QUFBQyxBQUdsQyxnQkFBYyxDQUNYLEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDZCxPQUFHLEVBQUUsR0FBRztBQUNSLGVBQVcsRUFB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LENBQUMsQ0FBQzs7O0FDNURILGFBQWEsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLFlBQVU7QUFDL0MsU0FBTztBQUNMLGNBQVUsRUFBRSxvQkFBUyxNQUFNLEVBQUUsV0FBVyxFQUFDOztBQUV2QyxZQUFNLENBQUMsT0FBTyxHQUFHLENBQ2Y7QUFDRSxpQkFBUyxFQUFFLG9CQUFvQjtBQUMvQixhQUFLLEVBQUUsaUJBQWlCO0FBQ3hCLGlCQUFTLEVBQUUsa0RBQWtEO0FBQzdELGNBQU0sRUFBRSxVQUFVO09BQ25CLEVBQ0Q7QUFDRSxpQkFBUyxFQUFFLG9CQUFvQjtBQUMvQixhQUFLLEVBQUUsUUFBUTtBQUNmLGlCQUFTLEVBQUUsNkVBQTZFO0FBQ3hGLGNBQU0sRUFBRSxVQUFVO09BQ25CLEVBQUM7QUFDQSxpQkFBUyxFQUFFLGdCQUFnQjtBQUMzQixhQUFLLEVBQUUsU0FBUztBQUNoQixpQkFBUyxFQUFFLG9EQUFvRDtBQUMvRCxjQUFNLEVBQUUsVUFBVTtPQUNuQixDQUNGLENBQUE7S0FDRjtBQUNELFlBQVEsRUFBRSxHQUFHO0FBQ2IsZUFBVyxFQUFFLDJDQUEyQztHQUN6RCxDQUFBO0NBQ0YsQ0FBQyxDQUFDIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxucmVxdWlyZSgnYW5ndWxhcicpO1xucmVxdWlyZSgnYW5ndWxhci11aS1yb3V0ZXInKTtcbmNvbnN0IFBhcnNlID0gcmVxdWlyZSgncGFyc2UnKTtcblxuY29uc3QgY29udHJvbGxlckFycmF5ID0gW1xuICBcInVpLnJvdXRlclwiXG5dO1xuXG5sZXQgbW92aWVQaXRjaEFwcCA9IGFuZ3VsYXIubW9kdWxlKFwibW92aWVQaXRjaEFwcFwiLCBjb250cm9sbGVyQXJyYXkpXG4gIC5jb25maWcoW1wiJHN0YXRlUHJvdmlkZXJcIiwgXCIkdXJsUm91dGVyUHJvdmlkZXJcIixcbiAgICBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcblxuICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgICAvLyBNYWluIE5hdlxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdpbmRleCcsIHtcbiAgICAgICAgICB1cmw6IFwiL1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2hvbWUuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgICAgICAgdXJsOiBcIi9hZG1pblwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2FkbWluLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyAuc3RhdGUoJ291ci10ZWFtJywge1xuICAgICAgICAvLyAgIHVybDogXCIvb3VyLXRlYW1cIixcbiAgICAgICAgLy8gICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9vdXItdGVhbS5odG1sXCIsXG4gICAgICAgIC8vICAgZGF0YToge1xuICAgICAgICAvLyAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gfSlcbiAgICAgICAgLy8gLnN0YXRlKCdzdWNjZXNzLXN0b3JpZXMnLCB7XG4gICAgICAgIC8vICAgdXJsOiBcIi9zdWNjZXNzLXN0b3JpZXNcIixcbiAgICAgICAgLy8gICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9zdWNjZXNzLXN0b3JpZXMuaHRtbFwiLFxuICAgICAgICAvLyAgIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH0pXG4gICAgICAgIC8vIC5zdGF0ZSgnc3VibWl0LXBpdGNoJywge1xuICAgICAgICAvLyAgIHVybDogXCIvc3VibWl0LXBpdGNoXCIsXG4gICAgICAgIC8vICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvc3VibWl0LXBpdGNoLmh0bWxcIixcbiAgICAgICAgLy8gICBkYXRhOiB7XG4gICAgICAgIC8vICAgICByZXF1aXJlTG9naW46IHRydWVcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAvLyBBY2NvdW50XG4gICAgICAvLyAkc3RhdGVQcm92aWRlclxuICAgICAgLy8gICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgLy8gICAgIHVybDogXCIvcmVnaXN0ZXJcIixcbiAgICAgIC8vICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9yZWdpc3Rlci5odG1sXCIsXG4gICAgICAvLyAgICAgZGF0YToge1xuICAgICAgLy8gICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfSlcbiAgICAgIC8vICAgLnN0YXRlKCdteS1hY2NvdW50Jywge1xuICAgICAgLy8gICAgIHVybDogXCIvbXktYWNjb3VudFwiLFxuICAgICAgLy8gICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL215LWFjY291bnQuaHRtbFwiLFxuICAgICAgLy8gICAgIGRhdGE6IHtcbiAgICAgIC8vICAgICAgIHJlcXVpcmVMb2dpbjogdHJ1ZVxuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfSk7XG5cblxuICAgICAgLy8gRm9vdGVyIE5hdlxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdmYXEnLCB7XG4gICAgICAgICAgdXJsOiBcIi9mYXFcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9mYXEuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgncHJlc3MnLCB7XG4gICAgICAgICAgdXJsOiBcIi9wcmVzc1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3ByZXNzLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2NvbnRhY3QtdXMnLCB7XG4gICAgICAgICAgdXJsOiBcIi9jb250YWN0LXVzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvY29udGFjdC11cy5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdsZWdhbCcsIHtcbiAgICAgICAgICB1cmw6IFwiL2xlZ2FsXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbGVnYWwuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuICBdKVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpe1xuICAgIFBhcnNlLmluaXRpYWxpemUoXCJQUjlXQkhFdmpTdVc5dXM4UTdTR2gyS1lSVlFhSExienRaanNoc2IxXCIsIFwibnl6N045c0dMVUlOMWhqTVk5Tk5RbmVFeHhQNVcwTUpoWEgzdTFRaFwiKTtcblxuICAgIC8vIE1ha2Ugc3VyZSBhIHVzZXIgaXMgbG9nZ2VkIG91dFxuICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSl7XG4gICAgICBsZXQgcmVxdWlyZUxvZ2luID0gdG9TdGF0ZS5kYXRhLnJlcXVpcmVMb2dpbjtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHRvU3RhdGUpO1xuXG4gICAgICBpZihyZXF1aXJlTG9naW4gPT09IHRydWUgJiYgJHJvb3RTY29wZS5jdXJVc2VyID09PSBudWxsKXtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgJHJvb3RTY29wZS50YXJnZXRTdGF0ZSA9IHRvU3RhdGUubmFtZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG4gIH0pO1xuIiwibW92aWVQaXRjaEFwcC5jb250cm9sbGVyKCdNYWluQ3RybCcsIFsnJHNjb3BlJyxcbiAgZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAvLyAkc2NvcGUuJG9uKCdsb2dpbi10cnVlJywgZnVuY3Rpb24oKXtcbiAgICAvLyAgICRzY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAvLyB9KVxuICB9XG5dKVxuIiwibW92aWVQaXRjaEFwcC5mYWN0b3J5KCdlbWFpbEZhY3RvcnknLCBmdW5jdGlvbigkcSl7XG4gIGxldCBzZW5kZ3JpZCA9IHJlcXVpcmUoJ3NlbmRncmlkJykoJ1NHLjJDU3F4OTlqUTItVXdVZjhCaVVVT1EuS2VLRWN2QTVxbldDQVdqSENyOEkwVEtoODhKQkY4TEtCcUh3TkhLRWw5bycpO1xuXG4gIGxldCBmYWN0b3J5ID0ge1xuXG4gICAgLy8gTW9jayB1cCBzZW5kaW5nIGEgY29udGFjdCBlbWFpbFxuICAgIC8vIGh0dHBzOi8vbm9kZW1haWxlci5jb20vXG4gICAgc2VuZENvbnRhY3RVc01lc3NhZ2U6IGZ1bmN0aW9uKG5hbWUsIGVtYWlsLCBzdWJqZWN0LCBtc2cpe1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgc3ViamVjdDogc3ViamVjdCxcbiAgICAgICAgbWVzc2FnZTogbXNnXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlRW1haWw6IGZ1bmN0aW9uKGVtYWlsKSB7XG4gICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBsZXQgcmVnID0gL14oW2EtekEtWjAtOV9cXC5cXC1dKStcXEAoKFthLXpBLVowLTlcXC1dKStcXC4pKyhbYS16QS1aMC05XXsyLDR9KSskLztcblxuICAgICAgaWYocmVnLnRlc3QoZW1haWwpKXtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGFyc2VGYWN0b3J5JywgZnVuY3Rpb24oJHEpIHtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgc3VibWl0UGl0Y2g6IGZ1bmN0aW9uKGdlbnJlLCB0ZXh0KSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIHVzZXIgaXMgbG9nZ2VkIGluIHRvIHN0b3JlIHRoZSBwaXRjaFxuICAgICAgaWYgKCRyb290U2NvcGUuY3VyVXNlciAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgUGl0Y2ggPSBQYXJzZS5PYmplY3QuZXh0ZW5kKFwiUGl0Y2hcIik7XG4gICAgICAgIHZhciBwaXRjaCA9IG5ldyBQaXRjaCgpO1xuXG4gICAgICAgIHBpdGNoLnNldChcImdlbnJlXCIsIGdlbnJlKTtcbiAgICAgICAgcGl0Y2guc2V0KFwicGl0Y2hcIiwgdGV4dCk7XG4gICAgICAgIC8vIHBpdGNoLnNldChcImNyZWF0ZXJcIiwgUGFyc2UuVXNlci5jdXJyZW50LnVzZXJuYW1lKVxuICAgICAgICBwaXRjaC5zZXQoXCJyZXZpZXdlZFwiLCBmYWxzZSlcblxuXG4gICAgICAgIHBpdGNoLnNhdmUobnVsbCwge1xuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHBpdGNoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgICAgZGF0YTogcGl0Y2hcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHBpdGNoLCBlcnJvcikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCIsXG4gICAgICAgICAgICAgIGRhdGE6IGVycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWplY3QgdGhlIHNhdmUgYXR0ZW1wdCBpZiBubyBjdXJyZW50IHVzZXJcbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIG5vdCBsb2dnZWQgaW5cIlxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGF5bWVudEZhY3RvcnknLCBmdW5jdGlvbigpe1xuICB2YXIgZmFjdG9yeSA9IHtcblxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5mYWN0b3J5KCd1c2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRxLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24pe1xuICB2YXIgZmFjdG9yeSA9IHtcbiAgICBjaGVja0xvZ2dlZEluOiBmdW5jdGlvbigpe1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgaWYoJHJvb3RTY29wZS5jdXJVc2VyID09PSBudWxsKXtcbiAgICAgICAgY29uc29sZS5sb2coJzEnKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICRsb2NhdGlvbi51cmwoJy9sb2dpbicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnMicpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgbG9naW5Vc2VyOiBmdW5jdGlvbih1c2VybmFtZSwgcHdkKXtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIFBhcnNlLlVzZXIubG9nSW4odXNlcm5hbWUsIHB3ZCkudGhlbihcbiAgICAgICAgZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgJHJvb3RTY29wZS5jdXJVc2VyID0gdXNlcjtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICBkYXRhOiB1c2VyXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICBlcnJvcjogZXJyXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIGxvZ291dFVzZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgUGFyc2UuVXNlci5sb2dPdXQoKTtcblxuICAgICAgdmFyIHVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblxuICAgICAgaWYodXNlciA9PT0gbnVsbCl7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgdXNlciBmcm9tIHRoZSAkcm9vdFNjb3BlXG4gICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9nb3V0LXVwZGF0ZScpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIGxvZ2dlZCBvdXRcIlxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgbXNnOiBcIlVzZXIgaXMgc3RpbGwgbG9nZ2VkIGluXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICBzaWduVXA6IGZ1bmN0aW9uKHVzZXJuYW1lLCBlbWFpbCwgcHdkKXtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIHZhciB1c2VyID0gbmV3IFBhcnNlLlVzZXIoKTtcbiAgICAgIHVzZXIuc2V0KFwidXNlcm5hbWVcIiwgdXNlcm5hbWUpO1xuICAgICAgdXNlci5zZXQoXCJlbWFpbFwiLCBlbWFpbCk7XG4gICAgICB1c2VyLnNldChcInBhc3N3b3JkXCIsIHB3ZCk7XG5cbiAgICAgIHVzZXIuc2lnblVwKG51bGwsIHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YTogdXNlclxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycil7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICB1c2VyOiB1c2VyLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYWRtaW5QaXRjaFJldmlldycsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICRzY29wZS5waXRjaGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk5vdmVtYmVyIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIG1hbiBmYWxscyBpbiBsb3ZlIHdpdGggYSBsYWR5LCBidXQgaXQncyBmdW5ueS5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk9jdG9iZXIgMjNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIkhvcnJvclwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIHdvbWFuIGtlZXBzIGNoZWNraW5nIGhlciBmcmlkZ2UsIGJ1dCB0aGVyZSdzIG5ldmVyIGFueXRoaW5nIHdvcnRoIGVhdGluZy5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiSnVuZSAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJXZXN0ZXJuXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIlNvbWUgY293Ym95cyByaWRlIGFyb3VuZCBjaGFzaW5nIGEgZ2FuZyBvZiB0aGlldmVzXCIsXG4gICAgICAgICAgc3RhdHVzOiBcImFjY2VwdGVkXCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FjdGlvbkJ1dHRvbicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGUpe1xuXG4gICAgICAkc2NvcGUudXBkYXRlID0gZnVuY3Rpb24oKXtcblxuICAgICAgICBpZigkcm9vdFNjb3BlLmN1clVzZXIgPT09IG51bGwpe1xuICAgICAgICAgICRzY29wZS50YXJnZXQgPSBcInJlZ2lzdGVyXCI7XG4gICAgICAgICAgJHNjb3BlLmFjdGlvblRleHQgPSBcIlJlZ2lzdGVyIFRvIFN0YXJ0IFBpdGNoaW5nIVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5hY3Rpb25UZXh0ID0gXCJTdWJtaXQgYSBQaXRjaCFcIjtcbiAgICAgICAgICAkc2NvcGUudGFyZ2V0ID0gXCJzdWJtaXQtcGl0Y2hcIjtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgJHNjb3BlLm5hdmlnYXRlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHN0YXRlLmdvKCRzY29wZS50YXJnZXQpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLiRvbignbG9naW4tdXBkYXRlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLnVwZGF0ZSgpO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ291dC11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUudXBkYXRlKCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbCwgYXR0cnMpe1xuICAgICAgc2NvcGUudXBkYXRlKCk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCJcbiAgfVxufSlcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdjb250YWN0VXNGb3JtJywgZnVuY3Rpb24oZW1haWxGYWN0b3J5KXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgJHNjb3BlLnN1YmplY3RzID0gW1xuICAgICAgICBcIkdlbmVyYWxcIixcbiAgICAgICAgXCJCaWxsaW5nXCIsXG4gICAgICAgIFwiU2FsZXNcIixcbiAgICAgICAgXCJTdXBwb3J0XCJcbiAgICAgIF07XG5cblxuICAgICAgbGV0IGNsZWFyRXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwiXCI7XG4gICAgICAgICRzY29wZS5zdWJtaXRTdWNjZXNzID0gXCJcIjtcbiAgICAgIH07XG5cbiAgICAgIGxldCBjbGVhckZpZWxkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICQoJ1tjb250YWN0LXVzLWZvcm1dJykuZmluZCgnLmZvcm0tY29udHJvbCcpLnZhbCgnJyk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q29udGFjdEZvcm0gPSBmdW5jdGlvbigpe1xuICAgICAgICBjbGVhckVycm9ycygpO1xuXG4gICAgICAgIGxldCBuYW1lLCBlbWFpbCwgc3ViamVjdCwgbWVzc2FnZTtcblxuICAgICAgICBuYW1lID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWN0LW5hbWUnKSkudmFsKCk7XG4gICAgICAgIGVtYWlsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWN0LWVtYWlsJykpLnZhbCgpO1xuICAgICAgICBzdWJqZWN0ID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWN0LXN1YmplY3QnKSkudmFsKCk7XG4gICAgICAgIG1lc3NhZ2UgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhY3QtbWVzc2FnZScpKS52YWwoKTtcblxuICAgICAgICBlbWFpbEZhY3RvcnkudmFsaWRhdGVFbWFpbChlbWFpbClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBpZihuYW1lID09PSBcIlwiIHx8IGVtYWlsID09PSBcIlwiIHx8IHN1YmplY3QgPT09IFwiXCIgfHwgbWVzc2FnZT09PVwiXCIpe1xuICAgICAgICAgICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJQbGVhc2UgZmlsbCBvdXQgZWFjaCBmaWVsZCBiZWZvcmUgc3VibWl0dGluZy5cIjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGVtYWlsRmFjdG9yeS5zZW5kQ29udGFjdFVzTWVzc2FnZShuYW1lLCBlbWFpbCwgc3ViamVjdCwgbWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgICAgICAgICBjbGVhckVycm9ycygpO1xuICAgICAgICAgICAgICAgICAgICAgIGNsZWFyRmllbGRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN1Ym1pdFN1Y2Nlc3MgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3VjY2Vzc1RleHQgPSBcIlN1Y2Nlc3MhIFlvdXIgbWVzc2FnZSBoYXMgYmVlbiBzdWJtaXR0ZWQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yVGV4dCA9IFwiQW4gZXJyb3IgaGFzIG9jY3VycmVkLiBZb3VyIG1lc3NhZ2Ugd2FzIG5vdCBzZW50LlwiO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9O1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvY29udGFjdC11cy1mb3JtL2NvbnRhY3QtdXMtZm9ybS5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnY2hlY2tvdXRCdXR0b24nLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAkc2NvcGUuaGFuZGxlciA9IFN0cmlwZUNoZWNrb3V0LmNvbmZpZ3VyZSh7XG4gICAgICAgIGtleTogJ3BrX3Rlc3RfWEhraHQwR01MUVBybjJzWUNYU0Z5NEZzJyxcbiAgICAgICAgLy8gaW1hZ2U6ICcvaW1nL2RvY3VtZW50YXRpb24vY2hlY2tvdXQvbWFya2V0cGxhY2UucG5nJyxcbiAgICAgICAgbG9jYWxlOiAnYXV0bycsXG4gICAgICAgIHRva2VuOiBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICAvLyBVc2UgdGhlIHRva2VuIHRvIGNyZWF0ZSB0aGUgY2hhcmdlIHdpdGggYSBzZXJ2ZXItc2lkZSBzY3JpcHQuXG4gICAgICAgIC8vIFlvdSBjYW4gYWNjZXNzIHRoZSB0b2tlbiBJRCB3aXRoIGB0b2tlbi5pZGBcbiAgICAgICAgICBjb25zb2xlLmxvZyh0b2tlbik7XG4gICAgICAgICAgLy8gJHNjb3BlLiRlbWl0KCdwYXltZW50LXN1Y2Nlc3MnLCB0b2tlbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICBlbC5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgc2NvcGUuaGFuZGxlci5vcGVuKHtcbiAgICAgICAgICBuYW1lOiBcIk1vdmllUGl0Y2guY29tXCIsXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiUGl0Y2ggU3VibWlzc2lvblwiLFxuICAgICAgICAgIGFtb3VudDogMjAwXG4gICAgICAgIH0pO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdwaXRjaEJveCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgc2NvcGU6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAkc2NvcGUuJG9uKCdwYXltZW50LXN1Y2Nlc3MnLCBmdW5jdGlvbih0b2tlbil7XG4gICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICBjb25zb2xlLmxvZyh0b2tlbik7XG4gICAgICAgIGNvbnNvbGUubG9nKCd5bycpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWwsIGF0dHJzKXtcbiAgICAgIGNvbnNvbGUubG9nKHNjb3BlKTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdsb2dpbicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUubG9naW5Vc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcblxuICAgICAgICB1c2VyID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItbG9naW4tcHdkJykpLnZhbCgpO1xuXG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VyLCBwd2QpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfTtcblxuXG4gICAgICAkc2NvcGUubG9nb3V0VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ291dFVzZXIoKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL2xvZ2luL2xvZ2luLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdhcHBIZWFkZXInLCBmdW5jdGlvbigkc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSBcIm1lbnUtY2xvc2VkXCI7XG4gICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dpblwiO1xuXG4gICAgICAkc2NvcGUudG9nZ2xlTWVudSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5tZW51VG9nZ2xlU3RhdHVzID0gJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPT09IFwibWVudS1jbG9zZWRcIiA/IFwibWVudS1vcGVuXCIgOiBcIm1lbnUtY2xvc2VkXCI7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dpbi11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dvdXRcIjtcbiAgICAgIH0pO1xuXG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ291dC11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuY3VycmVudExvZ0FjdGlvbiA9IFwic2hvdy1sb2dpblwiO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5sb2dvdXRVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdXNlckZhY3RvcnkubG9nb3V0VXNlcigpLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaW5kZXgnKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLm9wZW5Mb2dpbk1vZGFsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbCwgYXR0cnMpe1xuICAgICAgJChlbCkuZmluZCgnLm1haW4tbmF2IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBzY29wZS50b2dnbGVNZW51KCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL25hdi9uYXYuaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2xvZ2luTW9kYWwnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJcIjtcblxuICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcIlwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuZmxhZ0lucHV0RXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJpcy1lcnJvclwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1oaWRkZW5cIjtcbiAgICAgICRzY29wZS5oaWRlQWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LWhpZGRlblwifTtcbiAgICAgICRzY29wZS5zaG93QWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LXNob3duXCJ9O1xuXG4gICAgICAkc2NvcGUuY2xlYXJGb3JtcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBtb2RhbCA9ICQoJyNsb2dpbi1tb2RhbCcpO1xuXG4gICAgICAgIC8vIENsZWFyIEV4aXN0aW5nIElucHV0c1xuICAgICAgICBtb2RhbC5maW5kKCdpbnB1dCcpLnZhbCgnJyk7XG5cbiAgICAgICAgLy8gUmVzZXQgRXJyb3IgTm90aWZpY2F0aW9uc1xuICAgICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUudXNlckxvZ2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcbiAgICAgICAgdmFyIG1vZGFsID0gJCgnI2xvZ2luLW1vZGFsJyk7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tcGFzc3dvcmQnKSkudmFsKCk7XG5cbiAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXIsIHB3ZCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgICAgICAgJHNjb3BlLmNsZWFyRm9ybXMoKTtcbiAgICAgICAgICAgICRzY29wZS5oaWRlQWxlcnQoKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlICRyb290U2NvcGUgaXMgaW4gdGhlIHByb2Nlc3Mgb2YgbmF2aWdhdGluZyB0byBhIHN0YXRlLFxuICAgICAgICAgICAgLy8gYXMgaW4gYW4gZXZlbnQgd2hlcmUgbG9naW4gaW50ZXJydXB0cyBuYXZpZ2F0aW9uIHRvIGEgcmVzdHJpY3RlZCBwYWdlXG4gICAgICAgICAgICAvLyBjb250aW51ZSB0byB0aGF0IHN0YXRlLCBvdGhlcndpc2UgY2xlYXIgdGhlICRyb290U2NvcGUudGFyZ2V0U3RhdGVcbiAgICAgICAgICAgIGlmKCRyb290U2NvcGUudGFyZ2V0U3RhdGUgIT09IG51bGwpe1xuICAgICAgICAgICAgICAkc3RhdGUuZ28oJHJvb3RTY29wZS50YXJnZXRTdGF0ZSk7XG4gICAgICAgICAgICAgICRyb290U2NvcGUudGFyZ2V0U3RhdGUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICRzY29wZS5mbGFnSW5wdXRFcnJvcnMoKTtcbiAgICAgICAgICAgICRzY29wZS5zaG93QWxlcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG5cblxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiAnY29tcG9uZW50cy9sb2dpbi1tb2RhbC9sb2dpbi1tb2RhbC5odG1sJ1xuICB9XG59KVxuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3NlbGVjdEdlbnJlJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgJHNjb3BlLmdlbnJlcyA9IFtcbiAgICAgICAgXCJTZWxlY3QgR2VucmVcIixcbiAgICAgICAgXCJBY3Rpb25cIixcbiAgICAgICAgXCJBZHZlbnR1cmVcIixcbiAgICAgICAgXCJBbmltYXRlZFwiLFxuICAgICAgICBcIkNvbWVkeVwiLFxuICAgICAgICBcIkNyaW1lXCIsXG4gICAgICAgIFwiRHJhbWFcIixcbiAgICAgICAgXCJGYW50YXN5XCIsXG4gICAgICAgIFwiSGlzdG9yaWNhbFwiLFxuICAgICAgICBcIkhpc3RvcmljYWwgRmljdGlvblwiLFxuICAgICAgICBcIkhvcnJvclwiLFxuICAgICAgICBcIktpZHNcIixcbiAgICAgICAgXCJNeXN0ZXJ5XCIsXG4gICAgICAgIFwiUG9saXRpY2FsXCIsXG4gICAgICAgIFwiUmVsaWdpb3VzXCIsXG4gICAgICAgIFwiUm9tYW5jZVwiLFxuICAgICAgICBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICBcIlNhdGlyZVwiLFxuICAgICAgICBcIlNjaWVuY2UgRmljdGlvblwiLFxuICAgICAgICBcIlRocmlsbGVyXCIsXG4gICAgICAgIFwiV2VzdGVyblwiXG4gICAgICBdXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWwsIGF0dHJzKXtcbiAgICAgIGVsLm9uKCdmb2N1cycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGNvbnN0IHNlbGVjdEdlbnJlID0gZWwuZmluZCgnb3B0aW9uJylbMF07XG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChzZWxlY3RHZW5yZSkucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc2lnbnVwJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCAkc3RhdGUsICRyb290U2NvcGUsIHVzZXJGYWN0b3J5LCBlbWFpbEZhY3Rvcnkpe1xuICAgICAgLy8gJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS5lbWFpbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwiXCI7XG5cbiAgICAgICRzY29wZS52YWxpZGF0ZUVtYWlsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGVtYWlsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1lbWFpbCcpKS52YWwoKTtcblxuICAgICAgICBlbWFpbEZhY3RvcnkudmFsaWRhdGVFbWFpbChlbWFpbClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwiXCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3JUZXh0ID0gXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLlwiO1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5zaWdudXBVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXJuYW1lLCBlbWFpbCwgcHdkLCBjb25maXJtUHdkO1xuICAgICAgICB2YXIgdGVzdEFycmF5ID0gW107XG5cbiAgICAgICAgdXNlcm5hbWUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItZW1haWwnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItcGFzc3dvcmQnKSkudmFsKCk7XG4gICAgICAgIGNvbmZpcm1Qd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWNvbmZpcm0tcGFzc3dvcmQnKSkudmFsKCk7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIGVudHJpZXMgZXhpc3QgZm9yIGFsbCB0aHJlZSBwcmltYXJ5IGZpZWxkc1xuICAgICAgICBpZih1c2VybmFtZSA9PT0gXCJcIiB8fCBlbWFpbCA9PT0gXCJcIiB8fCBwd2QgPT09IFwiXCIpe1xuICAgICAgICAgICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICB0ZXN0QXJyYXkucHVzaChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHdkICE9PSBjb25maXJtUHdkKXtcbiAgICAgICAgICAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHRlc3RBcnJheS5wdXNoKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0ZXN0QXJyYXkubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICB1c2VyRmFjdG9yeS5zaWduVXAodXNlcm5hbWUsIGVtYWlsLCBwd2QpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2lnbnVwU3VjY2VzcyA9IFwic2hvdy1hbGVydFwiO1xuXG4gICAgICAgICAgICAgICAgLy8gbG9naW4gdGhlIHVzZXIgYWZ0ZXIgYSBzdWNjZXNzZnVsIHNpZ251cCBhbmQgbmF2aWdhdGUgdG8gc3VibWl0LXBpdGNoXG4gICAgICAgICAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXJuYW1lLCBwd2QpXG4gICAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnc3VibWl0LXBpdGNoJyk7XG4gICAgICAgICAgICAgICAgICAgICAgfSwgNTUwKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAgIHN3aXRjaChlcnIuZXJyb3IuY29kZSl7XG4gICAgICAgICAgICAgICAgICBjYXNlIC0xOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvclRleHQgPSBcIlRoZSB1c2VybmFtZSBmaWVsZCBpcyBlbXB0eS5cIlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAyMDI6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yVGV4dCA9IFwiVGhlIGRlc2lyZWQgdXNlcm5hbWUgaXMgYWxyZWFkeSB0YWtlbi5cIlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAyMDM6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yVGV4dCA9IFwiQW4gYWNjb3VudCBoYXMgYWxyZWFkeSBiZWVuIGNyZWF0ZWQgYXQgXCIgKyBlbWFpbCArIFwiLlwiO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuXG4gICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5jYXVnaHQgZXJyb3InKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9zaWdudXAvc2lnbnVwLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdzdWJtaXRQaXRjaCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCBwYXJzZUZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmdlbnJlcyA9IFtcbiAgICAgICAgXCJBY3Rpb25cIixcbiAgICAgICAgXCJBZHZlbnR1cmVcIixcbiAgICAgICAgXCJBbmltYXRlZFwiLFxuICAgICAgICBcIkNvbWVkeVwiLFxuICAgICAgICBcIkNyaW1lXCIsXG4gICAgICAgIFwiRHJhbWFcIixcbiAgICAgICAgXCJGYW50YXN5XCIsXG4gICAgICAgIFwiSGlzdG9yaWNhbFwiLFxuICAgICAgICBcIkhpc3RvcmljYWwgRmljdGlvblwiLFxuICAgICAgICBcIkhvcnJvclwiLFxuICAgICAgICBcIktpZHNcIixcbiAgICAgICAgXCJNeXN0ZXJ5XCIsXG4gICAgICAgIFwiUG9saXRpY2FsXCIsXG4gICAgICAgIFwiUmVsaWdpb3VzXCIsXG4gICAgICAgIFwiUm9tYW5jZVwiLFxuICAgICAgICBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICBcIlNhdGlyZVwiLFxuICAgICAgICBcIlNjaWVuY2UgRmljdGlvblwiLFxuICAgICAgICBcIlRocmlsbGVyXCIsXG4gICAgICAgIFwiV2VzdGVyblwiXG4gICAgICBdO1xuXG4gICAgICAkc2NvcGUuc3VibWl0UGl0Y2ggPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgZ2VucmUsIHBpdGNoLCB0ZXJtcywgZGF0ZUFncmVlZDtcblxuICAgICAgICBnZW5yZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2VucmUnKSkudmFsKCk7XG4gICAgICAgIHBpdGNoID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwaXRjaCcpKS52YWwoKTtcbiAgICAgICAgdGVybXMgPSAkKCcjYWdyZWUtdGVybXMnKS5pcyhcIjpjaGVja2VkXCIpO1xuICAgICAgICBkYXRlQWdyZWVkID0gbmV3IERhdGUoKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhnZW5yZSwgcGl0Y2gsIHRlcm1zLCBkYXRlQWdyZWVkKTtcblxuICAgICAgICAvLyBDaGVjayB0aGUgZm9ybSBmb3IgYmFzaWMgZXJyb3JzXG4gICAgICAgIHZhbGlkYXRlSW5wdXQoKTtcblxuICAgICAgICAvLyBpZihwaXRjaCAhPT0gXCJcIil7XG4gICAgICAgIC8vICAgLy8gcGFyc2VGYWN0b3J5LnN1Ym1pdFBpdGNoKGdlbnJlLCBwaXRjaCk7XG4gICAgICAgIC8vIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdmFsaWRhdGVJbnB1dCgpIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRlcm1zIGFyZSBhZ3JlZWQgdG9cbiAgICAgICAgaWYodGVybXMgIT09IHRydWUpe1xuICAgICAgICAgICRzY29wZS50ZXJtc0Vycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKHBpdGNoID09PSBcIlwiKSB7XG4gICAgICAgICAgJHNjb3BlLnRlcm1zRXJyb3IgPSBcIlwiO1xuICAgICAgICAgICRzY29wZS5waXRjaEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGdlbnJlKSB7XG5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3VzZXJQaXRjaGVzJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcblxuICAgICAgJHNjb3BlLnBpdGNoZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiTm92ZW1iZXIgM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiUm9tYW50aWMgQ29tZWR5XCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgbWFuIGZhbGxzIGluIGxvdmUgd2l0aCBhIGxhZHksIGJ1dCBpdCdzIGZ1bm55LlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiT2N0b2JlciAyM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiSG9ycm9yXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgd29tYW4ga2VlcHMgY2hlY2tpbmcgaGVyIGZyaWRnZSwgYnV0IHRoZXJlJ3MgbmV2ZXIgYW55dGhpbmcgd29ydGggZWF0aW5nLlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0se1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJKdW5lIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIldlc3Rlcm5cIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiU29tZSBjb3dib3lzIHJpZGUgYXJvdW5kIGNoYXNpbmcgYSBnYW5nIG9mIHRoaWV2ZXNcIixcbiAgICAgICAgICBzdGF0dXM6IFwiYWNjZXB0ZWRcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy91c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmh0bWxcIlxuICB9XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
