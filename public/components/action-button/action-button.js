moviePitchApp.directive('actionButton', function(){
  return {
    controller: function($scope, $rootScope, $state){

      $scope.update = function(){

        if($rootScope.curUser === null){
          $scope.target = "register";
          $scope.actionText = "Register To Start Pitching!";
        } else {
          $scope.actionText = "Submit a Pitch!";
          $scope.target = "submit-pitch";
        }
      };

      $scope.navigate = function(){
        $state.go($scope.target);
      };

      $scope.$on('login-update', function(){
        $scope.update();
      });

      $scope.$on('logout-update', function(){
        $scope.update();
      });
    },
    link: function(scope, el, attrs){
      scope.update();
    },
    restrict: "E"
  }
})
