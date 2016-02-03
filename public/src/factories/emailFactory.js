moviePitchApp.factory('emailFactory', function($q){
  let factory = {

    // Mock up sending a contact email
    // https://nodemailer.com/
    sendContactUsMessage: function(name, email, subject, msg){
      let deferred = $q.defer();

      deferred.resolve({
        status: "success",
        name: name,
        email: email,
        subject: subject,
        message: msg
      });

      return deferred.promise;
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