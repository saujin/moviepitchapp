moviePitchApp.controller('PitchModalController', ['$scope', 'close', function($scope, close) {
  $scope.dismissModal = function(){
    $('#modal-bg').addClass('modal-close-animation');
    close('Modal Dismissed', 500);
  }

  $scope.$on('close-modal', function(){
    $scope.dismissModal();
  });

}]);