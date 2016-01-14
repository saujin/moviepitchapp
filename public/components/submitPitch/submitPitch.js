moviePitchApp.directive('submitPitch', function(){
  return {
    controller: function($scope, parseFactory){
      $scope.genres = [
        "Action",
        "Adventure",
        "Animated",
        "Comedy",
        "Crime",
        "Drama",
        "Fantasy",
        "Historical",
        "Historical Fiction",
        "Horror",
        "Kids",
        "Mystery",
        "Political",
        "Religious",
        "Romance",
        "Romantic Comedy",
        "Satire",
        "Science Fiction",
        "Thriller",
        "Western"
      ];

      $scope.submitPitch = function(){
        var genre, pitch, terms, dateAgreed;

        genre = angular.element(document.getElementById('genre')).val();
        pitch = angular.element(document.getElementById('pitch')).val();
        terms = $('#agree-terms').is(":checked");
        dateAgreed = new Date();

        console.log(genre, pitch, terms, dateAgreed);

        // Check the form for basic errors
        validateInput();

        // if(pitch !== ""){
        //   // parseFactory.submitPitch(genre, pitch);
        // }
      }

      function validateInput() {
        // Make sure terms are agreed to
        if(terms !== true){
          $scope.termsError = "show-alert";
          return;
        } else if (pitch === "") {
          $scope.termsError = "";
          $scope.pitchError = "show-alert";
          return;
        } else if (genre) {

        }
      }
    },
    restrict: "A"
  }
});
