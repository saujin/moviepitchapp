var express = require('express');
var mongodb = require('mongodb').MongoClient;

var app = express();

// var seedData = [
//   {
//     decade: '1970s',
//     artist: 'Debby Boone',
//     song: 'You Light Up My Life',
//     weeksAtOne: 10
//   },
//   {
//     decade: '1980s',
//     artist: 'Olivia Newton-John',
//     song: 'Physical',
//     weeksAtOne: 10
//   },
//   {
//     decade: '1990s',
//     artist: 'Mariah Carey',
//     song: 'One Sweet Day',
//     weeksAtOne: 16
//   }
// ];
//
// var uri = "mongodb://heroku_0hl4nrjc:ech2adf24haq23l0rm08m44rdq@ds039145.mongolab.com:39145/heroku_0hl4nrjc";
//
// mongodb.connect(uri, function(err, db){
//   if(err) throw err;
//
//   var songs = db.collection('songs');
//   songs.insert(seedData, function(err, result){
//     if(err) throw err;
//   });
//
//   console.log(seedData.length);
// });

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/team', function(request, response) {
  response.render('pages/team');
});

app.get('/how-it-works', function(request, response) {
  response.render('pages/how-it-works');
});

app.get('/success-stories', function(request, response) {
  response.render('pages/success-stories');
});

app.get('/faq', function(request, response) {
  response.render('pages/faq');
});

app.get('/submit-pitch', function(request, response) {
  response.render('pages/submit-pitch');
});




app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
