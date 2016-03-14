moviePitchApp.factory('configFactory', function($http){
	const factory = {
		getApiUrl: function(){
			return $http({
				type: "GET",
				url: "/api_url"
			})
		},

		getStripeKey: function(){
			return $http({
				type: "GET",
				url: "/stripe_key"
			})
		}
	};

	return factory;
})