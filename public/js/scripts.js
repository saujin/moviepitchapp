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
          // console.log(token);
          $scope.$emit('payment-success', _token);
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

moviePitchApp.directive('selectGenre', function () {
  return {
    controller: function controller($scope) {
      $scope.genres = ["Action", "Adventure", "Animated", "Comedy", "Crime", "Drama", "Fantasy", "Historical", "Historical Fiction", "Horror", "Kids", "Mystery", "Political", "Religious", "Romance", "Romantic Comedy", "Satire", "Science Fiction", "Thriller", "Western"];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJwYXltZW50RmFjdG9yeS5qcyIsInVzZXJGYWN0b3J5LmpzIiwiYWN0aW9uLWJ1dHRvbi9hY3Rpb24tYnV0dG9uLmpzIiwiY2hlY2tvdXQvY2hlY2tvdXQtYnV0dG9uLmpzIiwiY2hlY2tvdXQvcGl0Y2gtYm94LmpzIiwiY29udGFjdC11cy1mb3JtL2NvbnRhY3QtdXMtZm9ybS5qcyIsImxvZ2luLW1vZGFsL2xvZ2luLW1vZGFsLmpzIiwibG9naW4vbG9naW4uanMiLCJuYXYvbmF2LmpzIiwic2VsZWN0LWdlbnJlL3NlbGVjdC1nZW5yZS5qcyIsInNpZ251cC9zaWdudXAuanMiLCJzdWJtaXRQaXRjaC9zdWJtaXRQaXRjaC5qcyIsInVzZXItcGl0Y2hlcy91c2VyLXBpdGNoZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQixPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUM3QixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRS9CLElBQU0sZUFBZSxHQUFHLENBQ3RCLFdBQVcsQ0FDWixDQUFDOztBQUVGLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUNqRSxNQUFNLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFDN0MsVUFBUyxjQUFjLEVBQUUsa0JBQWtCLEVBQUM7O0FBRTFDLG9CQUFrQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7OztBQUFDLEFBR2xDLGdCQUFjLENBQ1gsS0FBSyxDQUFDLE9BQU8sRUFBRTtBQUNkLE9BQUcsRUFBRSxHQUFHO0FBQ1IsZUFBVyxFQUFFLGlCQUFpQjtBQUM5QixRQUFJLEVBQUU7QUFDSixrQkFBWSxFQUFFLEtB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QVE7QUFDZixpQkFBUyxFQUFFLDZFQUE2RTtBQUN4RixjQUFNLEVBQUUsVUFBVTtPQUNuQixFQUFDO0FBQ0EsaUJBQVMsRUFBRSxnQkFBZ0I7QUFDM0IsYUFBSyxFQUFFLFNBQVM7QUFDaEIsaUJBQVMsRUFBRSxvREFBb0Q7QUFDL0QsY0FBTSxFQUFFLFVBQVU7T0FDbkIsQ0FDRixDQUFBO0tBQ0Y7QUFDRCxZQUFRLEVBQUUsR0FBRztBQUNiLGVBQVcsRUFBRSwyQ0FBMkM7R0FDekQsQ0FBQTtDQUNGLENBQUMsQ0FBQyIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnJlcXVpcmUoJ2FuZ3VsYXInKTtcbnJlcXVpcmUoJ2FuZ3VsYXItdWktcm91dGVyJyk7XG5jb25zdCBQYXJzZSA9IHJlcXVpcmUoJ3BhcnNlJyk7XG5cbmNvbnN0IGNvbnRyb2xsZXJBcnJheSA9IFtcbiAgXCJ1aS5yb3V0ZXJcIlxuXTtcblxubGV0IG1vdmllUGl0Y2hBcHAgPSBhbmd1bGFyLm1vZHVsZShcIm1vdmllUGl0Y2hBcHBcIiwgY29udHJvbGxlckFycmF5KVxuICAuY29uZmlnKFtcIiRzdGF0ZVByb3ZpZGVyXCIsIFwiJHVybFJvdXRlclByb3ZpZGVyXCIsXG4gICAgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcil7XG5cbiAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICAgLy8gTWFpbiBOYXZcbiAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnaW5kZXgnLCB7XG4gICAgICAgICAgdXJsOiBcIi9cIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9ob21lLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ291ci10ZWFtJywge1xuICAgICAgICAgIHVybDogXCIvb3VyLXRlYW1cIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9vdXItdGVhbS5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdzdWNjZXNzLXN0b3JpZXMnLCB7XG4gICAgICAgICAgdXJsOiBcIi9zdWNjZXNzLXN0b3JpZXNcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9zdWNjZXNzLXN0b3JpZXMuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnc3VibWl0LXBpdGNoJywge1xuICAgICAgICAgIHVybDogXCIvc3VibWl0LXBpdGNoXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvc3VibWl0LXBpdGNoLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAvLyBBY2NvdW50XG4gICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ3JlZ2lzdGVyJywge1xuICAgICAgICAgIHVybDogXCIvcmVnaXN0ZXJcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9yZWdpc3Rlci5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdteS1hY2NvdW50Jywge1xuICAgICAgICAgIHVybDogXCIvbXktYWNjb3VudFwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL215LWFjY291bnQuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgICAgLy8gRm9vdGVyIE5hdlxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdmYXEnLCB7XG4gICAgICAgICAgdXJsOiBcIi9mYXFcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9mYXEuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgncHJlc3MnLCB7XG4gICAgICAgICAgdXJsOiBcIi9wcmVzc1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3ByZXNzLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2NvbnRhY3QtdXMnLCB7XG4gICAgICAgICAgdXJsOiBcIi9jb250YWN0LXVzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvY29udGFjdC11cy5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdsZWdhbCcsIHtcbiAgICAgICAgICB1cmw6IFwiL2xlZ2FsXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbGVnYWwuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuICBdKVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpe1xuICAgIFBhcnNlLmluaXRpYWxpemUoXCJQUjlXQkhFdmpTdVc5dXM4UTdTR2gyS1lSVlFhSExienRaanNoc2IxXCIsIFwibnl6N045c0dMVUlOMWhqTVk5Tk5RbmVFeHhQNVcwTUpoWEgzdTFRaFwiKTtcblxuICAgIC8vIE1ha2Ugc3VyZSBhIHVzZXIgaXMgbG9nZ2VkIG91dFxuICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSl7XG4gICAgICBsZXQgcmVxdWlyZUxvZ2luID0gdG9TdGF0ZS5kYXRhLnJlcXVpcmVMb2dpbjtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHRvU3RhdGUpO1xuXG4gICAgICBpZihyZXF1aXJlTG9naW4gPT09IHRydWUgJiYgJHJvb3RTY29wZS5jdXJVc2VyID09PSBudWxsKXtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnI2xvZ2luLW1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICAgICAgJHJvb3RTY29wZS50YXJnZXRTdGF0ZSA9IHRvU3RhdGUubmFtZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG4gIH0pO1xuIiwibW92aWVQaXRjaEFwcC5jb250cm9sbGVyKCdNYWluQ3RybCcsIFsnJHNjb3BlJyxcbiAgZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAvLyAkc2NvcGUuJG9uKCdsb2dpbi10cnVlJywgZnVuY3Rpb24oKXtcbiAgICAvLyAgICRzY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAvLyB9KVxuICB9XG5dKVxuIiwibW92aWVQaXRjaEFwcC5mYWN0b3J5KCdlbWFpbEZhY3RvcnknLCBmdW5jdGlvbigkcSl7XG4gIGxldCBzZW5kZ3JpZCA9IHJlcXVpcmUoJ3NlbmRncmlkJykoJ1NHLjJDU3F4OTlqUTItVXdVZjhCaVVVT1EuS2VLRWN2QTVxbldDQVdqSENyOEkwVEtoODhKQkY4TEtCcUh3TkhLRWw5bycpO1xuXG4gIGxldCBmYWN0b3J5ID0ge1xuXG4gICAgLy8gTW9jayB1cCBzZW5kaW5nIGEgY29udGFjdCBlbWFpbFxuICAgIC8vIGh0dHBzOi8vbm9kZW1haWxlci5jb20vXG4gICAgc2VuZENvbnRhY3RVc01lc3NhZ2U6IGZ1bmN0aW9uKG5hbWUsIGVtYWlsLCBzdWJqZWN0LCBtc2cpe1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgc3ViamVjdDogc3ViamVjdCxcbiAgICAgICAgbWVzc2FnZTogbXNnXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlRW1haWw6IGZ1bmN0aW9uKGVtYWlsKSB7XG4gICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBsZXQgcmVnID0gL14oW2EtekEtWjAtOV9cXC5cXC1dKStcXEAoKFthLXpBLVowLTlcXC1dKStcXC4pKyhbYS16QS1aMC05XXsyLDR9KSskLztcblxuICAgICAgaWYocmVnLnRlc3QoZW1haWwpKXtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGFyc2VGYWN0b3J5JywgZnVuY3Rpb24oJHEpIHtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgc3VibWl0UGl0Y2g6IGZ1bmN0aW9uKGdlbnJlLCB0ZXh0KSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIHVzZXIgaXMgbG9nZ2VkIGluIHRvIHN0b3JlIHRoZSBwaXRjaFxuICAgICAgaWYgKCRyb290U2NvcGUuY3VyVXNlciAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgUGl0Y2ggPSBQYXJzZS5PYmplY3QuZXh0ZW5kKFwiUGl0Y2hcIik7XG4gICAgICAgIHZhciBwaXRjaCA9IG5ldyBQaXRjaCgpO1xuXG4gICAgICAgIHBpdGNoLnNldChcImdlbnJlXCIsIGdlbnJlKTtcbiAgICAgICAgcGl0Y2guc2V0KFwicGl0Y2hcIiwgdGV4dCk7XG4gICAgICAgIC8vIHBpdGNoLnNldChcImNyZWF0ZXJcIiwgUGFyc2UuVXNlci5jdXJyZW50LnVzZXJuYW1lKVxuICAgICAgICBwaXRjaC5zZXQoXCJyZXZpZXdlZFwiLCBmYWxzZSlcblxuXG4gICAgICAgIHBpdGNoLnNhdmUobnVsbCwge1xuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHBpdGNoKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgICAgZGF0YTogcGl0Y2hcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHBpdGNoLCBlcnJvcikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCIsXG4gICAgICAgICAgICAgIGRhdGE6IGVycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBSZWplY3QgdGhlIHNhdmUgYXR0ZW1wdCBpZiBubyBjdXJyZW50IHVzZXJcbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIG5vdCBsb2dnZWQgaW5cIlxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGF5bWVudEZhY3RvcnknLCBmdW5jdGlvbigpe1xuICB2YXIgZmFjdG9yeSA9IHtcblxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5mYWN0b3J5KCd1c2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRxLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24pe1xuICB2YXIgZmFjdG9yeSA9IHtcbiAgICBjaGVja0xvZ2dlZEluOiBmdW5jdGlvbigpe1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgaWYoJHJvb3RTY29wZS5jdXJVc2VyID09PSBudWxsKXtcbiAgICAgICAgY29uc29sZS5sb2coJzEnKTtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICRsb2NhdGlvbi51cmwoJy9sb2dpbicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygnMicpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgbG9naW5Vc2VyOiBmdW5jdGlvbih1c2VybmFtZSwgcHdkKXtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIFBhcnNlLlVzZXIubG9nSW4odXNlcm5hbWUsIHB3ZCkudGhlbihcbiAgICAgICAgZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgJHJvb3RTY29wZS5jdXJVc2VyID0gdXNlcjtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICBkYXRhOiB1c2VyXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICBlcnJvcjogZXJyXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIGxvZ291dFVzZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgUGFyc2UuVXNlci5sb2dPdXQoKTtcblxuICAgICAgdmFyIHVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblxuICAgICAgaWYodXNlciA9PT0gbnVsbCl7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgdXNlciBmcm9tIHRoZSAkcm9vdFNjb3BlXG4gICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IG51bGw7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9nb3V0LXVwZGF0ZScpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIGxvZ2dlZCBvdXRcIlxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgbXNnOiBcIlVzZXIgaXMgc3RpbGwgbG9nZ2VkIGluXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICBzaWduVXA6IGZ1bmN0aW9uKHVzZXJuYW1lLCBlbWFpbCwgcHdkKXtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIHZhciB1c2VyID0gbmV3IFBhcnNlLlVzZXIoKTtcbiAgICAgIHVzZXIuc2V0KFwidXNlcm5hbWVcIiwgdXNlcm5hbWUpO1xuICAgICAgdXNlci5zZXQoXCJlbWFpbFwiLCBlbWFpbCk7XG4gICAgICB1c2VyLnNldChcInBhc3N3b3JkXCIsIHB3ZCk7XG5cbiAgICAgIHVzZXIuc2lnblVwKG51bGwsIHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YTogdXNlclxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycil7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICB1c2VyOiB1c2VyLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYWN0aW9uQnV0dG9uJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRzdGF0ZSl7XG5cbiAgICAgICRzY29wZS51cGRhdGUgPSBmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgICAgJHNjb3BlLnRhcmdldCA9IFwicmVnaXN0ZXJcIjtcbiAgICAgICAgICAkc2NvcGUuYWN0aW9uVGV4dCA9IFwiUmVnaXN0ZXIgVG8gU3RhcnQgUGl0Y2hpbmchXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLmFjdGlvblRleHQgPSBcIlN1Ym1pdCBhIFBpdGNoIVwiO1xuICAgICAgICAgICRzY29wZS50YXJnZXQgPSBcInN1Ym1pdC1waXRjaFwiO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUubmF2aWdhdGUgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc3RhdGUuZ28oJHNjb3BlLnRhcmdldCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dpbi11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUudXBkYXRlKCk7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLiRvbignbG9nb3V0LXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS51cGRhdGUoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICBzY29wZS51cGRhdGUoKTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIlxuICB9XG59KVxuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2NoZWNrb3V0QnV0dG9uJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgJHNjb3BlLmhhbmRsZXIgPSBTdHJpcGVDaGVja291dC5jb25maWd1cmUoe1xuICAgICAgICBrZXk6ICdwa190ZXN0X1hIa2h0MEdNTFFQcm4yc1lDWFNGeTRGcycsXG4gICAgICAgIC8vIGltYWdlOiAnL2ltZy9kb2N1bWVudGF0aW9uL2NoZWNrb3V0L21hcmtldHBsYWNlLnBuZycsXG4gICAgICAgIGxvY2FsZTogJ2F1dG8nLFxuICAgICAgICB0b2tlbjogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgLy8gVXNlIHRoZSB0b2tlbiB0byBjcmVhdGUgdGhlIGNoYXJnZSB3aXRoIGEgc2VydmVyLXNpZGUgc2NyaXB0LlxuICAgICAgICAvLyBZb3UgY2FuIGFjY2VzcyB0aGUgdG9rZW4gSUQgd2l0aCBgdG9rZW4uaWRgXG4gICAgICAgICAgLy8gY29uc29sZS5sb2codG9rZW4pO1xuICAgICAgICAgICRzY29wZS4kZW1pdCgncGF5bWVudC1zdWNjZXNzJywgdG9rZW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbCwgYXR0cnMpe1xuICAgICAgZWwub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIHNjb3BlLmhhbmRsZXIub3Blbih7XG4gICAgICAgICAgbmFtZTogXCJNb3ZpZVBpdGNoLmNvbVwiLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlBpdGNoIFN1Ym1pc3Npb25cIixcbiAgICAgICAgICBhbW91bnQ6IDIwMFxuICAgICAgICB9KTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgncGl0Y2hCb3gnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIHNjb3BlOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgJHNjb3BlLiRvbigncGF5bWVudC1zdWNjZXNzJywgZnVuY3Rpb24odG9rZW4pe1xuICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgY29uc29sZS5sb2codG9rZW4pO1xuICAgICAgICBjb25zb2xlLmxvZygneW8nKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICBjb25zb2xlLmxvZyhzY29wZSk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnY29udGFjdFVzRm9ybScsIGZ1bmN0aW9uKGVtYWlsRmFjdG9yeSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICRzY29wZS5zdWJqZWN0cyA9IFtcbiAgICAgICAgXCJHZW5lcmFsXCIsXG4gICAgICAgIFwiQmlsbGluZ1wiLFxuICAgICAgICBcIlNhbGVzXCIsXG4gICAgICAgIFwiU3VwcG9ydFwiXG4gICAgICBdO1xuXG5cbiAgICAgIGxldCBjbGVhckVycm9ycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcIlwiO1xuICAgICAgICAkc2NvcGUuc3VibWl0U3VjY2VzcyA9IFwiXCI7XG4gICAgICB9O1xuXG4gICAgICBsZXQgY2xlYXJGaWVsZHMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkKCdbY29udGFjdC11cy1mb3JtXScpLmZpbmQoJy5mb3JtLWNvbnRyb2wnKS52YWwoJycpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnN1Ym1pdENvbnRhY3RGb3JtID0gZnVuY3Rpb24oKXtcbiAgICAgICAgY2xlYXJFcnJvcnMoKTtcblxuICAgICAgICBsZXQgbmFtZSwgZW1haWwsIHN1YmplY3QsIG1lc3NhZ2U7XG5cbiAgICAgICAgbmFtZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFjdC1uYW1lJykpLnZhbCgpO1xuICAgICAgICBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFjdC1lbWFpbCcpKS52YWwoKTtcbiAgICAgICAgc3ViamVjdCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFjdC1zdWJqZWN0JykpLnZhbCgpO1xuICAgICAgICBtZXNzYWdlID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWN0LW1lc3NhZ2UnKSkudmFsKCk7XG5cbiAgICAgICAgZW1haWxGYWN0b3J5LnZhbGlkYXRlRW1haWwoZW1haWwpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgaWYobmFtZSA9PT0gXCJcIiB8fCBlbWFpbCA9PT0gXCJcIiB8fCBzdWJqZWN0ID09PSBcIlwiIHx8IG1lc3NhZ2U9PT1cIlwiKXtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yVGV4dCA9IFwiUGxlYXNlIGZpbGwgb3V0IGVhY2ggZmllbGQgYmVmb3JlIHN1Ym1pdHRpbmcuXCI7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBlbWFpbEZhY3Rvcnkuc2VuZENvbnRhY3RVc01lc3NhZ2UobmFtZSwgZW1haWwsIHN1YmplY3QsIG1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgICAgICAgY2xlYXJFcnJvcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICBjbGVhckZpZWxkcygpO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdWJtaXRTdWNjZXNzID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN1Y2Nlc3NUZXh0ID0gXCJTdWNjZXNzISBZb3VyIG1lc3NhZ2UgaGFzIGJlZW4gc3VibWl0dGVkLlwiO1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIkFuIGVycm9yIGhhcyBvY2N1cnJlZC4gWW91ciBtZXNzYWdlIHdhcyBub3Qgc2VudC5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICRzY29wZS5tZXNzYWdlRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgJHNjb3BlLmVycm9yVGV4dCA9IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwgYWRkcmVzcy5cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL2NvbnRhY3QtdXMtZm9ybS9jb250YWN0LXVzLWZvcm0uaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2xvZ2luTW9kYWwnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJcIjtcblxuICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcIlwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuZmxhZ0lucHV0RXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJpcy1lcnJvclwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1oaWRkZW5cIjtcbiAgICAgICRzY29wZS5oaWRlQWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LWhpZGRlblwifTtcbiAgICAgICRzY29wZS5zaG93QWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LXNob3duXCJ9O1xuXG4gICAgICAkc2NvcGUuY2xlYXJGb3JtcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBtb2RhbCA9ICQoJyNsb2dpbi1tb2RhbCcpO1xuXG4gICAgICAgIC8vIENsZWFyIEV4aXN0aW5nIElucHV0c1xuICAgICAgICBtb2RhbC5maW5kKCdpbnB1dCcpLnZhbCgnJyk7XG5cbiAgICAgICAgLy8gUmVzZXQgRXJyb3IgTm90aWZpY2F0aW9uc1xuICAgICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUudXNlckxvZ2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcbiAgICAgICAgdmFyIG1vZGFsID0gJCgnI2xvZ2luLW1vZGFsJyk7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tcGFzc3dvcmQnKSkudmFsKCk7XG5cbiAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXIsIHB3ZCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgICAgICAgJHNjb3BlLmNsZWFyRm9ybXMoKTtcbiAgICAgICAgICAgICRzY29wZS5oaWRlQWxlcnQoKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlICRyb290U2NvcGUgaXMgaW4gdGhlIHByb2Nlc3Mgb2YgbmF2aWdhdGluZyB0byBhIHN0YXRlLFxuICAgICAgICAgICAgLy8gYXMgaW4gYW4gZXZlbnQgd2hlcmUgbG9naW4gaW50ZXJydXB0cyBuYXZpZ2F0aW9uIHRvIGEgcmVzdHJpY3RlZCBwYWdlXG4gICAgICAgICAgICAvLyBjb250aW51ZSB0byB0aGF0IHN0YXRlLCBvdGhlcndpc2UgY2xlYXIgdGhlICRyb290U2NvcGUudGFyZ2V0U3RhdGVcbiAgICAgICAgICAgIGlmKCRyb290U2NvcGUudGFyZ2V0U3RhdGUgIT09IG51bGwpe1xuICAgICAgICAgICAgICAkc3RhdGUuZ28oJHJvb3RTY29wZS50YXJnZXRTdGF0ZSk7XG4gICAgICAgICAgICAgICRyb290U2NvcGUudGFyZ2V0U3RhdGUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICRzY29wZS5mbGFnSW5wdXRFcnJvcnMoKTtcbiAgICAgICAgICAgICRzY29wZS5zaG93QWxlcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG5cblxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiAnY29tcG9uZW50cy9sb2dpbi1tb2RhbC9sb2dpbi1tb2RhbC5odG1sJ1xuICB9XG59KVxuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2xvZ2luJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5sb2dpblVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlciwgcHdkO1xuXG4gICAgICAgIHVzZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItbG9naW4tdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1sb2dpbi1wd2QnKSkudmFsKCk7XG5cbiAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXIsIHB3ZClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9O1xuXG5cbiAgICAgICRzY29wZS5sb2dvdXRVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdXNlckZhY3RvcnkubG9nb3V0VXNlcigpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvbG9naW4vbG9naW4uaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FwcEhlYWRlcicsIGZ1bmN0aW9uKCRzdGF0ZSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9IFwibWVudS1jbG9zZWRcIjtcbiAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ2luXCI7XG5cbiAgICAgICRzY29wZS50b2dnbGVNZW51ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9PT0gXCJtZW51LWNsb3NlZFwiID8gXCJtZW51LW9wZW5cIiA6IFwibWVudS1jbG9zZWRcIjtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ2luLXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ291dFwiO1xuICAgICAgfSk7XG5cblxuICAgICAgJHNjb3BlLiRvbignbG9nb3V0LXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ2luXCI7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLmxvZ291dFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB1c2VyRmFjdG9yeS5sb2dvdXRVc2VyKCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdpbmRleCcpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUub3BlbkxvZ2luTW9kYWwgPSBmdW5jdGlvbigpe1xuICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICAkKGVsKS5maW5kKCcubWFpbi1uYXYgYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLnRvZ2dsZU1lbnUoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvbmF2L25hdi5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc2VsZWN0R2VucmUnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAkc2NvcGUuZ2VucmVzID0gW1xuICAgICAgICBcIkFjdGlvblwiLFxuICAgICAgICBcIkFkdmVudHVyZVwiLFxuICAgICAgICBcIkFuaW1hdGVkXCIsXG4gICAgICAgIFwiQ29tZWR5XCIsXG4gICAgICAgIFwiQ3JpbWVcIixcbiAgICAgICAgXCJEcmFtYVwiLFxuICAgICAgICBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJIaXN0b3JpY2FsXCIsXG4gICAgICAgIFwiSGlzdG9yaWNhbCBGaWN0aW9uXCIsXG4gICAgICAgIFwiSG9ycm9yXCIsXG4gICAgICAgIFwiS2lkc1wiLFxuICAgICAgICBcIk15c3RlcnlcIixcbiAgICAgICAgXCJQb2xpdGljYWxcIixcbiAgICAgICAgXCJSZWxpZ2lvdXNcIixcbiAgICAgICAgXCJSb21hbmNlXCIsXG4gICAgICAgIFwiUm9tYW50aWMgQ29tZWR5XCIsXG4gICAgICAgIFwiU2F0aXJlXCIsXG4gICAgICAgIFwiU2NpZW5jZSBGaWN0aW9uXCIsXG4gICAgICAgIFwiVGhyaWxsZXJcIixcbiAgICAgICAgXCJXZXN0ZXJuXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc2lnbnVwJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCAkc3RhdGUsICRyb290U2NvcGUsIHVzZXJGYWN0b3J5LCBlbWFpbEZhY3Rvcnkpe1xuICAgICAgLy8gJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS5lbWFpbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwiXCI7XG5cbiAgICAgICRzY29wZS52YWxpZGF0ZUVtYWlsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGVtYWlsID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1lbWFpbCcpKS52YWwoKTtcblxuICAgICAgICBlbWFpbEZhY3RvcnkudmFsaWRhdGVFbWFpbChlbWFpbClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwiXCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3JUZXh0ID0gXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbCBhZGRyZXNzLlwiO1xuICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5zaWdudXBVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXJuYW1lLCBlbWFpbCwgcHdkLCBjb25maXJtUHdkO1xuICAgICAgICB2YXIgdGVzdEFycmF5ID0gW107XG5cbiAgICAgICAgdXNlcm5hbWUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItZW1haWwnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItcGFzc3dvcmQnKSkudmFsKCk7XG4gICAgICAgIGNvbmZpcm1Qd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWNvbmZpcm0tcGFzc3dvcmQnKSkudmFsKCk7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIGVudHJpZXMgZXhpc3QgZm9yIGFsbCB0aHJlZSBwcmltYXJ5IGZpZWxkc1xuICAgICAgICBpZih1c2VybmFtZSA9PT0gXCJcIiB8fCBlbWFpbCA9PT0gXCJcIiB8fCBwd2QgPT09IFwiXCIpe1xuICAgICAgICAgICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICB0ZXN0QXJyYXkucHVzaChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLmdlbmVyYWxFcnJvciA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHdkICE9PSBjb25maXJtUHdkKXtcbiAgICAgICAgICAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHRlc3RBcnJheS5wdXNoKGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUucGFzc3dvcmRFcnJvciA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0ZXN0QXJyYXkubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICB1c2VyRmFjdG9yeS5zaWduVXAodXNlcm5hbWUsIGVtYWlsLCBwd2QpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdsb2dpbi11cGRhdGUnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2lnbnVwU3VjY2VzcyA9IFwic2hvdy1hbGVydFwiO1xuXG4gICAgICAgICAgICAgICAgLy8gbG9naW4gdGhlIHVzZXIgYWZ0ZXIgYSBzdWNjZXNzZnVsIHNpZ251cCBhbmQgbmF2aWdhdGUgdG8gc3VibWl0LXBpdGNoXG4gICAgICAgICAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXJuYW1lLCBwd2QpXG4gICAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnc3VibWl0LXBpdGNoJyk7XG4gICAgICAgICAgICAgICAgICAgICAgfSwgNTUwKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAgIHN3aXRjaChlcnIuZXJyb3IuY29kZSl7XG4gICAgICAgICAgICAgICAgICBjYXNlIC0xOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvclRleHQgPSBcIlRoZSB1c2VybmFtZSBmaWVsZCBpcyBlbXB0eS5cIlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAyMDI6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS51c2VybmFtZUVycm9yVGV4dCA9IFwiVGhlIGRlc2lyZWQgdXNlcm5hbWUgaXMgYWxyZWFkeSB0YWtlbi5cIlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgY2FzZSAyMDM6XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yVGV4dCA9IFwiQW4gYWNjb3VudCBoYXMgYWxyZWFkeSBiZWVuIGNyZWF0ZWQgYXQgXCIgKyBlbWFpbCArIFwiLlwiO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuXG4gICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5jYXVnaHQgZXJyb3InKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9zaWdudXAvc2lnbnVwLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdzdWJtaXRQaXRjaCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCBwYXJzZUZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmdlbnJlcyA9IFtcbiAgICAgICAgXCJBY3Rpb25cIixcbiAgICAgICAgXCJBZHZlbnR1cmVcIixcbiAgICAgICAgXCJBbmltYXRlZFwiLFxuICAgICAgICBcIkNvbWVkeVwiLFxuICAgICAgICBcIkNyaW1lXCIsXG4gICAgICAgIFwiRHJhbWFcIixcbiAgICAgICAgXCJGYW50YXN5XCIsXG4gICAgICAgIFwiSGlzdG9yaWNhbFwiLFxuICAgICAgICBcIkhpc3RvcmljYWwgRmljdGlvblwiLFxuICAgICAgICBcIkhvcnJvclwiLFxuICAgICAgICBcIktpZHNcIixcbiAgICAgICAgXCJNeXN0ZXJ5XCIsXG4gICAgICAgIFwiUG9saXRpY2FsXCIsXG4gICAgICAgIFwiUmVsaWdpb3VzXCIsXG4gICAgICAgIFwiUm9tYW5jZVwiLFxuICAgICAgICBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICBcIlNhdGlyZVwiLFxuICAgICAgICBcIlNjaWVuY2UgRmljdGlvblwiLFxuICAgICAgICBcIlRocmlsbGVyXCIsXG4gICAgICAgIFwiV2VzdGVyblwiXG4gICAgICBdO1xuXG4gICAgICAkc2NvcGUuc3VibWl0UGl0Y2ggPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgZ2VucmUsIHBpdGNoLCB0ZXJtcywgZGF0ZUFncmVlZDtcblxuICAgICAgICBnZW5yZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2VucmUnKSkudmFsKCk7XG4gICAgICAgIHBpdGNoID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwaXRjaCcpKS52YWwoKTtcbiAgICAgICAgdGVybXMgPSAkKCcjYWdyZWUtdGVybXMnKS5pcyhcIjpjaGVja2VkXCIpO1xuICAgICAgICBkYXRlQWdyZWVkID0gbmV3IERhdGUoKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhnZW5yZSwgcGl0Y2gsIHRlcm1zLCBkYXRlQWdyZWVkKTtcblxuICAgICAgICAvLyBDaGVjayB0aGUgZm9ybSBmb3IgYmFzaWMgZXJyb3JzXG4gICAgICAgIHZhbGlkYXRlSW5wdXQoKTtcblxuICAgICAgICAvLyBpZihwaXRjaCAhPT0gXCJcIil7XG4gICAgICAgIC8vICAgLy8gcGFyc2VGYWN0b3J5LnN1Ym1pdFBpdGNoKGdlbnJlLCBwaXRjaCk7XG4gICAgICAgIC8vIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdmFsaWRhdGVJbnB1dCgpIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRlcm1zIGFyZSBhZ3JlZWQgdG9cbiAgICAgICAgaWYodGVybXMgIT09IHRydWUpe1xuICAgICAgICAgICRzY29wZS50ZXJtc0Vycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKHBpdGNoID09PSBcIlwiKSB7XG4gICAgICAgICAgJHNjb3BlLnRlcm1zRXJyb3IgPSBcIlwiO1xuICAgICAgICAgICRzY29wZS5waXRjaEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGdlbnJlKSB7XG5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiQVwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3VzZXJQaXRjaGVzJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcblxuICAgICAgJHNjb3BlLnBpdGNoZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiTm92ZW1iZXIgM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiUm9tYW50aWMgQ29tZWR5XCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgbWFuIGZhbGxzIGluIGxvdmUgd2l0aCBhIGxhZHksIGJ1dCBpdCdzIGZ1bm55LlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiT2N0b2JlciAyM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiSG9ycm9yXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIkEgd29tYW4ga2VlcHMgY2hlY2tpbmcgaGVyIGZyaWRnZSwgYnV0IHRoZXJlJ3MgbmV2ZXIgYW55dGhpbmcgd29ydGggZWF0aW5nLlwiLFxuICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiXG4gICAgICAgIH0se1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJKdW5lIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIldlc3Rlcm5cIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiU29tZSBjb3dib3lzIHJpZGUgYXJvdW5kIGNoYXNpbmcgYSBnYW5nIG9mIHRoaWV2ZXNcIixcbiAgICAgICAgICBzdGF0dXM6IFwiYWNjZXB0ZWRcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy91c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmh0bWxcIlxuICB9XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
