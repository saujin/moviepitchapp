moviePitchApp.factory('emailFactory', function($q){
  var factory = {
    validateEmail: function(email) {
      var deferred = $q.defer();

      var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

      if(reg.test(email)){
        deferred.resolve(true);
      } else {
        deferred.reject(false);
      }

      return deferred.promise;
    }
  };

  return factory;
})
