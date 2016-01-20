moviePitchApp.directive('pitchBox', function(){
  return {
    controller: function($scope, $q){

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

      // Validate the form before launching the payment window
      function validatePitch(){
        let deferred = $q.defer();

        if(
          $scope.data.termsAgree === true &&
          $scope.data.pitchText !== "" &&
          $scope.data.pitchText !== null &&
          $scope.data.pitchGenre !== "Select Genre" &&
          $scope.data.pitchGenre !== ""
        ) {
          deferred.resolve({
            status: "success",
            pitch : {
              genre: $scope.data.pitchGenre,
              pitch: $scope.data.pitchText,
              areTermsAgreed: $scope.data.termsAgree,
              dateAgreed: new Date(),
              token : null
            }
          });
        }

        // If the form doesn't validate, display errors for what kind of error
        else {
          if($scope.data.pitchText === "" || $scope.data.pitchText === null && $scope.data.pitchGenre === "" || $scope.data.pitchGenre === "Select Genre") {
            deferred.reject({
              status: "Please fill out the pitch form before submitting.",
              data: null
            });
          } else if($scope.data.termsAgree === false){
            deferred.reject({
              status: "Please accept the terms in order to continue.",
              data: null
            });
          } else if ($scope.data.pitchText === "" || $scope.data.pitchText === null){
            deferred.reject({
              status: "Robert is good, but not good enough to sell a blank pitch!",
              data: null
            });
          } else if ($scope.data.pitchGenre === "" || $scope.data.pitchGenre === "Select Genre"){
            deferred.reject({
              status: "What kind of movie is it? Please select a genre.",
              data: null
            });
          } else {
            deferred.reject({
              status: "An unknown error has occurred.",
              data: null
            });
          }
        }

        return deferred.promise;
      };

      // Run the handler when someone clicks 'submit'
      $scope.submitPitch = function(ev){

        // Run the fields through the validator before any action
        validatePitch().then(
          function(resp){
            // Clear the error messages
            $scope.validationText = "";

            // Store the Pitch Data for future use
            $scope.pitch = resp.pitch;

            $scope.handler.open({
              name: "MoviePitch.com",
              description: "Pitch Submission",
              amount: 200
            });
          },
          function(err){
            $scope.validationText = err.status;
            console.log(err);
          }
        )

        ev.preventDefault();
      };

      $scope.paymentSuccess = function(token){
        $scope.pitch.token = token;
        console.log($scope.pitch);


        // **************************************************
        // ********************* TO DO **********************

        // Write the pitch to the back-end here!!!

        // **************************************************
        // **************************************************
      };

      $scope.handler = StripeCheckout.configure({
        key: 'pk_test_XHkht0GMLQPrn2sYCXSFy4Fs',
        // image: '/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function(token) {
          // Use the token to create the charge with a server-side script.
          // You can access the token ID with `token.id`

          // **************************************************
          // ********************* TO DO **********************

          // Complete the transaction through the back-end data services
          // Return a promise

          // **************************************************
          // **************************************************

          $scope.paymentSuccess(token);
        }
      });
    },
    link: function(scope, el, attrs){
      el.find('select').on('focus', function(){
        const selectGenre = el.find('option')[0];
        angular.element(selectGenre).remove();
      });
    },
    restrict: "A"
  }
});
