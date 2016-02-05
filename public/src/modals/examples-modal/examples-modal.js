moviePitchApp.directive('examplesModal', function(){
	return {
		controller: function($scope, exampleFactory){

			exampleFactory.getAllPitches()
				.then(function(resp){
					$scope.pitches = resp.pitches;
					$scope.reveal = "";
					$scope.actionText = "Reveal Movie Title";
					$scope.getNewPitch('force');
				})
				.catch(function(err){
					console.log(err);
				});

			$scope.getNewPitch = function(override){
				if($scope.reveal === "" && override !== "force"){
					$scope.reveal = "reveal-title";
					$scope.actionText = "See Another Example";
				} else {
					$scope.reveal = "";
					$scope.actionText = "Reveal Movie Title";
					const numPitches = $scope.pitches.length;
					const randomPitch = Math.round(Math.random() * numPitches);

					$scope.curPitch = $scope.pitches[randomPitch];
					console.log(randomPitch);
					console.log($scope.pitches[randomPitch]);
				}

			}
		},
		restrict: "A"
	}
});