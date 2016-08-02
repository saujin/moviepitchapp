moviePitchApp.directive('pitchModal', function($timeout){
  return {
    controller: function(
      $scope, $q, $http, $rootScope, emailFactory,
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
        userHasAcceptedTerms: false,
        userEmail: "",
        submitterPhone: ""
      };

      // Set this property to configure alert messages displayed
      // on validation failures
      $scope.validationText = null;

      $scope.modalLoadingStatus = "";

      // Run the handler when someone clicks 'submit'
      $scope.submitPitch = function(ev){
        // Get the value for the genre (fancybox binding issue)
        $scope.pitch.genre = $('#select-genre').val();

        // Pitch price in $0.01
        var pitchPrice = 299;

        // The Handler has some basic Stripe config and then calls the payment
        // success function
        $scope.handler = StripeCheckout.configure({
          email: $scope.pitch.userEmail,
          key: $rootScope.stripe_key,
          image: '/dist/img/checkout-logo.png',
          locale: 'auto',
          token: function(token) {

            // Update the pitch object with the payment token
            $scope.pitch.paymentToken = token;
            $scope.pitch.submitterEmail = token.email;
            $scope.pitch.termsAcceptedTime = new Date(token.created * 1000);
            $scope.modalLoadingStatus = "modal--loading";

            pitchFactory.submitPitch($scope.pitch)
              .then(function(resp) {
                return paymentFactory.createCharge(pitchPrice, "Pitch submission", token.id)
              })
              .then(function(resp) {
                $scope.modalLoadingStatus = "";
                $scope.validationText = "Success! Pitch submitted.";
                $rootScope.$broadcast('close-modal');
              })
              .catch(function(err) {
                console.error(err);
                $scope.modalLoadingStatus = "";
                $scope.validationText = "Site Error: You have not been charged. Please try again later.";
              })
          }
        });

        // Create a combined promise
        $q.all([
          pitchFactory.validatePitch($scope.pitch),
          emailFactory.validateEmail($scope.pitch.userEmail)
        ])
        .then(function(resp){

          // clear the validation text
          $scope.validationText = "";

          // set the pitch equal to the returned & validated pitch
          $scope.pitch = resp[0].pitch;

          $scope.handler.open({
            name: "MoviePitch.com",
            description: "Pitch Submission",
            amount: pitchPrice
          });
        })
        .catch(function(err){
          $scope.validationText = err.msg;
          console.error(err);
        });

      };
    },
    restrict: "A"
  }
});