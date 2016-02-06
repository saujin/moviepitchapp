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
          templateUrl: "views/home.html",
          data: {
            requireLogin: false
          }
        })
        .state('login', {
          url: "/login",
          templateUrl: "views/login.html",
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
        })
        .state('admin-register', {
          url: "/admin/register",
          templateUrl: "views/admin/register.html",
          data: {
            requireLogin: true
          }
        })
        .state('admin-notifications', {
          url: "/admin/notifications",
          templateUrl: "views/admin/notifications.html",
          data: {
            requireLogin: true
          }
        })
        .state('admin-unreviewed', {
          url: "/admin/pitches/unreviewed",
          templateUrl: "views/admin/unreviewed-pitches.html",
          data: {
            requireLogin: true
          }
        })
        .state('admin-pending', {
          url: "/admin/pitches/pending",
          templateUrl: "views/admin/pending-pitches.html",
          data: {
            requireLogin: true
          }
        })
        .state('admin-accepted', {
          url: "/admin/pitches-accepted",
          templateUrl: "views/admin/accepted-pitches.html",
          data: {
            requireLogin: true
          }
        })
        .state('admin-rejected', {
          url: "/admin/pitches-rejected",
          templateUrl: "views/admin/rejected-pitches.html",
          data: {
            requireLogin: true
          }
        })
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
  .run(function($rootScope, $state){
    $rootScope.curUser = null;

    $rootScope.$on('$stateChangeStart', function(event, toState){
      let requireLogin = toState.data.requireLogin;

      if(requireLogin === true && $rootScope.curUser === null){
        event.preventDefault();
        $rootScope.targetState = toState.name;
        $state.go('login');
      }
    });
  });
