moviePitchApp.directive('submitPitch', function(){
  return {
    controller: function($scope, parseFactory){
      $scope.submitPitch = function(){
        var genre, pitch;

        genre = angular.element(document.getElementById('genre')).val();
        pitch = angular.element(document.getElementById('pitch')).val();

        console.log(genre, pitch);
        if(pitch !== ""){
          parseFactory.submitPitch(genre, pitch);
        }
      }
    },
    restrict: "A"
  }
});
