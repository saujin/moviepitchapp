"use strict";

moviePitchApp.factory('parseFactory', function(){
 var factory = {
   submitPitch: function(genre, text){
     var Pitch = Parse.Object.extend("Pitch");
     var pitch = new Pitch();

     pitch.set("genre", genre);
     pitch.set("pitch", text);

     pitch.save(null, {
       success: function(pitch){
         console.log(pitch);
       },
       error: function(pitch, error){
         console.log(error);
         console.log(error.code);
         console.log(error.message);
       }
     });
   }
 };

 return factory;
});
