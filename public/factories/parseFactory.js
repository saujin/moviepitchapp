"use strict";

moviePitchApp.factory('parseFactory', function($q) {
  var factory = {
    submitPitch: function(genre, text) {
      var deferred = $q.defer();

      // Make sure the user is logged in to store the pitch
      if ($rootScope.curUser !== null) {
        var Pitch = Parse.Object.extend("Pitch");
        var pitch = new Pitch();

        pitch.set("genre", genre);
        pitch.set("pitch", text);
        // pitch.set("creater", Parse.User.current.username)
        pitch.set("reviewed", false)


        pitch.save(null, {
          success: function(pitch) {
            deferred.resolve({
              status: "success",
              data: pitch
            });
          },
          error: function(pitch, error) {
            deferred.reject({
              status: "rejected",
              data: error
            });
          }
        });
      }

      // Reject the save attempt if no current user
      else {
        deferred.reject({
          status: "rejected",
          msg: "User is not logged in"
        })
      }

      return deferred.promise;
    }
  };

  return factory;
});
