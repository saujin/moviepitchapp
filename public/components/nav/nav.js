moviePitchApp.directive('appHeader', function(){
  return {
    controller: function($scope, userFactory){
      $scope.menuToggleStatus = "menu-closed";
      $scope.currentLogAction = "show-login";

      $scope.toggleMenu = function(){
        $scope.menuToggleStatus = $scope.menuToggleStatus === "menu-closed" ? "menu-open" : "menu-closed";
      };

      $scope.$on('login-update', function(){
        $scope.currentLogAction = "show-logout";
      });


      $scope.$on('logout-update', function(){
        $scope.currentLogAction = "show-login";
      });

      $scope.logoutUser = function(){
        userFactory.logoutUser().then(
          function(resp){
            console.log(resp);
          },
          function(err){
            console.log(err);
          }
        );
      }
    },
    link: function(scope, el, attrs){
      $(el).find('.main-nav a').on('click', function(){
        scope.toggleMenu();
      });
    },
    restrict: "E",
    templateUrl: "components/nav/nav.html"
  }
});