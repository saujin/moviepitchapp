"use strict";

moviePitchApp.factory('pitchFactory', function($q, $http) {
  const urlBase = "https://moviepitchapi.herokuapp.com";

  let factory = {

    acceptPitch: function(id){
      return $http({
        type: "GET",
        url: urlBase + "/pitch/accept/" + id
      });
    },

    getAllPitches: function(){
      // return $http.get(urlBase + "/get_all_pitches");
      return $http({
        method: "GET",
        url: urlBase + "/pitch"
      });
    },

    getPitchByFilter: function(filterString){
      return $http({
        method: "GET",
        url: urlBase + "/pitch?" + filterString
      });
    },

    getPitchByID: function(id){
      return $http({
        method: "GET",
        url: urlBase + '/pitch/' + id
      });
    },

    lockPitch: function(id){
      return $http({
        method: "GET",
        url: urlBase + "/pitch/lock/" + id
      });
    },

    rejectPitch: function(id){
      return $http({
        type: "GET",
        url: urlBase + "/pitch/reject/" + id
      });
    },

    submitPitch: function(pitch) {
      return $http({
        method: "POST",
        url: urlBase + "/pitch",
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
