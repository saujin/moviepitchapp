moviePitchApp.directive('selectGenre', function(){
  return {
    controller: function($scope){
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
      ]
    },
    link: function(scope, el, attrs){
      console.log('yo');
    },
    restrict: "A"
  }
});
