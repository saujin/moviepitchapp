moviePitchApp.factory('paymentFactory', function($http){
  var factory = {

    createCharge: function(amount, description, token){
      return $http({
        method: "POST",
        url: "https://moviepitchapi.herokuapp.com/stripe/create_charge",
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
