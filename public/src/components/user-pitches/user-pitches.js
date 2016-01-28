moviePitchApp.directive('userPitches', function(){
  return {
    controller: function($scope, userFactory){

      $scope.pitches = [
        {
          pitchDate: "November 3rd, 2015",
          genre: "Romantic Comedy",
          pitchText: "A man falls in love with a lady, but it's funny.",
          status: "rejected"
        },
        {
          pitchDate: "October 23rd, 2015",
          genre: "Horror",
          pitchText: "A woman keeps checking her fridge, but there's never anything worth eating.",
          status: "rejected"
        },{
          pitchDate: "June 3rd, 2015",
          genre: "Western",
          pitchText: "Some cowboys ride around chasing a gang of thieves",
          status: "accepted"
        }
      ]
    },
    restrict: "E",
    templateUrl: "src/components/user-pitches/user-pitches.html"
  }
});
