moviePitchApp.controller('AdminController',
	['$scope', '$rootScope', 'adminFactory', '$state', 'pitchFactory',
	function($scope, $rootScope, adminFactory, $state, pitchFactory){

	// Login an Admin
	// $scope.adminEmail = "j@j.com";
	// $scope.adminPassword = "test";
		$scope.adminEmail = "";
	$scope.adminPassword = "";
	$scope.loginAdmin = function(){

		adminFactory.loginAdmin($scope.adminEmail, $scope.adminPassword)
			.then(function(resp){
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

	// Logout an Admin
	$scope.logoutAdmin = function(){
		adminFactory.logoutAdmin()
			.then(function(resp){
				console.log('Logging out');
			})
			.catch(function(err){
				console.log(err);
			});
	};

	// Register an Admin
	$scope.adminUsernameRegister = "";
	$scope.adminEmailRegister = "";
	$scope.adminPasswordRegister = "";
	$scope.adminPasswordRegisterConfirm = "";

	$scope.registerAdmin = function(){
		if(
			$scope.adminPasswordRegister ===
			$scope.adminPasswordRegisterConfirm
		){
			const data = {
				name: $scope.adminUsernameRegister,
				email: $scope.adminEmailRegister,
				password: $scope.adminPasswordRegister
			};

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
	};

}]);