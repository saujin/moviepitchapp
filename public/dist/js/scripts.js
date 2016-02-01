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
"use strict";

moviePitchApp.factory('emailFactory', function ($q) {
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
    templateUrl: "src/components/checkout/pitch-box.html"
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
    templateUrl: "src/components/contact-us-form/contact-us-form.html"
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
    templateUrl: "src/components/login/login.html"
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
    templateUrl: 'src/components/login-modal/login-modal.html'
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
        // $('#login-modal').modal('show');
      };
    },

    link: function link(scope, el, attrs) {
      // $(el).find('.main-nav a').on('click', function(){
      //   scope.toggleMenu();
      // });
    },
    restrict: "A",
    templateUrl: "src/components/nav/nav.html"
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
    templateUrl: "src/components/signup/signup.html"
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
    templateUrl: "src/components/user-pitches/user-pitches.html"
  };
});