moviePitchApp.controller('AdminController',
	['$scope', '$rootScope', 'adminFactory', '$state',
	function($scope, $rootScope, adminFactory, $state){

	$scope.adminEmail = "";
	$scope.adminPassword = "";

	$scope.loginAdmin = function(){
		console.log($scope.adminEmail);
		console.log($scope.adminPassword);

		adminFactory.loginAdmin($scope.adminEmail, $scope.adminPassword)
			.then(function(resp){
				console.log(resp);
				$rootScope.curUser = resp.data.token;

				if($rootScope.targetState === "" || $rootScope.targetState === undefined){
					$state.go('admin');
				} else {
					$state.go($rootScope.targetState);
				}

				$rootScope.targetState = "";
			})
			.catch(function(err){
				console.log(err);
			});
	}


	$scope.adminUsernameRegister = "";
	$scope.adminEmailRegister = "";
	$scope.adminPasswordRegister = "";
	$scope.adminPasswordRegisterConfirm = "";

	$scope.registerAdmin = function(){
		console.log($scope.adminUsernameRegister);
		console.log($scope.adminEmailRegister);
		console.log($scope.adminPasswordRegister);
		console.log($scope.adminPasswordRegisterConfirm);

		if(
			$scope.adminPasswordRegister ===
			$scope.adminPasswordRegisterConfirm
		){
			const data = {
				name: $scope.adminUsernameRegister,
				email: $scope.adminEmailRegister,
				password: $scope.adminPasswordRegister
			};
			console.log(data);

			adminFactory.registerAdmin(data)
			.then(function(resp){
				console.log(resp);
			})
			.catch(function(err){
				console.log(err);
			});
		} else {
			console.log('passwords do not match');
		}

	}
}]);