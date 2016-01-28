"use strict";

moviePitchApp.factory('userFactory', function($q, $rootScope, $location){
  var factory = {
    checkLoggedIn: function(){
      let deferred = $q.defer();

      if($rootScope.curUser === null){
        console.log('1');
        deferred.reject();
        $location.url('/login')
      } else {
        console.log('2');
        deferred.resolve();
      }

      return deferred.promise;
    },
    loginUser: function(username, pwd){
      var deferred = $q.defer();

      Parse.User.logIn(username, pwd).then(
        function(user){
          $rootScope.curUser = user;
          deferred.resolve({
            status: "success",
            data: user
          });
          $rootScope.$broadcast('login-update');
        },
        function(err){
          deferred.reject({
            status: "error",
            error: err
          })
        }
      );

      return deferred.promise;
    },

    logoutUser: function(){
      var deferred = $q.defer();
      Parse.User.logOut();

      var user = Parse.User.current();

      if(user === null){
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

    signUp: function(username, email, pwd){
      var deferred = $q.defer();

      var user = new Parse.User();
      user.set("username", username);
      user.set("email", email);
      user.set("password", pwd);

      user.signUp(null, {
        success: function(user){
          deferred.resolve({
            status: "success",
            data: user
          });
          console.log(Parse.User.current());
        },
        error: function(user, err){
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
