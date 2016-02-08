moviePitchApp.directive('pressList', function(){
	return {
		controller: function($scope, PressFactory){
			PressFactory.getArticles()
				.then(function(resp){
					console.log(resp);
					$scope.articles = resp.articles;
				})
				.catch(function(err){
					console.log(err);
				});
		}
	}
})