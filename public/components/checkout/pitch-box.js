moviePitchApp.directive('pitchBox', function(){
  return {
    scope: function($scope){
      $scope.$on('payment-success', function(token){
        debugger;
        console.log(token);
        console.log('yo');
      });
    },
    link: function(scope, el, attrs){
      console.log(scope);
    },
    restrict: "A"
  }
});
