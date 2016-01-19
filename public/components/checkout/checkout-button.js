moviePitchApp.directive('checkoutButton', function(){
  return {
    controller: function($scope){
      $scope.handler = StripeCheckout.configure({
        key: 'pk_test_XHkht0GMLQPrn2sYCXSFy4Fs',
        // image: '/img/documentation/checkout/marketplace.png',
        locale: 'auto',
        token: function(token) {
        // Use the token to create the charge with a server-side script.
        // You can access the token ID with `token.id`
          // console.log(token);
          $scope.$emit('payment-success', token);
        }
      });
    },
    link: function(scope, el, attrs){
      el.on('click', function(e){
        scope.handler.open({
          name: "MoviePitch.com",
          description: "Pitch Submission",
          amount: 200
        });
        e.preventDefault();
      });
    },
    restrict: "A"
  }
});
