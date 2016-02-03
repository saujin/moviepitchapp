moviePitchApp.directive('loginModal', function($rootScope, $state){
  return {
    controller: function($scope, userFactory){
      $scope.inputsError = "";

      $scope.clearInputErrors = function(){
        $scope.inputsError = "";
      }

      $scope.flagInputErrors = function(){
        $scope.inputsError = "is-error";
      }

      $scope.isAlertShown = "alert-hidden";
      $scope.hideAlert = function(){$scope.isAlertShown = "alert-hidden"};
      $scope.showAlert = function(){$scope.isAlertShown = "alert-shown"};

      $scope.clearForms = function(){
        var modal = $('#login-modal');

        // Clear Existing Inputs
        modal.find('input').val('');

        // Reset Error Notifications
        $scope.clearInputErrors();
      }

      $scope.userLogin = function(){
        var user, pwd;
        var modal = $('#login-modal');

        user = angular.element(document.getElementById('login-username')).val();
        pwd = angular.element(document.getElementById('login-password')).val();

        userFactory.loginUser(user, pwd).then(
          function(resp){
            $('#login-modal').modal('hide');
            $scope.clearInputErrors();
            $scope.clearForms();
            $scope.hideAlert();

            // if the $rootScope is in the process of navigating to a state,
            // as in an event where login interrupts navigation to a restricted page
            // continue to that state, otherwise clear the $rootScope.targetState
            if($rootScope.targetState !== null){
              $state.go($rootScope.targetState);
              $rootScope.targetState = null;
            }
          },
          function(err){
            $scope.flagInputErrors();
            $scope.showAlert();
          }
        );
      }


    },
    restrict: "E",
    templateUrl: 'dist/components/login-modal/login-modal.html'
  }
})
