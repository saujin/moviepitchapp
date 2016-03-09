"use strict";

moviePitchApp.factory('emailFactory', function($q, $http, $rootScope){
  const urlBase = $rootScope.api_url;

  let factory = {

    sendContactUsMessage: function(name, email, subject, msg){

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
        deferred.resolve({
          status: "Success",
          msg: "Email Validated",
          data: true
        });
      } else {
        deferred.reject({
          status: "Error",
          msg: "Please enter a valid email address.",
          data: false
        });
      }

      return deferred.promise;
    }
  };

  return factory;
});