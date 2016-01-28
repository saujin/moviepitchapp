"use strict";

moviePitchApp.factory('paymentFactory', function($http){
  let urlBase = "https://moviepitchapi.herokuapp.com";
  let factory = {

    createCharge: function(amount, description, token){
      console.log({
        amount: amount,
        description: description,
        currency: "usd",
        source: token
      });
      
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
