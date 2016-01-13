moviePitchApp.directive('login', function(){
  return {
    controller: function($scope, userFactory){
      $scope.loginUser = function(){
        var user, pwd;

        user = angular.element(document.getElementById('user-login-username')).val();
        pwd = angular.element(document.getElementById('user-login-pwd')).val();

        userFactory.loginUser(user, pwd)
          .then(
            function(resp){
              console.log(resp);
            },
            function(err){
              console.log(err);
            }
          );
      };


      $scope.logoutUser = function(){
        userFactory.logoutUser()
          .then(
            function(resp){
              console.log(resp);
            },
            function(err){
              console.log(err);
            }
          );
      }
    },
    restrict: "E",
    templateUrl: "components/login/login.html"
  }
});
