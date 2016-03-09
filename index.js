require('dotenv').config({silent: true});
const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/api_url', function(req, res) {
  res.send(process.env.API_URL || "https://moviepitchapi.herokuapp.com");
});

app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
