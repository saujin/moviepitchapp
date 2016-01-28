"use strict";

require('angular');
require('angular-ui-router');

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
        .state('admin', {
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

    $rootScope.$on('$stateChangeStart', function(event, toState){
      let requireLogin = toState.data.requireLogin;

      if(requireLogin === true && $rootScope.curUser === null){
        event.preventDefault();
        $('#login-modal').modal('show');
        $rootScope.targetState = toState.name;
      }
    });

    $rootScope.curUser = null;
  });
