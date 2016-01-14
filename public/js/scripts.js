"use strict";

var controllerArray = ["ui.router"];

var moviePitchApp = angular.module("moviePitchApp", controllerArray).config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  // Main Nav
  $stateProvider.state('index', {
    url: "/",
    templateUrl: "views/home.html"
  }).state('our-team', {
    url: "/our-team",
    templateUrl: "views/our-team.html"
  }).state('success-stories', {
    url: "/success-stories",
    templateUrl: "views/success-stories.html"
  }).state('submit-pitch', {
    url: "/submit-pitch",
    templateUrl: "views/submit-pitch.html"
  });

  // Account
  $stateProvider.state('register', {
    url: "/register",
    templateUrl: "views/register.html"
  }).state('my-account', {
    url: "/account",
    templateUrl: "views/my-account.html"
  });

  // Footer Nav
  $stateProvider.state('faq', {
    url: "/faq",
    templateUrl: "views/faq.html"
  }).state('press', {
    url: "/press",
    templateUrl: "views/press.html"
  }).state('contact-us', {
    url: "/contact-us",
    templateUrl: "views/contact-us.html"
  }).state('legal', {
    url: "/legal",
    templateUrl: "views/legal.html"
  });
}]).run(function ($rootScope) {
  Parse.initialize("PR9WBHEvjSuW9us8Q7SGh2KYRVQaHLbztZjshsb1", "nyz7N9sGLUIN1hjMY9NNQneExxP5W0MJhXH3u1Qh");

  // Make sure a user is logged out
  Parse.User.logOut();
  $rootScope.curUser = null;
});
'use strict';

moviePitchApp.controller('MainCtrl', ['$scope', function ($scope) {
  // $scope.$on('login-true', function(){
  //   $scope.$broadcast('login-update');
  // })
}]);
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

moviePitchApp.factory('userFactory', function ($q, $rootScope) {
  var factory = {
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

moviePitchApp.directive('loginModal', function () {
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
        }, function (err) {
          console.log(err);
          $scope.flagInputErrors();
          $scope.showAlert();
          console.log($scope.inputsError);
        });
      };
    },
    restrict: "E",
    templateUrl: 'components/login-modal/login-modal.html'
  };
});
"use strict";

moviePitchApp.directive('appHeader', function () {
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
        }, function (err) {
          console.log(err);
        });
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
            $timeout(function () {
              $state.go('my-account');
            }, 750);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwiTWFpbkN0cmwuanMiLCJlbWFpbEZhY3RvcnkuanMiLCJwYXJzZUZhY3RvcnkuanMiLCJwYXltZW50RmFjdG9yeS5qcyIsInVzZXJGYWN0b3J5LmpzIiwiYWN0aW9uLWJ1dHRvbi9hY3Rpb24tYnV0dG9uLmpzIiwiY29udGFjdC11cy1mb3JtL2NvbnRhY3QtdXMtZm9ybS5qcyIsImxvZ2luL2xvZ2luLmpzIiwibG9naW4tbW9kYWwvbG9naW4tbW9kYWwuanMiLCJuYXYvbmF2LmpzIiwic2lnbnVwL3NpZ251cC5qcyIsInN1Ym1pdFBpdGNoL3N1Ym1pdFBpdGNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixJQUFNLGVBQWUsR0FBRyxDQUN0QixXQUFXLENBQ1osQ0FBQzs7QUFHRixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQ3hCLE1BQU0sQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQ3hDLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLG9CQUFvQixFQUM3QyxVQUFTLGNBQWMsRUFBRSxrQkFBa0IsRUFBQzs7QUFFMUMsb0JBQWtCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQzs7O0FBQUMsQUFHbEMsZ0JBQWMsQ0FDWCxLQUFLLENBQUMsT0FBTyxFQUFFO0FBQ2QsT0FBRyxFQUFFLEdBQUc7QUFDUixlQUFXLEVBQUUsaUJBQWlCO0dBQy9CLENBQUMsQ0FDRCxLQUFLLENBQUMsVUFBVSxFQUFFO0FBQ2pCLE9BQUcsRUFBRSxXQUFXO0FBQ2hCLGVBQVcsRUFBRSxxQkFBcUI7R0FDbkMsQ0FBQyxDQUNELEtBQUssQ0FBQyxpQkFBaUIsRUFBRTtBQUN4QixPQUFHLEVBQUUsa0JBQWtCO0FBQ3ZCLGVBQVcsRUFBRSw0QkFBNEI7R0FDMUMsQ0FBQyxDQUNELEtBQUssQ0FBQyxjQUFjLEVBQUU7QUFDckIsT0FBRyxFQUFFLGVBQWU7QUFDcEIsZUFBVyxFQUFFLHlCQUF5QjtHQUN2QyxDQUFDOzs7QUFB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QixnQkFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdkIsZ0JBQU0sQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDO0FBQ2pDLGlCQUFPO1NBQ1IsTUFBTSxJQUFJLEtBQUssRUFBRSxFQUVqQjtPQUNGO0tBQ0Y7QUFDRCxZQUFRLEVBQUUsR0FBRztHQUNkLENBQUE7Q0FDRixDQUFDLENBQUMiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBjb250cm9sbGVyQXJyYXkgPSBbXG4gIFwidWkucm91dGVyXCJcbl07XG5cblxubGV0IG1vdmllUGl0Y2hBcHAgPSBhbmd1bGFyXG4gIC5tb2R1bGUoXCJtb3ZpZVBpdGNoQXBwXCIsIGNvbnRyb2xsZXJBcnJheSlcbiAgLmNvbmZpZyhbXCIkc3RhdGVQcm92aWRlclwiLCBcIiR1cmxSb3V0ZXJQcm92aWRlclwiLFxuICAgIGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpe1xuXG4gICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cbiAgICAgIC8vIE1haW4gTmF2XG4gICAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2luZGV4Jywge1xuICAgICAgICAgIHVybDogXCIvXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvaG9tZS5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdvdXItdGVhbScsIHtcbiAgICAgICAgICB1cmw6IFwiL291ci10ZWFtXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvb3VyLXRlYW0uaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnc3VjY2Vzcy1zdG9yaWVzJywge1xuICAgICAgICAgIHVybDogXCIvc3VjY2Vzcy1zdG9yaWVzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3Mvc3VjY2Vzcy1zdG9yaWVzLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3N1Ym1pdC1waXRjaCcsIHtcbiAgICAgICAgICB1cmw6IFwiL3N1Ym1pdC1waXRjaFwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3N1Ym1pdC1waXRjaC5odG1sXCJcbiAgICAgICAgfSk7XG5cbiAgICAgIC8vIEFjY291bnRcbiAgICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgncmVnaXN0ZXInLCB7XG4gICAgICAgICAgdXJsOiBcIi9yZWdpc3RlclwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3JlZ2lzdGVyLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ215LWFjY291bnQnLCB7XG4gICAgICAgICAgdXJsOiBcIi9hY2NvdW50XCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbXktYWNjb3VudC5odG1sXCJcbiAgICAgICAgfSk7XG5cblxuICAgICAgLy8gRm9vdGVyIE5hdlxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdmYXEnLCB7XG4gICAgICAgICAgdXJsOiBcIi9mYXFcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9mYXEuaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgncHJlc3MnLCB7XG4gICAgICAgICAgdXJsOiBcIi9wcmVzc1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3ByZXNzLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2NvbnRhY3QtdXMnLCB7XG4gICAgICAgICAgdXJsOiBcIi9jb250YWN0LXVzXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvY29udGFjdC11cy5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdsZWdhbCcsIHtcbiAgICAgICAgICB1cmw6IFwiL2xlZ2FsXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbGVnYWwuaHRtbFwiXG4gICAgICAgIH0pO1xuXG4gICAgfVxuICBdKVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUpe1xuICAgIFBhcnNlLmluaXRpYWxpemUoXCJQUjlXQkhFdmpTdVc5dXM4UTdTR2gyS1lSVlFhSExienRaanNoc2IxXCIsIFwibnl6N045c0dMVUlOMWhqTVk5Tk5RbmVFeHhQNVcwTUpoWEgzdTFRaFwiKTtcblxuICAgIC8vIE1ha2Ugc3VyZSBhIHVzZXIgaXMgbG9nZ2VkIG91dFxuICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG4gICAgJHJvb3RTY29wZS5jdXJVc2VyID0gbnVsbDtcbiAgfSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmNvbnRyb2xsZXIoJ01haW5DdHJsJywgWyckc2NvcGUnLFxuICBmdW5jdGlvbigkc2NvcGUpe1xuICAgIC8vICRzY29wZS4kb24oJ2xvZ2luLXRydWUnLCBmdW5jdGlvbigpe1xuICAgIC8vICAgJHNjb3BlLiRicm9hZGNhc3QoJ2xvZ2luLXVwZGF0ZScpO1xuICAgIC8vIH0pXG4gIH1cbl0pXG4iLCJtb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ2VtYWlsRmFjdG9yeScsIGZ1bmN0aW9uKCRxKXtcbiAgbGV0IGZhY3RvcnkgPSB7XG5cbiAgICAvLyBNb2NrIHVwIHNlbmRpbmcgYSBjb250YWN0IGVtYWlsXG4gICAgLy8gaHR0cHM6Ly9ub2RlbWFpbGVyLmNvbS9cbiAgICBzZW5kQ29udGFjdFVzTWVzc2FnZTogZnVuY3Rpb24obmFtZSwgZW1haWwsIHN1YmplY3QsIG1zZyl7XG4gICAgICBsZXQgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHtcbiAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICBzdWJqZWN0OiBzdWJqZWN0LFxuICAgICAgICBtZXNzYWdlOiBtc2dcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVFbWFpbDogZnVuY3Rpb24oZW1haWwpIHtcbiAgICAgIGxldCBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGxldCByZWcgPSAvXihbYS16QS1aMC05X1xcLlxcLV0pK1xcQCgoW2EtekEtWjAtOVxcLV0pK1xcLikrKFthLXpBLVowLTldezIsNH0pKyQvO1xuXG4gICAgICBpZihyZWcudGVzdChlbWFpbCkpe1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSlcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BhcnNlRmFjdG9yeScsIGZ1bmN0aW9uKCRxKSB7XG4gIHZhciBmYWN0b3J5ID0ge1xuICAgIHN1Ym1pdFBpdGNoOiBmdW5jdGlvbihnZW5yZSwgdGV4dCkge1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgLy8gTWFrZSBzdXJlIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbiB0byBzdG9yZSB0aGUgcGl0Y2hcbiAgICAgIGlmICgkcm9vdFNjb3BlLmN1clVzZXIgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIFBpdGNoID0gUGFyc2UuT2JqZWN0LmV4dGVuZChcIlBpdGNoXCIpO1xuICAgICAgICB2YXIgcGl0Y2ggPSBuZXcgUGl0Y2goKTtcblxuICAgICAgICBwaXRjaC5zZXQoXCJnZW5yZVwiLCBnZW5yZSk7XG4gICAgICAgIHBpdGNoLnNldChcInBpdGNoXCIsIHRleHQpO1xuICAgICAgICAvLyBwaXRjaC5zZXQoXCJjcmVhdGVyXCIsIFBhcnNlLlVzZXIuY3VycmVudC51c2VybmFtZSlcbiAgICAgICAgcGl0Y2guc2V0KFwicmV2aWV3ZWRcIiwgZmFsc2UpXG5cblxuICAgICAgICBwaXRjaC5zYXZlKG51bGwsIHtcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihwaXRjaCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgICAgIGRhdGE6IHBpdGNoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihwaXRjaCwgZXJyb3IpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgICAgICBkYXRhOiBlcnJvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVqZWN0IHRoZSBzYXZlIGF0dGVtcHQgaWYgbm8gY3VycmVudCB1c2VyXG4gICAgICBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwicmVqZWN0ZWRcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBub3QgbG9nZ2VkIGluXCJcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBmYWN0b3J5O1xufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3BheW1lbnRGYWN0b3J5JywgZnVuY3Rpb24oKXtcbiAgdmFyIGZhY3RvcnkgPSB7XG5cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgndXNlckZhY3RvcnknLCBmdW5jdGlvbigkcSwgJHJvb3RTY29wZSl7XG4gIHZhciBmYWN0b3J5ID0ge1xuICAgIGxvZ2luVXNlcjogZnVuY3Rpb24odXNlcm5hbWUsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCBwd2QpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgICRyb290U2NvcGUuY3VyVXNlciA9IHVzZXI7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgICBzdGF0dXM6IFwic3VjY2Vzc1wiLFxuICAgICAgICAgICAgZGF0YTogdXNlclxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgZXJyb3I6IGVyclxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG5cbiAgICBsb2dvdXRVc2VyOiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgIFBhcnNlLlVzZXIubG9nT3V0KCk7XG5cbiAgICAgIHZhciB1c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbiAgICAgIGlmKHVzZXIgPT09IG51bGwpe1xuICAgICAgICAvLyBSZW1vdmUgdGhlIHVzZXIgZnJvbSB0aGUgJHJvb3RTY29wZVxuICAgICAgICAkcm9vdFNjb3BlLmN1clVzZXIgPSBudWxsO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ291dC11cGRhdGUnKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7XG4gICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBsb2dnZWQgb3V0XCJcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3Qoe1xuICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgIG1zZzogXCJVc2VyIGlzIHN0aWxsIGxvZ2dlZCBpblwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9LFxuXG4gICAgc2lnblVwOiBmdW5jdGlvbih1c2VybmFtZSwgZW1haWwsIHB3ZCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICB2YXIgdXNlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgICB1c2VyLnNldChcInVzZXJuYW1lXCIsIHVzZXJuYW1lKTtcbiAgICAgIHVzZXIuc2V0KFwiZW1haWxcIiwgZW1haWwpO1xuICAgICAgdXNlci5zZXQoXCJwYXNzd29yZFwiLCBwd2QpO1xuXG4gICAgICB1c2VyLnNpZ25VcChudWxsLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIGRhdGE6IHVzZXJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnIpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICAgIHN0YXR1czogXCJlcnJvclwiLFxuICAgICAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgICAgIGVycm9yOiBlcnJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pXG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYWN0aW9uQnV0dG9uJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRzdGF0ZSl7XG5cbiAgICAgICRzY29wZS51cGRhdGUgPSBmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCRyb290U2NvcGUuY3VyVXNlciA9PT0gbnVsbCl7XG4gICAgICAgICAgJHNjb3BlLnRhcmdldCA9IFwicmVnaXN0ZXJcIjtcbiAgICAgICAgICAkc2NvcGUuYWN0aW9uVGV4dCA9IFwiUmVnaXN0ZXIgVG8gU3RhcnQgUGl0Y2hpbmchXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLmFjdGlvblRleHQgPSBcIlN1Ym1pdCBhIFBpdGNoIVwiO1xuICAgICAgICAgICRzY29wZS50YXJnZXQgPSBcInN1Ym1pdC1waXRjaFwiO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUubmF2aWdhdGUgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc3RhdGUuZ28oJHNjb3BlLnRhcmdldCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuJG9uKCdsb2dpbi11cGRhdGUnLCBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUudXBkYXRlKCk7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLiRvbignbG9nb3V0LXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS51cGRhdGUoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICBzY29wZS51cGRhdGUoKTtcbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIlxuICB9XG59KVxuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2NvbnRhY3RVc0Zvcm0nLCBmdW5jdGlvbihlbWFpbEZhY3Rvcnkpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAkc2NvcGUuc3ViamVjdHMgPSBbXG4gICAgICAgIFwiR2VuZXJhbFwiLFxuICAgICAgICBcIkJpbGxpbmdcIixcbiAgICAgICAgXCJTYWxlc1wiLFxuICAgICAgICBcIlN1cHBvcnRcIlxuICAgICAgXTtcblxuXG4gICAgICBsZXQgY2xlYXJFcnJvcnMgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJcIjtcbiAgICAgICAgJHNjb3BlLnN1Ym1pdFN1Y2Nlc3MgPSBcIlwiO1xuICAgICAgfTtcblxuICAgICAgbGV0IGNsZWFyRmllbGRzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJCgnW2NvbnRhY3QtdXMtZm9ybV0nKS5maW5kKCcuZm9ybS1jb250cm9sJykudmFsKCcnKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5zdWJtaXRDb250YWN0Rm9ybSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNsZWFyRXJyb3JzKCk7XG5cbiAgICAgICAgbGV0IG5hbWUsIGVtYWlsLCBzdWJqZWN0LCBtZXNzYWdlO1xuXG4gICAgICAgIG5hbWUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhY3QtbmFtZScpKS52YWwoKTtcbiAgICAgICAgZW1haWwgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhY3QtZW1haWwnKSkudmFsKCk7XG4gICAgICAgIHN1YmplY3QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhY3Qtc3ViamVjdCcpKS52YWwoKTtcbiAgICAgICAgbWVzc2FnZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFjdC1tZXNzYWdlJykpLnZhbCgpO1xuXG4gICAgICAgIGVtYWlsRmFjdG9yeS52YWxpZGF0ZUVtYWlsKGVtYWlsKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGlmKG5hbWUgPT09IFwiXCIgfHwgZW1haWwgPT09IFwiXCIgfHwgc3ViamVjdCA9PT0gXCJcIiB8fCBtZXNzYWdlPT09XCJcIil7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIlBsZWFzZSBmaWxsIG91dCBlYWNoIGZpZWxkIGJlZm9yZSBzdWJtaXR0aW5nLlwiO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgZW1haWxGYWN0b3J5LnNlbmRDb250YWN0VXNNZXNzYWdlKG5hbWUsIGVtYWlsLCBzdWJqZWN0LCBtZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICAgICAgIGNsZWFyRXJyb3JzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgY2xlYXJGaWVsZHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc3VibWl0U3VjY2VzcyA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zdWNjZXNzVGV4dCA9IFwiU3VjY2VzcyEgWW91ciBtZXNzYWdlIGhhcyBiZWVuIHN1Ym1pdHRlZC5cIjtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gXCJBbiBlcnJvciBoYXMgb2NjdXJyZWQuIFlvdXIgbWVzc2FnZSB3YXMgbm90IHNlbnQuXCI7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2VFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgICAgICAkc2NvcGUubWVzc2FnZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsIGFkZHJlc3MuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJBXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9jb250YWN0LXVzLWZvcm0vY29udGFjdC11cy1mb3JtLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdsb2dpbicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUubG9naW5Vc2VyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHVzZXIsIHB3ZDtcblxuICAgICAgICB1c2VyID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItbG9naW4tcHdkJykpLnZhbCgpO1xuXG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VyLCBwd2QpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfTtcblxuXG4gICAgICAkc2NvcGUubG9nb3V0VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ291dFVzZXIoKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCJjb21wb25lbnRzL2xvZ2luL2xvZ2luLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdsb2dpbk1vZGFsJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIHVzZXJGYWN0b3J5KXtcbiAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiXCI7XG5cbiAgICAgICRzY29wZS5jbGVhcklucHV0RXJyb3JzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmlucHV0c0Vycm9yID0gXCJcIjtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmZsYWdJbnB1dEVycm9ycyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5pbnB1dHNFcnJvciA9IFwiaXMtZXJyb3JcIjtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmlzQWxlcnRTaG93biA9IFwiYWxlcnQtaGlkZGVuXCI7XG4gICAgICAkc2NvcGUuaGlkZUFsZXJ0ID0gZnVuY3Rpb24oKXskc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1oaWRkZW5cIn07XG4gICAgICAkc2NvcGUuc2hvd0FsZXJ0ID0gZnVuY3Rpb24oKXskc2NvcGUuaXNBbGVydFNob3duID0gXCJhbGVydC1zaG93blwifTtcblxuICAgICAgJHNjb3BlLmNsZWFyRm9ybXMgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgbW9kYWwgPSAkKCcjbG9naW4tbW9kYWwnKTtcblxuICAgICAgICAvLyBDbGVhciBFeGlzdGluZyBJbnB1dHNcbiAgICAgICAgbW9kYWwuZmluZCgnaW5wdXQnKS52YWwoJycpO1xuXG4gICAgICAgIC8vIFJlc2V0IEVycm9yIE5vdGlmaWNhdGlvbnNcbiAgICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMoKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnVzZXJMb2dpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VyLCBwd2Q7XG4gICAgICAgIHZhciBtb2RhbCA9ICQoJyNsb2dpbi1tb2RhbCcpO1xuXG4gICAgICAgIHVzZXIgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLXVzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvZ2luLXBhc3N3b3JkJykpLnZhbCgpO1xuXG4gICAgICAgIHVzZXJGYWN0b3J5LmxvZ2luVXNlcih1c2VyLCBwd2QpLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24ocmVzcCl7XG4gICAgICAgICAgICAkKCcjbG9naW4tbW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgJHNjb3BlLmNsZWFySW5wdXRFcnJvcnMoKTtcbiAgICAgICAgICAgICRzY29wZS5jbGVhckZvcm1zKCk7XG4gICAgICAgICAgICAkc2NvcGUuaGlkZUFsZXJ0KCk7XG5cbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgJHNjb3BlLmZsYWdJbnB1dEVycm9ycygpO1xuICAgICAgICAgICAgJHNjb3BlLnNob3dBbGVydCgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmlucHV0c0Vycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG5cblxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiAnY29tcG9uZW50cy9sb2dpbi1tb2RhbC9sb2dpbi1tb2RhbC5odG1sJ1xuICB9XG59KVxuIiwibW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ2FwcEhlYWRlcicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCB1c2VyRmFjdG9yeSl7XG4gICAgICAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9IFwibWVudS1jbG9zZWRcIjtcbiAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ2luXCI7XG5cbiAgICAgICRzY29wZS50b2dnbGVNZW51ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9PT0gXCJtZW51LWNsb3NlZFwiID8gXCJtZW51LW9wZW5cIiA6IFwibWVudS1jbG9zZWRcIjtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS4kb24oJ2xvZ2luLXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ291dFwiO1xuICAgICAgfSk7XG5cblxuICAgICAgJHNjb3BlLiRvbignbG9nb3V0LXVwZGF0ZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5jdXJyZW50TG9nQWN0aW9uID0gXCJzaG93LWxvZ2luXCI7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLmxvZ291dFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB1c2VyRmFjdG9yeS5sb2dvdXRVc2VyKCkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsLCBhdHRycyl7XG4gICAgICAkKGVsKS5maW5kKCcubWFpbi1uYXYgYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLnRvZ2dsZU1lbnUoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvbmF2L25hdi5odG1sXCJcbiAgfVxufSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW92aWVQaXRjaEFwcC5kaXJlY3RpdmUoJ3NpZ251cCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgJHN0YXRlLCAkcm9vdFNjb3BlLCB1c2VyRmFjdG9yeSwgZW1haWxGYWN0b3J5KXtcbiAgICAgIC8vICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgIC8vICRzY29wZS51c2VybmFtZUVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAvLyAkc2NvcGUuZW1haWxFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgLy8gJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcIlwiO1xuXG4gICAgICAkc2NvcGUudmFsaWRhdGVFbWFpbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVnaXN0ZXItZW1haWwnKSkudmFsKCk7XG5cbiAgICAgICAgZW1haWxGYWN0b3J5LnZhbGlkYXRlRW1haWwoZW1haWwpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihyZXNwKXtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcIlwiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgICAgICRzY29wZS5lbWFpbEVycm9yVGV4dCA9IFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwgYWRkcmVzcy5cIjtcbiAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuc2lnbnVwVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VybmFtZSwgZW1haWwsIHB3ZCwgY29uZmlybVB3ZDtcbiAgICAgICAgdmFyIHRlc3RBcnJheSA9IFtdO1xuXG4gICAgICAgIHVzZXJuYW1lID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgZW1haWwgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLWVtYWlsJykpLnZhbCgpO1xuICAgICAgICBwd2QgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZ2lzdGVyLXBhc3N3b3JkJykpLnZhbCgpO1xuICAgICAgICBjb25maXJtUHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWdpc3Rlci1jb25maXJtLXBhc3N3b3JkJykpLnZhbCgpO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSBlbnRyaWVzIGV4aXN0IGZvciBhbGwgdGhyZWUgcHJpbWFyeSBmaWVsZHNcbiAgICAgICAgaWYodXNlcm5hbWUgPT09IFwiXCIgfHwgZW1haWwgPT09IFwiXCIgfHwgcHdkID09PSBcIlwiKXtcbiAgICAgICAgICAkc2NvcGUuZ2VuZXJhbEVycm9yID0gXCJzaG93LWFsZXJ0XCI7XG4gICAgICAgICAgdGVzdEFycmF5LnB1c2goZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5nZW5lcmFsRXJyb3IgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHB3ZCAhPT0gY29uZmlybVB3ZCl7XG4gICAgICAgICAgJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICB0ZXN0QXJyYXkucHVzaChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLnBhc3N3b3JkRXJyb3IgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGVzdEFycmF5Lmxlbmd0aCA9PT0gMCl7XG4gICAgICAgICAgdXNlckZhY3Rvcnkuc2lnblVwKHVzZXJuYW1lLCBlbWFpbCwgcHdkKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4tdXBkYXRlJyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnNpZ251cFN1Y2Nlc3MgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdteS1hY2NvdW50Jyk7XG4gICAgICAgICAgICAgICAgfSwgNzUwKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICAgICAgICBzd2l0Y2goZXJyLmVycm9yLmNvZGUpe1xuICAgICAgICAgICAgICAgICAgY2FzZSAtMTpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3JUZXh0ID0gXCJUaGUgdXNlcm5hbWUgZmllbGQgaXMgZW1wdHkuXCJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIGNhc2UgMjAyOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcm5hbWVFcnJvclRleHQgPSBcIlRoZSBkZXNpcmVkIHVzZXJuYW1lIGlzIGFscmVhZHkgdGFrZW4uXCJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnVzZXJuYW1lRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgIGNhc2UgMjAzOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZW1haWxFcnJvclRleHQgPSBcIkFuIGFjY291bnQgaGFzIGFscmVhZHkgYmVlbiBjcmVhdGVkIGF0IFwiICsgZW1haWwgKyBcIi5cIjtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVtYWlsRXJyb3IgPSBcInNob3ctYWxlcnRcIjtcblxuICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VuY2F1Z2h0IGVycm9yJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvc2lnbnVwL3NpZ251cC5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnc3VibWl0UGl0Y2gnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgcGFyc2VGYWN0b3J5KXtcbiAgICAgICRzY29wZS5nZW5yZXMgPSBbXG4gICAgICAgIFwiQWN0aW9uXCIsXG4gICAgICAgIFwiQWR2ZW50dXJlXCIsXG4gICAgICAgIFwiQW5pbWF0ZWRcIixcbiAgICAgICAgXCJDb21lZHlcIixcbiAgICAgICAgXCJDcmltZVwiLFxuICAgICAgICBcIkRyYW1hXCIsXG4gICAgICAgIFwiRmFudGFzeVwiLFxuICAgICAgICBcIkhpc3RvcmljYWxcIixcbiAgICAgICAgXCJIaXN0b3JpY2FsIEZpY3Rpb25cIixcbiAgICAgICAgXCJIb3Jyb3JcIixcbiAgICAgICAgXCJLaWRzXCIsXG4gICAgICAgIFwiTXlzdGVyeVwiLFxuICAgICAgICBcIlBvbGl0aWNhbFwiLFxuICAgICAgICBcIlJlbGlnaW91c1wiLFxuICAgICAgICBcIlJvbWFuY2VcIixcbiAgICAgICAgXCJSb21hbnRpYyBDb21lZHlcIixcbiAgICAgICAgXCJTYXRpcmVcIixcbiAgICAgICAgXCJTY2llbmNlIEZpY3Rpb25cIixcbiAgICAgICAgXCJUaHJpbGxlclwiLFxuICAgICAgICBcIldlc3Rlcm5cIlxuICAgICAgXTtcblxuICAgICAgJHNjb3BlLnN1Ym1pdFBpdGNoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGdlbnJlLCBwaXRjaCwgdGVybXMsIGRhdGVBZ3JlZWQ7XG5cbiAgICAgICAgZ2VucmUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dlbnJlJykpLnZhbCgpO1xuICAgICAgICBwaXRjaCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGl0Y2gnKSkudmFsKCk7XG4gICAgICAgIHRlcm1zID0gJCgnI2FncmVlLXRlcm1zJykuaXMoXCI6Y2hlY2tlZFwiKTtcbiAgICAgICAgZGF0ZUFncmVlZCA9IG5ldyBEYXRlKCk7XG5cbiAgICAgICAgY29uc29sZS5sb2coZ2VucmUsIHBpdGNoLCB0ZXJtcywgZGF0ZUFncmVlZCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgdGhlIGZvcm0gZm9yIGJhc2ljIGVycm9yc1xuICAgICAgICB2YWxpZGF0ZUlucHV0KCk7XG5cbiAgICAgICAgLy8gaWYocGl0Y2ggIT09IFwiXCIpe1xuICAgICAgICAvLyAgIC8vIHBhcnNlRmFjdG9yeS5zdWJtaXRQaXRjaChnZW5yZSwgcGl0Y2gpO1xuICAgICAgICAvLyB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHZhbGlkYXRlSW5wdXQoKSB7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0ZXJtcyBhcmUgYWdyZWVkIHRvXG4gICAgICAgIGlmKHRlcm1zICE9PSB0cnVlKXtcbiAgICAgICAgICAkc2NvcGUudGVybXNFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChwaXRjaCA9PT0gXCJcIikge1xuICAgICAgICAgICRzY29wZS50ZXJtc0Vycm9yID0gXCJcIjtcbiAgICAgICAgICAkc2NvcGUucGl0Y2hFcnJvciA9IFwic2hvdy1hbGVydFwiO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChnZW5yZSkge1xuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
