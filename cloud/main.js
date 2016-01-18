var Parse = require('parse-cloud-express').Parse;

// Process environment variable
process.env['PARSE_WEBHOOK_KEY'] = process.env['PARSE_WEBHOOK_KEY'] || "ExeQWHq9sEVBASH6X8WM2mtGRjdVN2k8UtKl7oR5";


Parse.Cloud.define('test', function(request, response){
  var date = new Date();
  console.log(date);

  response.success('Writing date');
});
