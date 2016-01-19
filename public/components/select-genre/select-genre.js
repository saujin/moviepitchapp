moviePitchApp.directive('selectGenre', function(){
  return {
    controller: function($scope){
      $scope.genres = [
        "Select Genre",
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
      el.on('focus', function(){
        const selectGenre = el.find('option')[0];
        angular.element(selectGenre).remove();
      });
    },
    restrict: "A"
  }
});
