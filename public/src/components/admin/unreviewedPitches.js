moviePitchApp.directive('adminPitchList', function(){
	return {
		controller: function($scope, pitchFactory){

			// Load all the unreviewed pitches
			$scope.getPitches = function(status){
				pitchFactory.getPitchesByFilter('status=' + status)
				.then(function(resp){
					console.log(resp);
					$scope.pitches = resp.data.docs;
				})
				.catch(function(err){
					console.log(err);
				});
			}

			// Reject a pitch by ID
			$scope.rejectPitch = function(id, status){
				pitchFactory.rejectPitch(id)
					.then(function(resp){
						console.log(resp);
						$scope.getPitches(status);
					})
					.catch(function(err){
						console.log(err);
					});
			}

			$scope.updatePitch = function(id, data, status){
				pitchFactory.updatePitchStatus(id, data)
					.then(function(resp){
						console.log(resp);
						$scope.getPitches(status);
					})
					.catch(function(err){
						console.log(err);
					})
			}

		},
		link: function(scope, el, attrs){
			// Load all the unreviewed pitches on init
			scope.getPitches(attrs.status);
		},
		restrict: "A"
	}
});

moviePitchApp.directive('adminPitch', function(){
	return {
		link: function(scope, el, attrs){
			$(el).find('.js-reject-unreviewed-pitch').on('click', function(){
				scope.updatePitch(attrs.id, 'rejected', 'created');
			});

			$(el).find('.js-accept-unreviewed-pitch').on('click', function(){
				scope.updatePitch(attrs.id, 'pending', 'created');
			});

			$(el).find('.js-reject-pending-pitch').on('click', function(){
				scope.updatePitch(attrs.id, 'rejected', 'pending');
			});

			$(el).find('.js-accept-pending-pitch').on('click', function(){
				scope.updatePitch(attrs.id, 'accepted', 'pending');
			});

			$(el).find('.js-accept-rejected-pitch').on('click', function(){
				scope.updatePitch(attrs.id, 'accepted', 'rejected');
			});
		},
		restrict: "A"
	}
});