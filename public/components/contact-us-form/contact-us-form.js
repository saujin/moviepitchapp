moviePitchApp.directive('contactUsForm', function(emailFactory){
  return {
    controller: function($scope){
      $scope.data = {
        name: null,
        email: null,
        msgSubject: "General",
        message: null,
        subjects: [
          "General",
          "Billing",
          "Sales",
          "Support"
        ],

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
      };

      $scope.submitContactForm = function(){
        clearErrors();

        emailFactory.validateEmail($scope.data.email)
          .then(
            function(resp){
              debugger;
              if(
                $scope.data.name === "" ||
                $scope.data.name === null ||
                $scope.data.email === "" ||
                $scope.data.email === null ||
                $scope.data.msgSubject === "" ||
                $scope.data.msgSubject === null ||
                $scope.data.message === "" ||
                $scope.data.message === null
              ){
                $scope.messageError = "show-alert";
                $scope.errorText = "Please fill out each field before submitting.";
              }
              else {
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
                    },
                    function(err){
                      $scope.errorText = "An error has occurred. Your message was not sent.";
                      $scope.messageError = "show-alert";
                    }
                  )
              }
            },
            function(err){
              $scope.messageError = "show-alert";
              $scope.errorText = "Please enter a valid email address.";
            }
          );
      };
    },
    restrict: "A",
    templateUrl: "components/contact-us-form/contact-us-form.html"
  }
});
