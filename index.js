var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');
//
// app.get('/', function(request, response) {
//   response.render('pages/index');
// });
//
// app.get('/team', function(request, response) {
//   response.render('pages/team');
// });
//
// app.get('/how-it-works', function(request, response) {
//   response.render('pages/how-it-works');
// });
//
// app.get('/success-stories', function(request, response) {
//   response.render('pages/success-stories');
// });
//
// app.get('/faq', function(request, response) {
//   response.render('pages/faq');
// });
//
// app.get('/submit-pitch', function(request, response) {
//   response.render('pages/submit-pitch');
// });
//
// app.get('/login', function(request, response) {
//   response.render('pages/login');
// });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
