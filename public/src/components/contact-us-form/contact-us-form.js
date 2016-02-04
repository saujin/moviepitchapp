moviePitchApp.directive('contactUsForm', function(emailFactory, $timeout){
  return {
    controller: function($scope){
      $scope.data = {
        name: "",
        email: "",
        msgSubject: "General",
        message: "",
        subjects: [
          "General",
          "Billing",
          "Sales",
          "Support"
        ],
        errors : {
          email: true,
          username: true,
          message: true
        }
      }

      $scope.btnState = "btn--inactive";

      $scope.btnStateChange = function(){
        // console.log($scope.data.errors);
        if(
          $scope.data.errors.email === true ||
          $scope.data.errors.username === true ||
          $scope.data.errors.message === true
        ) {
          $scope.btnState = "btn--inactive";
        } else {
          $scope.btnState = "";
        }
      }

      $scope.validateName = function(){
        // console.log('validating name');
        if($scope.data.name === ""){
          $scope.data.errors.username = true;
        } else {
          $scope.data.errors.username = false;
        }
      }

      $scope.validateEmail = function(){
        // console.log('validating email');
        emailFactory.validateEmail($scope.data.email)
          .then(function(resp){
            $scope.data.errors.email = false;
          }, function(err){
            $scope.data.errors.email = true;
          });
      }

      $scope.validateMsg = function(){
        // console.log('validating message');
        if($scope.data.name === ""){
          $scope.data.errors.message = true;
        } else {
          $scope.data.errors.message = false;
        }
      }

      let clearErrors = function(){
        $scope.messageError = "";
        $scope.submitSuccess = "";
      };

      let clearFields = function(){
        $scope.data.name = null;
        $scope.data.email = null;
        $scope.data.message = null;
        $scope.data.msgSubject = "General";
        $scope.btnState = "btn--inactive";
      };

      $scope.submitContactForm = function(){
        if($scope.btnState === "btn--inactive"){
          // console.log('inactive');
        } else {
          clearErrors();
          emailFactory
            .sendContactUsMessage(
              $scope.data.name,
              $scope.data.email,
              $scope.data.msgSubject,
              $scope.data.message
            )
            .then(
              function(resp){
                clearErrors();
                clearFields();
                $scope.submitSuccess = "show-alert";
                $scope.successText = "Success! Your message has been submitted.";
                // console.log(resp);
                $timeout(function(){
                  $scope.submitSuccess = "";
                  $scope.successText = "";
                }, 4000)
              },
              function(err){
                $scope.errorText = "An error has occurred. Your message was not sent.";
                $scope.messageError = "show-alert";
              }
            )
          // console.log($scope.data);
        }
      };
    },
    link: function(scope, el, attrs){
      let $select = $('#contact-subject');

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

    },
    restrict: "A",
    templateUrl: "dist/components/contact-us-form/contact-us-form.html"
  }
});
