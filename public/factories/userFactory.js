"use strict";

moviePitchApp.factory('userFactory', function($q, $rootScope){
  var factory = {
    loginUser: function(username, pwd){
      var deferred = $q.defer();

      // try {
      //   Parse.User.logIn(username, pwd, {
      //     success: function(user){
      //       // Store the user in the $rootScope
      //       $rootScope.curUser = user;
      //
      //       deferred.resolve({
      //         status: "success",
      //         data: user
      //       });
      //     },
      //     error: function(user, error){
      //       deferred.reject({
      //         status: "error",
      //         data: user,
      //         error: error
      //       });
      //     }
      //   });
      // } catch (e) {
      //   deferred.reject(e);
      // }
      Parse.User.logIn(username, pwd).then(
        function(resp){
          deferred.resolve({
              status: "success",
              data: resp
            });
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
