"use strict";

moviePitchApp.factory('pitchFactory', function($q, $http) {
  var factory = {
    submitPitch: function(pitch) {
      $http({
        method: "POST",
        url: "https://moviepitchapi.herokuapp.com/pitch",
        data: pitch
      })
    },
    validatePitch: function(pitch){
      // console.log(pitch);
      var deferred = $q.defer();

      if(
        pitch.userHasAcceptedTerms === true &&
        pitch.pitchText !== "" &&
        pitch.pitchText !== null &&
        pitch.genre !== "Select Genre" &&
        pitch.genre !== ""
      ) {
        pitch.status = "created";
        pitch.userHasAcceptedTime = new Date();

        deferred.resolve({
          status: "success",
          pitch : pitch
        });
      }

      else if (
        pitch.pitchText === "" || pitch.pitchText === null &&
        pitch.genre === "" || pitch.genre === "Select Genre") {
          deferred.reject({
            status: "error",
            errorCode: 1000,
            msg: "Please fill out the pitch form before submitting."
          });
      }

      else if(pitch.userHasAcceptedTerms === false){
        deferred.reject({
          status: "error",
          errorCode: 1001,
          msg: "Please accept the terms in order to continue."
        });
      }

      else if (pitch.pitchText === "" || pitch.pitchText === null){
        deferred.reject({
          status: "error",
          errorCode: 1002,
          msg: "Robert is good, but not good enough to sell a blank pitch!"
        });
      }

      else if (pitch.genre === "" || pitch.genre === "Select Genre"){
        deferred.reject({
          status: "error",
          errorCode: 1003,
          msg: "What kind of movie is it? Please select a genre."
        });
      }

      else {
        deferred.reject({
          status: "error",
          errorCode: 9999,
          msg: "An unknown error has occurred.",
        });
      }

      return deferred.promise;
    }

  };

  return factory;
});
