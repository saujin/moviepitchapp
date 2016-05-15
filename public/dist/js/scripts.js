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
    templateUrl: "views/home.html"
  }).state('faq', {
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
}]).run(function (configFactory, $rootScope) {

  // Grab the API URL from the node process
  configFactory.getApiUrl().then(function (resp) {
    $rootScope.api_url = resp.data;
  }).catch(function (e) {
    console.log(e);
  });

  configFactory.getStripeKey().then(function (resp) {
    $rootScope.stripe_key = resp.data;
  }).catch(function (e) {
    console.log(e);
  });
});
'use strict';

moviePitchApp.controller('CustomModalController', ['$scope', 'close', function ($scope, close) {
  $scope.dismissModal = function () {
    $('#modal-bg').addClass('modal-close-animation');
    close('Modal Dismissed', 500);
  };
}]);
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
'use strict';

moviePitchApp.controller('PitchModalController', ['$scope', 'close', function ($scope, close) {
  $scope.dismissModal = function () {
    $('#modal-bg').addClass('modal-close-animation');
    close('Modal Dismissed', 500);
  };

  $scope.$on('close-modal', function () {
    $scope.dismissModal();
  });
}]);
"use strict";

moviePitchApp.factory('configFactory', function ($http) {
	var factory = {
		getApiUrl: function getApiUrl() {
			return $http({
				type: "GET",
				url: "/api_url"
			});
		},

		getStripeKey: function getStripeKey() {
			return $http({
				type: "GET",
				url: "/stripe_key"
			});
		}
	};

	return factory;
});
"use strict";

moviePitchApp.factory('emailFactory', function ($q, $http, $rootScope) {
  var urlBase = $rootScope.api_url;

  var factory = {

    sendContactUsMessage: function sendContactUsMessage(name, email, subject, msg) {

      return $http({
        method: "POST",
        url: urlBase + "/contact/",
        data: {
          name: name,
          email: email,
          subject: subject,
          message: msg
        }
      });
    },

    validateEmail: function validateEmail(email) {
      var deferred = $q.defer();

      var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if (reg.test(email)) {
        deferred.resolve({
          status: "Success",
          msg: "Email Validated",
          data: true
        });
      } else {
        deferred.reject({
          status: "Error",
          msg: "Please enter a valid email address.",
          data: false
        });
      }

      return deferred.promise;
    }
  };

  return factory;
});
"use strict";

moviePitchApp.factory('exampleFactory', function ($q) {
	var pitches = [{
		"title": "GROUNDHOG DAY",
		"pitch": "A comedy about a down-on-his-luck weatherman, who finds himself doomed to repeat the same day over and over over again."
	}, {
		"title": "HOME ALONE",
		"pitch": "When a family goes on vacation, they accidentally leave one of their children behind. Now, it's up to this 10-year old boy to defend his home from two bumbling burglars."
	}, {
		"title": "SPLASH",
		"pitch": "A romantic comedy about what happens when a man falls in love with the perfect girl... who just happens to be a mermaid."
	}, {
		"title": "THREE MEN AND A BABY",
		"pitch": "Three swinging bachelors are forced to take care of a newborn baby."
	}, {
		"title": "MEET THE PARENTS",
		"pitch": "Comedy that deals with what happens when a young man must meet his girlfriend's parents for the first time, and begins to crack under the pressure of trying to impress and get along with her family... In the process, he almost ruins his chance to marry the girl of his dreams."
	}, {
		"title": "TOOTSIE",
		"pitch": "A struggling actor realizes that if he can't get a job as an 'actor'... he will dress up as a woman, and try to have better luck as an 'actress.'' The problem is... he suddenly finds himself becoming a famous 'actress' and his deception becomes harder to maintain. (Especially when he finds himself falling in love with a beautiful actress who doesn't know he's really a man.)"
	}, {
		"title": "IT'S A WONDERFUL LIFE",
		"pitch": "A classic story that asks the question: 'How would the world be different if you had never been born in the first place?' In this movie, our hero has the chance to discover that his life, and everyone else's, really do make a difference. (Every life has meaning.)"
	}, {
		"title": "THE GRADUATE",
		"pitch": "Comedy about a young man who has a big dilemma: how do you tell the woman you've fallen in love with that you've been sleeping with her mother?"
	}, {
		"title": "BIG",
		"pitch": "A young boy makes a wish to be 'big' and he discovers the next morning his wish has come true. He's now in the body of an adult, but 'inside' he's still a 10-year old kid. He's about to discover that being 'big' isn't always so great, i.e. 'be careful what you wish for.'"
	}, {
		"title": "NEIGHBORS",
		"pitch": "A young couple with their newborn baby moves into a quiet neighborhood... only to discover they're now living next-door to an ANIMAL HOUSE-like fraternity. The couple decides to do anything they can to get rid of the frat house."
	}, {
		"title": "TAKEN",
		"pitch": "When his daughter is kidnapped, a retired CIA agent is forced to track down the kidnappers and rescue his daughter."
	}, {
		"title": "MALEFICENT",
		"pitch": "The classic fairy tale of SLEEPING BEAUTY is retold from the point-of-view of the villainous character."
	}, {
		"title": "SHAKESPEARE IN LOVE",
		"pitch": "When William Shakespeare suffers from crippling writer's block... he's lucky enough to meet a beautiful young woman, who he falls in love with, and is inspired by her to write the classic ROMEO AND JULIET."
	}, {
		"title": "YOU'VE GOT MAIL",
		"pitch": "Two people who dislike each other begin to communicate anonymously online... and fall in love."
	}, {
		"title": "WHAT WOMEN WANT",
		"pitch": "A cynical advertising exec suddenly develops the power to read women's thoughts."
	}, {
		"title": "THE HANGOVER",
		"pitch": "After a wild bachelor party in vegas, three friends wake up to find the groom is missing, and no one has any memory of the previous night."
	}, {
		"title": "BACK TO THE FUTURE",
		"pitch": "In 1985, Doc Brown invents time travel. Marty McFly travels back to 1955 and accidentally prevents his parents from meeting, putting his own existence in jeopardy."
	}, {
		"title": "SPEED",
		"pitch": "There's a bomb on a crowded city bus... and if the bus slows below 50mph, the bomb will go off."
	}, {
		"title": "LIAR LIAR",
		"pitch": "A lawyer suddenly loses his ability to lie."
	}, {
		"title": "THE GRADUATE",
		"pitch": "A comedy that asks the question: how do you tell the girl you're in love with that you've been sleeping with her mother?"
	}, {
		"title": "SHAKESPEARE IN LOVE",
		"pitch": "Shakespeare has writer's block, but meets a beautiful woman who inspires him to write ROMEO & JULIET"
	}, {
		"title": "BIG",
		"pitch": "A young boy makes a wish to be 'big' and wakes up to discover he's now in an adult body... but still a 10-year old kid."
	}, {
		"title": "THREE MEN AND A BABY",
		"pitch": "Three swinging bachelors get stuck trying to take care of a newborn baby."
	}, {
		"title": "HOME ALONE",
		"pitch": "A family goes on vacation, but accidentally leaves their young son behind. Now the 10-year old boy must defend his home from two bumbling burglars."
	}, {
		"title": "BRUCE ALMIGHTY",
		"pitch": "What would you do if you could play God for a week?"
	}, {
		"title": "SPLASH",
		"pitch": "Tom Hanks falls in love with a beautiful woman... who just happens to be a mermaid."
	}, {
		"title": "FROZEN",
		"pitch": "A fearless princess sets off on an epic journey alongside a rugged iceman, his  loyal pet reindeer, and a naïve snowman to find her estranged sister, whose icy powers  have inadvertently trapped the kingdom in eternal winter."
	}, {
		"title": "SCHINDLER’S LIST",
		"pitch": "The wartime experiences of ethnic German Oskar Schindler, who,  during the Holocaust, saved the lives of more than a thousand Polish Jews by employing  them in his factories."
	}, {
		"title": "IT’S COMPLICATED",
		"pitch": "A successful divorcee starts an affair with a married man – her ex‐ husband – just as she’s starting to date again."
	}, {
		"title": "BAND OF BROTHERS",
		"pitch": "The epic story of the Easy Company of the US Army’s 101st Airborne Division and their mission in World War II Europe from training through major  battles in Europe."
	}];

	var factory = {
		getAllPitches: function getAllPitches() {
			var deferred = $q.defer();

			deferred.resolve({
				status: "success",
				pitches: pitches
			});

			return deferred.promise;
		}
	};

	return factory;
});
"use strict";

moviePitchApp.factory('paymentFactory', function ($http, $rootScope) {
  var urlBase = $rootScope.api_url;
  var factory = {

    createCharge: function createCharge(amount, description, token) {

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

moviePitchApp.factory('pitchFactory', function ($q, $http, $rootScope) {
  var urlBase = $rootScope.api_url;

  var factory = {

    acceptPitch: function acceptPitch(id) {
      return $http({
        type: "GET",
        url: urlBase + "/pitch/accept/" + id
      });
    },

    getAllPitches: function getAllPitches() {
      return $http({
        method: "GET",
        url: urlBase + "/pitch"
      });
    },

    getPitchesByFilter: function getPitchesByFilter(filterString) {
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

    updatePitchStatus: function updatePitchStatus(id, status) {
      var validStatuses = ["unreviewed", "in_negotiation", "under_consideration", "accepted", "rejected"];
      var testResults = false;

      // test each valid status against passed in status
      validStatuses.forEach(function (val, index, arr) {
        if (val === status) {
          testResults = true;
        }
      });

      // proceed if status matches any valid status
      if (testResults === true) {
        return $http({
          method: "PUT",
          url: urlBase + "/pitch/update/" + id,
          data: {
            status: status
          }
        });
      }

      // throw a promise error back test fails
      else {
          var deferred = $q.defer();
          deferred.reject({
            status: "Error",
            message: status + " is not a valid status"
          });
          return deferred.promise;
        }
    },

    validatePitch: function validatePitch(pitch) {
      var deferred = $q.defer();

      if (pitch.userHasAcceptedTerms === true && pitch.pitchText !== "" && pitch.genre !== "Select Genre" && pitch.genre !== "") {
        pitch.status = "unreviewed";
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

moviePitchApp.factory('PressFactory', function ($q) {
	var articles = [{
		title: "Meet Hollywood's Mr. Pitch",
		subtitle: "Robert Kosberg has made a career out of pitching in-your-face ideas for movies. Why not let him direct your next pitch?",
		url: "http://www.fastcompany.com/38665/meet-hollywoods-mr-pitch"
	}, {
		title: "Talking with Bob Kosberg",
		subtitle: "Talking with Bob Kosberg -- Here's why everyone's buying what Hollywood's best talker has to sell.",
		url: "http://www.ew.com/article/2006/07/28/talking-bob-kosberg"
	}, {
		title: "‘Extra!’ base hit for pair",
		subtitle: "DreamWorks has preemptively bought the pitch “Extra! Extra!” by scribes Bobby Florsheim and Josh Stolberg (“The Passion of the Ark”) for Robert Kosberg to produce.",
		url: "https://variety.com/2005/film/reviews/extra-base-hit-for-pair-1117924064/"
	}, {
		title: "The Art of Selling Ideas",
		subtitle: "A few moments with Bob Kosberg, Hollywood idea man and pitch master.",
		url: "http://www.flightofideas.net/Articles/Quest%20-%20The%20Art%20of%20Selling%20Ideas%20-%20By%20Bob%20Kodzis%20Jan%20Feb%202008.pdf"
	}, {
		title: "Concept is King",
		subtitle: "In today's tight spec-script market, nothing is more important than your idea.",
		url: "http://www.scriptmag.com/features/concept-is-king"
	}, {
		title: "The Pitch Guy",
		subtitle: "Some people carve out a career writing screenplays. Others get rich bringing them to life onscreen. Then there’s Robert Kosberg. His specialty? Ideas.",
		url: "http://www.lamag.com/longform/the-pitch-guy/"
	}, {
		title: "It's the Pitch, Stupid!",
		subtitle: "An interview with Robert Kosberg.",
		url: "http://www.absolutewrite.com/screenwriting/robert_kosberg.htm"
	}];

	var factory = {
		getArticles: function getArticles() {
			var deferred = $q.defer();

			deferred.resolve({
				status: "success",
				articles: articles
			});

			return deferred.promise;
		}
	};

	return factory;
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
        // console.log($scope.data.errors);
        if ($scope.data.errors.email === true || $scope.data.errors.username === true || $scope.data.errors.message === true) {
          $scope.btnState = "btn--inactive";
        } else {
          $scope.btnState = "";
        }
      };

      $scope.validateName = function () {
        // console.log('validating name');
        if ($scope.data.name === "") {
          $scope.data.errors.username = true;
        } else {
          $scope.data.errors.username = false;
        }
      };

      $scope.validateEmail = function () {
        // console.log('validating email');
        emailFactory.validateEmail($scope.data.email).then(function (resp) {
          $scope.data.errors.email = false;
        }, function (err) {
          $scope.data.errors.email = true;
        });
      };

      $scope.validateMsg = function () {
        // console.log('validating message');
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
          // console.log('inactive');
        } else {
            clearErrors();
            emailFactory.sendContactUsMessage($scope.data.name, $scope.data.email, $scope.data.msgSubject, $scope.data.message).then(function (resp) {
              clearErrors();
              clearFields();
              $scope.submitSuccess = "show-alert";
              $scope.successText = "Success! Your message has been submitted.";
              // console.log(resp);
              $timeout(function () {
                $scope.submitSuccess = "";
                $scope.successText = "";
              }, 4000);
            }, function (err) {
              $scope.errorText = "An error has occurred. Your message was not sent.";
              $scope.messageError = "show-alert";
            });
            // console.log($scope.data);
          }
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
    templateUrl: "dist/components/contact-us-form/contact-us-form.html"
  };
});
"use strict";

moviePitchApp.directive('appHeader', function ($state) {
  return {
    controller: function controller($scope) {
      $scope.menuToggleStatus = "menu-closed";

      $scope.toggleMenu = function () {
        $scope.menuToggleStatus = $scope.menuToggleStatus === "menu-closed" ? "menu-open" : "menu-closed";
      };
    },
    restrict: "A",
    templateUrl: "dist/components/nav/nav.html"
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

moviePitchApp.directive('pressList', function () {
	return {
		controller: function controller($scope, PressFactory) {
			PressFactory.getArticles().then(function (resp) {
				$scope.articles = resp.articles;
			}).catch(function (err) {
				console.log(err);
			});
		}
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
    templateUrl: "dist/components/success-carousel/success-carousel.html"
  };
});
"use strict";

moviePitchApp.directive('examplesModal', function () {
	return {
		controller: function controller($scope, exampleFactory) {

			exampleFactory.getAllPitches().then(function (resp) {
				$scope.pitches = resp.pitches;
				$scope.reveal = "";
				$scope.actionText = "Reveal Movie Title";
				$scope.getNewPitch('force');
			}).catch(function (err) {
				console.log(err);
			});

			$scope.getNewPitch = function (override) {
				if ($scope.reveal === "" && override !== "force") {
					$scope.reveal = "reveal-title";
					$scope.actionText = "See Another Example";
				} else {
					$scope.reveal = "";
					$scope.actionText = "Reveal Movie Title";
					var numPitches = $scope.pitches.length;
					var randomPitch = Math.round(Math.random() * numPitches);

					$scope.curPitch = $scope.pitches[randomPitch];
					console.log(randomPitch);
					console.log($scope.pitches[randomPitch]);
				}
			};
		},
		restrict: "A"
	};
});
"use strict";

moviePitchApp.directive('pitchModal', function ($timeout) {
  return {
    controller: function controller($scope, $q, $http, $rootScope, emailFactory, paymentFactory, pitchFactory) {

      // Populate an array of genres, and create some variables
      // for the ng-models to bind to
      $scope.genres = ["Select Genre", "Action", "Adventure", "Animated", "Comedy", "Crime", "Drama", "Fantasy", "Historical", "Historical Fiction", "Horror", "Kids", "Mystery", "Political", "Religious", "Romance", "Romantic Comedy", "Satire", "Science Fiction", "Thriller", "Western"];

      // Carve out a place for storing a submitted pitch
      $scope.pitch = {
        genre: "Select Genre",
        pitchText: "",
        userHasAcceptedTerms: false,
        userEmail: "",
        submitterPhone: ""
      };

      // Set this property to configure alert messages displayed
      // on validation failures
      $scope.validationText = null;

      $scope.modalLoadingStatus = "";

      // Run the handler when someone clicks 'submit'
      $scope.submitPitch = function (ev) {
        // Get the value for the genre (fancybox binding issue)
        $scope.pitch.genre = $('#select-genre').val();

        // Pitch price in $0.01
        var pitchPrice = 299;

        // The Handler has some basic Stripe config and then calls the payment
        // success function
        $scope.handler = StripeCheckout.configure({
          email: $scope.pitch.userEmail,
          key: $rootScope.stripe_key,
          // key: 'pk_test_dXGHL1a18TOiXS6z0k7ehIHK',
          image: '/dist/img/checkout-logo.png',
          locale: 'auto',
          token: function token(_token) {
            // Update the pitch object with the payment token

            $scope.pitch.paymentToken = _token;
            $scope.pitch.submitterEmail = _token.email;
            $scope.pitch.termsAcceptedTime = new Date(_token.created * 1000);
            $scope.modalLoadingStatus = "modal--loading";

            // Create the charge
            paymentFactory.createCharge(pitchPrice, "Pitch submission", _token.id).then(function (resp) {
              console.log($scope.pitch);
              pitchFactory.submitPitch($scope.pitch).then(function (resp) {
                console.log(resp);
                $scope.modalLoadingStatus = "";
                $scope.validationText = "Success! Pitch submitted.";
                $rootScope.$broadcast('close-modal');
              }).catch(function (err) {
                $scope.validationText = "Error: Pitch not submitted.";
                console.log(err);
              });
            }).catch(function (err) {
              console.log(err);
            });
          }
        });

        // Create a combined promise
        $q.all([pitchFactory.validatePitch($scope.pitch), emailFactory.validateEmail($scope.pitch.userEmail)]).then(function (resp) {
          // console.log(resp[0]);
          // console.log(resp[1]);

          // clear the validation text
          $scope.validationText = "";

          // set the pitch equal to the returned & validated pitch
          $scope.pitch = resp[0].pitch;

          $scope.handler.open({
            name: "MoviePitch.com",
            description: "Pitch Submission",
            amount: pitchPrice
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