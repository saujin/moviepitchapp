"use strict";

const controllerArray = [
  "ui.router"
];


let moviePitchApp = angular
  .module("moviePitchApp", controllerArray)
  .config(["$stateProvider", "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider){

      $urlRouterProvider.otherwise('/');

      // Main Nav
      $stateProvider
        .state('index', {
          url: "/",
          templateUrl: "views/home.html"
        })
        .state('our-team', {
          url: "/our-team",
          templateUrl: "views/our-team.html"
        })
        .state('success-stories', {
          url: "/success-stories",
          templateUrl: "views/success-stories.html"
        })
        .state('submit-pitch', {
          url: "/submit-pitch",
          templateUrl: "views/submit-pitch.html"
        });

      // Account
      $stateProvider
        .state('register', {
          url: "/register",
          templateUrl: "views/register.html"
        })
        .state('my-account', {
          url: "/account",
          templateUrl: "views/my-account.html"
        });


      // Footer Nav
      $stateProvider
        .state('faq', {
          url: "/faq",
          templateUrl: "views/faq.html"
        })
        .state('press', {
          url: "/press",
          templateUrl: "views/press.html"
        })
        .state('contact-us', {
          url: "/contact-us",
          templateUrl: "views/contact-us.html"
        })
        .state('legal', {
          url: "/legal",
          templateUrl: "views/legal.html"
        });

    }
  ])
  .run(function($rootScope){
    Parse.initialize("PR9WBHEvjSuW9us8Q7SGh2KYRVQaHLbztZjshsb1", "nyz7N9sGLUIN1hjMY9NNQneExxP5W0MJhXH3u1Qh");

    // Make sure a user is logged out
    Parse.User.logOut();
    $rootScope.curUser = null;
  });
