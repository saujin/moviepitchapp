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
        .state('our-team', {
          url: "/our-team",
          templateUrl: "views/our-team.html"
        })
        .state('how-it-works', {
          url: "/how-it-works",
          templateUrl: "views/how-it-works.html"
        })
        .state('success-stories', {
          url: "/success-stories",
          templateUrl: "views/success-stories.html"
        })
        .state('faq', {
          url: "/faq",
          templateUrl: "views/faq.html"
        })
        .state('submit-pitch', {
          url: "/submit-pitch",
          templateUrl: "views/submit-pitch.html"
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

"use strict";

moviePitchApp.factory('parseFactory', function(){
 var factory = {
   submitPitch: function(genre, text){
     var Pitch = Parse.Object.extend("Pitch");
     var pitch = new Pitch();

     pitch.set("genre", genre);
     pitch.set("pitch", text);

     pitch.save(null, {
       success: function(pitch){
         console.log(pitch);
       },
       error: function(pitch, error){
         console.log(error);
         console.log(error.code);
         console.log(error.message);
       }
     });
   }
 };

 return factory;
});

"use strict";

moviePitchApp.factory('userFactory', function($q){
  var factory = {
    loginUser: function(username, pwd){
      var deferred = $q.defer();

      Parse.User.logIn(username, pwd, {
        success: function(user){
          deferred.resolve({
            status: "success",
            data: user
          })
        },
        error: function(user, error){
          deferred.reject({
            status: "error",
            data: user,
            error: error
          });
        }
      });

      return deferred.promise;

    },

    logoutUser: function(){
      var deferred = $q.defer();
      Parse.User.logOut();

      var user = Parse.User.current();

      if(user === null){
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

    signUp: function(username, email, pwd){
      var user = new Parse.User();
      user.set("username", username);
      user.set("email", email);
      user.set("password", pwd);

      user.signUp(null, {
        success: function(user){
          console.log(user);
          return "success";
        },
        error: function(user, error){
          console.log(error);
          console.log(error.code);
          console.log(error.message);
        }
      })
    }
  };

  return factory;
})

moviePitchApp.directive('login', function(){
  return {
    controller: function($scope, userFactory){
      $scope.loginUser = function(){
        var user, pwd;

        user = angular.element(document.getElementById('user-login-username')).val();
        pwd = angular.element(document.getElementById('user-login-pwd')).val();

        userFactory
          .loginUser(user, pwd)
          .then(function(resp){
            if(resp.status === "success"){
              console.log(resp);
            }
          });
      };

      $scope.logoutUser = function(){
        userFactory
          .logoutUser()
          .then(function(resp){
            console.log(resp);
          });
      }
    },
    restrict: "E",
    templateUrl: "components/login/login.html"
  }
});

moviePitchApp.directive('appHeader', function(){
  return {
    controller: function($scope){
      $scope.menuToggleStatus = "menu-closed";

      $scope.toggleMenu = function(){
        $scope.menuToggleStatus = $scope.menuToggleStatus === "menu-closed" ? "menu-open" : "menu-closed";
      }
    },
    link: function(scope, el, attrs){
      $(el).find('a').on('click', function(){
        scope.toggleMenu();
      });
    },
    restrict: "E",
    templateUrl: "components/nav/nav.html"
  }
});

moviePitchApp.directive('loginModal', function(){
  return {
    controller: function($scope){

    },
    restrict: "E",
    templateUrl: 'components/login-modal/login-modal.html'
  }
})

"use strict";

moviePitchApp.directive('signup', function(){
  return {
    controller: function($scope, userFactory){
      $scope.signupUser = function(){
        var username, email, pwd, confirmPwd;

        username = angular.element(document.getElementById('username')).val();
        email = angular.element(document.getElementById('email')).val();
        pwd = angular.element(document.getElementById('pwd')).val();
        confirmPwd = angular.element(document.getElementById('confirm-pwd')).val();

        if(pwd === confirmPwd){
          userFactory.signUp(username, email, pwd);
        } else {
          console.log('passwords do not match')
        }
      }
    },
    restrict: "E",
    templateUrl: "components/signup/signup.html"
  }
});

moviePitchApp.directive('submitPitch', function(){
  return {
    controller: function($scope, parseFactory){
      $scope.submitPitch = function(){
        var genre, pitch;

        genre = angular.element(document.getElementById('genre')).val();
        pitch = angular.element(document.getElementById('pitch')).val();

        console.log(genre, pitch);
        if(pitch !== ""){
          parseFactory.submitPitch(genre, pitch);
        }
      }
    },
    restrict: "A"
  }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIiwicGFyc2VGYWN0b3J5LmpzIiwidXNlckZhY3RvcnkuanMiLCJsb2dpbi9sb2dpbi5qcyIsIm5hdi9uYXYuanMiLCJsb2dpbi1tb2RhbC9sb2dpbi1tb2RhbC5qcyIsInNpZ251cC9zaWdudXAuanMiLCJzdWJtaXRQaXRjaC9zdWJtaXRQaXRjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIGNvbnRyb2xsZXJBcnJheSA9IFtcbiAgXCJ1aS5yb3V0ZXJcIlxuXTtcblxuXG52YXIgbW92aWVQaXRjaEFwcCA9IGFuZ3VsYXJcbiAgLm1vZHVsZShcIm1vdmllUGl0Y2hBcHBcIiwgY29udHJvbGxlckFycmF5KVxuICAuY29uZmlnKFtcIiRzdGF0ZVByb3ZpZGVyXCIsIFwiJHVybFJvdXRlclByb3ZpZGVyXCIsXG4gICAgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcil7XG5cbiAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcblxuICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdpbmRleCcsIHtcbiAgICAgICAgICB1cmw6IFwiL1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2hvbWUuaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnb3VyLXRlYW0nLCB7XG4gICAgICAgICAgdXJsOiBcIi9vdXItdGVhbVwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL291ci10ZWFtLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2hvdy1pdC13b3JrcycsIHtcbiAgICAgICAgICB1cmw6IFwiL2hvdy1pdC13b3Jrc1wiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL2hvdy1pdC13b3Jrcy5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdzdWNjZXNzLXN0b3JpZXMnLCB7XG4gICAgICAgICAgdXJsOiBcIi9zdWNjZXNzLXN0b3JpZXNcIixcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJ2aWV3cy9zdWNjZXNzLXN0b3JpZXMuaHRtbFwiXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgnZmFxJywge1xuICAgICAgICAgIHVybDogXCIvZmFxXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvZmFxLmh0bWxcIlxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ3N1Ym1pdC1waXRjaCcsIHtcbiAgICAgICAgICB1cmw6IFwiL3N1Ym1pdC1waXRjaFwiLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInZpZXdzL3N1Ym1pdC1waXRjaC5odG1sXCJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgICB1cmw6IFwiL2xvZ2luXCIsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6IFwidmlld3MvbG9naW4uaHRtbFwiXG4gICAgICAgIH0pO1xuICAgIH1cbiAgXSlcbiAgLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlKXtcbiAgICBQYXJzZS5pbml0aWFsaXplKFwiUFI5V0JIRXZqU3VXOXVzOFE3U0doMktZUlZRYUhMYnp0WmpzaHNiMVwiLCBcIm55ejdOOXNHTFVJTjFoak1ZOU5OUW5lRXh4UDVXME1KaFhIM3UxUWhcIik7XG4gIH0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZmFjdG9yeSgncGFyc2VGYWN0b3J5JywgZnVuY3Rpb24oKXtcbiB2YXIgZmFjdG9yeSA9IHtcbiAgIHN1Ym1pdFBpdGNoOiBmdW5jdGlvbihnZW5yZSwgdGV4dCl7XG4gICAgIHZhciBQaXRjaCA9IFBhcnNlLk9iamVjdC5leHRlbmQoXCJQaXRjaFwiKTtcbiAgICAgdmFyIHBpdGNoID0gbmV3IFBpdGNoKCk7XG5cbiAgICAgcGl0Y2guc2V0KFwiZ2VucmVcIiwgZ2VucmUpO1xuICAgICBwaXRjaC5zZXQoXCJwaXRjaFwiLCB0ZXh0KTtcblxuICAgICBwaXRjaC5zYXZlKG51bGwsIHtcbiAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihwaXRjaCl7XG4gICAgICAgICBjb25zb2xlLmxvZyhwaXRjaCk7XG4gICAgICAgfSxcbiAgICAgICBlcnJvcjogZnVuY3Rpb24ocGl0Y2gsIGVycm9yKXtcbiAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yLmNvZGUpO1xuICAgICAgICAgY29uc29sZS5sb2coZXJyb3IubWVzc2FnZSk7XG4gICAgICAgfVxuICAgICB9KTtcbiAgIH1cbiB9O1xuXG4gcmV0dXJuIGZhY3Rvcnk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb3ZpZVBpdGNoQXBwLmZhY3RvcnkoJ3VzZXJGYWN0b3J5JywgZnVuY3Rpb24oJHEpe1xuICB2YXIgZmFjdG9yeSA9IHtcbiAgICBsb2dpblVzZXI6IGZ1bmN0aW9uKHVzZXJuYW1lLCBwd2Qpe1xuICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgUGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwgcHdkLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgICAgc3RhdHVzOiBcInN1Y2Nlc3NcIixcbiAgICAgICAgICAgIGRhdGE6IHVzZXJcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3Ipe1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdCh7XG4gICAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICAgIGRhdGE6IHVzZXIsXG4gICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXG4gICAgfSxcblxuICAgIGxvZ291dFVzZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgUGFyc2UuVXNlci5sb2dPdXQoKTtcblxuICAgICAgdmFyIHVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblxuICAgICAgaWYodXNlciA9PT0gbnVsbCl7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoe1xuICAgICAgICAgIHN0YXR1czogXCJzdWNjZXNzXCIsXG4gICAgICAgICAgbXNnOiBcIlVzZXIgaXMgbG9nZ2VkIG91dFwiXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KHtcbiAgICAgICAgICBzdGF0dXM6IFwiZXJyb3JcIixcbiAgICAgICAgICBtc2c6IFwiVXNlciBpcyBzdGlsbCBsb2dnZWQgaW5cIlxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfSxcblxuICAgIHNpZ25VcDogZnVuY3Rpb24odXNlcm5hbWUsIGVtYWlsLCBwd2Qpe1xuICAgICAgdmFyIHVzZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgICAgdXNlci5zZXQoXCJ1c2VybmFtZVwiLCB1c2VybmFtZSk7XG4gICAgICB1c2VyLnNldChcImVtYWlsXCIsIGVtYWlsKTtcbiAgICAgIHVzZXIuc2V0KFwicGFzc3dvcmRcIiwgcHdkKTtcblxuICAgICAgdXNlci5zaWduVXAobnVsbCwge1xuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICBjb25zb2xlLmxvZyh1c2VyKTtcbiAgICAgICAgICByZXR1cm4gXCJzdWNjZXNzXCI7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcil7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yLmNvZGUpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn0pXG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW4nLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLmxvZ2luVXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB1c2VyLCBwd2Q7XG5cbiAgICAgICAgdXNlciA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1sb2dpbi11c2VybmFtZScpKS52YWwoKTtcbiAgICAgICAgcHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLWxvZ2luLXB3ZCcpKS52YWwoKTtcblxuICAgICAgICB1c2VyRmFjdG9yeVxuICAgICAgICAgIC5sb2dpblVzZXIodXNlciwgcHdkKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgaWYocmVzcC5zdGF0dXMgPT09IFwic3VjY2Vzc1wiKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUubG9nb3V0VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHVzZXJGYWN0b3J5XG4gICAgICAgICAgLmxvZ291dFVzZXIoKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3Ape1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcCk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9sb2dpbi9sb2dpbi5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnYXBwSGVhZGVyJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSBcIm1lbnUtY2xvc2VkXCI7XG5cbiAgICAgICRzY29wZS50b2dnbGVNZW51ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLm1lbnVUb2dnbGVTdGF0dXMgPSAkc2NvcGUubWVudVRvZ2dsZVN0YXR1cyA9PT0gXCJtZW51LWNsb3NlZFwiID8gXCJtZW51LW9wZW5cIiA6IFwibWVudS1jbG9zZWRcIjtcbiAgICAgIH1cbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbCwgYXR0cnMpe1xuICAgICAgJChlbCkuZmluZCgnYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLnRvZ2dsZU1lbnUoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcImNvbXBvbmVudHMvbmF2L25hdi5odG1sXCJcbiAgfVxufSk7XG4iLCJtb3ZpZVBpdGNoQXBwLmRpcmVjdGl2ZSgnbG9naW5Nb2RhbCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlKXtcblxuICAgIH0sXG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiAnY29tcG9uZW50cy9sb2dpbi1tb2RhbC9sb2dpbi1tb2RhbC5odG1sJ1xuICB9XG59KVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdzaWdudXAnLCBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgdXNlckZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLnNpZ251cFVzZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdXNlcm5hbWUsIGVtYWlsLCBwd2QsIGNvbmZpcm1Qd2Q7XG5cbiAgICAgICAgdXNlcm5hbWUgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJuYW1lJykpLnZhbCgpO1xuICAgICAgICBlbWFpbCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZW1haWwnKSkudmFsKCk7XG4gICAgICAgIHB3ZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHdkJykpLnZhbCgpO1xuICAgICAgICBjb25maXJtUHdkID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb25maXJtLXB3ZCcpKS52YWwoKTtcblxuICAgICAgICBpZihwd2QgPT09IGNvbmZpcm1Qd2Qpe1xuICAgICAgICAgIHVzZXJGYWN0b3J5LnNpZ25VcCh1c2VybmFtZSwgZW1haWwsIHB3ZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Bhc3N3b3JkcyBkbyBub3QgbWF0Y2gnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiY29tcG9uZW50cy9zaWdudXAvc2lnbnVwLmh0bWxcIlxuICB9XG59KTtcbiIsIm1vdmllUGl0Y2hBcHAuZGlyZWN0aXZlKCdzdWJtaXRQaXRjaCcsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCBwYXJzZUZhY3Rvcnkpe1xuICAgICAgJHNjb3BlLnN1Ym1pdFBpdGNoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGdlbnJlLCBwaXRjaDtcblxuICAgICAgICBnZW5yZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2VucmUnKSkudmFsKCk7XG4gICAgICAgIHBpdGNoID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwaXRjaCcpKS52YWwoKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhnZW5yZSwgcGl0Y2gpO1xuICAgICAgICBpZihwaXRjaCAhPT0gXCJcIil7XG4gICAgICAgICAgcGFyc2VGYWN0b3J5LnN1Ym1pdFBpdGNoKGdlbnJlLCBwaXRjaCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc3RyaWN0OiBcIkFcIlxuICB9XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
