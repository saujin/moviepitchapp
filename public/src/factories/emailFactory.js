"use strict";

moviePitchApp.factory('emailFactory', function($q, $http){
  const urlBase = "https://moviepitchapi.herokuapp.com";

  let factory = {

    sendContactUsMessage: function(name, email, subject, msg){
      // let deferred = $q.defer();

      // deferred.resolve({
      //   status: "success",
      //   name: name,
      //   email: email,
      //   subject: subject,
      //   message: msg
      // });

      // return deferred.promise;
      return $http({
        method: "POST",
        url: urlBase + "/contact/",
        data: {
          name: name,
          email: email,
          subject: subject,
          message: msg
        }
      });
    },

    validateEmail: function(email) {
      let deferred = $q.defer();

      let reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if(reg.test(email)){
        deferred.resolve(true);
      } else {
        deferred.reject(false);
      }

      return deferred.promise;
    }
  };

  return factory;
});