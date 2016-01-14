"use strict";

require('angular');
require('angular-ui-router');
let Parse = require('parse');


const controllerArray = [
  "ui.router"
];

let moviePitchApp = angular.module("moviePitchApp", controllerArray)
  .config(["$stateProvider", "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider){

      $urlRouterProvider.otherwise('/');

      // Main Nav
      $stateProvider
        .state('index', {
          url: "/",
          templateUrl: "views/home.html",
          data: {
            requireLogin: false
          }
        })
        .state('our-team', {
          url: "/our-team",
          templateUrl: "views/our-team.html",
          data: {
            requireLogin: false
          }
        })
        .state('success-stories', {
          url: "/success-stories",
          templateUrl: "views/success-stories.html",
          data: {
            requireLogin: false
          }
        })
        .state('submit-pitch', {
          url: "/submit-pitch",
          templateUrl: "views/submit-pitch.html",
          data: {
            requireLogin: true
          }
        });

      // Account
      $stateProvider
        .state('register', {
          url: "/register",
          templateUrl: "views/register.html",
          data: {
            requireLogin: false
          }
        })
        .state('my-account', {
          url: "/my-account",
          templateUrl: "views/my-account.html",
          data: {
            requireLogin: true
          }
        });


      // Footer Nav
      $stateProvider
        .state('faq', {
          url: "/faq",
          templateUrl: "views/faq.html",
          data: {
            requireLogin: false
          }
        })
        .state('press', {
          url: "/press",
          templateUrl: "views/press.html",
          data: {
            requireLogin: false
          }
        })
        .state('contact-us', {
          url: "/contact-us",
          templateUrl: "views/contact-us.html",
          data: {
            requireLogin: false
          }
        })
        .state('legal', {
          url: "/legal",
          templateUrl: "views/legal.html",
          data: {
            requireLogin: false
          }
        });

    }
  ])
  .run(function($rootScope){
    Parse.initialize("PR9WBHEvjSuW9us8Q7SGh2KYRVQaHLbztZjshsb1", "nyz7N9sGLUIN1hjMY9NNQneExxP5W0MJhXH3u1Qh");

    // Make sure a user is logged out
    Parse.User.logOut();

    $rootScope.$on('$stateChangeStart', function(event, toState){
      let requireLogin = toState.data.requireLogin;
      console.log(event);
      console.log(toState);

      if(requireLogin === true && $rootScope.curUser === null){
        event.preventDefault();
        $('#login-modal').modal('show');
        $rootScope.targetState = toState.name;
      }
    });

    $rootScope.curUser = null;
  });
