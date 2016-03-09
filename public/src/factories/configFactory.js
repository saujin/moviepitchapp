moviePitchApp.factory('configFactory', function($http){
	const factory = {
		getApiUrl: function(){
			return $http({
				type: "GET",
				url: "/api_url"
			})
		}
	};

	return factory;
})