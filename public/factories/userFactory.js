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
