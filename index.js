require('dotenv').config({silent: true});
const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/api_url', function(req, res) {
  // res.send(process.env.API_URL || "https://moviepitchapi.herokuapp.com");
  res.send(process.env.API_URL || "https://moviepitchapi-dev.herokuapp.com");
});

app.get('/stripe_key', function(req, res) {
  // res.send(process.env.STRIPE_KEY || "pk_live_ssCD1YYIwILiNgCLbfZX6yty");
  res.send(process.env.STRIPE_KEY || "pk_test_dXGHL1a18TOiXS6z0k7ehIHK");
});

app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
