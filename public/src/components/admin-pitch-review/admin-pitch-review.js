moviePitchApp.directive('adminPitchReview', function(){
  return {
    controller: function($scope, pitchFactory){
      $scope.pageTitle = "Please Log In";
      $scope.data = {
        username: "",
        password: ""
      };

      $scope.loginAdmin = function(){
        $scope.$emit('admin-logged-in');

        $scope.pageTitle = "Admin";

        pitchFactory.getAllPitches()
          .then(function(resp){
            console.log(resp);
            $scope.pitches = resp.data.docs;
          })
          .catch(function(err){
            console.log(err);
          });
      };


    },
    restrict: "A"
  }
});
