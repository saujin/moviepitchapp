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
        .state('contact-us', {
          url: "/contact-us",
          templateUrl: "views/contact-us.html"
        })
        .state('legal', {
          url: "/legal",
          templateUrl: "views/legal.html"
        });

    }
  ]);
