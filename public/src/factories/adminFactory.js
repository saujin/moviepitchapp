"use strict";

moviePitchApp.factory('adminFactory', function($http, $q, $rootScope){
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

    logoutAdmin: function(){
      let deferred = $q.defer();

      $rootScope.curUser = null;

      if($rootScope.curUser === null){
        deferred.resolve({
        status: "Success",
        message: "User is logged out"
      });
      } else {
        deferred.reject({
          status: "Logout error",
          message: "User is still logged in"
        });
      }

      return deferred.promise;
    },

    registerAdmin: function(data){
      return $http({
        method: "POST",
        url: urlBase + "/admin/register",
        data: {
          name      : data.name,
          email     : data.email,
          password  : data.password
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
