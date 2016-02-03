moviePitchApp.directive('successCarousel', function(){
  return {
    controller: function($scope){
      $scope.index = 1;

      $scope.stories = [
        {
          name: "Emily Lloyd",
          text: "A grandmother from Ozark, Arkansas, sent Bob an index card about a man who lived in the Statue of Liberty. He sold the project to Universal Studios. Ryan Murphy (GLEE) wrote the script. “I can’t believe Bob was able to sell my one line idea. He was great to work with. I can’t wait to send him more.”"
        },
        {
          name: "David Simon",
          text: "I brought my original idea ‘The High School Security Tapes’ to Bob. He not only sold it to DreamWorks, he also made sure I got to write the screenplay. Since then, he sold another idea with Katherine Heigl to Fox 2000 and another with director Todd Phillips (THE HANGOVER) to Warner Brothers."
        },
        {
          name: "Tom Newman",
          text: "I was living in London when I heard about Bob Kosberg. I sent him a one page outline called ‘The Beauty Contest.’ Within one week, Bob had attached Meg Ryan to star and sold the project to New Line."
        },
        {
          name: "Steve List",
          text: "I attended one of Bob’s pitch events. I literally pitched Bob a thirty second story while we walked through the lobby. Bob had Paramount and Fox interested in buying my pitch and soon we had Drew Barrymore attached and I began writing the script at Fox Studios. I now have a writing career in Hollywood and it all started with Bob; he believed in my project and set it up at a studio."
        }
      ];

      $scope.length = $scope.stories.length;
      $scope.carouselClass = "test";

      $scope.moveCarousel = function(dir){
        let curIndex = $scope.index;
        let maxLength = $scope.length;
        let integer = dir;

        if(dir === 1 && curIndex === maxLength) {
          $scope.index = 1;
        } else if(dir === -1 && curIndex === 1 ) {
          $scope.index = maxLength;
        } else {
          $scope.index = $scope.index + dir;
        }

        $scope.carouselClass = "carousel-" + $scope.index;
      }
    },
    restrict: "A",
    templateUrl: "dist/components/success-carousel/success-carousel.html"
  }
})
