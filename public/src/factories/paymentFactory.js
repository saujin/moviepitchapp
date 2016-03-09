"use strict";

moviePitchApp.factory('paymentFactory', function($http, $rootScope){
  let urlBase = $rootScope.api_url;
  let factory = {

    createCharge: function(amount, description, token){

      return $http({
        method: "POST",
        url: urlBase + "/stripe/create_charge",
        data: {
          amount: amount,
          description: description,
          currency: "usd",
          source: token
        }
      });
    }
  };

  return factory;
});
