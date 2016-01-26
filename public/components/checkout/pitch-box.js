moviePitchApp.directive('pitchBox', function(){
  return {
    controller: function($scope, $q, $http, paymentFactory, pitchFactory){

      // Populate an array of genres, and create some variables
      // for the ng-models to bind to
      $scope.data = {
        genres: [
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
        ],
        pitchGenre: "Select Genre",
        pitchText: null,
        termsAgree: false
      }

      // Carve out a place for storing a submitted pitch
      $scope.pitch = null;

      // Set this property to configure alert messages displayed
      // on validation failures
      $scope.validationText = null;

      // The Handler has some basic Stripe config and then calls the payment
      // success function
      $scope.handler = StripeCheckout.configure({
        key: 'pk_test_XHkht0GMLQPrn2sYCXSFy4Fs',
        // image: '/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function(token) {
          $scope.paymentSuccess(token);
        }
      });

      // Run the handler when someone clicks 'submit'
      $scope.submitPitch = function(ev){

        // Create a pitch object for validation
        $scope.pitch = {
          genre: $scope.data.pitchGenre,
          pitchText: $scope.data.pitchText,
          userHasAcceptedTerms: $scope.data.termsAgree
        };

        pitchFactory
          .validatePitch($scope.pitch)
          .then(
            function(resp) {
              $scope.validationText = "";

              // Update the pitch object with the returned pitch
              $scope.pitch = resp.pitch;
              // console.log($scope.pitch);

              // Now that pitch is validated, trigger Stripe
              $scope.handler.open({
                name: "MoviePitch.com",
                description: "Pitch Submission",
                amount: 200
              });
            },
            function(err) {
              $scope.validationText = err.msg;
              console.log(err);
            }
          );

        ev.preventDefault();
      };

      $scope.paymentSuccess = function(token){
        // Update the pitch object with the payment token
        $scope.pitch.token = token;
        console.log($scope.pitch);


        // **************************************************
        // ********************* TO DO **********************

        pitchFactory.submitPitch($scope.pitch);


        // **************************************************
        // **************************************************
      };

    },
    link: function(scope, el, attrs){
      el.find('select').on('focus', function(){
        const selectGenre = el.find('option')[0];
        angular.element(selectGenre).remove();
      });
    },
    restrict: "A",
    templateUrl: "components/checkout/pitch-box.html"
  }
});
