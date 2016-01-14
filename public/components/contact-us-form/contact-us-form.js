moviePitchApp.directive('contactUsForm', function(emailFactory){
  return {
    controller: function($scope){
      $scope.subjects = [
        "General",
        "Billing",
        "Sales",
        "Support"
      ];


      let clearErrors = function(){
        $scope.messageError = "";
        $scope.submitSuccess = "";
      };

      let clearFields = function(){
        $('[contact-us-form]').find('.form-control').val('');
      };

      $scope.submitContactForm = function(){
        clearErrors();

        let name, email, subject, message;

        name = angular.element(document.getElementById('contact-name')).val();
        email = angular.element(document.getElementById('contact-email')).val();
        subject = angular.element(document.getElementById('contact-subject')).val();
        message = angular.element(document.getElementById('contact-message')).val();

        emailFactory.validateEmail(email)
          .then(
            function(resp){
              if(name === "" || email === "" || subject === "" || message===""){
                $scope.messageError = "show-alert";
                $scope.errorText = "Please fill out each field before submitting.";
              } else {

                emailFactory.sendContactUsMessage(name, email, subject, message)
                  .then(
                    function(resp){
                      clearErrors();
                      clearFields();
                      $scope.submitSuccess = "show-alert";
                      $scope.successText = "Success! Your message has been submitted.";
                      console.log(resp);
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
