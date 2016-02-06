moviePitchApp.controller('CustomModalController', ['$scope', 'close', function($scope, close) {
  $scope.dismissModal = function(){
    $('#modal-bg').addClass('modal-close-animation');
    close('Modal Dismissed', 500);
  }
}]);