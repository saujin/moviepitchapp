moviePitchApp.directive('labelWrapper', function(){
  return {
    controller: function($scope){
      $scope.labelState = "";
    },
    link: function(scope, el, attrs){
      let $inputs = el.find('input, select, textarea');
      let $label = el.find('label');

      $inputs.on('focus', function(){
        $label.addClass('label-wrapper-label--out');
      });


      $inputs.on('blur', function(){
        let value = $($inputs[0]).val();

        if(value === ""){
          $label.removeClass('label-wrapper-label--out');
        }
      });
    },
    restrict: "A"
  }
});
