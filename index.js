const express = require('express');
const app = express();
const forceDomain = require('forcedomain');

app.set('port', (process.env.PORT || 5000));

app.use(forceDomain({
	hostname: 'www.moviepitch.com'
}));
app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
