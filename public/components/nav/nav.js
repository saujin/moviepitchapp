moviePitchApp.directive('appHeader', function(){
  return {
    controller: function($scope){
      $scope.menuToggleStatus = "menu-closed";

      $scope.toggleMenu = function(){
        $scope.menuToggleStatus = $scope.menuToggleStatus === "menu-closed" ? "menu-open" : "menu-closed";
      }
    },
    link: function(scope, el, attrs){
      $(el).find('a').on('click', function(){
        scope.toggleMenu();
      });
    },
    restrict: "E",
    templateUrl: "components/nav/nav.html"
  }
});
