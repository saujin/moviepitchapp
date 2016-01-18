var express = require('express');
//
// var Parse = require('parse-cloud-express').Parse;
//
// require('./cloud/main.js');
// console.log(process.env['PARSE_WEBHOOK_KEY']);
// Mount the cloud code webhooks
// app.use('/webhooks', ParseCloud.app);

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
