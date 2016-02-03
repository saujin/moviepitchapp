moviePitchApp.controller('MainController', ['$scope', 'ModalService', '$timeout',
  function($scope, ModalService, $timeout){
    $scope.showPitchModal = function(){

      ModalService.showModal({
        controller: "PitchModalController",
        templateUrl: "src/modals/pitch-modal/pitch-modal.html"
      })
      .then(function(modal){
        modal.close.then(function(result){
          console.log(result);
        });

        let $select = $('#select-genre');
        console.log($select);

        function selectReady(){
          let numOptions = $select.find('option').length;

          if(numOptions > 1){
            $select.fancySelect();
          } else {
            $timeout(selectReady, 50);
          }
        }

        // The fancySelect function runs before the page
        // is fully loaded, hence the timeout function
        selectReady();
      })
    };

    $scope.showExampleModal = function(){
      $('.modal-close-animation').removeClass('modal-close-animation');
      
      ModalService.showModal({
        controller: "CustomModalController",
        templateUrl: "src/modals/examples-modal/examples-modal.html"
      })
      .then(function(modal){
        modal.close.then(function(result){
          console.log(result);
        })
      });
    }
  }
]);

moviePitchApp.controller('PitchModalController', ['$scope', 'close', function($scope, close){
  $scope.dismissModal = function(result){
    $('#modal-bg').addClass('modal-close-animation');
    close('result 1', 500);
  }
}]);

moviePitchApp.controller('CustomModalController', ['$scope', 'close', function($scope, close){
  $scope.dismissModal = function(result){
    $('#modal-bg').addClass('modal-close-animation');
    close('result 1', 500);
  }
}])
