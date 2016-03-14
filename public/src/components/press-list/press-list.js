moviePitchApp.directive('pressList', function(){
	return {
		controller: function($scope, PressFactory){
			PressFactory.getArticles()
				.then(function(resp){
					$scope.articles = resp.articles;
				})
				.catch(function(err){
					console.log(err);
				});
		}
	}
})