moviePitchApp.directive('pitchModal', function($timeout){
  return {
    controller: function(
      $scope, $q, $http, adminFactory, $rootScope,
      paymentFactory, pitchFactory
    ){

      // Populate an array of genres, and create some variables
      // for the ng-models to bind to
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

      // Carve out a place for storing a submitted pitch
      $scope.pitch = {
        genre: "Select Genre",
        pitchText: "",
        userHasAcceptedTerms: false
      };

      // Set this property to configure alert messages displayed
      // on validation failures
      $scope.validationText = null;

      // The Handler has some basic Stripe config and then calls the payment
      // success function
      $scope.handler = StripeCheckout.configure({
        key: 'pk_test_dXGHL1a18TOiXS6z0k7ehIHK',
        // image: '/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function(token) {
          // Update the pitch object with the payment token
          $scope.pitch.token = token;
          $scope.pitch.submitterEmail = token.email;

          console.log($scope.pitch);

          // Create the charge
          paymentFactory
            .createCharge(200, "Pitch submission", token.id)
            .then(function(resp){

              // if charge is successful submit the pitch
              console.log('Transaction complete.')
              console.log(resp);
              pitchFactory.submitPitch($scope.pitch)
                .then(function(resp){
                  $scope.validationText = "Success! Pitch submitted.";

                  console.log('Pitch submitted');
                  console.log(resp);
                  $rootScope.$broadcast('close-modal');
                })
                .catch(function(err){
                  $scope.validationText = "Error: Pitch not submitted.";
                  console.log(err);
                })
            })
            .catch(function(err){
              console.log(err);
            });
        }
      });


      // Run the handler when someone clicks 'submit'
      $scope.submitPitch = function(ev){
        // Get the value for the genre (fancybox binding issue)
        $scope.pitch.genre = $('#select-genre').val();

        // Validate the pitch object
        pitchFactory.validatePitch($scope.pitch)
          .then(function(resp){
            // clear the validation text
            $scope.validationText = "";

            // set the pitch equal to the returned & validated pitch
            $scope.pitch = resp.pitch;

            $scope.handler.open({
              name: "MoviePitch.com",
              description: "Pitch Submission",
              amount: 200
            })
          })
          .catch(function(err){
            $scope.validationText = err.msg;
            console.log(err);
          });

      };

    },
    restrict: "A"
  }
});
