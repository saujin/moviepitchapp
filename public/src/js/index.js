"use strict";

require('angular');
require('angular-ui-router');
require('angular-modal-service');

const controllerArray = [
  "ui.router",
  "angularModalService"
];

let moviePitchApp = angular.module("moviePitchApp", controllerArray)
  .config(["$stateProvider", "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider){

      $urlRouterProvider.otherwise('/');

      // Main Nav
      $stateProvider
        .state('index', {
          url: "/",
          templateUrl: "views/home.html"
        })
        .state('faq', {
          url: "/faq",
          templateUrl: "views/faq.html"
        })
        .state('press', {
          url: "/press",
          templateUrl: "views/press.html"
        })
        .state('privacy', {
          url: "/privacy",
          templateUrl: "views/privacy.html"
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
  .run(function(configFactory, $rootScope){

    // Grab the API URL from the node process
    configFactory.getApiUrl()
      .then(function(resp){
        $rootScope.api_url = resp.data
      })
      .catch(function(e){
        console.log(e);
      });

    configFactory.getStripeKey()
      .then(function(resp){
        $rootScope.stripe_key = resp.data
      })
      .catch(function(e){
        console.log(e)
      })
  });
