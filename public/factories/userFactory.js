"use strict";

moviePitchApp.factory('userFactory', function(){
  var factory = {
    signUp: function(username, email, pwd){
      console.log('testing');
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
