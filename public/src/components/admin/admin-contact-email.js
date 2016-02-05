moviePitchApp.directive('adminContactEmail', function(){
	return {
		controller: function($scope, adminFactory, emailFactory){
			// Define Scope Variables;
			$scope.emails = [];
			$scope.newAdminEmail = "";

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
				console.log($scope.newAdminEmail);

				adminFactory.addAdminEmail($scope.newAdminEmail)
					.then(function(resp){
						console.log(resp);
						$scope.newAdminEmail = "";
						$scope.refreshEmails();
					})
					.catch(function(err){
						console.log(err)
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
					});
			}

			// Init Page
			$scope.refreshEmails();
		},
		link: function(scope, el, attrs){
			$(el).find('')
		},
		restrict: "A",
		templateUrl: "dist/components/admin/admin-contact-email.html"
	};
});