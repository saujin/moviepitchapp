moviePitchApp.controller('MainController', ['$scope', 'ModalService',
  function($scope, ModalService){
    $scope.showPitchModal = function(){
      ModalService.showModal({
        controller: function($scope){

        },
        templateUrl: "src/modals/pitch-modal/pitch-modal.html"
      })
        .then(function(modal){

        })
    }
  }
]);
