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

      $scope.userLogin = function(){
        // debugger;
        var user, pwd;
        var modal = $('#login-modal');

        user = angular.element(document.getElementById('login-username')).val();
        pwd = angular.element(document.getElementById('login-password')).val();

        userFactory.loginUser(user, pwd).then(
          function(resp){
            console.log(resp);
            $('#login-modal').modal('hide');
            $scope.clearInputErrors();
            $scope.hideAlert();
          },
          function(err){
            console.log(err);
            $scope.flagInputErrors();
            $scope.showAlert();
            console.log($scope.inputsError);
          }
        );

        // userFactory.loginUser(user, pwd).then(function(resp){
        //   // Close Modal on Success
        //   if(resp.status === "success"){
        //
        //   }
        //
        //   // Show errors on login fail
        //   else {
        //
        //   }
        // });
      }

      $scope.clearForms = function(){
        var modal = $('#login-modal');

        // Clear Existing Inputs
        modal.find('input').val('');

        // Reset Error Notifications
        scope.clearInputErrors();
      }
    },
    restrict: "E",
    templateUrl: 'components/login-modal/login-modal.html'
  }
})
