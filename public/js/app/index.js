"use strict";

var controllerArray = [
  "ui.router"
];


var moviePitchApp = angular
  .module("moviePitchApp", controllerArray)
  .config(["$stateProvider", "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider){

      $urlRouterProvider.otherwise('/');

      $stateProvider
        .state('index', {
          url: "/",
          templateUrl: "views/home.html"
        })
        .state('login', {
          url: "/login",
          templateUrl: "views/login.html"
        });
    }
  ])
  .run(function($rootScope){
    Parse.initialize("PR9WBHEvjSuW9us8Q7SGh2KYRVQaHLbztZjshsb1", "nyz7N9sGLUIN1hjMY9NNQneExxP5W0MJhXH3u1Qh");
  });
