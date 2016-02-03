'use strict';

// Generated by CoffeeScript 1.4.0
(function () {
  var $;

  $ = window.jQuery || window.Zepto || window.$;

  $.fn.fancySelect = function (opts) {
    var isiOS, settings;
    if (opts == null) {
      opts = {};
    }
    settings = $.extend({
      forceiOS: false,
      includeBlank: false,
      optionTemplate: function optionTemplate(optionEl) {
        return optionEl.text();
      },
      triggerTemplate: function triggerTemplate(optionEl) {
        return optionEl.text();
      }
    }, opts);
    isiOS = !!navigator.userAgent.match(/iP(hone|od|ad)/i);
    return this.each(function () {
      var copyOptionsToList, disabled, options, sel, trigger, updateTriggerText, wrapper;
      sel = $(this);
      if (sel.hasClass('fancified') || sel[0].tagName !== 'SELECT') {
        return;
      }
      sel.addClass('fancified');
      sel.css({
        width: 1,
        height: 1,
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 0
      });
      sel.wrap('<div class="fancy-select">');
      wrapper = sel.parent();
      if (sel.data('class')) {
        wrapper.addClass(sel.data('class'));
      }
      wrapper.append('<div class="trigger">');
      if (!(isiOS && !settings.forceiOS)) {
        wrapper.append('<ul class="options">');
      }
      trigger = wrapper.find('.trigger');
      options = wrapper.find('.options');
      disabled = sel.prop('disabled');
      if (disabled) {
        wrapper.addClass('disabled');
      }
      updateTriggerText = function updateTriggerText() {
        var triggerHtml;
        triggerHtml = settings.triggerTemplate(sel.find(':selected'));
        return trigger.html(triggerHtml);
      };
      sel.on('blur.fs', function () {
        if (trigger.hasClass('open')) {
          return setTimeout(function () {
            return trigger.trigger('close.fs');
          }, 120);
        }
      });
      trigger.on('close.fs', function () {
        trigger.removeClass('open');
        return options.removeClass('open');
      });
      trigger.on('click.fs', function () {
        var offParent, parent;
        if (!disabled) {
          trigger.toggleClass('open');
          if (isiOS && !settings.forceiOS) {
            if (trigger.hasClass('open')) {
              return sel.focus();
            }
          } else {
            if (trigger.hasClass('open')) {
              parent = trigger.parent();
              offParent = parent.offsetParent();
              if (parent.offset().top + parent.outerHeight() + options.outerHeight() + 20 > $(window).height() + $(window).scrollTop()) {
                options.addClass('overflowing');
              } else {
                options.removeClass('overflowing');
              }
            }
            options.toggleClass('open');
            if (!isiOS) {
              return sel.focus();
            }
          }
        }
      });
      sel.on('enable', function () {
        sel.prop('disabled', false);
        wrapper.removeClass('disabled');
        disabled = false;
        return copyOptionsToList();
      });
      sel.on('disable', function () {
        sel.prop('disabled', true);
        wrapper.addClass('disabled');
        return disabled = true;
      });
      sel.on('change.fs', function (e) {
        if (e.originalEvent && e.originalEvent.isTrusted) {
          return e.stopPropagation();
        } else {
          return updateTriggerText();
        }
      });
      sel.on('keydown', function (e) {
        var hovered, newHovered, w;
        w = e.which;
        hovered = options.find('.hover');
        hovered.removeClass('hover');
        if (!options.hasClass('open')) {
          if (w === 13 || w === 32 || w === 38 || w === 40) {
            e.preventDefault();
            return trigger.trigger('click.fs');
          }
        } else {
          if (w === 38) {
            e.preventDefault();
            if (hovered.length && hovered.index() > 0) {
              hovered.prev().addClass('hover');
            } else {
              options.find('li:last-child').addClass('hover');
            }
          } else if (w === 40) {
            e.preventDefault();
            if (hovered.length && hovered.index() < options.find('li').length - 1) {
              hovered.next().addClass('hover');
            } else {
              options.find('li:first-child').addClass('hover');
            }
          } else if (w === 27) {
            e.preventDefault();
            trigger.trigger('click.fs');
          } else if (w === 13 || w === 32) {
            e.preventDefault();
            hovered.trigger('mousedown.fs');
          } else if (w === 9) {
            if (trigger.hasClass('open')) {
              trigger.trigger('close.fs');
            }
          }
          newHovered = options.find('.hover');
          if (newHovered.length) {
            options.scrollTop(0);
            return options.scrollTop(newHovered.position().top - 12);
          }
        }
      });
      options.on('mousedown.fs', 'li', function (e) {
        var clicked;
        clicked = $(this);
        sel.val(clicked.data('raw-value'));
        if (!isiOS) {
          sel.trigger('blur.fs').trigger('focus.fs');
        }
        options.find('.selected').removeClass('selected');
        clicked.addClass('selected');
        trigger.addClass('selected');
        return sel.val(clicked.data('raw-value')).trigger('change.fs').trigger('blur.fs').trigger('focus.fs');
      });
      options.on('mouseenter.fs', 'li', function () {
        var hovered, nowHovered;
        nowHovered = $(this);
        hovered = options.find('.hover');
        hovered.removeClass('hover');
        return nowHovered.addClass('hover');
      });
      options.on('mouseleave.fs', 'li', function () {
        return options.find('.hover').removeClass('hover');
      });
      copyOptionsToList = function copyOptionsToList() {
        var selOpts;
        updateTriggerText();
        if (isiOS && !settings.forceiOS) {
          return;
        }
        selOpts = sel.find('option');
        return sel.find('option').each(function (i, opt) {
          var optHtml;
          opt = $(opt);
          if (!opt.prop('disabled') && (opt.val() || settings.includeBlank)) {
            optHtml = settings.optionTemplate(opt);
            if (opt.prop('selected')) {
              return options.append("<li data-raw-value=\"" + opt.val() + "\" class=\"selected\">" + optHtml + "</li>");
            } else {
              return options.append("<li data-raw-value=\"" + opt.val() + "\">" + optHtml + "</li>");
            }
          }
        });
      };
      sel.on('update.fs', function () {
        wrapper.find('.options').empty();
        return copyOptionsToList();
      });
      return copyOptionsToList();
    });
  };
}).call(undefined);
"use strict";

require('angular');
require('angular-ui-router');
require('angular-modal-service');

var controllerArray = ["ui.router", "angularModalService"];

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

moviePitchApp.controller('MainController', ['$scope', 'ModalService', '$timeout', function ($scope, ModalService, $timeout) {
  $scope.isModalShown = "modal-hidden";

  function openModalTasks() {
    $('.modal-close-animation').removeClass('modal-close-animation');
  }

  function closeModalTasks(modal) {
    $scope.isModalShown = "modal-shown";
    modal.close.then(function (result) {
      $scope.isModalShown = "modal-hidden";
    });
  }

  function populateFancySelect(id) {
    var $select = $(id);

    function selectReady() {
      var numOptions = $select.find('option').length;

      if (numOptions > 1) {
        $select.fancySelect();
      } else {
        $timeout(selectReady, 50);
      }
    }

    // The fancySelect function runs before the page
    // is fully loaded, hence the timeout function
    selectReady();
  }

  $scope.scrollToLink = function (id) {
    var offset = $(id).offset().top;

    $('html, body').animate({
      scrollTop: offset
    }, 500);

    return false;
  };

  $scope.showPitchModal = function () {
    openModalTasks();

    ModalService.showModal({
      controller: "PitchModalController",
      templateUrl: "src/modals/pitch-modal/pitch-modal.html"
    }).then(function (modal) {
      populateFancySelect('#select-genre');
      closeModalTasks(modal);
    });
  };

  $scope.showExampleModal = function () {
    $('.modal-close-animation').removeClass('modal-close-animation');

    ModalService.showModal({
      controller: "CustomModalController",
      templateUrl: "src/modals/examples-modal/examples-modal.html"
    }).then(function (modal) {
      closeModalTasks(modal);
    });
  };
}]);

moviePitchApp.controller('PitchModalController', ['$scope', 'close', function ($scope, close) {
  $scope.dismissModal = function () {
    $('#modal-bg').addClass('modal-close-animation');
    close('Modal Dismissed', 500);
  };
}]);

moviePitchApp.controller('CustomModalController', ['$scope', 'close', function ($scope, close) {
  $scope.dismissModal = function () {
    $('#modal-bg').addClass('modal-close-animation');
    close('Modal Dismissed', 500);
  };
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

      console.log(pitch);
      if (pitch.userHasAcceptedTerms === true && pitch.pitchText !== "" && pitch.genre !== "Select Genre" && pitch.genre !== "") {
        pitch.status = "created";
        pitch.userHasAcceptedTime = new Date();

        deferred.resolve({
          status: "success",
          pitch: pitch
        });
      } else if (pitch.pitchText === "" && pitch.userHasAcceptedTerms === false && pitch.genre === "Select Genre") {
        deferred.reject({
          status: "error",
          errorCode: 1000,
          msg: "Please fill out the pitch form before submitting."
        });
      } else if (pitch.genre === "" || pitch.genre === "Select Genre") {
        deferred.reject({
          status: "error",
          errorCode: 1001,
          msg: "Please select a genre."
        });
      } else if (pitch.pitchText === "" || pitch.pitchText === null) {
        deferred.reject({
          status: "error",
          errorCode: 1002,
          msg: "Please write your movie idea in the textarea."
        });
      } else if (pitch.userHasAcceptedTerms === false) {
        deferred.reject({
          status: "error",
          errorCode: 1003,
          msg: "Please accept the terms in order to continue."
        });
      } else {
        deferred.reject({
          status: "error",
          errorCode: 1010,
          msg: "Something has gone wrong. Please refresh the page."
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

moviePitchApp.directive('contactUsForm', function (emailFactory, $timeout) {
  return {
    controller: function controller($scope) {
      $scope.data = {
        name: "",
        email: "",
        msgSubject: "General",
        message: "",
        subjects: ["General", "Billing", "Sales", "Support"],
        errors: {
          email: true,
          username: true,
          message: true
        }
      };

      $scope.btnState = "btn--inactive";

      $scope.btnStateChange = function () {
        console.log($scope.data.errors);
        if ($scope.data.errors.email === true || $scope.data.errors.username === true || $scope.data.errors.message === true) {
          $scope.btnState = "btn--inactive";
        } else {
          $scope.btnState = "";
        }
      };

      $scope.validateName = function () {
        console.log('validating name');
        if ($scope.data.name === "") {
          $scope.data.errors.username = true;
        } else {
          $scope.data.errors.username = false;
        }
      };

      $scope.validateEmail = function () {
        console.log('validating email');
        emailFactory.validateEmail($scope.data.email).then(function (resp) {
          $scope.data.errors.email = false;
        }, function (err) {
          $scope.data.errors.email = true;
        });
      };

      $scope.validateMsg = function () {
        console.log('validating message');
        if ($scope.data.name === "") {
          $scope.data.errors.message = true;
        } else {
          $scope.data.errors.message = false;
        }
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
        $scope.btnState = "btn--inactive";
      };

      $scope.submitContactForm = function () {
        if ($scope.btnState === "btn--inactive") {
          console.log('inactive');
        } else {
          clearErrors();
          emailFactory.sendContactUsMessage($scope.data.name, $scope.data.email, $scope.data.msgSubject, $scope.data.message).then(function (resp) {
            clearErrors();
            clearFields();
            $scope.submitSuccess = "show-alert";
            $scope.successText = "Success! Your message has been submitted.";
            $timeout(function () {
              $scope.submitSuccess = "";
              $scope.successText = "";
            }, 4000);
            // console.log(resp);
          }, function (err) {
            $scope.errorText = "An error has occurred. Your message was not sent.";
            $scope.messageError = "show-alert";
          });
          console.log($scope.data);
        }

        // emailFactory.validateEmail($scope.data.email)
        //   .then(
        //     function(resp){
        //       if(
        //         $scope.data.name === "" ||
        //         $scope.data.name === null ||
        //         $scope.data.email === "" ||
        //         $scope.data.email === null ||
        //         $scope.data.msgSubject === "" ||
        //         $scope.data.msgSubject === null ||
        //         $scope.data.message === "" ||
        //         $scope.data.message === null
        //       ){
        //         $scope.messageError = "show-alert";
        //         $scope.errorText = "Please fill out each field before submitting.";
        //       }
        //       else {
        //         emailFactory
        //           .sendContactUsMessage(
        //             $scope.data.name,
        //             $scope.data.email,
        //             $scope.data.msgSubject,
        //             $scope.data.message
        //           )
        //           .then(
        //             function(resp){
        //               clearErrors();
        //               clearFields();
        //               $scope.submitSuccess = "show-alert";
        //               $scope.successText = "Success! Your message has been submitted.";
        //               // console.log(resp);
        //             },
        //             function(err){
        //               $scope.errorText = "An error has occurred. Your message was not sent.";
        //               $scope.messageError = "show-alert";
        //             }
        //           )
        //       }
        //     },
        //     function(err){
        //       $scope.messageError = "show-alert";
        //       $scope.errorText = "Please enter a valid email address.";
        //     }
        //   );
      };
    },
    link: function link(scope, el, attrs) {
      var $select = $('#contact-subject');

      function selectReady() {
        var numOptions = $select.find('option').length;

        if (numOptions > 1) {
          $select.fancySelect();
        } else {
          $timeout(selectReady, 50);
        }
      }

      // The fancySelect function runs before the page
      // is fully loaded, hence the timeout function
      selectReady();
    },
    restrict: "A",
    templateUrl: "src/components/contact-us-form/contact-us-form.html"
  };
});
'use strict';

moviePitchApp.directive('labelWrapper', function () {
  return {
    controller: function controller($scope) {
      $scope.labelState = "";
    },
    link: function link(scope, el, attrs) {
      var $inputs = el.find('input, select, textarea');
      var $label = el.find('label');

      $inputs.on('focus', function () {
        $label.addClass('label-wrapper-label--out');
      });

      $inputs.on('blur', function () {
        var value = $($inputs[0]).val();

        if (value === "") {
          $label.removeClass('label-wrapper-label--out');
        }
      });
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
"use strict";

moviePitchApp.directive('successCarousel', function () {
  return {
    controller: function controller($scope) {
      $scope.index = 1;

      $scope.stories = [{
        name: "Emily Lloyd",
        text: "A grandmother from Ozark, Arkansas, sent Bob an index card about a man who lived in the Statue of Liberty. He sold the project to Universal Studios. Ryan Murphy (GLEE) wrote the script. “I can’t believe Bob was able to sell my one line idea. He was great to work with. I can’t wait to send him more.”"
      }, {
        name: "David Simon",
        text: "I brought my original idea ‘The High School Security Tapes’ to Bob. He not only sold it to DreamWorks, he also made sure I got to write the screenplay. Since then, he sold another idea with Katherine Heigl to Fox 2000 and another with director Todd Phillips (THE HANGOVER) to Warner Brothers."
      }, {
        name: "Tom Newman",
        text: "I was living in London when I heard about Bob Kosberg. I sent him a one page outline called ‘The Beauty Contest.’ Within one week, Bob had attached Meg Ryan to star and sold the project to New Line."
      }, {
        name: "Steve List",
        text: "I attended one of Bob’s pitch events. I literally pitched Bob a thirty second story while we walked through the lobby. Bob had Paramount and Fox interested in buying my pitch and soon we had Drew Barrymore attached and I began writing the script at Fox Studios. I now have a writing career in Hollywood and it all started with Bob; he believed in my project and set it up at a studio."
      }];

      $scope.length = $scope.stories.length;
      $scope.carouselClass = "test";

      $scope.moveCarousel = function (dir) {
        var curIndex = $scope.index;
        var maxLength = $scope.length;
        var integer = dir;

        if (dir === 1 && curIndex === maxLength) {
          $scope.index = 1;
        } else if (dir === -1 && curIndex === 1) {
          $scope.index = maxLength;
        } else {
          $scope.index = $scope.index + dir;
        }

        $scope.carouselClass = "carousel-" + $scope.index;
      };
    },
    restrict: "A",
    templateUrl: "src/components/success-carousel/success-carousel.html"
  };
});
"use strict";

moviePitchApp.directive('pitchModal', function ($timeout) {
  return {
    controller: function controller($scope, $q, $http, adminFactory, paymentFactory, pitchFactory) {

      // Populate an array of genres, and create some variables
      // for the ng-models to bind to
      $scope.genres = ["Select Genre", "Action", "Adventure", "Animated", "Comedy", "Crime", "Drama", "Fantasy", "Historical", "Historical Fiction", "Horror", "Kids", "Mystery", "Political", "Religious", "Romance", "Romantic Comedy", "Satire", "Science Fiction", "Thriller", "Western"];

      // Carve out a place for storing a submitted pitch
      $scope.pitch = {
        genre: "Select Genre",
        pitchText: "",
        userHasAcceptedTerms: false
      };

      // Set this property to configure alert messages displayed
      // on validation failures
      $scope.validationText = null;

      // The Handler has some basic Stripe config and then calls the payment
      // success function
      $scope.handler = StripeCheckout.configure({
        key: 'sk_test_jGkEuv4sLEOhZhBxTdlJExvt',
        // image: '/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function token(_token) {
          // Update the pitch object with the payment token
          $scope.pitch.token = _token;
          $scope.pitch.submitterEmail = _token.email;

          console.log($scope.pitch);

          // Create the charge
          paymentFactory.createCharge(200, "Pitch submission", _token.id).then(function (resp) {

            // if charge is successful submit the pitch
            console.log(resp);
            // pitchFactory.submitPitch($scope.pitch)
            //   .then(function(resp){
            //     console.log(resp);
            //   })
            //   .catch(function(err){
            //     console.log(err);
            //   })
          }).catch(function (err) {
            console.log(err);
          });
        }
      });

      // Run the handler when someone clicks 'submit'
      $scope.submitPitch = function (ev) {

        // Get the value for the genre (fancybox binding issue)
        $scope.pitch.genre = $('#select-genre').val();

        // Validate the pitch object
        pitchFactory.validatePitch($scope.pitch).then(function (resp) {
          // clear the validation text
          $scope.validationText = "";

          // set the pitch equal to the returned & validated pitch
          $scope.pitch = resp.pitch;

          $scope.handler.open({
            name: "MoviePitch.com",
            description: "Pitch Submission",
            amount: 200
          });
        }).catch(function (err) {
          $scope.validationText = err.msg;
          console.log(err);
        });
      };
    },
    restrict: "A"
  };
});