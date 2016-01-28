"use strict";

require('angular');
require('angular-ui-router');

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

  $rootScope.$on('$stateChangeStart', function (event, toState) {
    var requireLogin = toState.data.requireLogin;

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
"use strict";

moviePitchApp.factory('adminFactory', function ($http) {
  var urlBase = "https://moviepitchapi.herokuapp.com";

  var testUser = {
    name: "Justin Tulk",
    email: "justintulk@gmail.com",
    pwd: "testPassword"
  };

  var factory = {

    loginAdmin: function loginAdmin(email, pwd) {
      return $http({
        method: "POST",
        url: urlBase + "/admin/login",
        data: {
          email: email,
          password: pwd
        }
      });
    },

    registerAdmin: function registerAdmin(data) {
      return $http({
        method: "POST",
        url: urlBase + "/admin/register",
        data: {
          name: data.name,
          email: data.email,
          password: data.pwd
        }
      });
    },

    testLoginAdmin: function testLoginAdmin() {
      return $http({
        method: "POST",
        url: urlBase + '/admin/login',
        data: {
          email: testUser.email,
          password: testUser.pwd
        }
      });
    },

    testRegisterAdmin: function testRegisterAdmin() {
      return $http({
        method: "POST",
        url: urlBase + '/admin/register',
        data: {
          name: testUser.name,
          email: testUser.email,
          password: testUser.pwd
        }
      });
    }
  };

  return factory;
});
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

moviePitchApp.factory('paymentFactory', function ($http) {
  var urlBase = "https://moviepitchapi.herokuapp.com";
  var factory = {

    createCharge: function createCharge(amount, description, token) {
      console.log({
        amount: amount,
        description: description,
        currency: "usd",
        source: token
      });

      return $http({
        method: "POST",
        url: urlBase + "/stripe/create_charge",
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
  var urlBase = "https://moviepitchapi.herokuapp.com";

  var factory = {

    acceptPitch: function acceptPitch(id) {
      return $http({
        type: "GET",
        url: urlBase + "/pitch/accept/" + id
      });
    },

    getAllPitches: function getAllPitches() {
      // return $http.get(urlBase + "/get_all_pitches");
      return $http({
        method: "GET",
        url: urlBase + "/pitch"
      });
    },

    getPitchByFilter: function getPitchByFilter(filterString) {
      return $http({
        method: "GET",
        url: urlBase + "/pitch?" + filterString
      });
    },

    getPitchByID: function getPitchByID(id) {
      return $http({
        method: "GET",
        url: urlBase + '/pitch/' + id
      });
    },

    lockPitch: function lockPitch(id) {
      return $http({
        method: "GET",
        url: urlBase + "/pitch/lock/" + id
      });
    },

    rejectPitch: function rejectPitch(id) {
      return $http({
        type: "GET",
        url: urlBase + "/pitch/reject/" + id
      });
    },

    submitPitch: function submitPitch(pitch) {
      return $http({
        method: "POST",
        url: urlBase + "/pitch",
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
    controller: function controller($scope, $q, $http, adminFactory, paymentFactory, pitchFactory) {

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
            debugger;
            console.log(resp);
            pitchFactory.submitPitch($scope.pitch).then(function (resp) {
              console.log(resp);
            }).catch(function (err) {
              console.log(err);
            });
          }).catch(function (err) {
            console.log(err);
          });
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
        .validatePitch($scope.pitch)
        // .then(function(resp){
        //   pitchFactory.lockPitch('56a92ab8bc55811100089d1a')
        //     .then(function(resp){
        //       console.log(resp);
        //     })
        //     .catch(function(err){
        //       console.log(err.status);
        //       console.log(err.statusText)
        //       console.log(err.data);
        //     });
        // })
        .then(function (resp) {
          // If Pitch validates, build a pitch in $scope
          $scope.validationText = "";
          $scope.pitch = resp.pitch;

          // Open the Stripe Checkout Handler
          $scope.handler.open({
            name: "MoviePitch.com",
            description: "Pitch Submission",
            amount: 200
          });
        }).catch(function (err) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJhZG1pbkZhY3RvcnkuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXltZW50RmFjdG9yeS5qcyIsInBpdGNoRmFjdG9yeS5qcyIsInVzZXJGYWN0b3J5LmpzIiwiYWRtaW4tcGl0Y2gtcmV2aWV3L2FkbWluLXBpdGNoLXJldmlldy5qcyIsImNoZWNrb3V0L3BpdGNoLWJveC5qcyIsImxvZ2luL2xvZ2luLmpzIiwibG9naW4tbW9kYWwvbG9naW4tbW9kYWwuanMiLCJuYXYvbmF2LmpzIiwic2lnbnVwL3NpZ251cC5qcyIsImNvbnRhY3QtdXMtZm9ybS9jb250YWN0LXVzLWZvcm0uanMiLCJ1c2VyLXBpdGNoZXMvdXNlci1waXRjaGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLFFBQVEsU0FBUjtBQUNBLFFBQVEsbUJBQVI7O0FBRUEsSUFBTSxrQkFBa0IsQ0FDdEIsV0FEc0IsQ0FBbEI7O0FBSU4sSUFBSSxnQkFBZ0IsUUFBUSxNQUFSLENBQWUsZUFBZixFQUFnQyxlQUFoQyxFQUNqQixNQURpQixDQUNWLENBQUMsZ0JBQUQsRUFBbUIsb0JBQW5CLEVBQ04sVUFBUyxjQUFULEVBQXlCLGtCQUF6QixFQUE0Qzs7QUFFMUMscUJBQW1CLFNBQW5CLENBQTZCLEdBQTdCOzs7QUFGMEMsZ0JBSzFDLENBQ0csS0FESCxDQUNTLE9BRFQsRUFDa0I7QUFDZCxTQUFLLEdBQUw7QUFDQSxpQkFBYSxpQkFBYjtBQUNBLFVBQU07QUFDSixvQkFBYyxLQUFkO0tBREY7R0FKSixFQVFHLEtBUkgsQ0FRUyxPQVJULEVBUWtCO0FBQ2QsU0FBSyxRQUFMO0FBQ0EsaUJBQWEsa0JBQWI7QUFDQSxVQUFNO0FBQ0osb0JBQWMsSUFBZDtLQURGO0dBWEo7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTDBDLGdCQXdDMUMsQ0FDRyxLQURILENBQ1MsS0FEVCxFQUNnQjtBQUNaLFNBQUssTUFBTDtBQUNBLGlCQUFhLGdCQUFi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QUFTLE1BQVQsRUFBaUIsV0FBakIsRUFBNkI7O0FBRXZDLGFBQU8sT0FBUCxHQUFpQixDQUNmO0FBQ0UsbUJBQVcsb0JBQVg7QUFDQSxlQUFPLGlCQUFQO0FBQ0EsbUJBQVcsa0RBQVg7QUFDQSxnQkFBUSxVQUFSO09BTGEsRUFPZjtBQUNFLG1CQUFXLG9CQUFYO0FBQ0EsZUFBTyxRQUFQO0FBQ0EsbUJBQVcsNkVBQVg7QUFDQSxnQkFBUSxVQUFSO09BWGEsRUFZYjtBQUNBLG1CQUFXLGdCQUFYO0FBQ0EsZUFBTyxTQUFQO0FBQ0EsbUJBQVcsb0RBQVg7QUFDQSxnQkFBUSxVQUFSO09BaEJhLENBQWpCLENBRnVDO0tBQTdCO0FBc0JaLGNBQVUsR0FBVjtBQUNBLGlCQUFhLDJDQUFiO0dBeEJGLENBRCtDO0NBQVYsQ0FBdkMiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5yZXF1aXJlKCdhbmd1bGFyJyk7XG5yZXF1aXJlKCdhbmd1bGFyLXVpLXJvdXRlcicpO1xuXG5jb25zdCBjb250cm9sbGVyQXJyYXkgPSBbXG4gIFwidWkucm91dGVyXCJcbl07XG5cbmxldCBtb3ZpZVBpdGNoQXBwID0gYW5ndWxhci5tb2R1bGUoXCJtb3ZpZVBpdGNoQXBwXCIsIGNvbnRyb2xsZXJBcnJheSlcbiAgLmNvbmZpZyhbXCIkc3RhdGVQcm92aWRlclwiLCBcIiR1cmxSb3V0ZXJQcm92aWRlclwiLFxuICAgIGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpe1xuXG4gICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cbiAgICAgIC8vIE1haW4gTmF2XG4gICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xuICAgICAgICAgIHVybDogXCIvXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvaG9tZS5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhZG1pbicsIHtcbiAgICAgICAgICB1cmw6IFwiL2FkbWluXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvYWRtaW4uaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgIC8vIEFjY291bnRcbiAgICAgIC8vICRzdGF0ZVByb3ZpZGVyXG4gICAgICAvLyAgIC5zdGF0ZSgncmVnaXN0ZXInLCB7XG4gICAgICAvLyAgICAgdXJsOiBcIi9yZWdpc3RlclwiLFxuICAgICAgLy8gICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3JlZ2lzdGVyLmh0bWxcIixcbiAgICAgIC8vICAgICBkYXRhOiB7XG4gICAgICAvLyAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAvLyAgICAgfVxuICAgICAgLy8gICB9KVxuICAgICAgLy8gICAuc3RhdGUoJ215LWFjY291bnQnLCB7XG4gICAgICAvLyAgICAgdXJsOiBcIi9teS1hY2NvdW50XCIsXG4gICAgICAvLyAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbXktYWNjb3VudC5odG1sXCIsXG4gICAgICAvLyAgICAgZGF0YToge1xuICAgICAgLy8gICAgICAgcmVxdWlyZUxvZ2luOiB0cnVlXG4gICAgICAvLyAgICAgfVxuICAgICAgLy8gICB9KTtcblxuXG4gICAgICAvLyBGb290ZXIgTmF2XG4gICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2ZhcScsIHtcbiAgICAgICAgICB1cmw6IFwiL2ZhcVwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2ZhcS5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdwcmVzcycsIHtcbiAgICAgICAgICB1cmw6IFwiL3ByZXNzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvcHJlc3MuaHRtbFwiLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHJlcXVpcmVMb2dpbjogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnY29udGFjdC11cycsIHtcbiAgICAgICAgICB1cmw6IFwiL2NvbnRhY3QtdXNcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9jb250YWN0LXVzLmh0bWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICByZXF1aXJlTG9naW46IGZhbHNlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2xlZ2FsJywge1xuICAgICAgICAgIHVybDogXCIvbGVnYWxcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9sZWdhbC5odG1sXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgcmVxdWlyZUxvZ2luOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG4gIF0pXG4gIC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSl7XG5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSl7XG4gICAgICBsZXQgcmVxdWlyZUxvZ2luID0gdG9TdGF0ZS5kYXRhLnJlcXVpcmVMb2dpbjtcblxuICAgICAgaWYocmVxdWlyZUxvZ2luID09PSB0cnVlICYmICRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICRyb290U2NvcGUudGFyZ2V0U3RhdGUgPSB0b1N0YXRlLm5hbWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICB9KTtcbiIsIm1vdmllUGl0Y2hBcHAuY29udHJvbGxlcignTWFpbkN0cmwnLCBbJyRzY29wZScsXG4gIGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgLy8gJHNjb3BlLiRvbignbG9naW4tdHJ1ZScsIGZ1bmN0aW9uKCl7XG4gICAgLy8gICAkc2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgLy8gfSlcbiAgfVxuXSlcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ2FkbWluRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcbiAgY29uc3QgdXJsQmFzZSA9IFwiaHR0cHM6Ly9tb3ZpZXBpdGNoYXBpLmhlcm9rdWFwcC5jb21cIjtcblxuICBjb25zdCB0ZXN0VXNlciA9IHtcbiAgICBuYW1lOiBcIkp1c3RpbiBUdWxrXCIsXG4gICAgZW1haWw6IFwianVzdGludHVsa0BnbWFpbC5jb21cIixcbiAgICBwd2Q6IFwidGVzdFBhc3N3b3JkXCJcbiAgfTtcblxuICBsZXQgZmFjdG9yeSA9IHtcblxuICAgIGxvZ2luQWRtaW46IGZ1bmN0aW9uKGVtYWlsLCBwd2Qpe1xuICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgdXJsOiB1cmxCYXNlICsgXCIvYWRtaW4vbG9naW5cIixcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICBwYXNzd29yZDogcHdkXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZWdpc3RlckFkbWluOiBmdW5jdGlvbihkYXRhKXtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIHVybDogdXJsQmFzZSArIFwiL2FkbWluL3JlZ2lzdGVyXCIsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBuYW1lICAgICAgOiBkYXRhLm5hbWUsXG4gICAgICAgICAgZW1haWwgICAgIDogZGF0YS5lbWFpbCxcbiAgICAgICAgICBwYXNzd29yZCAgOiBkYXRhLnB3ZFxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgdGVzdExvZ2luQWRtaW46IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICB1cmw6IHVybEJhc2UgKyAnL2FkbWluL2xvZ2luJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGVtYWlsOiB0ZXN0VXNlci5lbWFpbCxcbiAgICAgICAgICBwYXNzd29yZDogdGVzdFVzZXIucHdkXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB0ZXN0UmVnaXN0ZXJBZG1pbjogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIHVybDogdXJsQmFzZSArICcvYWRtaW4vcmVnaXN0ZXInLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgbmFtZTogdGVzdFVzZXIubmFtZSxcbiAgICAgICAgICBlbWFpbDogdGVzdFVzZXIuZW1haWwsXG4gICAgICAgICAgcGFzc3dvcmQ6IHRlc3RVc2VyLnB3ZFxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG5cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5mYWN0b3J5KCdlbWFpbEZhY3RvcnknLCBmdW5jdGlvbigkcSl7XG4gIGxldCBzZW5kZ3JpZCA9IHJlcXVpcmUoJ3NlbmRncmlkJykoJ1NHLjJDU3F4OTlqUTItVXdVZjhCaVVVT1EuS2VLRWN2QTVxbldDQVdqSENyOEkwVEtoODhKQkY4TEtCcUh3TkhLRWw5bycpO1xuXG4gIGxldCBmYWN0b3J5ID0ge1xuXG4gICAgLy8gTW9jayB1cCBzZW5kaW5nIGEgY29udGFjdCBlbWFpbFxuICAgIC8vIGh0dHBzOi8vbm9kZW1haWxlci5jb20vXG4gICAgc2VuZENvbnRhY3RVc01lc3NhZ2U6IGZ1bmN0aW9uKG5hbWUsIGVtYWlsLCBzdWJqZWN0LCBtc2cpe1xuICAgICAgbGV0IGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgc3ViamVjdDogc3ViamVjdCxcbiAgICAgICAgbWVzc2FnZTogbXNnXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlRW1haWw6IGZ1bmN0aW9uKGVtYWlsKSB7XG4gICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBsZXQgcmVnID0gL14oW2EtekEtWjAtOV9cXC5cXC1dKStcXEAoKFthLXpBLVowLTlcXC1dKStcXC4pKyhbYS16QS1aMC05XXsyLDR9KSskLztcblxuICAgICAgaWYocmVnLnRlc3QoZW1haWwpKXtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGF5bWVudEZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XG4gIGxldCB1cmxCYXNlID0gXCJodHRwczovL21vdmllcGl0Y2hhcGkuaGVyb2t1YXBwLmNvbVwiO1xuICBsZXQgZmFjdG9yeSA9IHtcblxuICAgIGNyZWF0ZUNoYXJnZTogZnVuY3Rpb24oYW1vdW50LCBkZXNjcmlwdGlvbiwgdG9rZW4pe1xuICAgICAgY29uc29sZS5sb2coe1xuICAgICAgICBhbW91bnQ6IGFtb3VudCxcbiAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICBjdXJyZW5jeTogXCJ1c2RcIixcbiAgICAgICAgc291cmNlOiB0b2tlblxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIHVybDogdXJsQmFzZSArIFwiL3N0cmlwZS9jcmVhdGVfY2hhcmdlXCIsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBhbW91bnQ6IGFtb3VudCxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gICAgICAgICAgY3VycmVuY3k6IFwidXNkXCIsXG4gICAgICAgICAgc291cmNlOiB0b2tlblxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BpdGNoRmFjdG9yeScsIGZ1bmN0aW9uKCRxLCAkaHR0cCkge1xuICBjb25zdCB1cmxCYXNlID0gXCJodHRwczovL21vdmllcGl0Y2hhcGkuaGVyb2t1YXBwLmNvbVwiO1xuXG4gIGxldCBmYWN0b3J5ID0ge1xuXG4gICAgYWNjZXB0UGl0Y2g6IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgIHVybDogdXJsQmFzZSArIFwiL3BpdGNoL2FjY2VwdC9cIiArIGlkXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0QWxsUGl0Y2hlczogZnVuY3Rpb24oKXtcbiAgICAgIC8vIHJldHVybiAkaHR0cC5nZXQodXJsQmFzZSArIFwiL2dldF9hbGxfcGl0Y2hlc1wiKTtcbiAgICAgIHJldHVybiAkaHR0cCh7XG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgdXJsOiB1cmxCYXNlICsgXCIvcGl0Y2hcIlxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldFBpdGNoQnlGaWx0ZXI6IGZ1bmN0aW9uKGZpbHRlclN0cmluZyl7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIHVybDogdXJsQmFzZSArIFwiL3BpdGNoP1wiICsgZmlsdGVyU3RyaW5nXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0UGl0Y2hCeUlEOiBmdW5jdGlvbihpZCl7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIHVybDogdXJsQmFzZSArICcvcGl0Y2gvJyArIGlkXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgbG9ja1BpdGNoOiBmdW5jdGlvbihpZCl7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIHVybDogdXJsQmFzZSArIFwiL3BpdGNoL2xvY2svXCIgKyBpZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlamVjdFBpdGNoOiBmdW5jdGlvbihpZCl7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICB1cmw6IHVybEJhc2UgKyBcIi9waXRjaC9yZWplY3QvXCIgKyBpZFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHN1Ym1pdFBpdGNoOiBmdW5jdGlvbihwaXRjaCkge1xuICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgdXJsOiB1cmxCYXNlICsgXCIvcGl0Y2hcIixcbiAgICAgICAgZGF0YTogcGl0Y2hcbiAgICAgIH0pXG4gICAgfSxcblxuICAgIHZhbGlkYXRlUGl0Y2g6IGZ1bmN0aW9uKHBpdGNoKXtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHBpdGNoKTtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmKFxuICAgICAgICBwaXRjaC51c2VySGFzQWNjZXB0ZWRUZXJtcyA9PT0gdHJ1ZSAmJlxuICAgICAgICBwaXRjaC5waXRjaFRleHQgIT09IFwiXCIgJiZcbiAgICAgICAgcGl0Y2gucGl0Y2hUZXh0ICE9PSBudWxsICYmXG4gICAgICAgIHBpdGNoLmdlbnJlICE9PSBcIlNlbGVjdCBHZW5yZVwiICYmXG4gICAgICAgIHBpdGNoLmdlbnJlICE9PSBcIlwiXG4gICAgICApIHtcbiAgICAgICAgcGl0Y2guc3RhdHVzID0gXCJjcmVhdGVkXCI7XG4gICAgICAgIHBpdGNoLnVzZXJIYXNBY2NlcHRlZFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgcGl0Y2ggOiBwaXRjaFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZWxzZSBpZiAoXG4gICAgICAgIHBpdGNoLnBpdGNoVGV4dCA9PT0gXCJcIiB8fCBwaXRjaC5waXRjaFRleHQgPT09IG51bGwgJiZcbiAgICAgICAgcGl0Y2guZ2VucmUgPT09IFwiXCIgfHwgcGl0Y2guZ2VucmUgPT09IFwiU2VsZWN0IEdlbnJlXCIpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImVycm9yXCIsXG4gICAgICAgICAgICBlcnJvckNvZGU6IDEwMDAsXG4gICAgICAgICAgICBtc2c6IFwiUGxlYXNlIGZpbGwgb3V0IHRoZSBwaXRjaCBmb3JtIGJlZm9yZSBzdWJtaXR0aW5nLlwiXG4gICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGVsc2UgaWYocGl0Y2gudXNlckhhc0FjY2VwdGVkVGVybXMgPT09IGZhbHNlKXtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBlcnJvckNvZGU6IDEwMDEsXG4gICAgICAgICAgbXNnOiBcIlBsZWFzZSBhY2NlcHQgdGhlIHRlcm1zIGluIG9yZGVyIHRvIGNvbnRpbnVlLlwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBlbHNlIGlmIChwaXRjaC5waXRjaFRleHQgPT09IFwiXCIgfHwgcGl0Y2gucGl0Y2hUZXh0ID09PSBudWxsKXtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBlcnJvckNvZGU6IDEwMDIsXG4gICAgICAgICAgbXNnOiBcIlJvYmVydCBpcyBnb29kLCBidXQgbm90IGdvb2QgZW5vdWdoIHRvIHNlbGwgYSBibGFuayBwaXRjaCFcIlxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZWxzZSBpZiAocGl0Y2guZ2VucmUgPT09IFwiXCIgfHwgcGl0Y2guZ2VucmUgPT09IFwiU2VsZWN0IEdlbnJlXCIpe1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIGVycm9yQ29kZTogMTAwMyxcbiAgICAgICAgICBtc2c6IFwiV2hhdCBraW5kIG9mIG1vdmllIGlzIGl0PyBQbGVhc2Ugc2VsZWN0IGEgZ2VucmUuXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIGVycm9yQ29kZTogOTk5OSxcbiAgICAgICAgICBtc2c6IFwiQW4gdW5rbm93biBlcnJvciBoYXMgb2NjdXJyZWQuXCIsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG5cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgndXNlckZhY3RvcnknLCBmdW5jdGlvbigkcSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG4gICAgY2hlY2tMb2dnZWRJbjogZnVuY3Rpb24oKXtcbiAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGlmKCRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcxJyk7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAkbG9jYXRpb24udXJsKCcvbG9naW4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJzInKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuICAgIGxvZ2luVXNlcjogZnVuY3Rpb24odXNlcm5hbWUsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwd2QpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IHVzZXI7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YTogdXNlclxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICBsb2dvdXRVc2VyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAgIHZhciB1c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbiAgICAgIGlmKHVzZXIgPT09IG51bGwpe1xuICAgICAgICAvLyBSZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgJHJvb3RTY29wZVxuICAgICAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ291dC11cGRhdGUnKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBsb2dnZWQgb3V0XCJcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIHN0aWxsIGxvZ2dlZCBpblwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgc2lnblVwOiBmdW5jdGlvbih1c2VybmFtZSwgZW1haWwsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICB2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgICB1c2VyLnNldChcInVzZXJuYW1lXCIsIHVzZXJuYW1lKTtcbiAgICAgIHVzZXIuc2V0KFwiZW1haWxcIiwgZW1haWwpO1xuICAgICAgdXNlci5zZXQoXCJwYXNzd29yZFwiLCBwd2QpO1xuXG4gICAgICB1c2VyLnNpZ25VcChudWxsLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIGRhdGE6IHVzZXJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnIpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgICAgIGVycm9yOiBlcnJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FkbWluUGl0Y2hSZXZpZXcnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAkc2NvcGUucGl0Y2hlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJOb3ZlbWJlciAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJSb21hbnRpYyBDb21lZHlcIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiQSBtYW4gZmFsbHMgaW4gbG92ZSB3aXRoIGEgbGFkeSwgYnV0IGl0J3MgZnVubnkuXCIsXG4gICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHBpdGNoRGF0ZTogXCJPY3RvYmVyIDIzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJIb3Jyb3JcIixcbiAgICAgICAgICBwaXRjaFRleHQ6IFwiQSB3b21hbiBrZWVwcyBjaGVja2luZyBoZXIgZnJpZGdlLCBidXQgdGhlcmUncyBuZXZlciBhbnl0aGluZyB3b3J0aCBlYXRpbmcuXCIsXG4gICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCJcbiAgICAgICAgfSx7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIkp1bmUgM3JkLCAyMDE1XCIsXG4gICAgICAgICAgZ2VucmU6IFwiV2VzdGVyblwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJTb21lIGNvd2JveXMgcmlkZSBhcm91bmQgY2hhc2luZyBhIGdhbmcgb2YgdGhpZXZlc1wiLFxuICAgICAgICAgIHN0YXR1czogXCJhY2NlcHRlZFwiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdwaXRjaEJveCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkcSwgJGh0dHAsIGFkbWluRmFjdG9yeSwgcGF5bWVudEZhY3RvcnksIHBpdGNoRmFjdG9yeSl7XG5cbiAgICAgIC8vIFBvcHVsYXRlIGFuIGFycmF5IG9mIGdlbnJlcywgYW5kIGNyZWF0ZSBzb21lIHZhcmlhYmxlc1xuICAgICAgLy8gZm9yIHRoZSBuZy1tb2RlbHMgdG8gYmluZCB0b1xuICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIGdlbnJlczogW1xuICAgICAgICAgIFwiU2VsZWN0IEdlbnJlXCIsXG4gICAgICAgICAgXCJBY3Rpb25cIixcbiAgICAgICAgICBcIkFkdmVudHVyZVwiLFxuICAgICAgICAgIFwiQW5pbWF0ZWRcIixcbiAgICAgICAgICBcIkNvbWVkeVwiLFxuICAgICAgICAgIFwiQ3JpbWVcIixcbiAgICAgICAgICBcIkRyYW1hXCIsXG4gICAgICAgICAgXCJGYW50YXN5XCIsXG4gICAgICAgICAgXCJIaXN0b3JpY2FsXCIsXG4gICAgICAgICAgXCJIaXN0b3JpY2FsIEZpY3Rpb25cIixcbiAgICAgICAgICBcIkhvcnJvclwiLFxuICAgICAgICAgIFwiS2lkc1wiLFxuICAgICAgICAgIFwiTXlzdGVyeVwiLFxuICAgICAgICAgIFwiUG9saXRpY2FsXCIsXG4gICAgICAgICAgXCJSZWxpZ2lvdXNcIixcbiAgICAgICAgICBcIlJvbWFuY2VcIixcbiAgICAgICAgICBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICAgIFwiU2F0aXJlXCIsXG4gICAgICAgICAgXCJTY2llbmNlIEZpY3Rpb25cIixcbiAgICAgICAgICBcIlRocmlsbGVyXCIsXG4gICAgICAgICAgXCJXZXN0ZXJuXCJcbiAgICAgICAgXSxcbiAgICAgICAgcGl0Y2hHZW5yZTogXCJTZWxlY3QgR2VucmVcIixcbiAgICAgICAgcGl0Y2hUZXh0OiBudWxsLFxuICAgICAgICB0ZXJtc0FncmVlOiBmYWxzZVxuICAgICAgfVxuXG4gICAgICAvLyBDYXJ2ZSBvdXQgYSBwbGFjZSBmb3Igc3RvcmluZyBhIHN1Ym1pdHRlZCBwaXRjaFxuICAgICAgJHNjb3BlLnBpdGNoID0gbnVsbDtcblxuICAgICAgLy8gU2V0IHRoaXMgcHJvcGVydHkgdG8gY29uZmlndXJlIGFsZXJ0IG1lc3NhZ2VzIGRpc3BsYXllZFxuICAgICAgLy8gb24gdmFsaWRhdGlvbiBmYWlsdXJlc1xuICAgICAgJHNjb3BlLnZhbGlkYXRpb25UZXh0ID0gbnVsbDtcblxuICAgICAgLy8gVGhlIEhhbmRsZXIgaGFzIHNvbWUgYmFzaWMgU3RyaXBlIGNvbmZpZyBhbmQgdGhlbiBjYWxscyB0aGUgcGF5bWVudFxuICAgICAgLy8gc3VjY2VzcyBmdW5jdGlvblxuICAgICAgJHNjb3BlLmhhbmRsZXIgPSBTdHJpcGVDaGVja291dC5jb25maWd1cmUoe1xuICAgICAgICBrZXk6ICdwa190ZXN0X1hIa2h0MEdNTFFQcm4yc1lDWFNGeTRGcycsXG4gICAgICAgIC8vIGltYWdlOiAnL2ltZy9kb2N1bWVudGF0aW9uL2NoZWNrb3V0L21hcmtldHBsYWNlLnBuZycsXG4gICAgICAgIGxvY2FsZTogJ2F1dG8nLFxuICAgICAgICB0b2tlbjogZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHBpdGNoIG9iamVjdCB3aXRoIHRoZSBwYXltZW50IHRva2VuXG4gICAgICAgICAgJHNjb3BlLnBpdGNoLnRva2VuID0gdG9rZW47XG4gICAgICAgICAgJHNjb3BlLnBpdGNoLnN1Ym1pdHRlckVtYWlsID0gdG9rZW4uZW1haWw7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucGl0Y2gpO1xuICAgICAgICAgIHBheW1lbnRGYWN0b3J5XG4gICAgICAgICAgICAuY3JlYXRlQ2hhcmdlKDIwMCwgXCJQaXRjaCBzdWJtaXNzaW9uXCIsIHRva2VuLmlkKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgICAgcGl0Y2hGYWN0b3J5LnN1Ym1pdFBpdGNoKCRzY29wZS5waXRjaClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cblxuICAgICAgLy8gUnVuIHRoZSBoYW5kbGVyIHdoZW4gc29tZW9uZSBjbGlja3MgJ3N1Ym1pdCdcbiAgICAgICRzY29wZS5zdWJtaXRQaXRjaCA9IGZ1bmN0aW9uKGV2KXtcblxuICAgICAgICAvLyBDcmVhdGUgYSBwaXRjaCBvYmplY3QgZm9yIHZhbGlkYXRpb25cbiAgICAgICAgJHNjb3BlLnBpdGNoID0ge1xuICAgICAgICAgIGdlbnJlOiAkc2NvcGUuZGF0YS5waXRjaEdlbnJlLFxuICAgICAgICAgIHBpdGNoVGV4dDogJHNjb3BlLmRhdGEucGl0Y2hUZXh0LFxuICAgICAgICAgIHVzZXJIYXNBY2NlcHRlZFRlcm1zOiAkc2NvcGUuZGF0YS50ZXJtc0FncmVlXG4gICAgICAgIH07XG5cbiAgICAgICAgcGl0Y2hGYWN0b3J5XG4gICAgICAgICAgLy8gVmFsaWRhdGUgdGhlIHBpdGNoIG9iamVjdFxuICAgICAgICAgIC52YWxpZGF0ZVBpdGNoKCRzY29wZS5waXRjaClcbiAgICAgICAgICAvLyAudGhlbihmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAvLyAgIHBpdGNoRmFjdG9yeS5sb2NrUGl0Y2goJzU2YTkyYWI4YmM1NTgxMTEwMDA4OWQxYScpXG4gICAgICAgICAgLy8gICAgIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgIC8vICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgIC8vICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAvLyAgICAgICBjb25zb2xlLmxvZyhlcnIuc3RhdHVzKTtcbiAgICAgICAgICAvLyAgICAgICBjb25zb2xlLmxvZyhlcnIuc3RhdHVzVGV4dClcbiAgICAgICAgICAvLyAgICAgICBjb25zb2xlLmxvZyhlcnIuZGF0YSk7XG4gICAgICAgICAgLy8gICAgIH0pO1xuICAgICAgICAgIC8vIH0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICAgICAgLy8gSWYgUGl0Y2ggdmFsaWRhdGVzLCBidWlsZCBhIHBpdGNoIGluICRzY29wZVxuICAgICAgICAgICAgJHNjb3BlLnZhbGlkYXRpb25UZXh0ID0gXCJcIjtcbiAgICAgICAgICAgICRzY29wZS5waXRjaCA9IHJlc3AucGl0Y2g7XG5cbiAgICAgICAgICAgIC8vIE9wZW4gdGhlIFN0cmlwZSBDaGVja291dCBIYW5kbGVyXG4gICAgICAgICAgICAkc2NvcGUuaGFuZGxlci5vcGVuKHtcbiAgICAgICAgICAgICAgbmFtZTogXCJNb3ZpZVBpdGNoLmNvbVwiLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogXCJQaXRjaCBTdWJtaXNzaW9uXCIsXG4gICAgICAgICAgICAgIGFtb3VudDogMjAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgJHNjb3BlLnZhbGlkYXRpb25UZXh0ID0gZXJyLm1zZztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgfSlcblxuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfTtcblxuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICBlbC5maW5kKCdzZWxlY3QnKS5vbignZm9jdXMnLCBmdW5jdGlvbigpe1xuICAgICAgICBjb25zdCBzZWxlY3RHZW5yZSA9IGVsLmZpbmQoJ29wdGlvbicpWzBdO1xuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoc2VsZWN0R2VucmUpLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9jaGVja291dC9waXRjaC1ib3guaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2xvZ2luJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5sb2dpblVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlciwgcHdkO1xuXG4gICAgICAgIHVzZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItbG9naW4tdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1sb2dpbi1wd2QnKSkudmFsKCk7XG5cbiAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXIsIHB3ZClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICB9O1xuXG5cbiAgICAgICRzY29wZS5sb2dvdXRVc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdXNlckZhY3RvcnkubG9nb3V0VXNlcigpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvbG9naW4vbG9naW4uaHRtbFwiXG4gIH1cbn0pO1xuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2xvZ2luTW9kYWwnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJcIjtcblxuICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUuaW5wdXRzRXJyb3IgPSBcIlwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuZmxhZ0lucHV0RXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJpcy1lcnJvclwiO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1oaWRkZW5cIjtcbiAgICAgICRzY29wZS5oaWRlQWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LWhpZGRlblwifTtcbiAgICAgICRzY29wZS5zaG93QWxlcnQgPSBmdW5jdGlvbigpeyRzY29wZS5pc0FsZXJ0U2hvd24gPSBcImFsZXJ0LXNob3duXCJ9O1xuXG4gICAgICAkc2NvcGUuY2xlYXJGb3JtcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBtb2RhbCA9ICQoJyNsb2dpbi1tb2RhbCcpO1xuXG4gICAgICAgIC8vIENsZWFyIEV4aXN0aW5nIElucHV0c1xuICAgICAgICBtb2RhbC5maW5kKCdpbnB1dCcpLnZhbCgnJyk7XG5cbiAgICAgICAgLy8gUmVzZXQgRXJyb3IgTm90aWZpY2F0aW9uc1xuICAgICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUudXNlckxvZ2luID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcbiAgICAgICAgdmFyIG1vZGFsID0gJCgnI2xvZ2luLW1vZGFsJyk7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tdXNlcm5hbWUnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9naW4tcGFzc3dvcmQnKSkudmFsKCk7XG5cbiAgICAgICAgdXNlckZhY3RvcnkubG9naW5Vc2VyKHVzZXIsIHB3ZCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICQoJyNsb2dpbi1tb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAkc2NvcGUuY2xlYXJJbnB1dEVycm9ycygpO1xuICAgICAgICAgICAgJHNjb3BlLmNsZWFyRm9ybXMoKTtcbiAgICAgICAgICAgICRzY29wZS5oaWRlQWxlcnQoKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlICRyb290U2NvcGUgaXMgaW4gdGhlIHByb2Nlc3Mgb2YgbmF2aWdhdGluZyB0byBhIHN0YXRlLFxuICAgICAgICAgICAgLy8gYXMgaW4gYW4gZXZlbnQgd2hlcmUgbG9naW4gaW50ZXJydXB0cyBuYXZpZ2F0aW9uIHRvIGEgcmVzdHJpY3RlZCBwYWdlXG4gICAgICAgICAgICAvLyBjb250aW51ZSB0byB0aGF0IHN0YXRlLCBvdGhlcndpc2UgY2xlYXIgdGhlICRyb290U2NvcGUudGFyZ2V0U3RhdGVcbiAgICAgICAgICAgIGlmKCRyb290U2NvcGUudGFyZ2V0U3RhdGUgIT09IG51bGwpe1xuICAgICAgICAgICAgICAkc3RhdGUuZ28oJHJvb3RTY29wZS50YXJnZXRTdGF0ZSk7XG4gICAgICAgICAgICAgICRyb290U2NvcGUudGFyZ2V0U3RhdGUgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICRzY29wZS5mbGFnSW5wdXRFcnJvcnMoKTtcbiAgICAgICAgICAgICRzY29wZS5zaG93QWxlcnQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG5cblxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiAnY29tcG9uZW50cy9sb2dpbi1tb2RhbC9sb2dpbi1tb2RhbC5odG1sJ1xuICB9XG59KVxuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FwcEhlYWRlcicsIGZ1bmN0aW9uKCRzdGF0ZSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9IFwibWVudS1jbG9zZWRcIjtcbiAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ2luXCI7XG5cbiAgICAgICRzY29wZS50b2dnbGVNZW51ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9PT0gXCJtZW51LWNsb3NlZFwiID8gXCJtZW51LW9wZW5cIiA6IFwibWVudS1jbG9zZWRcIjtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ2luLXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ291dFwiO1xuICAgICAgfSk7XG5cblxuICAgICAgJHNjb3BlLiRvbignbG9nb3V0LXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ2luXCI7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLmxvZ291dFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB1c2VyRmFjdG9yeS5sb2dvdXRVc2VyKCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdpbmRleCcpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUub3BlbkxvZ2luTW9kYWwgPSBmdW5jdGlvbigpe1xuICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICAkKGVsKS5maW5kKCcubWFpbi1uYXYgYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLnRvZ2dsZU1lbnUoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvbmF2L25hdi5odG1sXCJcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3NpZ251cCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgJHN0YXRlLCAkcm9vdFNjb3BlLCB1c2VyRmFjdG9yeSwgZW1haWxGYWN0b3J5KXtcbiAgICAgIC8vICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS51c2VybmFtZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcIlwiO1xuXG4gICAgICAkc2NvcGUudmFsaWRhdGVFbWFpbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItZW1haWwnKSkudmFsKCk7XG5cbiAgICAgICAgZW1haWxGYWN0b3J5LnZhbGlkYXRlRW1haWwoZW1haWwpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcIlwiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yVGV4dCA9IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwgYWRkcmVzcy5cIjtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuc2lnbnVwVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VybmFtZSwgZW1haWwsIHB3ZCwgY29uZmlybVB3ZDtcbiAgICAgICAgdmFyIHRlc3RBcnJheSA9IFtdO1xuXG4gICAgICAgIHVzZXJuYW1lID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgZW1haWwgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWVtYWlsJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXBhc3N3b3JkJykpLnZhbCgpO1xuICAgICAgICBjb25maXJtUHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1jb25maXJtLXBhc3N3b3JkJykpLnZhbCgpO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSBlbnRyaWVzIGV4aXN0IGZvciBhbGwgdGhyZWUgcHJpbWFyeSBmaWVsZHNcbiAgICAgICAgaWYodXNlcm5hbWUgPT09IFwiXCIgfHwgZW1haWwgPT09IFwiXCIgfHwgcHdkID09PSBcIlwiKXtcbiAgICAgICAgICAkc2NvcGUuZ2VuZXJhbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgdGVzdEFycmF5LnB1c2goZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHB3ZCAhPT0gY29uZmlybVB3ZCl7XG4gICAgICAgICAgJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICB0ZXN0QXJyYXkucHVzaChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGVzdEFycmF5Lmxlbmd0aCA9PT0gMCl7XG4gICAgICAgICAgdXNlckZhY3Rvcnkuc2lnblVwKHVzZXJuYW1lLCBlbWFpbCwgcHdkKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnNpZ251cFN1Y2Nlc3MgPSBcInNob3ctYWxlcnRcIjtcblxuICAgICAgICAgICAgICAgIC8vIGxvZ2luIHRoZSB1c2VyIGFmdGVyIGEgc3VjY2Vzc2Z1bCBzaWdudXAgYW5kIG5hdmlnYXRlIHRvIHN1Ym1pdC1waXRjaFxuICAgICAgICAgICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VybmFtZSwgcHdkKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3N1Ym1pdC1waXRjaCcpO1xuICAgICAgICAgICAgICAgICAgICAgIH0sIDU1MCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICBzd2l0Y2goZXJyLmVycm9yLmNvZGUpe1xuICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3JUZXh0ID0gXCJUaGUgdXNlcm5hbWUgZmllbGQgaXMgZW1wdHkuXCJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIGNhc2UgMjAyOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvclRleHQgPSBcIlRoZSBkZXNpcmVkIHVzZXJuYW1lIGlzIGFscmVhZHkgdGFrZW4uXCJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIGNhc2UgMjAzOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvclRleHQgPSBcIkFuIGFjY291bnQgaGFzIGFscmVhZHkgYmVlbiBjcmVhdGVkIGF0IFwiICsgZW1haWwgKyBcIi5cIjtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcblxuICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VuY2F1Z2h0IGVycm9yJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvc2lnbnVwL3NpZ251cC5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnY29udGFjdFVzRm9ybScsIGZ1bmN0aW9uKGVtYWlsRmFjdG9yeSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICRzY29wZS5kYXRhID0ge1xuICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICBlbWFpbDogbnVsbCxcbiAgICAgICAgbXNnU3ViamVjdDogXCJHZW5lcmFsXCIsXG4gICAgICAgIG1lc3NhZ2U6IG51bGwsXG4gICAgICAgIHN1YmplY3RzOiBbXG4gICAgICAgICAgXCJHZW5lcmFsXCIsXG4gICAgICAgICAgXCJCaWxsaW5nXCIsXG4gICAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICAgIFwiU3VwcG9ydFwiXG4gICAgICAgIF0sXG5cbiAgICAgIH1cblxuICAgICAgbGV0IGNsZWFyRXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwiXCI7XG4gICAgICAgICRzY29wZS5zdWJtaXRTdWNjZXNzID0gXCJcIjtcbiAgICAgIH07XG5cbiAgICAgIGxldCBjbGVhckZpZWxkcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5kYXRhLm5hbWUgPSBudWxsO1xuICAgICAgICAkc2NvcGUuZGF0YS5lbWFpbCA9IG51bGw7XG4gICAgICAgICRzY29wZS5kYXRhLm1lc3NhZ2UgPSBudWxsO1xuICAgICAgICAkc2NvcGUuZGF0YS5tc2dTdWJqZWN0ID0gXCJHZW5lcmFsXCI7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q29udGFjdEZvcm0gPSBmdW5jdGlvbigpe1xuICAgICAgICBjbGVhckVycm9ycygpO1xuXG4gICAgICAgIGVtYWlsRmFjdG9yeS52YWxpZGF0ZUVtYWlsKCRzY29wZS5kYXRhLmVtYWlsKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICBpZihcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5uYW1lID09PSBcIlwiIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubmFtZSA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLmVtYWlsID09PSBcIlwiIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEuZW1haWwgPT09IG51bGwgfHxcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5tc2dTdWJqZWN0ID09PSBcIlwiIHx8XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubXNnU3ViamVjdCA9PT0gbnVsbCB8fFxuICAgICAgICAgICAgICAgICRzY29wZS5kYXRhLm1lc3NhZ2UgPT09IFwiXCIgfHxcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5tZXNzYWdlID09PSBudWxsXG4gICAgICAgICAgICAgICl7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIlBsZWFzZSBmaWxsIG91dCBlYWNoIGZpZWxkIGJlZm9yZSBzdWJtaXR0aW5nLlwiO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtYWlsRmFjdG9yeVxuICAgICAgICAgICAgICAgICAgLnNlbmRDb250YWN0VXNNZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS5lbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubXNnU3ViamVjdCxcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGEubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICAgICAgIGNsZWFyRXJyb3JzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgY2xlYXJGaWVsZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3VibWl0U3VjY2VzcyA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdWNjZXNzVGV4dCA9IFwiU3VjY2VzcyEgWW91ciBtZXNzYWdlIGhhcyBiZWVuIHN1Ym1pdHRlZC5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJBbiBlcnJvciBoYXMgb2NjdXJyZWQuIFlvdXIgbWVzc2FnZSB3YXMgbm90IHNlbnQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFkZHJlc3MuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9jb250YWN0LXVzLWZvcm0vY29udGFjdC11cy1mb3JtLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCd1c2VyUGl0Y2hlcycsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG5cbiAgICAgICRzY29wZS5waXRjaGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk5vdmVtYmVyIDNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIlJvbWFudGljIENvbWVkeVwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIG1hbiBmYWxscyBpbiBsb3ZlIHdpdGggYSBsYWR5LCBidXQgaXQncyBmdW5ueS5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcGl0Y2hEYXRlOiBcIk9jdG9iZXIgMjNyZCwgMjAxNVwiLFxuICAgICAgICAgIGdlbnJlOiBcIkhvcnJvclwiLFxuICAgICAgICAgIHBpdGNoVGV4dDogXCJBIHdvbWFuIGtlZXBzIGNoZWNraW5nIGhlciBmcmlkZ2UsIGJ1dCB0aGVyZSdzIG5ldmVyIGFueXRoaW5nIHdvcnRoIGVhdGluZy5cIixcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIlxuICAgICAgICB9LHtcbiAgICAgICAgICBwaXRjaERhdGU6IFwiSnVuZSAzcmQsIDIwMTVcIixcbiAgICAgICAgICBnZW5yZTogXCJXZXN0ZXJuXCIsXG4gICAgICAgICAgcGl0Y2hUZXh0OiBcIlNvbWUgY293Ym95cyByaWRlIGFyb3VuZCBjaGFzaW5nIGEgZ2FuZyBvZiB0aGlldmVzXCIsXG4gICAgICAgICAgc3RhdHVzOiBcImFjY2VwdGVkXCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvdXNlci1waXRjaGVzL3VzZXItcGl0Y2hlcy5odG1sXCJcbiAgfVxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
