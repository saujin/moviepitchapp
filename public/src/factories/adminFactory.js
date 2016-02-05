"use strict";

moviePitchApp.factory('adminFactory', function($http){
  const urlBase = "https://moviepitchapi.herokuapp.com";

  const testUser = {
    name: "Justin Tulk",
    email: "justintulk@gmail.com",
    pwd: "testPassword"
  };

  let factory = {
    getAdminEmails: function(){
      return $http({
        method: "GET",
        url: urlBase + "/admin/destination_emails"
      });
    },

    addAdminEmail: function(email){
      return $http({
        method: "POST",
        url: urlBase + "/admin/add_destination_email/",
        data: {
          email_address: email
        }
      });
    },

    removeAdminEmail: function(email){
      return $http({
        method: "GET",
        url: urlBase + "/admin/remove_email/" + email
      });
    },

    loginAdmin: function(email, pwd){
      return $http({
        method: "POST",
        url: urlBase + "/admin/login",
        data: {
          email: email,
          password: pwd
        }
      });
    },

    registerAdmin: function(data){
      return $http({
        method: "POST",
        url: urlBase + "/admin/register",
        data: {
          name      : data.name,
          email     : data.email,
          password  : data.pwd
        }
      });
    },

    testLoginAdmin: function(){
      return $http({
        method: "POST",
        url: urlBase + '/admin/login',
        data: {
          email: testUser.email,
          password: testUser.pwd
        }
      });
    },

    testRegisterAdmin: function(){
      return $http({
        method: "POST",
        url: urlBase + '/admin/register',
        data: {
          name: testUser.name,
          email: testUser.email,
          password: testUser.pwd
        }
      });
    }
  };

  return factory;

});
