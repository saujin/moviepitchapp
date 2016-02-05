moviePitchApp.directive('adminContactEmail', function(){
	return {
		controller: function($scope, adminFactory){
			// Define Scope Variables;
			$scope.emails = [];

			$scope.$on('admin-logged-in', function(){
				console.log('received event');
				// Init Directive
				$scope.refreshEmails();
			});

			$scope.refreshEmails = function(){
				adminFactory.getAdminEmails()
					.then(function(resp){
						console.log(resp);
						$scope.emails = resp.data;
					})
					.catch(function(err){
						console.log(err);
					});
			};

			$scope.addAdmin = function(){
				adminFactory.addAdminEmail(email)
					.then(function(resp){
						console.log(resp);
					})
					.catch(function(err){
						consol.log(err)
					});
			};

			$scope.removeAdmin = function(id){
				let emailAddress = $scope.emails[id].email_address;
				console.log(emailAddress);

				adminFactory.removeAdminEmail(emailAddress)
					.then(function(resp){
						console.log(resp);
						$scope.refreshEmails();
					})
					.catch(function(err){
						console.log(err);
						$scope.emails.splice(id, 1);
					});
			}
		},
		link: function(scope, el, attrs){
			$(el).find('')
		},
		restrict: "A",
		templateUrl: "dist/components/admin/admin-contact-email.html"
	};
});