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

      console.log(pitch);
      if(
        pitch.userHasAcceptedTerms === true &&
        pitch.pitchText !== "" &&
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
        pitch.pitchText === "" &&
        pitch.userHasAcceptedTerms === false &&
        pitch.genre === "Select Genre") {
          deferred.reject({
            status: "error",
            errorCode: 1000,
            msg: "Please fill out the pitch form before submitting."
          });
      }

      else if (pitch.genre === "" || pitch.genre === "Select Genre"){
        deferred.reject({
          status: "error",
          errorCode: 1001,
          msg: "Please select a genre."
        });
      }

      else if (pitch.pitchText === "" || pitch.pitchText === null){
        deferred.reject({
          status: "error",
          errorCode: 1002,
          msg: "Please write your movie idea in the textarea."
        });
      }

      else if(pitch.userHasAcceptedTerms === false){
        deferred.reject({
          status: "error",
          errorCode: 1003,
          msg: "Please accept the terms in order to continue."
        });
      }

      else {
        deferred.reject({
          status: "error",
          errorCode: 1010,
          msg: "Something has gone wrong. Please refresh the page.",
        });
      }

      return deferred.promise;
    }
  };

  return factory;
});
