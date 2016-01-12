moviePitchApp.directive('loginModal', function(){
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

          },
          function(err){
            console.log(err);
            $scope.flagInputErrors();
            $scope.showAlert();
            console.log($scope.inputsError);
          }
        );
      }


    },
    restrict: "E",
    templateUrl: 'components/login-modal/login-modal.html'
  }
})
